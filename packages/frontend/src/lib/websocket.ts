import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

class WebSocketClient {
  private socket: Socket | null = null
  private token: string | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return
    }

    this.token = token
    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const ws = new WebSocketClient()
