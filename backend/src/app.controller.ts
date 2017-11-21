import { Controller, Get } from '@nestjs/common';

import { PizzasProvidersService } from './features/pizzas-providers/pizzas-providers.component';
import { UsersService } from './features/models/users/users.component';
import { OrdersService } from './features/models/orders/orders.component';
import { INormalizedInformation } from './features/pizzas-providers/pizzas-providers.interface';
import { IOrdersNormalized } from './features/models/orders/orders.interface';
import { IUsersNormalized } from './features/models/users/users.interface';

@Controller()
export class AppController {
  constructor(
    private pizzasProvidersService: PizzasProvidersService,
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  @Get('initial-state')
  async getInitialState(): Promise<
    INormalizedInformation & { users: IUsersNormalized } & {
      orders: IOrdersNormalized;
    }
  > {
    const pizzaProviderInformation = await this.pizzasProvidersService
      .getCurrentProvider()
      .getCompleteAndNormalizedInformation();

    const initialState = {
      ...pizzaProviderInformation,
      users: this.usersService.getNormalizedData(),
      orders: this.ordersService.getNormalizedData(),
    };

    return initialState;
  }
}
