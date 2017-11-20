import { INormalizedInformation } from './pizzas-providers.interface';
import { PizzasService } from '../models/pizzas/pizzas.component';
import { PizzasCategoriesService } from '../models/pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../models/ingredients/ingredients.component';

export abstract class PizzasProvider {
  /**
   * used to display in lists
   */
  abstract longCompanyName: string;

  /**
   * used to write in console autocomplete
   */
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
  abstract fetchParseAndUpdate(): Promise<PizzasProvider>;

  getCompleteAndNormalizedInformation(): INormalizedInformation {
    return {
      pizzeria: {
        name: this.longCompanyName,
        phone: this.phone,
        url: this.url,
      },
      pizzas: this.pizzasService.getNormalizedData(),
      pizzasCategories: this.pizzasCategoriesService.getNormalizedData(),
      ingredients: this.ingredientsService.getNormalizedData(),
    };
  }
}
