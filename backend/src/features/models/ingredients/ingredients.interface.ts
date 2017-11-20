export interface IIngredientWithoutId {
  name: string;
}

export interface IIngredientWithId extends IIngredientWithoutId {
  id: string;
}
