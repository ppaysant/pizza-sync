import { Module, Inject } from '@nestjs/common';

import { CommandLineService } from './command-line.component';
import { PizzasProvidersModule } from '../features/pizzas-providers/pizzas-providers.module';
import { PizzasProvidersService } from '../features/pizzas-providers/pizzas-providers.component';
import { OrdersService } from '../features/models/orders/orders.component';
import { OrdersModule } from '../features/models/orders/orders.module';

// before creating the `CommandLineService` we need to wait
// for the default pizza provider to be set
const CommandLineServiceFactory = {
  provide: 'CommandLineService',
  useFactory: async (
    pizzasProvidersService: PizzasProvidersService,
    ordersService: OrdersService
  ) => {
    await pizzasProvidersService.setDefaultProvider();
    return new CommandLineService(pizzasProvidersService, ordersService);
  },
  inject: [PizzasProvidersService, OrdersService],
};

@Module({
  modules: [PizzasProvidersModule, OrdersModule],
  components: [CommandLineServiceFactory],
})
export class CommandLineModule {
  constructor(@Inject('CommandLineService') commandLineService) {}
}
