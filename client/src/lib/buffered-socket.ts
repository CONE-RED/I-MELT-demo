/**
 * Enhanced WebSocket service with buffered playback and latency monitoring
 * Phase 5: Reliability, trust & ops polish
 */

import { WebSocketMessage } from '@/types';
import { store } from './store';

interface BufferedTick {
  timestamp: number;
  serverTimestamp: number;
  data: any;
  latency: number;
}

interface ConnectionMetrics {
  latency: number;
  isBuffering: boolean;
  bufferSize: number;
  reconnectAttempts: number;
  lastServerTick: number;
}

class BufferedWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private bufferPlaybackTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly BASE_RECONNECT_DELAY = 1000;
  
  // Ring buffer for storing recent ticks
  private readonly BUFFER_SIZE = 180; // 180 seconds at 1Hz
  private readonly BUFFER_PLAYBACK_INTERVAL = 1000; // 1 second playback
  private tickBuffer: BufferedTick[] = [];
  private bufferPlaybackIndex = 0;
  private isBuffering = false;
  
  // Latency monitoring
  private latency = 0;
  private lastPingTime = 0;
  private latencyCheckInterval: NodeJS.Timeout | null = null;
  
  // Connection state
  private currentHeatId?: number;
  private isConnected = false;
  
  constructor() {
    this.startLatencyMonitoring();
  }

  /**
   * Setup WebSocket connection with enhanced buffering
   */
  setupWebSocket(heatId?: number): WebSocket {
    this.currentHeatId = heatId;
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws${heatId ? `?heatId=${heatId}` : ''}`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('🔌 Enhanced WebSocket connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.stopBufferedPlayback();
      
      store.dispatch({ type: 'SET_WS_CONNECTED', payload: true });
      this.updateConnectionMetrics();
      
      // Send initial request
      if (heatId) {
        this.sendMessage({
          type: 'subscribe',
          payload: { heatId }
        });
      }
    };
    
    this.socket.onmessage = (event) => {
      const receiveTime = Date.now();
      
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Handle latency measurement for simulation_tick messages
        if (message.type === 'simulation_tick' && message.payload?.timestamp) {
          const serverTime = message.payload.timestamp;
          this.latency = receiveTime - serverTime;
          
          // Store in buffer for potential playback
          this.addToBuffer({
            timestamp: receiveTime,
            serverTimestamp: serverTime,
            data: message.payload,
            latency: this.latency
          });
        }
        
        this.processMessage(message);
        this.updateConnectionMetrics();
        
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err);
      }
    };
    
    this.socket.onclose = (event) => {
      console.log('🔌 WebSocket connection closed, starting buffered playback');
      this.isConnected = false;
      store.dispatch({ type: 'SET_WS_CONNECTED', payload: false });
      
      // Start buffered playback immediately
      this.startBufferedPlayback();
      
      // Attempt reconnection if not clean close
      if (!event.wasClean && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        const delay = this.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);
        console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts + 1})`);
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }
        
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts++;
          this.setupWebSocket(this.currentHeatId);
        }, delay);
      }
      
      this.updateConnectionMetrics();
    };
    
    this.socket.onerror = () => {
      console.error('❌ Enhanced WebSocket error occurred');
    };
    
    return this.socket;
  }

  /**
   * Add tick to ring buffer
   */
  private addToBuffer(tick: BufferedTick): void {
    this.tickBuffer.push(tick);
    
    // Maintain ring buffer size
    if (this.tickBuffer.length > this.BUFFER_SIZE) {
      this.tickBuffer.shift();
    }
  }

  /**
   * Start buffered playback when WebSocket disconnects
   */
  private startBufferedPlayback(): void {
    if (this.isBuffering || this.tickBuffer.length === 0) {
      return;
    }
    
    this.isBuffering = true;
    this.bufferPlaybackIndex = Math.max(0, this.tickBuffer.length - 60); // Start from 60 seconds ago
    
    console.log(`📦 Starting buffered playback from buffer (${this.tickBuffer.length} ticks available)`);
    
    this.bufferPlaybackTimer = setInterval(() => {
      if (this.bufferPlaybackIndex < this.tickBuffer.length) {
        const tick = this.tickBuffer[this.bufferPlaybackIndex];
        
        // Simulate real-time tick with buffered data
        const simulatedMessage: WebSocketMessage = {
          type: 'simulation_tick',
          payload: {
            ...tick.data,
            timestamp: Date.now(), // Use current time for smooth playback
            isBuffered: true
          }
        };
        
        this.processMessage(simulatedMessage);
        this.bufferPlaybackIndex++;
      } else {
        // Buffer exhausted, loop back to start for continuous demo
        this.bufferPlaybackIndex = Math.max(0, this.tickBuffer.length - 60);
      }
      
      this.updateConnectionMetrics();
    }, this.BUFFER_PLAYBACK_INTERVAL);
  }

  /**
   * Stop buffered playback when WebSocket reconnects
   */
  private stopBufferedPlayback(): void {
    if (this.bufferPlaybackTimer) {
      clearInterval(this.bufferPlaybackTimer);
      this.bufferPlaybackTimer = null;
    }
    
    this.isBuffering = false;
    console.log('📦 Stopped buffered playback - live connection restored');
  }

  /**
   * Process WebSocket messages (both live and buffered)
   */
  private processMessage(message: WebSocketMessage): void {
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
      case 'simulation_tick':
        // Handle real-time physics simulation data
        store.dispatch({ type: 'UPDATE_SIMULATION_DATA', payload: message.payload });
        break;
      case 'available_heats':
        console.log('Available heats:', message.payload);
        break;
      case 'pong':
        // Handle ping response for latency measurement
        if (message.payload?.timestamp && message.payload?.serverTime) {
          const roundTripTime = Date.now() - message.payload.timestamp;
          this.latency = Math.round(roundTripTime);
          console.log(`📊 Latency: ${this.latency}ms (RTT: ${roundTripTime}ms)`);
        }
        break;
      case 'error':
        store.dispatch({ type: 'SET_ERROR', payload: message.payload.message });
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Start latency monitoring with periodic pings
   */
  private startLatencyMonitoring(): void {
    this.latencyCheckInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        // Send ping through regular message - server echoes timestamp
        this.sendMessage({
          type: 'ping',
          payload: { timestamp: this.lastPingTime }
        });
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Update connection metrics in store
   */
  private updateConnectionMetrics(): void {
    const metrics: ConnectionMetrics = {
      latency: this.latency,
      isBuffering: this.isBuffering,
      bufferSize: this.tickBuffer.length,
      reconnectAttempts: this.reconnectAttempts,
      lastServerTick: this.tickBuffer.length > 0 
        ? this.tickBuffer[this.tickBuffer.length - 1].serverTimestamp 
        : 0
    };
    
    store.dispatch({ type: 'SET_CONNECTION_METRICS', payload: metrics });
  }

  /**
   * Send message through WebSocket
   */
  sendMessage(message: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Get current connection metrics
   */
  getMetrics(): ConnectionMetrics {
    return {
      latency: this.latency,
      isBuffering: this.isBuffering,
      bufferSize: this.tickBuffer.length,
      reconnectAttempts: this.reconnectAttempts,
      lastServerTick: this.tickBuffer.length > 0 
        ? this.tickBuffer[this.tickBuffer.length - 1].serverTimestamp 
        : 0
    };
  }

  /**
   * Close WebSocket and cleanup
   */
  closeWebSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.stopBufferedPlayback();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.latencyCheckInterval) {
      clearInterval(this.latencyCheckInterval);
      this.latencyCheckInterval = null;
    }
    
    this.isConnected = false;
    this.isBuffering = false;
  }
}

// Export singleton instance
export const bufferedSocketService = new BufferedWebSocketService();

// Export for backward compatibility
export const setupWebSocket = (heatId?: number) => bufferedSocketService.setupWebSocket(heatId);
export const sendMessage = (message: any) => bufferedSocketService.sendMessage(message);
export const closeWebSocket = () => bufferedSocketService.closeWebSocket();