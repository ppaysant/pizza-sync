export interface IPizzaWithoutId {
  name: string;
  ingredientsIds: string[];
  prices: number[];
  imgUrl: string;
}

export interface IPizzaWithId extends IPizzaWithoutId {
  id: string;
}
