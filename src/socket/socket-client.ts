import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

@Injectable()
export class SocketClient implements OnModuleInit {
  public socketClient: Socket;

  constructor() {
    this.socketClient = io('http://localhost:3000');
  }
  onModuleInit() {
    this.registerConsumerEvents();
  }
  private registerConsumerEvents() {
    this.socketClient.emit('newMessage', { msg: 'hey there' });
    this.socketClient.on('connect', () => {
      console.log(`Connect to Gateway`);
    });

    this.socketClient.on('onMessage', (payload: any) => {
      console.log(payload);
    });
  }
}
