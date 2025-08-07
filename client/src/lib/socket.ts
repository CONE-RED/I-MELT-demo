import { WebSocketMessage } from '@/types';
import { store } from './store';

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;

export function setupWebSocket(heatId?: number): WebSocket {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.close();
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws${heatId ? `?heatId=${heatId}` : ''}`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
    store.dispatch({ type: 'SET_WS_CONNECTED', payload: true });
    reconnectAttempts = 0;
    
    // Send initial request
    if (heatId) {
      sendMessage({
        type: 'subscribe',
        payload: { heatId }
      });
    }
  };
  
  socket.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'heat_data':
          store.dispatch({ type: 'SET_HEAT_DATA', payload: message.payload });
          break;
        case 'insight':
          store.dispatch({ type: 'ADD_INSIGHT', payload: message.payload });
          break;
        case 'model_update':
          store.dispatch({ type: 'UPDATE_MODEL_STATUS', payload: message.payload });
          break;
        case 'available_heats':
          // Handle available heats list - could be used for heat selector
          console.log('Available heats:', message.payload);
          break;
        case 'error':
          store.dispatch({ type: 'SET_ERROR', payload: message.payload.message });
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  };
  
  socket.onclose = (event) => {
    store.dispatch({ type: 'SET_WS_CONNECTED', payload: false });
    
    if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
      console.log(`WebSocket connection closed. Reconnecting in ${delay}ms...`);
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      reconnectTimer = setTimeout(() => {
        reconnectAttempts++;
        setupWebSocket(heatId);
      }, delay);
    } else {
      console.log('WebSocket connection closed');
    }
  };
  
  socket.onerror = () => {
    console.error('WebSocket error occurred');
  };
  
  return socket;
}

export function sendMessage(message: any): boolean {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

export function closeWebSocket(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}
