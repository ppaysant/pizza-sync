import { Module } from '@nestjs/common';

import { WebSocketService } from './web-socket.component';

@Module({
  components: [WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}
