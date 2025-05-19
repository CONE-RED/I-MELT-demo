import { createStore } from 'redux';
import { AppState, AppAction, HeatData, Insight } from '@/types';

// Initial state
const initialState: AppState = {
  language: 'en',
  heat: null,
  heatNumber: null,
  loading: false,
  error: null,
  wsConnected: false,
  selectedTab: 'insights',
  chemViewMode: 'absolute',
  chemActiveView: 'steel'
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
    default:
      return state;
  }
}

// Create store
export const store = createStore(reducer);

// Type-safe dispatch and selector hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
