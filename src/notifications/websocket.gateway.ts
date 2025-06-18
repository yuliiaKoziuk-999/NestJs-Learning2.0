import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ transport: ['websocket'] })
export class NativeWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: WebSocket) {
    console.log('WebSocket client connected');
  }

  handleDisconnect(client: WebSocket) {
    console.log('WebSocket client disconnected');
  }

  sendPostCreatedNotification(message: string) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: 'postCreated', message }));
      }
    });
  }
}
