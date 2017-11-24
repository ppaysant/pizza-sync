import * as _vorpal from 'vorpal';

import { PizzasProvidersService } from '../features/pizzas-providers/pizzas-providers.component';
import { PizzasProvidersModule } from '../features/pizzas-providers/pizzas-providers.module';
import { ProvidersCommand } from './commands/providers.command';
import { ProviderCommand } from './commands/provider.command';
import { Command } from './command.class';

export class CommandLineService {
  private vorpal = _vorpal();
  private commands: Command[] = [];

  constructor(private pizzasProvidersService: PizzasProvidersService) {
    // register all the command by pushing them into `commands` array
    this.commands.push(
      new ProviderCommand(this.vorpal, pizzasProvidersService),
      new ProvidersCommand(this.vorpal, pizzasProvidersService)
    );

    // register every commands
    this.commands.forEach(command => command.register());

    this.vorpal.delimiter('pizza-sync$').show();
  }
}
