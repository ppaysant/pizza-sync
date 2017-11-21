import { IIngredientWithId, IIngredientsNormalized } from './../models/ingredients/ingredients.interface';
import { IPizzaWithId, IPizzasNormalized } from '../models/pizzas/pizzas.interface';
import { IPizzaCategoryWithId, IPizzasCategoriesNormalized } from '../models/pizzas-categories/pizzas-categories.interface';

export interface INormalizedInformation {
  pizzeria: { name: string; phone: string; url: string };
  pizzas: IPizzasNormalized;
  pizzasCategories: IPizzasCategoriesNormalized;
  ingredients: IIngredientsNormalized;
}
