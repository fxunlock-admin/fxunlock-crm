import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.sub;
      client.data.userId = userId;

      // Store socket for this user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId).push(client.id);

      console.log(`✅ WebSocket connected: ${userId} (${client.id})`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const index = sockets.indexOf(client.id);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      }
      console.log(`❌ WebSocket disconnected: ${userId} (${client.id})`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    client.join(room);
    console.log(`User ${client.data.userId} joined room: ${room}`);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, room: string) {
    client.leave(room);
    console.log(`User ${client.data.userId} left room: ${room}`);
  }

  // Notification methods
  notifyNewBid(userId: string, bid: any) {
    this.emitToUser(userId, 'new_bid', bid);
  }

  notifyBidUpdate(userId: string, bid: any) {
    this.emitToUser(userId, 'bid_updated', bid);
  }

  notifyBidAccepted(userId: string, data: any) {
    this.emitToUser(userId, 'bid_accepted', data);
  }

  notifyBidRejected(userId: string, bid: any) {
    this.emitToUser(userId, 'bid_rejected', bid);
  }

  notifyNewNegotiation(userId: string, negotiation: any) {
    this.emitToUser(userId, 'new_negotiation', negotiation);
  }

  notifyNewMessage(userId: string, message: any) {
    this.emitToUser(userId, 'new_message', message);
  }

  private emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }
}