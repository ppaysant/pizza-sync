import { Component } from '@nestjs/common';

import { NormalizedModel } from '../normalized-model.class';
import { IOrderWithId, IOrderWithoutId } from './orders.interface';
import { WebSocketService } from '../../../web-socket.component';

@Component()
export class OrdersService extends NormalizedModel<IOrderWithoutId> {
  // when the app should stop accepting orders
  private hourEnd: number;
  private minuteEnd: number;

  constructor() {
    super('orderId');

    // by default, the app stop accepting orders after 1 hour
    const currentDate = new Date();
    this.setHourAndMinuteEnd(
      currentDate.getHours() + 1,
      currentDate.getMinutes()
    );
  }

  getHourEnd() {
    return this.hourEnd;
  }

  getMinuteEnd() {
    return this.minuteEnd;
  }

  // TODO: add a command line to change this
  setHourAndMinuteEnd(hourEnd, minuteEnd) {
    this.hourEnd = hourEnd;
    this.minuteEnd = minuteEnd;

    // this.webSocketService.setCountdown(hourEnd, minuteEnd);
  }
}
