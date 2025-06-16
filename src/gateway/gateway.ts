import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { log } from 'console';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MyGateway {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(`BODY ` + body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }
}
