import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Socket.IO client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket.IO client disconnected: ${client.id}`);
  }

  sendPostCreatedNotification(message: string) {
    // Відправка повідомлення всім підключеним клієнтам
    this.server.emit('postCreated', { message });
  }
}
