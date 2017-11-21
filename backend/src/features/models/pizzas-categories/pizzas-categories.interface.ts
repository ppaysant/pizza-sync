export interface IPizzaCategoryWithoutId {}

export interface IPizzaCategoryWithId extends IPizzaCategoryWithoutId {
  id: string;
}

export interface IPizzasCategoriesNormalized {
  byId: { [key: string]: IPizzaCategoryWithId };
  allIds: string[];
}
