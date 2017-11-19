import { Component } from '@nestjs/common';

import { PizzasProvider } from './pizzas-provider.class';
import { OrmeauProvider } from './implementations/ormeau.class';
import { PizzasService } from '../pizzas/pizzas.component';
import { PizzasCategoriesService } from '../pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../ingredients/ingredients.component';

@Component()
export class PizzasProvidersService {
  private providers: PizzasProvider[];
  private currentProvider: PizzasProvider;

  constructor(
    private pizzasService: PizzasService,
    private pizzasCategoriesService: PizzasCategoriesService,
    private ingredientsService: IngredientsService
  ) {
    const providers = [OrmeauProvider];

    this.providers = providers.map(
      PizzaProvider =>
        new PizzaProvider(
          pizzasService,
          pizzasCategoriesService,
          ingredientsService
        )
    );
  }

  getProviders(): PizzasProvider[] {
    return this.providers;
  }

  getProvidersShortNames(): string[] {
    return this.providers.map(provider => provider.shortCompanyName);
  }

  getProvidersLongNames(): string[] {
    return this.providers.map(provider => provider.longCompanyName);
  }

  includes(providerShortCompanyName: string): boolean {
    return !!this.providers.find(
      provider => provider.shortCompanyName === providerShortCompanyName
    );
  }

  setDefaultProvider(): Promise<void> {
    const [firstProvider] = this.providers;
    return this.setCurrentProvider(firstProvider);
  }

  async setCurrentProvider(provider: PizzasProvider): Promise<void> {
    await provider.fetchParseAndUpdate();

    this.currentProvider = provider;
  }

  getCurrentProvider(): PizzasProvider {
    return this.currentProvider;
  }

  getProviderInstanceByName(providerShortCompanyName: string): PizzasProvider {
    return this.providers.find(
      provider => provider.shortCompanyName === providerShortCompanyName
    );
  }
}
