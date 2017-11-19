import { Controller, Get } from '@nestjs/common';

import { PizzasProvidersService } from './pizzas-providers/pizzas-providers.component';
import { UsersService } from './users/users.component';
import { OrdersService } from './orders/orders.component';

@Controller()
export class AppController {
  constructor(
    private pizzasProvidersService: PizzasProvidersService,
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  @Get('initial-state')
  async getInitialState() {
    const info = await this.pizzasProvidersService
      .getCurrentProvider()
      .getCompleteAndNormalizedInformation();

    const tmp = {
      ...info,
      users: this.usersService.getNormalizedData(),
      orders: this.ordersService.getNormalizedData(),
    };

    return tmp;
  }
}
