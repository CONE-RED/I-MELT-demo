import { createStore } from 'redux';
import { AppState, AppAction, HeatData, Insight } from '@/types';

// Default heat data from the Markdown tables
const defaultHeatData = {
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
      title: "Energy Optimization",
      message: "Switch to profile 4 during stages 15-16 to reduce energy consumption by 8.7% based on historical data pattern.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      acknowledged: true,
      actionable: true
    },
    {
      id: "ins-03",
      type: "trend",
      title: "Manganese Trend Detected",
      message: "Mn levels trending 0.02% higher than previous 5 heats of same grade. Consider adjusting FeMn addition in bucket 2.",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      acknowledged: false,
      actionable: false
    }
  ]
};

// Initial state with default heat data preloaded
const initialState: AppState = {
  language: 'en',
  heat: defaultHeatData,
  heatNumber: 93378,
  loading: false,
  error: null,
  wsConnected: false,
  selectedTab: 'insights',
  chemViewMode: 'absolute',
  chemActiveView: 'steel',
  simulationData: null
};

// Reducer
function reducer(state: AppState = initialState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    case 'SET_HEAT_NUMBER':
      return {
        ...state,
        heatNumber: action.payload
      };
    case 'SET_HEAT_DATA':
      return {
        ...state,
        heat: action.payload,
        heatNumber: action.payload.heat
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_WS_CONNECTED':
      return {
        ...state,
        wsConnected: action.payload
      };
    case 'SET_HEAT_DATA':
      return {
        ...state,
        heat: action.payload,
        loading: false
      };
    case 'SET_SELECTED_TAB':
      return {
        ...state,
        selectedTab: action.payload
      };
    case 'SET_CHEM_VIEW_MODE':
      return {
        ...state,
        chemViewMode: action.payload
      };
    case 'SET_CHEM_ACTIVE_VIEW':
      return {
        ...state,
        chemActiveView: action.payload
      };
    case 'ADD_INSIGHT':
      if (!state.heat) return state;
      const newInsights = [...state.heat.insights];
      newInsights.unshift(action.payload);
      return {
        ...state,
        heat: {
          ...state.heat,
          insights: newInsights
        }
      };
    case 'UPDATE_MODEL_STATUS':
      if (!state.heat) return state;
      return {
        ...state,
        heat: {
          ...state.heat,
          modelStatus: action.payload.status,
          confidence: action.payload.confidence
        }
      };
    case 'ACKNOWLEDGE_INSIGHT':
      if (!state.heat) return state;
      const updatedInsights = state.heat.insights.map((insight: Insight) => 
        insight.id === action.payload 
          ? { ...insight, acknowledged: true }
          : insight
      );
      return {
        ...state,
        heat: {
          ...state.heat,
          insights: updatedInsights
        }
      };
    
    case 'CLEAR_SCREEN':
      // Clear screen action - reset dashboard to clean state
      if (!state.heat) return state;
      return {
        ...state,
        heat: {
          ...state.heat,
          insights: []
        },
        selectedTab: 'insights' as const,
        error: null
      };
      
    case 'UPDATE_SIMULATION_DATA':
      return {
        ...state,
        simulationData: action.payload
      };
      
    default:
      return state;
  }
}

// Create store
export const store = createStore(reducer);

// Type-safe dispatch and selector hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
