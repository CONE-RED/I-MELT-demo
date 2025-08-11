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

  app.post('/api/roi/report', (req, res) => {
    try {
      const { current, prices }: { current: Current; prices?: Prices } = req.body;
      if (!current) return res.status(400).json({ error: 'Current performance data is required' });

      const finalPrices = { ...DEFAULT_PRICES, ...prices };
      const roi = computeROI(DEFAULT_BASELINE, current, finalPrices);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="I-MELT_ROI_Report.pdf"');
      doc.pipe(res);

      // Header
      doc.fontSize(18).text('I-MELT ROI Analysis Report', { underline: true });
      doc.moveDown(0.5).fontSize(10).text(`Generated: ${new Date().toLocaleString('en-EU')}`);
      doc.moveDown();

      // Executive summary
      doc.fontSize(12).text(`Monthly Savings: €${roi.perMonth.toLocaleString('en-EU', { maximumFractionDigits: 0 })}`);
      doc.text(`Per Heat Savings: €${roi.perHeat.toFixed(2)}`);
      doc.text(`Annual Projection: €${(roi.perMonth * 12).toLocaleString('en-EU', { maximumFractionDigits: 0 })}`);
      doc.moveDown();

      // Table: improvements
      const rows = [
        ['Metric', 'Baseline', 'Optimized', 'Improvement'],
        ['Energy (kWh/t)', `${DEFAULT_BASELINE.kwhPerT}`, `${current.kwhPerT}`, `${roi.details.energyDelta.toFixed(1)} kWh/t`],
        ['Time (min/heat)', `${DEFAULT_BASELINE.minPerHeat}`, `${current.minPerHeat}`, `${roi.details.timeDelta.toFixed(1)} min/heat`],
        ['Electrodes (kg/heat)', `${DEFAULT_BASELINE.electrodeKgPerHeat}`, `${current.electrodeKgPerHeat}`, `${roi.details.electrodeDelta.toFixed(2)} kg/heat`],
      ];
      doc.fontSize(11);
      rows.forEach((r, i) => {
        if (i === 0) doc.font('Helvetica-Bold');
        doc.text(r[0], { continued: true, width: 160 });
        doc.text(r[1], { continued: true, width: 120 });
        doc.text(r[2], { continued: true, width: 120 });
        doc.text(r[3]);
        if (i === 0) doc.font('Helvetica');
      });
      doc.moveDown();

      // Breakdown
      doc.text('Breakdown (per heat):');
      doc.text(`• Energy: €${roi.breakdown.energySaving.toFixed(2)}`);
      doc.text(`• Time: €${roi.breakdown.timeSaving.toFixed(2)}`);
      doc.text(`• Electrodes: €${roi.breakdown.electrodeSaving.toFixed(2)}`);
      doc.moveDown();

      // Assumptions
      doc.text('Assumptions:');
      doc.text(`• Heats/day: ${DEFAULT_BASELINE.heatsPerDay}`);
      doc.text(`• Heat size: ${DEFAULT_BASELINE.massT} t`);
      doc.text(`• Energy price: €${finalPrices.kwh}/kWh`);
      doc.text(`• Electrode price: €${finalPrices.electrode}/kg`);
      doc.text(`• Production value: €${finalPrices.prodValuePerMin}/min`);

      doc.end();
    } catch (error: any) {
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

  return httpServer;
}
