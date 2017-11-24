import { Component } from '@nestjs/common';

import { NormalizedModel } from '../normalized-model.class';
import {
  IIngredientWithId,
  IIngredientWithoutId,
} from './ingredients.interface';
import { cleanIngredientName } from '../../../helpers/string.helper';

@Component()
export class IngredientsService extends NormalizedModel<IIngredientWithoutId> {
  constructor() {
    super('ingredientId');
  }
}
