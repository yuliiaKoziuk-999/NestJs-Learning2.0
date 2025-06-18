import { Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';
import { NativeWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [SocketIoGateway, NativeWebSocketGateway],
  exports: [SocketIoGateway, NativeWebSocketGateway], // 👈 це потрібно!
})
export class NotificationsModule {}
