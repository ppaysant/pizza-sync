import { INormalizedInformation } from './pizzas-providers.interface';
import { PizzasService } from '../models/pizzas/pizzas.component';
import { PizzasCategoriesService } from '../models/pizzas-categories/pizzas-categories.component';
import { IngredientsService } from '../models/ingredients/ingredients.component';
import { normalizeArray } from '../../helpers/normalize.helper';

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
  abstract fetchParseAndUpdate(): Promise<void>;

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

  protected saveNormalizedData(pizzasAndPizzasCategories: {
    pizzeria: { name: string; phone: string; url: string };
    pizzas: any[];
    pizzasCategories: any[];
    ingredients: any[];
  }): void {
    // normalize the pizzas
    const normalizedPizzasAndPizzasCaterogies = {
      pizzeria: pizzasAndPizzasCategories.pizzeria,
      pizzas: normalizeArray(pizzasAndPizzasCategories.pizzas),
      pizzasCategories: normalizeArray(
        pizzasAndPizzasCategories.pizzasCategories
      ),
      ingredients: normalizeArray(pizzasAndPizzasCategories.ingredients),
    };

    // as the ingredients will appear in the order of the fetched pizzas
    // sort the ingredients allIds array to match the alphabetical order
    normalizedPizzasAndPizzasCaterogies.ingredients.allIds = normalizedPizzasAndPizzasCaterogies.ingredients.allIds.sort(
      (ingId1, ingId2) => {
        const ing1 =
          normalizedPizzasAndPizzasCaterogies.ingredients.byId[ingId1].name;
        const ing2 =
          normalizedPizzasAndPizzasCaterogies.ingredients.byId[ingId2].name;

        return ing1.localeCompare(ing2);
      }
    );

    this.pizzasService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.pizzas
    );
    this.pizzasCategoriesService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.pizzasCategories
    );
    this.ingredientsService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.ingredients
    );
  }
}
