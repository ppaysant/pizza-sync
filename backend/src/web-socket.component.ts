import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { UsersService } from './features/models/users/users.component';
import { OrdersService } from './features/models/orders/orders.component';
import { IOrderWithoutId } from './features/models/orders/orders.interface';

@WebSocketGateway()
export class WebSocketService
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  handleConnection(client: any) {
    client.emit('SET_COUNTDOWN', {
      hour: this.ordersService.getHourEnd(),
      minute: this.ordersService.getMinuteEnd(),
    });
  }

  handleDisconnect(client: any) {
    if (!client.user) {
      return;
    }

    this.usersService.setUserOffline(client.user);

    if (this.usersService.getNbConnectionsUser(client.user) === 0) {
      this.server.sockets.emit('DISCONNECT_USER_SUCCESS', client.user.id);
    }
  }

  @SubscribeMessage('CONNECT_USER')
  async connectUser(client, username: string) {
    const user = this.usersService.getUser(username);

    if (!!user) {
      this.usersService.setUserOnline(user);

      this.server.sockets.emit('CONNECT_USER_SUCCESS', user);
    } else {
      const newUser = await this.usersService.addUser(username);

      client.user = newUser;

      this.usersService.setUserOnline(newUser);
      this.server.sockets.emit('CONNECT_USER_SUCCESS', newUser);
    }
  }

  @SubscribeMessage('ADD_ORDER')
  addOrder(client, orderWithoutId: IOrderWithoutId) {
    // TODO : block if current time >= hourEnd and minuteEnd
    const order = this.ordersService.create(orderWithoutId);

    this.server.sockets.emit('ADD_ORDER_SUCCESS', order);
  }

  @SubscribeMessage('REMOVE_ORDER')
  removeOrder(client, orderId: string) {
    // TODO : block if current time >= hourEnd and minuteEnd
    const hasOrderBeenRemoved = this.ordersService.delete(orderId);

    if (hasOrderBeenRemoved) {
      this.server.sockets.emit('REMOVE_ORDER_SUCCESS', orderId);
    }
  }
}
