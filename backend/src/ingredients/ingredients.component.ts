import { Component } from '@nestjs/common';

import { NormalizedModel } from '../normalized-model.class';
import {
  IIngredientWithId,
  IIngredientWithoutId,
} from './ingredients.interface';
import { cleanIngredientName } from '../helpers/string.helper';

@Component()
export class IngredientsService extends NormalizedModel<IIngredientWithoutId> {
  private ingredients: Map<string, IIngredientWithId> = new Map();

  constructor() {
    super('ingredientId');
  }

  registerIfNewAndGetId(ingredientName: string): string {
    ingredientName = cleanIngredientName(ingredientName);
    if (this.ingredients.has(ingredientName)) {
      return this.ingredients.get(ingredientName).id;
    }

    const newId = this.getNewId();

    this.ingredients.set(ingredientName, {
      id: newId,
      name: ingredientName,
    });

    return newId;
  }

  getIngredients(): IIngredientWithId[] {
    return Array.from(this.ingredients.values());
  }
}
