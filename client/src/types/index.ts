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
  chemSteel: Record<string, number>;
  chemSlag: Record<string, number>;
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

// WebSocket message types
export interface WebSocketMessage {
  type: 'heat_data' | 'insight' | 'model_update' | 'available_heats' | 'error';
  payload: any;
}

// App state types
export interface AppState {
  language: 'en' | 'ru';
  heat: HeatData | null;
  heatNumber: number | null;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  selectedTab: 'insights' | 'explain' | 'chat';
  chemViewMode: 'absolute' | 'delta';
  chemActiveView: 'steel' | 'slag';
}

// Action types
export interface AppAction {
  type: string;
  payload?: any;
}
