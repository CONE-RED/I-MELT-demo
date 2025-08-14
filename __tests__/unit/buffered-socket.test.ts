/**
 * Unit Tests for Buffered WebSocket Service
 * Phase 5: Testing buffered playback and latency monitoring
 */

import { bufferedSocketService } from '../../client/src/lib/buffered-socket';

// Mock Redux store
const mockDispatch = jest.fn();
jest.mock('../../client/src/lib/store', () => ({
  store: {
    dispatch: mockDispatch
  }
}));

describe('BufferedWebSocketService', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    mockDispatch.mockClear();
    
    // Mock WebSocket constructor
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: 1,
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };
    
    global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        protocol: 'http:',
        host: 'localhost:3000'
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection with correct URL', () => {
      const heatId = 93378;
      
      bufferedSocketService.setupWebSocket(heatId);
      
      expect(global.WebSocket).toHaveBeenCalledWith(
        'ws://localhost:3000/ws?heatId=93378'
      );
    });

    it('should send subscription message on connection', () => {
      const heatId = 93378;
      
      bufferedSocketService.setupWebSocket(heatId);
      
      // Simulate connection open
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          payload: { heatId }
        })
      );
    });

    it('should update connection state on open/close', () => {
      bufferedSocketService.setupWebSocket();
      
      // Simulate connection open
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_WS_CONNECTED',
        payload: true
      });
      
      mockDispatch.mockClear();
      
      // Simulate connection close
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ wasClean: false });
      }
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_WS_CONNECTED',
        payload: false
      });
    });
  });

  describe('Message Handling', () => {
    beforeEach(() => {
      bufferedSocketService.setupWebSocket();
    });

    it('should handle simulation_tick messages', () => {
      const tickData = {
        ts: Date.now(),
        stage: 'MELT',
        tempC: 1650,
        kwhTotal: 45.2,
        timestamp: Date.now()
      };
      
      const message = {
        data: JSON.stringify({
          type: 'simulation_tick',
          payload: tickData
        })
      };
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(message);
      }
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_SIMULATION_DATA',
        payload: tickData
      });
    });

    it('should handle pong messages for latency calculation', () => {
      const pingTime = Date.now() - 150; // 150ms ago
      const serverTime = Date.now() - 75;  // 75ms ago
      
      const pongMessage = {
        data: JSON.stringify({
          type: 'pong',
          payload: {
            timestamp: pingTime,
            serverTime: serverTime
          }
        })
      };
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(pongMessage);
      }
      
      // Should calculate and store latency
      const metrics = bufferedSocketService.getMetrics();
      expect(metrics.latency).toBeGreaterThan(0);
      expect(metrics.latency).toBeLessThan(300); // Should be reasonable
    });

    it('should handle heat_data messages', () => {
      const heatData = {
        heat: 93378,
        grade: '13KhFA/9',
        master: 'Ivanov'
      };
      
      const message = {
        data: JSON.stringify({
          type: 'heat_data',
          payload: heatData
        })
      };
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(message);
      }
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_HEAT_DATA',
        payload: heatData
      });
    });
  });

  describe('Buffer Management', () => {
    it('should store ticks in buffer for playback', () => {
      bufferedSocketService.setupWebSocket();
      
      // Send multiple simulation ticks
      for (let i = 0; i < 5; i++) {
        const tickData = {
          timestamp: Date.now() + i * 1000,
          stage: 'MELT',
          tempC: 1600 + i * 10
        };
        
        const message = {
          data: JSON.stringify({
            type: 'simulation_tick',
            payload: tickData
          })
        };
        
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(message);
        }
      }
      
      const metrics = bufferedSocketService.getMetrics();
      expect(metrics.bufferSize).toBe(5);
    });

    it('should start buffered playback on disconnect', (done) => {
      bufferedSocketService.setupWebSocket();
      
      // Add some data to buffer first
      const tickData = {
        timestamp: Date.now(),
        stage: 'MELT',
        tempC: 1650
      };
      
      const message = {
        data: JSON.stringify({
          type: 'simulation_tick',
          payload: tickData
        })
      };
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage(message);
      }
      
      // Simulate disconnect
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ wasClean: false });
      }
      
      // Check that buffering starts
      setTimeout(() => {
        const metrics = bufferedSocketService.getMetrics();
        expect(metrics.isBuffering).toBe(true);
        done();
      }, 100);
    });
  });

  describe('Latency Monitoring', () => {
    it('should send ping messages periodically', () => {
      jest.useFakeTimers();
      
      bufferedSocketService.setupWebSocket();
      
      // Simulate connection open
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen();
      }
      
      mockWebSocket.send.mockClear();
      
      // Fast-forward to trigger ping
      jest.advanceTimersByTime(5000);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"ping"')
      );
      
      jest.useRealTimers();
    });

    it('should provide connection metrics', () => {
      const metrics = bufferedSocketService.getMetrics();
      
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('isBuffering');
      expect(metrics).toHaveProperty('bufferSize');
      expect(metrics).toHaveProperty('reconnectAttempts');
      expect(metrics).toHaveProperty('lastServerTick');
      
      expect(typeof metrics.latency).toBe('number');
      expect(typeof metrics.isBuffering).toBe('boolean');
      expect(typeof metrics.bufferSize).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON messages gracefully', () => {
      bufferedSocketService.setupWebSocket();
      
      const malformedMessage = {
        data: 'not valid json'
      };
      
      // Should not throw
      expect(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage(malformedMessage);
        }
      }).not.toThrow();
    });

    it('should attempt reconnection on unexpected close', () => {
      jest.useFakeTimers();
      
      const originalWebSocket = global.WebSocket;
      const setupSpy = jest.spyOn(bufferedSocketService, 'setupWebSocket');
      
      bufferedSocketService.setupWebSocket();
      
      // Simulate unexpected close
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ wasClean: false });
      }
      
      // Fast-forward past reconnection delay
      jest.advanceTimersByTime(2000);
      
      // Should attempt reconnection
      expect(setupSpy).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
      global.WebSocket = originalWebSocket;
    });
  });
});