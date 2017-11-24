import { Component } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { normalize, schema } from 'normalizr';

import { PizzasProvider } from './pizzas-provider.class';
import { OrmeauProvider } from './implementations/ormeau.class';
import { PizzasService } from '../models/pizzas/pizzas.component';
import { PizzasCategoriesService } from '../models/pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../models/ingredients/ingredients.component';
import {
  renameKeyInObject,
  renameKeysInObject,
} from './../../helpers/object.helper';
import {
  IPizzeriaNestedFkWithoutId,
  IPizzeriaNestedFkWithId,
  INormalizedInformation,
} from './pizzas-providers.interface';
import {
  IPizzaCategoryWithId,
  IPizzasCategoriesNormalized,
} from '../models/pizzas-categories/pizzas-categories.interface';
import {
  IPizzaWithId,
  IPizzasNormalized,
} from '../models/pizzas/pizzas.interface';

@Component()
export class PizzasProvidersService {
  private providers: PizzasProvider[];
  private currentProvider: PizzasProvider;

  constructor(
    private pizzasService: PizzasService,
    private pizzasCategoriesService: PizzasCategoriesService,
    private ingredientsService: IngredientsService
  ) {
    // list all the providers within the array
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

    // add IDs and normalize data
    const pizzaProviderInfoWithIds = this.addIdToPizzasCategoriesPizzasAndIngredients(
      pizzaProviderInfo.pizzeria
    );
    const pizzaProviderInfoNormalized = this.normalizePizzasCategoriesPizzasAndIngredients(
      pizzaProviderInfoWithIds.pizzeria
    );

    // save the normalized data
    this.pizzasService.setNormalizedData(pizzaProviderInfoNormalized.pizzas);
    this.pizzasCategoriesService.setNormalizedData(
      pizzaProviderInfoNormalized.pizzasCategories
    );
    this.ingredientsService.setNormalizedData(
      pizzaProviderInfoNormalized.ingredients
    );

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

  // a pizza provider is just parsing the pizzas categories
  // with the pizzas and the ingredients
  // they do not have IDs and before normalizing these data
  // we need to give them IDs
  private addIdToPizzasCategoriesPizzasAndIngredients(
    pizzeria: IPizzeriaNestedFkWithoutId
  ): { pizzeria: IPizzeriaNestedFkWithId } {
    return {
      pizzeria: {
        ...pizzeria,
        id: uuid(),
        pizzasCategories: pizzeria.pizzasCategories.map(x => ({
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

  private normalizePizzasCategoriesPizzasAndIngredients(
    pizzeria: IPizzeriaNestedFkWithId
  ) {
    // get the schema to normalize the data
    const normalizedData = this.getNormalizrSchema(pizzeria);

    // normalize the data
    const {
      pizzasCategoriesById,
      pizzasCategoriesAllIds,
    } = this.getPizzasCategoriesByIdAndAllIds(normalizedData.pizzasCategories);

    const { pizzasById, pizzasAllIds } = this.getPizzasByIdAndAllIds(
      normalizedData.pizzas
    );

    return {
      pizzeria: {
        name: pizzeria.name,
        phone: pizzeria.phone,
        url: pizzeria.url,
      },
      pizzasCategories: {
        byId: pizzasCategoriesById,
        allIds: pizzasCategoriesAllIds,
      },
      pizzas: {
        byId: pizzasById,
        allIds: pizzasAllIds,
      },
      ingredients: normalizedData.ingredients,
    };
  }

  // a pizza provider returns a structure where
  // a pizza has a key `ingredients`
  // but we want to rename it to igredientsIds
  private getPizzasByIdAndAllIds(pizzas: IPizzasNormalized) {
    const pizzasAllIds = pizzas.allIds;

    const pizzasById: {
      [key: string]: IPizzaWithId;
    } = renameKeysInObject(
      pizzas.byId,
      pizzas.allIds,
      'ingredients',
      'ingredientsIds'
    );

    return { pizzasById, pizzasAllIds };
  }

  // a pizza provider returns a structure where
  // a pizza categorie has a key `pizzas`
  // but we want to rename it to pizzasIds
  private getPizzasCategoriesByIdAndAllIds(
    pizzasCategories: IPizzasCategoriesNormalized
  ) {
    const pizzasCategoriesAllIds = pizzasCategories.allIds;

    const pizzasCategoriesById: {
      [key: string]: IPizzaCategoryWithId;
    } = renameKeysInObject(
      pizzasCategories.byId,
      pizzasCategories.allIds,
      'pizzas',
      'pizzasIds'
    );

    return {
      pizzasCategoriesById,
      pizzasCategoriesAllIds,
    };
  }

  private getNormalizrSchema(
    pizzeria: IPizzeriaNestedFkWithId
  ): INormalizedInformation {
    const ingredientEntity = new schema.Entity('ingredients');

    const pizzaEntity = new schema.Entity('pizzas', {
      ingredients: [ingredientEntity],
    });

    const pizzaCategorieEntity = new schema.Entity('pizzasCategories', {
      pizzas: [pizzaEntity],
    });

    const normalizedData = normalize(pizzeria.pizzasCategories, [
      pizzaCategorieEntity,
    ]);

    return {
      pizzeria: {
        name: pizzeria.name,
        phone: pizzeria.phone,
        url: pizzeria.url,
      },
      pizzas: {
        byId: normalizedData.entities.pizzas,
        allIds: Object.keys(normalizedData.entities.pizzas),
      },
      pizzasCategories: {
        byId: normalizedData.entities.pizzasCategories,
        allIds: Object.keys(normalizedData.entities.pizzasCategories),
      },
      ingredients: {
        byId: normalizedData.entities.ingredients,
        allIds: Object.keys(normalizedData.entities.ingredients),
      },
    };
  }
}
