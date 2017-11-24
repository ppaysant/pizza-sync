import {
  IIngredientWithId,
  IIngredientsNormalized,
} from './../models/ingredients/ingredients.interface';
import {
  IPizzaWithId,
  IPizzasNormalized,
} from '../models/pizzas/pizzas.interface';
import {
  IPizzaCategoryWithId,
  IPizzasCategoriesNormalized,
} from '../models/pizzas-categories/pizzas-categories.interface';

export interface INormalizedInformation {
  pizzeria: { name: string; phone: string; url: string };
  pizzas: IPizzasNormalized;
  pizzasCategories: IPizzasCategoriesNormalized;
  ingredients: IIngredientsNormalized;
}

// --------------------------
// NESTED WITHOUT ID
// --------------------------
// pizzeria
interface IPizzeriaNestedCommonWithoutId {
  name: string;
  phone: string;
  url: string;
}
export interface IPizzeriaNestedFkWithoutId
  extends IPizzeriaNestedCommonWithoutId {
  pizzasCategories: IPizzaCategoryFkWithoutId[];
}

// category
interface IPizzaCategoryCommonWithoutId {
  name: string;
}
interface IPizzaCategoryFkWithoutId extends IPizzaCategoryCommonWithoutId {
  pizzas: IPizzaFkWithoutId[];
}

// pizza
interface IPizzaCommonWithoutId {
  name: string;
  imgUrl: string;
  prices: number[];
}
interface IPizzaFkWithoutId {
  ingredients: { name: string }[];
}

// --------------------------
// NESTED WITH ID
// --------------------------
// pizzeria
export interface IPizzeriaNestedFkWithId
  extends IPizzeriaNestedCommonWithoutId {
  id: string;
  pizzasCategories: IPizzaCategoryFkWithId[];
}

// category
export interface IPizzaCategoryFkWithId extends IPizzaCategoryCommonWithoutId {
  id: string;
  pizzas: IPizzaFkWithId[];
}

// pizza
export interface IPizzaFkWithId extends IPizzaFkWithoutId {
  id: string;
}
