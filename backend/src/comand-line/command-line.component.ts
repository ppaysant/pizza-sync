import * as _vorpal from 'vorpal';

import { PizzasProvidersService } from '../features/pizzas-providers/pizzas-providers.component';
import { PizzasProvidersModule } from '../features/pizzas-providers/pizzas-providers.module';

export class CommandLineService {
  private vorpal = _vorpal();

  constructor(private pizzasProvidersService: PizzasProvidersService) {
    this.registerProviderCommand();
    this.registerProvidersCommand();

    this.vorpal.delimiter('pizza-sync$').show();
  }

  private registerProviderCommand(): void {
    const self = this;

    self.vorpal
      .command('provider <provider>', 'Change current provider')
      .description('Set the current provider')
      .autocomplete(this.pizzasProvidersService.getProvidersShortNames())
      .action(function(args, callback) {
        const vorpalContext = this;
        const newProviderName = args.provider;

        if (!newProviderName) {
          vorpalContext.log('You need to select a provider');
          return callback();
        }

        if (!self.pizzasProvidersService.includes(newProviderName)) {
          vorpalContext.log('Unknown provider');
          return callback();
        }

        const newProviderInstance = self.pizzasProvidersService.getProviderInstanceByName(
          newProviderName
        );

        self.pizzasProvidersService.setCurrentProvider(newProviderInstance);
        return callback();
      });
  }

  private registerProvidersCommand(): void {
    const self = this;

    self.vorpal
      .command('providers', 'List available pizzas providers')
      .action(function(args, callback) {
        const vorpalContext = this;
        self.displayFormattedProviders(vorpalContext);

        return callback();
      });
  }

  private displayFormattedProviders(vorpalContext): void {
    vorpalContext.log('Available providers (current between curly brackets)');

    this.getFormattedProviders().forEach(provider =>
      vorpalContext.log(provider)
    );
  }

  // returns an array of providers' name with the
  // currently selected between brackets
  private getFormattedProviders(): string[] {
    const providers = this.pizzasProvidersService.getProviders();
    const currentProvider = this.pizzasProvidersService.getCurrentProvider();

    return providers.map(
      provider =>
        provider === currentProvider
          ? `- { ${provider.longCompanyName} }`
          : `- ${provider.longCompanyName}`
    );
  }
}
