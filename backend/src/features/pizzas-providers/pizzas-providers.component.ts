import { Component } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { normalize, schema } from 'normalizr';

import { PizzasProvider } from './pizzas-provider.class';
import { OrmeauProvider } from './implementations/ormeau.class';
import { PizzasService } from '../models/pizzas/pizzas.component';
import { PizzasCategoriesService } from '../models/pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../models/ingredients/ingredients.component';

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
    const pizzaProviderInfo = await provider.fetchAndParseData();
    const pizzaProviderInfoWithIds = this.addIdToPizzasCategoriesPizzasAndIngredients(
      pizzaProviderInfo
    );
    const pizzaProviderInfoNormalized = this.normalizePizzasCategoriesPizzasAndIngredients(
      pizzaProviderInfoWithIds
    );

    console.log('----------------------');
    console.log(JSON.stringify(pizzaProviderInfoNormalized));

    console.log('----------------------');

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

  private addIdToPizzasCategoriesPizzasAndIngredients(a: {
    pizzeria: {
      name: string;
      phone: string;
      url: string;
      pizzasCategories: {
        name: string;
        pizzas: {
          name: string;
          imgUrl: string;
          ingredients: { name: string }[];
          prices: number[];
        }[];
      }[];
    };
  }) {
    return {
      pizzeria: {
        ...a.pizzeria,
        id: uuid(),
        pizzasCategories: a.pizzeria.pizzasCategories.map(x => ({
          ...x,
          id: uuid(),
          pizzas: x.pizzas.map(y => ({
            ...y,
            id: uuid(),
            ingredients: y.ingredients.map(z => ({
              ...z,
              id: uuid(),
            })),
          })),
        })),
      },
    };
  }

  private normalizePizzasCategoriesPizzasAndIngredients(a) {
    const ingredient = new schema.Entity('ingredients');

    const pizzas = new schema.Entity('pizzas', {
      ingredients: [ingredient],
    });

    const pizzasCategories = new schema.Entity('pizzasCategories', {
      pizzas: [pizzas],
    });

    // const pizzeria = new schema.Entity('pizzeria', {
    //   pizzasCategories: [pizzasCategories],
    // });

    const normalizedData = normalize(a.pizzeria.pizzasCategories, [
      pizzasCategories,
    ]);

    return {
      pizzasCategories: {
        byId: normalizedData.entities.pizzasCategories,
        allIds: Object.keys(normalizedData.entities.pizzasCategories),
      },
      pizzas: {
        byId: normalizedData.entities.pizzas,
        allIds: Object.keys(normalizedData.entities.pizzas),
      },
      ingredients: {
        byId: normalizedData.entities.ingredients,
        allIds: Object.keys(normalizedData.entities.ingredients),
      },
    };
  }
}
