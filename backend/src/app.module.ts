import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { PizzasProvidersModule } from './features/pizzas-providers/pizzas-providers.module';
import { CommandLineModule } from './comand-line/command-line.module';
import { IngredientsModule } from './features/models/ingredients/ingredients.module';
import { OrdersModule } from './features/models/orders/orders.module';
import { PizzasModule } from './features/models/pizzas/pizzas.module';
import { PizzasCategoriesModule } from './features/models/pizzas-categories/pizzas-categories.module';
import { UsersModule } from './features/models/users/users.module';
import { WebSocketModule } from './web-socket.module';

@Module({
  modules: [
    PizzasProvidersModule,
    CommandLineModule,
    IngredientsModule,
    OrdersModule,
    PizzasModule,
    PizzasCategoriesModule,
    UsersModule,
    WebSocketModule,
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
