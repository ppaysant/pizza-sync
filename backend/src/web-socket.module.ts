import { Module } from '@nestjs/common';

import { WebSocketService } from './web-socket.component';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  modules: [UsersModule, OrdersModule],
  components: [WebSocketService],
})
export class WebSocketModule {}
