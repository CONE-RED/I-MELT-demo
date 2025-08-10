import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { HeatSim } from "./demo/heat-sim";

// Mock data for a steel heat - based on exact values from the screenshot
// This is a showroom demo with the exact data from the Markdown tables
// Heat simulator instances for deterministic, physics-based simulation
const sims = new Map<string, HeatSim>();
const mockHeatData = {
  ts: "2019-01-13 03:00:11",
  heat: 93378,
  grade: "13KhFA/9",
  master: "Ivanov",
  operator: "Petrov",
  modelStatus: "idle",
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
    "V": null,
    "Mo": 0.027,
    "N2": null,
    "Sn": null
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
    "S": null,
    "Mo": 0.027,
    "N2": null,
    "Basicity": null
  },
  insights: [
    {
      id: "ins-01",
      type: "critical",
      title: "Critical Action Required",
      message: "Increase carbon addition by 0.42t in next 5 minutes to avoid composition drift. Current trajectory shows 0.19% below target.",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      acknowledged: false,
      actionable: true
    },
    {
      id: "ins-02",
      type: "optimization",
      title: "Stage 15 Optimization",
      message: "Reducing power during phase 15 by 8% would save 4.2kWh without affecting quality based on current composition trajectory.",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      acknowledged: false,
      actionable: true
    },
    {
      id: "ins-03",
      type: "trend",
      title: "Trend Analysis",
      message: "Slag basicity approaching optimal range. Current CaO/SiO₂ ratio is trending toward 2.4 which matches target grade requirements.",
      timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
      acknowledged: false,
      actionable: false
    },
    {
      id: "ins-04",
      type: "historical",
      title: "Historical Pattern",
      message: "Your last 3 heats of 13KhFA/9 grade have shown consistent S values (0.028-0.030%). Current trajectory is within optimal parameters.",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      acknowledged: false,
      actionable: false
    }
  ]
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
      
      // Send exact heat data for customer demo with the exact values from tables
      ws.send(JSON.stringify({
        type: 'heat_data',
        payload: { ...mockHeatData }
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
  
  // Setup periodic updates to simulate real-time data
  setInterval(() => {
    // Update all connected clients by heat
    clientsByHeat.forEach((clients, heatId) => {
      if (clients.size === 0) return;
      
      // Generate a random insight
      const newInsight = {
        id: `ins-${Date.now()}`,
        type: ["trend", "optimization", "historical"][Math.floor(Math.random() * 3)],
        title: "Real-time Update",
        message: `Temperature trending ${Math.random() > 0.5 ? 'up' : 'down'} by ${(Math.random() * 10).toFixed(1)}°C. ${Math.random() > 0.7 ? 'Consider adjusting power level.' : ''}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        actionable: Math.random() > 0.7
      };
      
      // Update model status randomly
      const modelStatus = Math.random() > 0.8 ? 'training' : (Math.random() > 0.5 ? 'predicting' : 'idle');
      const confidence = Math.min(100, Math.max(50, 85 + Math.floor((Math.random() - 0.5) * 20)));
      
      // Send to all clients subscribed to this heat
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          // Send new insight
          if (Math.random() > 0.7) {
            client.send(JSON.stringify({
              type: 'insight',
              payload: newInsight
            }));
          }
          
          // Send model update
          if (Math.random() > 0.8) {
            client.send(JSON.stringify({
              type: 'model_update',
              payload: { status: modelStatus, confidence }
            }));
          }
        }
      });
    });
  }, 10000); // Every 10 seconds
  
  // API routes
  app.get('/api/heats', async (req, res) => {
    res.json([93378, 93379, 93380, 93381]);
  });
  
  // Fix: Add both singular and plural endpoints for compatibility
  app.get('/api/heat/:id', async (req, res) => {
    const heatId = parseInt(req.params.id);
    res.json({ ...mockHeatData, heat: heatId });
  });
  
  app.get('/api/heats/:id', async (req, res) => {
    const heatId = parseInt(req.params.id);
    res.json({ ...mockHeatData, heat: heatId });
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

  // Deterministic Heat Simulator endpoints for physics-based demo
  app.get('/api/demo/start', (req, res) => {
    const seed = Number(req.query.seed ?? 42);
    const clientId = req.ip || 'default';
    
    // Stop existing simulation if any
    const existingSim = sims.get(clientId);
    if (existingSim) {
      existingSim.removeAllListeners();
    }
    
    // Create new seeded simulation
    const sim = new HeatSim(seed);
    sims.set(clientId, sim);
    
    // Send periodic updates via WebSocket
    const interval = setInterval(() => {
      const tick = sim.tick();
      
      // Broadcast to connected clients for this IP
      if (clientsByHeat.size > 0) {
        const message = JSON.stringify({
          type: 'simulation_tick',
          payload: tick
        });
        
        clientsByHeat.forEach((clients) => {
          clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(message);
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
