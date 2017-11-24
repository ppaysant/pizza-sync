import { INormalizedInformation } from './pizzas-providers.interface';
import { PizzasService } from '../models/pizzas/pizzas.component';
import { PizzasCategoriesService } from '../models/pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../models/ingredients/ingredients.component';
import { normalizeArray } from '../../helpers/normalize.helper';

export abstract class PizzasProvider {
  //  used to display in lists
  abstract longCompanyName: string;

  //  used to write in console autocomplete
  abstract shortCompanyName: string;

  protected abstract phone: string;
  protected abstract url: string;
  protected abstract imgsFolder: string;

  protected normalizedInformation: INormalizedInformation;

  constructor(
    protected pizzasService: PizzasService,
    protected pizzasCategoriesService: PizzasCategoriesService,
    protected ingredientsService: IngredientsService
  ) {}

  // this should be the first method to call on a pizza provider
  // it'll try to fetch and parse all the required data and then
  // will give us an access to synchronous data on a pizza provider
  abstract fetchAndParseData(): Promise<{
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
  }>;

  getPizzeriaInformation() {
    return {
      name: this.longCompanyName,
      phone: this.phone,
      url: this.url,
    };
  }
}
