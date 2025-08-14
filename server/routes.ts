import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { HeatSim, ScenarioInjection } from "./demo/heat-sim";
import { insightFor } from "./ai/insight-static";
import { computeROI, generateROIReport, DEFAULT_BASELINE, DEFAULT_PRICES, type Current, type Prices } from "./roi";
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { syncGuard, syncDecisionLog, type RouteETA, type SyncDecision } from './models/sync';
import { pdfService } from './pdf-service';

// Multiple heat datasets for realistic switching between different steel heats
// Each heat has unique materials, chemistry, operators, and progression
const sims = new Map<string, HeatSim>();

// Mock data for steel heat - this is the base heat data
const mockHeatData = {
  ts: "2019-01-13 03:00:11",
  heat: 93378,
  grade: "13KhFA/9",
  master: "Ivanov",
  operator: "Petrov",
  modelStatus: "idle" as const,
  confidence: 85,
  buckets: [
    {
      id: 1,
      materials: [
        { name: "Scrap 3AZhD", weight: 9.7, percentage: 9.6 },
        { name: "Scrap 25A", weight: 5.8, percentage: 5.7 },
        { name: "Scrap 3AN", weight: 76.1, percentage: 75.1 },
        { name: "Turnings 15A", weight: 4.2, percentage: 4.1 },
        { name: "Anthracite", weight: 0.8, percentage: 0.8 },
        { name: "HBI (briquetted DRI)", weight: 4.7, percentage: 4.6 }
      ],
      totalWeight: 101.3
    },
    {
      id: 2,
      materials: [
        { name: "Scrap 3AZhD", weight: 9.9, percentage: 17.6 },
        { name: "Scrap 3AN", weight: 39.5, percentage: 70.4 },
        { name: "Turnings 15A", weight: 5.9, percentage: 10.5 },
        { name: "Anthracite", weight: 0.8, percentage: 1.4 }
      ],
      totalWeight: 56.1
    }
  ],
  stages: [
    { bucket: 1, stage: 10, plannedEnergy: 0.38, actualEnergy: 0.38, plannedTime: "00:24", actualTime: "00:23", profile: 3, temp: null, status: "done" },
    { bucket: 1, stage: 12, plannedEnergy: 0.19, actualEnergy: 0.20, plannedTime: "00:09", actualTime: "00:10", profile: 3, temp: null, status: "done" },
    { bucket: 1, stage: 14, plannedEnergy: 0.20, actualEnergy: 0.20, plannedTime: "00:09", actualTime: "00:10", profile: 3, temp: null, status: "done" },
    { bucket: 1, stage: 15, plannedEnergy: 0.18, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 5, temp: null, status: "current" },
    { bucket: 1, stage: 16, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
    { bucket: 1, stage: 18, plannedEnergy: 20.02, actualEnergy: null, plannedTime: "15:31", actualTime: null, profile: 5, temp: null, status: "planned" },
    { bucket: 2, stage: 10, plannedEnergy: 0.389, actualEnergy: null, plannedTime: "00:24", actualTime: null, profile: 4, temp: null, status: "planned" },
    { bucket: 2, stage: 12, plannedEnergy: 0.21, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
    { bucket: 2, stage: 14, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
    { bucket: 2, stage: 15, plannedEnergy: 0.18, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
    { bucket: 2, stage: 16, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
    { bucket: 2, stage: 18, plannedEnergy: 9.05, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
    { bucket: 2, stage: 18, plannedEnergy: 0.37, actualEnergy: null, plannedTime: "00:06", actualTime: null, profile: 5, temp: null, status: "planned" },
    { bucket: 2, stage: 17, plannedEnergy: 23.4, actualEnergy: null, plannedTime: "00:16:42", actualTime: null, profile: 3, temp: 1590, status: "planned" }
  ],
  additives: [
    { bucket: 1, stage: 18, name: "Lime 3-80 mm", weight: 3002, energy: 16.8 },
    { bucket: 2, stage: 17, name: "Anthracite", weight: 706, energy: 31.0 },
    { bucket: 2, stage: 17, name: "Lime 3-80 mm", weight: 3006, energy: 31.0 },
    { bucket: 2, stage: 17, name: "Magma", weight: 606, energy: 44.8 },
    { bucket: 2, stage: 17, name: "Magma", weight: 1000, energy: 50.4 }
  ],
  chemSteel: {
    "C": 0.090,
    "Mn": 0.140,
    "Si": 0.000,
    "P": 0.004,
    "S": 0.029,
    "Cr": 0.100,
    "Cu": 0.190,
    "Ni": 0.120,
    "V": 0.0,
    "Mo": 0.027,
    "N2": 0.0,
    "Sn": 0.0
  },
  chemSlag: {
    "CaO": 0.090,
    "SiO2": 0.140,
    "P2O5": 0.000,
    "Cr2O3": 0.004,
    "FeO": 0.029,
    "MnO": 0.100,
    "MgO": 0.190,
    "Al2O3": 0.120,
    "S": 0.0,
    "Mo": 0.027,
    "N2": 0.0,
    "Basicity": 2.4
  },
  insights: [
    {
      id: "ins-01",
      type: "critical" as const,
      title: "Critical Action Required",
      message: "Increase carbon addition by 0.42t in next 5 minutes to avoid composition drift. Current trajectory shows 0.19% below target.",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      acknowledged: false,
      actionable: true
    },
    {
      id: "ins-02",
      type: "optimization" as const,
      title: "Stage 15 Optimization",
      message: "Reducing power during phase 15 by 8% would save 4.2kWh without affecting quality based on current composition trajectory.",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      acknowledged: false,
      actionable: true
    },
    {
      id: "ins-03",
      type: "trend" as const,
      title: "Trend Analysis",
      message: "Slag basicity approaching optimal range. Current CaO/SiO₂ ratio is trending toward 2.4 which matches target grade requirements.",
      timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
      acknowledged: false,
      actionable: false
    },
    {
      id: "ins-04",
      type: "historical" as const,
      title: "Historical Pattern",
      message: "Your last 3 heats of 13KhFA/9 grade have shown consistent S values (0.028-0.030%). Current trajectory is within optimal parameters.",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      acknowledged: false,
      actionable: false
    }
  ]
};

// Create completely different heat datasets including realistic historical data
function createHeatData(heat: number, grade: string, master: string, operator: string, 
                       confidence: number, timestamp: string, isPastHeat: boolean = false) {
  
  // Base materials vary by steel grade
  const materialsByGrade = {
    "13KhFA/9": [
      { name: "Scrap 3AZhD", weight: 9.7, percentage: 9.6 },
      { name: "Scrap 25A", weight: 5.8, percentage: 5.7 },
      { name: "Scrap 3AN", weight: 76.1, percentage: 75.1 },
      { name: "Turnings 15A", weight: 4.2, percentage: 4.1 },
      { name: "Anthracite", weight: 0.8, percentage: 0.8 },
      { name: "HBI (briquetted DRI)", weight: 4.7, percentage: 4.6 }
    ],
    "10G2B4": [
      { name: "Scrap Heavy", weight: 78.2, percentage: 76.5 },
      { name: "DRI Pellets", weight: 18.4, percentage: 18.0 },
      { name: "Cast Iron", weight: 5.6, percentage: 5.5 }
    ],
    "S235JR": [
      { name: "Scrap Mix", weight: 85.6, percentage: 84.2 },
      { name: "Hot Metal", weight: 12.8, percentage: 12.6 },
      { name: "Coke", weight: 3.2, percentage: 3.2 }
    ],
    "42CrMo4": [
      { name: "Scrap Premium", weight: 45.2, percentage: 44.8 },
      { name: "Pig Iron Low P", weight: 48.7, percentage: 48.3 },
      { name: "FeCr LC", weight: 4.9, percentage: 4.9 },
      { name: "FeMo", weight: 2.0, percentage: 2.0 }
    ]
  };

  // Chemistry by grade
  const chemistryByGrade = {
    "13KhFA/9": { "C": 0.090, "Mn": 0.140, "Si": 0.000, "P": 0.004, "S": 0.029, "Cr": 0.100, "Cu": 0.190, "Ni": 0.120, "V": 0.0, "Mo": 0.027, "N2": 0.0, "Sn": 0.0 },
    "10G2B4": { "C": 0.105, "Mn": 0.380, "Si": 0.025, "P": 0.008, "S": 0.015, "Cr": 0.080, "Cu": 0.145, "Ni": 0.095, "V": 0.0, "Mo": 0.018, "N2": 0.0, "Sn": 0.0 },
    "S235JR": { "C": 0.067, "Mn": 0.185, "Si": 0.012, "P": 0.012, "S": 0.032, "Cr": 0.045, "Cu": 0.205, "Ni": 0.078, "V": 0.0, "Mo": 0.008, "N2": 0.0, "Sn": 0.0 },
    "42CrMo4": { "C": 0.420, "Mn": 0.750, "Si": 0.285, "P": 0.006, "S": 0.008, "Cr": 1.150, "Mo": 0.245, "Ni": 0.089, "V": 0.0, "N2": 0.0, "Sn": 0.0 }
  };

  // Stage progression for past vs current heats
  const stageStatus = isPastHeat ? 
    mockHeatData.stages.map(stage => ({ ...stage, status: 'done' as const, actualTime: stage.plannedTime, actualEnergy: stage.plannedEnergy })) :
    mockHeatData.stages;

  const materials = materialsByGrade[grade as keyof typeof materialsByGrade] || materialsByGrade["13KhFA/9"];
  const chemistry = chemistryByGrade[grade as keyof typeof chemistryByGrade] || chemistryByGrade["13KhFA/9"];

  return {
    ...mockHeatData,
    heat,
    ts: timestamp,
    grade,
    master,
    operator,
    confidence,
    modelStatus: isPastHeat ? 'idle' as const : mockHeatData.modelStatus,
    buckets: [{
      id: 1,
      materials,
      totalWeight: materials.reduce((sum, m) => sum + m.weight, 0)
    }],
    stages: stageStatus,
    chemSteel: chemistry
  };
}

// Create heat variants with realistic industrial data
const heatVariants = new Map([
  [93378, mockHeatData], // Current heat (live)
  [93379, createHeatData(93379, "10G2B4", "Kozlov", "Sidorov", 92, "2019-01-13 05:30:22", false)], // Current heat (different grade)
  [93380, createHeatData(93380, "S235JR", "Volkov", "Morozov", 78, "2019-01-13 08:15:45", true)], // Past completed heat
  [93381, createHeatData(93381, "42CrMo4", "Petrov", "Ivanov", 96, "2019-01-13 11:42:18", true)] // Past completed heat
]);

// Get heat data by number
const getHeatData = (heatNumber: number) => {
  const data = heatVariants.get(heatNumber);
  console.log(`Heat ${heatNumber} requested - Found: ${!!data}, Grade: ${data?.grade}, Master: ${data?.master}`);
  return data || mockHeatData;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Create a map to store client connections by heatId
  const clientsByHeat: Map<number, Set<WebSocket>> = new Map();
  
  // WebSocket server connection handler
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Parse heatId from query string if available
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const heatId = parseInt(url.searchParams.get('heatId') || '0');
    
    // Track client connection by heatId if provided
    if (heatId) {
      if (!clientsByHeat.has(heatId)) {
        clientsByHeat.set(heatId, new Set());
      }
      clientsByHeat.get(heatId)?.add(ws);
      
      // Send specific heat data based on heatId
      const heatData = getHeatData(heatId);
      ws.send(JSON.stringify({
        type: 'heat_data',
        payload: { ...heatData }
      }));
    } else {
      // Send available heat numbers
      ws.send(JSON.stringify({
        type: 'available_heats',
        payload: [93378, 93379, 93380, 93381]
      }));
    }
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        console.log('Received message:', parsedMessage);
        
        // Handle subscription request
        if (parsedMessage.type === 'subscribe' && parsedMessage.payload?.heatId) {
          const newHeatId = parseInt(parsedMessage.payload.heatId);
          
          // Remove from previous heat if any
          if (heatId) {
            clientsByHeat.get(heatId)?.delete(ws);
          }
          
          // Add to new heat
          if (!clientsByHeat.has(newHeatId)) {
            clientsByHeat.set(newHeatId, new Set());
          }
          clientsByHeat.get(newHeatId)?.add(ws);
          
          // Send heat data with exact values from Markdown tables
          ws.send(JSON.stringify({
            type: 'heat_data',
            payload: mockHeatData
          }));
        }
        
        // Handle insight acknowledgement
        if (parsedMessage.type === 'acknowledge_insight' && parsedMessage.payload?.insightId) {
          console.log(`Insight ${parsedMessage.payload.insightId} acknowledged`);
        }
        
        // Phase 5: Handle ping for latency measurement
        if (parsedMessage.type === 'ping' && parsedMessage.payload?.timestamp) {
          ws.send(JSON.stringify({
            type: 'pong',
            payload: { 
              timestamp: parsedMessage.payload.timestamp,
              serverTime: Date.now()
            }
          }));
        }
        
        // Handle chat message with real AI service
        if (parsedMessage.type === 'chat_message' && parsedMessage.payload?.message) {
          if (aiService.isConfigured()) {
            // Use real AI service when API key is available
            aiService.generateInsight(mockHeatData, 'process')
              .then(insight => {
                const response = {
                  type: 'chat_response',
                  payload: {
                    message: `AI Analysis: ${insight.message}`,
                    timestamp: new Date().toISOString(),
                    confidence: 85
                  }
                };
                ws.send(JSON.stringify(response));
              })
              .catch(error => {
                const response = {
                  type: 'chat_response',
                  payload: {
                    message: `AI service error: ${error.message}. Your message: "${parsedMessage.payload.message}"`,
                    timestamp: new Date().toISOString()
                  }
                };
                ws.send(JSON.stringify(response));
              });
          } else {
            const response = {
              type: 'chat_response',
              payload: {
                message: `Please configure OpenRouter API key to enable AI chat functionality. Your message: "${parsedMessage.payload.message}"`,
                timestamp: new Date().toISOString()
              }
            };
            ws.send(JSON.stringify(response));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Remove from tracked clients
      if (heatId && clientsByHeat.has(heatId)) {
        clientsByHeat.get(heatId)?.delete(ws);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // DEMO_RANDOM environment variable controls random insight broadcasts
  const demoRandom = process.env.DEMO_RANDOM === 'true';
  
  // Random insight push (opt-in only via DEMO_RANDOM=true)
  if (demoRandom) {
    setInterval(() => {
      // Send random insights to all connected clients
      const randomInsights = [
        { type: 'insight', text: 'Electrode consumption appears optimized', priority: 'medium' },
        { type: 'model_update', status: 'Thermal model recalibrated', confidence: 94 },
        { type: 'insight', text: 'Power factor efficiency detected', priority: 'high' }
      ];
      
      const randomInsight = randomInsights[Math.floor(Math.random() * randomInsights.length)];
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: randomInsight.type,
            payload: randomInsight
          }));
        }
      });
    }, 10000); // Every 10 seconds
  }
  
  // All insights are deterministic by default (DEMO_RANDOM=false)
  
  // API routes
  // Health check endpoint for API smoke tests
  app.get('/healthz', (req, res) => {
    res.json({ ok: true, timestamp: Date.now(), service: 'I-MELT API' });
  });

  app.get('/api/heats', async (req, res) => {
    res.json([93378, 93379, 93380, 93381]);
  });
  
  // Fix: Add both singular and plural endpoints for compatibility
  app.get('/api/heat/:id', async (req, res) => {
    const heatId = parseInt(req.params.id);
    const heatData = getHeatData(heatId);
    res.json(heatData); // Direct response format for compatibility
  });
  
  // AI Insights endpoint - deterministic by default
  app.get('/api/insights/:heatId', (req, res) => {
    try {
      const { heatId } = req.params;
      const clientId = req.ip || 'default';
      const sim = sims.get(clientId);
      
      if (!sim) {
        return res.status(400).json({ error: 'No active simulation for insights.' });
      }
      
      // Get current simulation state
      const currentTick = sim.getCurrentState();
      
      if (!currentTick) {
        return res.status(404).json({ error: 'No simulation data available.' });
      }
      
      // Generate deterministic insight
      const insight = insightFor(currentTick);
      
      res.json({
        heatId: parseInt(heatId),
        timestamp: Date.now(),
        mode: 'deterministic',
        insight,
        simulationState: {
          stage: currentTick.stage,
          tempC: Math.round(currentTick.tempC),
          kwhPerT: (currentTick.kwhPerT * 1000).toFixed(1),
          pf: currentTick.pf.toFixed(2),
          foamIdx: (currentTick.foamIdx * 100).toFixed(0)
        }
      });
      
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to generate insights: ${error.message}` 
      });
    }
  });
  
  // ROI Calculation API endpoints
  app.post('/api/roi/calculate', (req, res) => {
    try {
      const { current, prices }: { current: Current; prices?: Prices } = req.body;
      
      if (!current) {
        return res.status(400).json({ error: 'Current performance data is required' });
      }
      
      const finalPrices = { ...DEFAULT_PRICES, ...prices };
      const roi = computeROI(DEFAULT_BASELINE, current, finalPrices);
      
      res.json(roi);
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to calculate ROI: ${error.message}` 
      });
    }
  });

  app.post('/api/roi/report', async (req, res) => {
    try {
      const { current, prices, heatId, operator }: { 
        current: Current; 
        prices?: Prices; 
        heatId?: number;
        operator?: string;
      } = req.body;
      
      if (!current) {
        return res.status(400).json({ error: 'Current performance data is required' });
      }

      const finalPrices = { ...DEFAULT_PRICES, ...prices };
      const roi = computeROI(DEFAULT_BASELINE, current, finalPrices);
      
      // Generate report ID
      const reportId = `I-MELT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare data for PDF generation
      const pdfData = {
        roi,
        baseline: DEFAULT_BASELINE,
        current,
        prices: finalPrices,
        metadata: {
          heatId: heatId || 93378,
          operator: operator || 'Demo User',
          timestamp: new Date(),
          reportId
        }
      };

      // Generate PDF using professional service
      const pdfBuffer = await pdfService.generateROIPDF(pdfData);
      
      // Set proper PDF headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="I-MELT_ROI_Report.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF
      res.send(pdfBuffer);
      
      console.log(`📄 Generated ROI PDF report: ${reportId} (${pdfBuffer.length} bytes)`);
      
    } catch (error: any) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: `Failed to generate ROI report: ${error.message}` });
    }
  });

  // AI Chat API endpoint  
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, heatData } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await aiService.chatCompletion(message, heatData || mockHeatData);
      
      // Return either the AI response or fallback
      const responseText = result.response || result.fallbackResponse;
      
      res.json({
        response: responseText,
        confidence: result.confidence,
        fallbackUsed: !result.response
      });
    } catch (error: any) {
      console.error('AI Chat API Error:', error);
      res.status(500).json({ 
        error: 'Failed to process AI chat request',
        fallbackResponse: 'I apologize, but I cannot process your request at the moment. Please check the OpenRouter API configuration.'
      });
    }
  });

  // AI Insights API endpoint
  app.post('/api/ai/generate-insight', async (req, res) => {
    try {
      const { heatData, type } = req.body;
      
      if (!aiService.isConfigured()) {
        return res.status(503).json({ 
          error: 'AI service not configured. Please provide OpenRouter API key.' 
        });
      }

      const insight = await aiService.generateInsight(heatData || mockHeatData, type || 'process');
      res.json(insight);
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to generate AI insight: ${error.message}` 
      });
    }
  });



  // Reports API endpoints
  app.post('/api/reports/generate', async (req, res) => {
    try {
      const { reportType, format, heatRange, dateRange } = req.body;
      
      // Simulate report generation
      const reportData = {
        id: `report-${Date.now()}`,
        type: reportType,
        format: format,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        downloadUrl: `/api/reports/download/${reportType}-${Date.now()}.${format}`,
        metadata: {
          heatRange,
          dateRange,
          recordCount: Math.floor(Math.random() * 1000) + 100,
          fileSize: `${(Math.random() * 5 + 1).toFixed(1)}MB`
        }
      };

      res.json(reportData);
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to generate report: ${error.message}` 
      });
    }
  });

  app.get('/api/reports/download/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      
      // In a real application, this would serve the actual file
      res.json({
        message: `Report ${filename} would be downloaded in a real system`,
        downloadUrl: `/downloads/${filename}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to download report: ${error.message}` 
      });
    }
  });

  // Scenario injection endpoints for "Win Moments" demo
  app.post('/api/demo/scenario/:scenarioId', async (req, res) => {
    try {
      const { scenarioId } = req.params;
      const clientId = req.ip || 'default';
      const sim = sims.get(clientId);
      
      if (!sim) {
        return res.status(400).json({ error: 'No active simulation. Start simulation first.' });
      }
      
      // Load scenario from file
      const scenarioPath = path.join(process.cwd(), 'server/demo/scenarios', `${scenarioId}.json`);
      if (!fs.existsSync(scenarioPath)) {
        return res.status(404).json({ error: `Scenario "${scenarioId}" not found` });
      }
      
      const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as ScenarioInjection;
      sim.injectScenario(scenarioData);
      
      res.json({
        ok: true,
        scenario: scenarioData,
        message: `Scenario "${scenarioId}" injected successfully`
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to inject scenario: ${error.message}` });
    }
  });

  app.post('/api/demo/recovery', (req, res) => {
    try {
      const clientId = req.ip || 'default';
      const sim = sims.get(clientId);
      
      if (!sim) {
        return res.status(400).json({ error: 'No active simulation. Start simulation first.' });
      }
      
      sim.applyRecovery();
      res.json({
        ok: true,
        message: 'Recovery actions applied successfully'
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to apply recovery: ${error.message}` });
    }
  });

  // Phase 2: Apply Plan endpoint for specific insight recommendations
  app.post('/api/demo/apply-plan', (req, res) => {
    try {
      const clientId = req.ip || 'default';
      const sim = sims.get(clientId);
      const { insightId, expectedImpact } = req.body;
      
      if (!sim) {
        return res.status(400).json({ error: 'No active simulation. Start simulation first.' });
      }

      // Get current tick to determine which plan to apply
      const currentTick = sim.getCurrentTick();
      if (!currentTick) {
        return res.status(400).json({ error: 'No simulation data available' });
      }

      // Apply specific optimization based on current insight
      const insight = insightFor(currentTick);
      
      if (!insight.applyable) {
        return res.status(400).json({ error: 'Current insight is not applyable automatically' });
      }

      // Apply the plan by making targeted adjustments to simulation parameters
      const appliedChanges = sim.applyInsightPlan(insight);
      
      res.json({
        ok: true,
        message: `Applied: ${insight.title}`,
        appliedChanges,
        expectedImpact: insight.expectedImpact,
        timestamp: Date.now(),
        // Phase 2 requirement: Show KPI changes within 10-15 seconds
        visibleIn: '10-15 seconds'
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to apply plan: ${error.message}` });
    }
  });

  // Phase 3: Sync Guard API endpoints for LF→CC synchronization
  app.get('/api/sync/analyze/:routeId', (req, res) => {
    try {
      const { routeId } = req.params;
      const heatId = parseInt(req.query.heatId as string) || 93378;
      
      // Mock route data for demo - in real implementation would come from plant systems
      const mockRoute: RouteETA = {
        eta_LF: 2,        // Ladle ready in 2 minutes
        eta_CC: 8,        // Caster available in 8 minutes  
        eta_target: 4,    // Target was 4 minutes
        route_id: routeId
      };

      const analysis = syncGuard.analyzeRoute(mockRoute);
      
      res.json({
        ok: true,
        heatId,
        analysis,
        timestamp: Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to analyze route: ${error.message}` });
    }
  });

  app.post('/api/sync/apply-mitigation', (req, res) => {
    try {
      const { routeId, mitigationId, heatId, operator } = req.body;
      
      if (!routeId || !mitigationId) {
        return res.status(400).json({ error: 'routeId and mitigationId are required' });
      }

      // Get fresh analysis for the route
      const mockRoute: RouteETA = {
        eta_LF: 2,
        eta_CC: 8,
        eta_target: 4,
        route_id: routeId
      };

      const analysis = syncGuard.analyzeRoute(mockRoute);
      const chosen_mitigation = analysis.mitigation_options.find(m => m.id === mitigationId);
      
      if (!chosen_mitigation) {
        return res.status(400).json({ error: 'Invalid mitigation option' });
      }

      // Calculate final impact after mitigation
      const final_impact = syncGuard.applyMitigation(
        analysis.route,
        analysis.baseline_impact,
        chosen_mitigation
      );

      // Log the decision
      const decision: SyncDecision = {
        timestamp: Date.now(),
        route_id: routeId,
        original_impact: analysis.baseline_impact,
        chosen_mitigation,
        final_impact,
        operator: operator || 'Demo User'
      };

      syncDecisionLog.logDecision(decision);

      res.json({
        ok: true,
        message: `Mitigation "${chosen_mitigation.name}" applied successfully`,
        decision,
        savings: {
          per_heat: decision.original_impact.cost_per_heat - decision.final_impact.cost_per_heat,
          per_day: decision.original_impact.cost_per_day - decision.final_impact.cost_per_day,
          per_year: decision.original_impact.cost_per_year - decision.final_impact.cost_per_year
        },
        timestamp: Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to apply mitigation: ${error.message}` });
    }
  });

  app.get('/api/sync/decisions', (req, res) => {
    try {
      const routeId = req.query.routeId as string;
      const count = parseInt(req.query.count as string) || 10;
      
      const decisions = routeId 
        ? syncDecisionLog.getDecisions(routeId)
        : syncDecisionLog.getRecentDecisions(count);
      
      const totalSavings = syncDecisionLog.getTotalSavings();
      
      res.json({
        ok: true,
        decisions,
        totalSavings,
        count: decisions.length,
        timestamp: Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to get decisions: ${error.message}` });
    }
  });

  app.get('/api/sync/config', (req, res) => {
    try {
      const config = syncGuard.getConfig();
      res.json({
        ok: true,
        config,
        timestamp: Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to get config: ${error.message}` });
    }
  });

  app.post('/api/sync/config', (req, res) => {
    try {
      const { config } = req.body;
      
      if (!config) {
        return res.status(400).json({ error: 'Config object is required' });
      }

      syncGuard.updateConfig(config);
      
      res.json({
        ok: true,
        message: 'Sync Guard configuration updated',
        config: syncGuard.getConfig(),
        timestamp: Date.now()
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to update config: ${error.message}` });
    }
  });

  app.get('/api/demo/scenarios', (req, res) => {
    try {
      const scenariosDir = path.join(process.cwd(), 'server/demo/scenarios');
      const files = fs.readdirSync(scenariosDir);
      const scenarios = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const content = fs.readFileSync(path.join(scenariosDir, file), 'utf8');
          return JSON.parse(content);
        });
      
      res.json({ scenarios });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to load scenarios: ${error.message}` });
    }
  });

  // Deterministic Heat Simulator endpoints for physics-based demo
  app.get('/api/demo/start', (req, res) => {
    const seed = Number(req.query.seed ?? 42);
    const heatId = Number(req.query.heatId ?? 93378); // Allow simulator to target specific heat
    const clientId = req.ip || 'default';
    
    // Stop existing simulation if any
    const existingSim = sims.get(clientId);
    if (existingSim) {
      existingSim.removeAllListeners();
    }
    
    // Create new seeded simulation
    const sim = new HeatSim(seed);
    sims.set(clientId, sim);
    
    // Send periodic updates via WebSocket and update heat data
    const interval = setInterval(() => {
      const tick = sim.tick();
      
      // Get current heat data and update with simulation values  
      const currentHeatData = getHeatData(heatId);
      const updatedHeatData = {
        ...currentHeatData,
        ts: new Date(tick.ts).toISOString().slice(0, 19).replace('T', ' '),
        chemSteel: {
          ...currentHeatData.chemSteel,
          "C": tick.cPct || currentHeatData.chemSteel.C,
          "S": (tick.oPct || 0.029) / 10, // Convert to reasonable range
        },
        // Update stages based on simulation progress
        stages: currentHeatData.stages.map(stage => {
          const currentTime = sim.getStatus().time;
          if (stage.bucket === 1) {
            // Update current stage status based on simulation
            if (currentTime > 120 && stage.stage === 15) {
              return { ...stage, status: 'done' as const, actualTime: '00:24', actualEnergy: 0.38 };
            }
            if (currentTime > 900 && stage.stage === 16) {
              return { ...stage, status: 'current' as const };
            }
          }
          return stage;
        })
      };
      
      // Broadcast simulation tick for real-time display
      const tickMessage = JSON.stringify({
        type: 'simulation_tick',
        payload: tick
      });
      
      // Broadcast updated heat data
      const heatMessage = JSON.stringify({
        type: 'heat_data',
        payload: updatedHeatData
      });
      
      // Send to connected clients
      if (clientsByHeat.size > 0) {
        clientsByHeat.forEach((clients) => {
          clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(tickMessage);
              ws.send(heatMessage);
            }
          });
        });
      }
      
      // Stop simulation after TAP stage
      if (tick.stage === 'TAP' && sim.getStatus().time > 1200) {
        clearInterval(interval);
        sims.delete(clientId);
      }
    }, 1000);
    
    res.json({ ok: true, seed, status: 'started' });
  });

  app.get('/api/demo/stop', (req, res) => {
    const clientId = req.ip || 'default';
    const sim = sims.get(clientId);
    
    if (sim) {
      sim.removeAllListeners();
      sims.delete(clientId);
      res.json({ ok: true, status: 'stopped' });
    } else {
      res.json({ ok: false, error: 'No simulation running' });
    }
  });

  // Phase 1: Deterministic Reset with Scenario Support
  app.get('/api/demo/reset', (req, res) => {
    try {
      const seed = Number(req.query.seed ?? 42);
      const heatId = Number(req.query.heatId ?? 93378);
      const scenario = req.query.scenario as string || '';
      const injectAtSec = Number(req.query.injectAtSec ?? 0);
      const clientId = req.ip || 'default';
      
      console.log(`🔄 Deterministic reset: seed=${seed}, heatId=${heatId}, scenario=${scenario}, injectAt=${injectAtSec}`);
      
      // Stop existing simulation if any
      const existingSim = sims.get(clientId);
      if (existingSim) {
        existingSim.removeAllListeners();
        sims.delete(clientId);
      }
      
      // Create new simulation with deterministic seed
      const newSim = new HeatSim(seed);
      
      // Fast-forward simulation to injection time if specified
      if (injectAtSec > 0) {
        console.log(`⏩ Fast-forwarding simulation to ${injectAtSec} seconds`);
        // Fast-forward by ticking the simulation
        for (let i = 0; i < injectAtSec; i++) {
          newSim.tick();
        }
      }
      
      // Apply scenario if specified
      if (scenario) {
        console.log(`🎬 Applying scenario: ${scenario}`);
        try {
          newSim.injectScenario(scenario as any);
        } catch (scenarioError) {
          console.warn(`⚠️ Failed to inject scenario ${scenario}:`, scenarioError);
        }
      }
      
      sims.set(clientId, newSim);
      
      // Get current simulation state
      const currentTick = newSim.tick();
      
      console.log(`✅ Deterministic reset complete: ${newSim.getStatus().stage} stage at ${newSim.getStatus().time}s`);
      
      res.json({ 
        ok: true, 
        status: 'reset',
        seed: seed,
        heatId: heatId,
        scenario: scenario || null,
        seconds: newSim.getStatus().time,
        stage: currentTick.stage,
        confidence: 85,
        temperature: currentTick.tempC,
        energy: currentTick.kwhPerT
      });
    } catch (error: any) {
      console.error('Deterministic reset failed:', error);
      res.status(500).json({ error: `Failed to reset simulation: ${error.message}` });
    }
  });

  // Legacy POST endpoint for backwards compatibility
  app.post('/api/demo/reset', (req, res) => {
    try {
      const { seed = 42 } = req.body;
      const clientId = req.ip || 'default';
      
      // Stop existing simulation if any
      const existingSim = sims.get(clientId);
      if (existingSim) {
        existingSim.removeAllListeners();
        sims.delete(clientId);
      }
      
      // Create new simulation with specified seed (default 42)
      const newSim = new HeatSim(seed);
      sims.set(clientId, newSim);
      
      console.log(`🔄 Legacy reset simulation with seed=${seed} for client ${clientId}`);
      
      res.json({ 
        ok: true, 
        status: 'reset', 
        seed: seed,
        heatId: 93378,
        confidence: 85,
        stage: 'MELT'
      });
    } catch (error: any) {
      console.error('Reset failed:', error);
      res.status(500).json({ error: `Failed to reset simulation: ${error.message}` });
    }
  });

  // Phase 1: Current simulation state endpoint
  app.get('/api/demo/state', (req, res) => {
    const clientId = req.ip || 'default';
    const sim = sims.get(clientId);
    
    if (sim) {
      const currentTick = sim.tick();
      res.json({
        ok: true,
        seed: sim.seed || 42,
        heatId: 93378, // TODO: Make this configurable
        seconds: currentTick.time,
        stage: currentTick.stage,
        scenarioActive: sim.activeScenario || null,
        running: true,
        temperature: currentTick.tempC,
        energy: currentTick.kwhPerT,
        powerFactor: currentTick.pf
      });
    } else {
      res.json({
        ok: false,
        seed: null,
        heatId: null,
        seconds: 0,
        stage: null,
        scenarioActive: null,
        running: false,
        error: 'No active simulation'
      });
    }
  });

  // Phase 1: Available scenarios endpoint
  app.get('/api/demo/scenarios', (req, res) => {
    try {
      const scenarios = [
        {
          id: 'energy-spike',
          name: 'Energy Consumption Spike',
          description: 'Power consumption increases due to electrode issues',
          injectAtSec: 120,
          expectedImpact: '+15% energy consumption',
          category: 'energy'
        },
        {
          id: 'foam-collapse', 
          name: 'Foam Index Collapse',
          description: 'Slag foaming collapses, exposing electrodes',
          injectAtSec: 180,
          expectedImpact: '+25% electrode consumption',
          category: 'process'
        },
        {
          id: 'temp-risk',
          name: 'Temperature Deviation Risk',
          description: 'Temperature trending outside target range',
          injectAtSec: 240,
          expectedImpact: 'Quality risk, timing delays',
          category: 'quality'
        },
        {
          id: 'power-factor',
          name: 'Poor Power Factor',
          description: 'Power factor drops below optimal range',
          injectAtSec: 300,
          expectedImpact: '+8% energy costs',
          category: 'energy'
        }
      ];
      
      res.json({
        ok: true,
        scenarios: scenarios,
        count: scenarios.length
      });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to load scenarios: ${error.message}` });
    }
  });

  app.get('/api/demo/status', (req, res) => {
    const clientId = req.ip || 'default';
    const sim = sims.get(clientId);
    
    if (sim) {
      res.json({ 
        ok: true, 
        running: true,
        ...sim.getStatus()
      });
    } else {
      res.json({ 
        ok: true, 
        running: false 
      });
    }
  });

  // ROI PDF endpoint with proper error handling
  app.get('/api/roi/pdf', async (req, res) => {
    try {
      const heatId = parseInt(req.query.heatId as string) || 93378;
      
      // Mock current performance data for demo
      const mockCurrent = {
        kwhPerTon: 420,
        electrodeConsumption: 2.1,
        qualityScore: 96,
        downtime: 8,
        heatsPerMonth: 850
      };

      // Generate PDF using the service
      const pdfData = {
        roi: computeROI(DEFAULT_BASELINE, mockCurrent, DEFAULT_PRICES),
        baseline: DEFAULT_BASELINE,
        current: mockCurrent,
        prices: DEFAULT_PRICES,
        metadata: {
          heatId,
          operator: 'Demo User',
          timestamp: new Date(),
          reportId: `I-MELT-${Date.now()}`
        }
      };

      const pdfBuffer = await pdfService.generateROIPDF(pdfData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="I-MELT_ROI_Report.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
      
    } catch (error: any) {
      console.error('PDF generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate ROI PDF report',
        message: error.message 
      });
    }
  });

  // Predictive Action Execution Endpoints
  // These endpoints simulate realistic steel production actions for demo
  
  app.post('/api/actions/adjust-carbon', async (req, res) => {
    try {
      const { heatId, targetC, addAmount } = req.body;
      
      // Simulate realistic carbon adjustment process
      const adjustmentTime = Math.floor(Math.random() * 300) + 480; // 8-13 minutes
      const confidence = Math.floor(Math.random() * 15) + 85; // 85-100% confidence
      
      setTimeout(() => {
        console.log(`✅ Carbon adjustment complete for Heat ${heatId}: +${addAmount}t carbon added`);
      }, 2000); // Simulate processing delay
      
      res.json({
        ok: true,
        action: 'adjust-carbon',
        heatId: heatId,
        parameters: {
          carbonAdded: addAmount,
          targetCarbon: targetC,
          estimatedTime: adjustmentTime,
          actualTime: adjustmentTime - Math.floor(Math.random() * 60)
        },
        result: {
          success: true,
          message: `Successfully added ${addAmount}t carbon to Heat ${heatId}`,
          newCarbonLevel: targetC,
          confidence: confidence,
          qualityImprovement: '+12% grade compliance',
          costImpact: `€${Math.floor(Math.random() * 200) + 150} material cost`,
          nextAction: 'Monitor chemistry for 15 minutes, then verify with lab analysis'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute carbon adjustment',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/desulfurize', async (req, res) => {
    try {
      const { heatId, targetS } = req.body;
      
      const treatmentTime = Math.floor(Math.random() * 300) + 600; // 10-15 minutes
      const confidence = Math.floor(Math.random() * 10) + 87; // 87-97% confidence
      
      res.json({
        ok: true,
        action: 'desulfurize',
        heatId: heatId,
        result: {
          success: true,
          message: `Desulfurization initiated for Heat ${heatId}`,
          newSulfurLevel: targetS,
          targetSulfur: targetS,
          estimatedTime: `${Math.floor(treatmentTime / 60)} minutes`,
          confidence: confidence,
          qualityImprovement: '+18% ductility improvement expected',
          agentsUsed: 'CaO + Al',
          costImpact: `€${Math.floor(Math.random() * 150) + 80} treatment cost`
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute desulfurization',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/adjust-silicon', async (req, res) => {
    try {
      const { heatId } = req.body;
      
      res.json({
        ok: true,
        action: 'adjust-silicon',
        heatId: heatId,
        result: {
          success: true,
          message: `Silicon adjustment initiated for Heat ${heatId}`,
          newSiliconLevel: 0.18, // Target silicon level
          estimatedTime: '6-8 minutes',
          confidence: 82,
          materialAdded: 'FeSi75',
          expectedBenefit: 'Improved deoxidation and steel cleanliness',
          costImpact: '€95 ferrosilicon cost'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute silicon adjustment',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/optimize-energy', async (req, res) => {
    try {
      const { heatId, powerReduction } = req.body;
      
      const savings = Math.floor(Math.random() * 200) + 750; // €750-950 savings
      
      res.json({
        ok: true,
        action: 'optimize-energy',
        heatId: heatId,
        result: {
          success: true,
          message: `Energy optimization applied to Heat ${heatId}`,
          powerReduction: `${(powerReduction * 100).toFixed(1)}%`,
          estimatedSavings: `€${savings}`,
          confidence: 84,
          method: 'Arc power curve optimization + electrode positioning',
          qualityImpact: 'No quality compromise expected',
          timeToEffect: '3-5 minutes'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute energy optimization',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/prevent-foam-collapse', async (req, res) => {
    try {
      const { heatId, urgency } = req.body;
      
      res.json({
        ok: true,
        action: 'prevent-foam-collapse',
        heatId: heatId,
        result: {
          success: true,
          message: 'Emergency foam stabilization executed',
          actions: [
            'Anti-foaming agent injection: 15kg',
            'Gas flow reduction: -20%',
            'Arc power adjustment: -10%'
          ],
          estimatedTime: '2-3 minutes',
          confidence: 94,
          criticalityLevel: urgency,
          expectedOutcome: 'Foam stability restored, electrode protection maintained'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute foam collapse prevention',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/stabilize-temperature', async (req, res) => {
    try {
      const { heatId, targetTemp } = req.body;
      
      res.json({
        ok: true,
        action: 'stabilize-temperature',
        heatId: heatId,
        result: {
          success: true,
          message: 'Temperature stabilization initiated',
          targetTemperature: `${targetTemp}°C`,
          actions: [
            'Arc power reduction: -15%',
            'Cooling lance activation',
            'Electrode positioning optimization'
          ],
          estimatedTime: '4-5 minutes',
          confidence: 91,
          safetyImpact: 'Overheating risk eliminated'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute temperature stabilization',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/manage-energy-spike', async (req, res) => {
    try {
      const { heatId } = req.body;
      
      res.json({
        ok: true,
        action: 'manage-energy-spike',
        heatId: heatId,
        result: {
          success: true,
          message: 'Energy spike management applied',
          actions: [
            'Arc power limiting: -20%',
            'Electrode height adjustment: +50mm',
            'Reactive power compensation'
          ],
          estimatedTime: '3-4 minutes',
          confidence: 88,
          equipmentProtection: 'Transformer and electrode damage prevention'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute energy spike management',
        message: error.message 
      });
    }
  });

  app.post('/api/actions/schedule-chemistry-check', async (req, res) => {
    try {
      const { heatId } = req.body;
      
      res.json({
        ok: true,
        action: 'schedule-chemistry-check',
        heatId: heatId || 93378,
        result: {
          success: true,
          message: 'Chemistry analysis scheduled',
          scheduledTime: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes from now
          analysisType: 'Full chemistry + inclusion analysis',
          estimatedTime: '15-20 minutes',
          confidence: 85,
          labTechnician: 'Auto-assigned',
          priority: 'Standard'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to schedule chemistry check',
        message: error.message 
      });
    }
  });

  app.post('/api/system/health-check', async (req, res) => {
    try {
      res.json({
        ok: true,
        action: 'health-check',
        result: {
          success: true,
          message: 'System health check completed',
          systems: {
            aiMonitoring: 'Operational',
            dataCollection: 'Operational', 
            networkConnectivity: 'Optimal',
            sensorStatus: '98.5% online',
            lastUpdate: new Date().toISOString()
          },
          confidence: 95,
          issues: 'None detected',
          nextCheck: '1 hour'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to execute health check',
        message: error.message 
      });
    }
  });

  // API Error Handler - Must be after all API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      endpoint: req.path,
      method: req.method,
      availableEndpoints: [
        'GET /api/heats',
        'GET /api/heat/:id', 
        'GET /api/insights/:heatId',
        'GET /api/roi/pdf',
        'POST /api/roi/calculate',
        'POST /api/roi/report',
        'POST /api/ai/chat',
        'POST /api/ai/generate-insight',
        'GET /api/demo/scenarios',
        'GET /api/demo/start',
        'GET /api/demo/stop',
        'GET /api/demo/reset',
        'POST /api/demo/scenario/:scenarioId',
        'POST /api/demo/recovery',
        'GET /api/sync/analyze/:routeId',
        'POST /api/sync/apply-mitigation',
        'POST /api/actions/adjust-carbon',
        'POST /api/actions/desulfurize',
        'POST /api/actions/adjust-silicon',
        'POST /api/actions/optimize-energy',
        'POST /api/actions/prevent-foam-collapse',
        'POST /api/actions/stabilize-temperature',
        'POST /api/actions/manage-energy-spike',
        'POST /api/actions/schedule-chemistry-check',
        'POST /api/system/health-check'
      ]
    });
  });

  return httpServer;
}
