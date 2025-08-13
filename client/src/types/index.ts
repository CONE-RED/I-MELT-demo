// Heat data types
export interface HeatData {
  ts: string;
  heat: number;
  grade: string;
  master: string;
  operator: string;
  buckets: Bucket[];
  stages: Stage[];
  additives: Additive[];
  chemSteel: Record<string, number | null>;
  chemSlag: Record<string, number | null>;
  insights: Insight[];
  modelStatus: 'idle' | 'training' | 'predicting';
  confidence: number;
}

export interface Bucket {
  id: number;
  materials: Material[];
  totalWeight: number;
}

export interface Material {
  name: string;
  weight: number;
  percentage: number;
}

export interface Stage {
  bucket: number;
  stage: number;
  plannedEnergy: number;
  actualEnergy: number | null;
  plannedTime: string;
  actualTime: string | null;
  profile: number;
  temp: number | null;
  status: 'done' | 'current' | 'planned';
}

export interface Additive {
  bucket: number;
  stage: number;
  name: string;
  weight: number;
  energy: number;
}

export interface Insight {
  id: string;
  type: 'critical' | 'optimization' | 'trend' | 'historical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  actionable: boolean;
}

// Simulation data types
export interface SimulationTick {
  ts: number;
  stage: "BOR" | "MELT" | "REFINE" | "TAP";
  tempC: number;
  kwhTotal: number;
  kwhPerT: number;
  pf: number;
  tap: number;
  thd: number;
  foamIdx: number;
  cPct?: number;
  oPct?: number;
  note?: string;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'heat_data' | 'insight' | 'model_update' | 'available_heats' | 'error' | 'simulation_tick' | 'ping' | 'pong';
  payload: any;
}

// Connection metrics for Phase 5 reliability
export interface ConnectionMetrics {
  latency: number;
  isBuffering: boolean;
  bufferSize: number;
  reconnectAttempts: number;
  lastServerTick: number;
}

// App state types
export interface AppState {
  language: 'en' | 'ru';
  heat: HeatData | null;
  heatNumber: number | null;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  connectionMetrics: ConnectionMetrics;
  selectedTab: 'insights' | 'explain' | 'chat';
  chemViewMode: 'absolute' | 'delta';
  simulationData: SimulationTick | null;
  chemActiveView: 'steel' | 'slag';
}

// Action types
export interface AppAction {
  type: string;
  payload?: any;
}
