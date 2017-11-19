import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { PizzasProvidersModule } from './pizzas-providers/pizzas-providers.module';
import { CommandLineModule } from './comand-line/command-line.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { OrdersModule } from './orders/orders.module';
import { PizzasModule } from './pizzas/pizzas.module';
import { PizzasCategoriesModule } from './pizzas-categories/pizzas-categories.module';
import { UsersModule } from './users/users.module';
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
