import { Component } from '@nestjs/common';
import { get } from 'request';
import { v4 as uuid } from 'uuid';
import * as cheerio from 'cheerio';

import { PizzasProvider } from '../pizzas-provider.class';
import { requestOptions } from '../../../helpers/http.helper';
import { IngredientsService } from '../../models/ingredients/ingredients.component';
import { getPathImgPizza } from '../../../helpers/file.helper';
import { normalizeArray } from '../../../helpers/normalize.helper';

export class OrmeauProvider extends PizzasProvider {
  readonly longCompanyName = `L'Ormeau`;
  readonly shortCompanyName = `Ormeau`;

  protected phone = '';
  protected url = 'http://www.pizzadelormeau.com/nos-pizzas/';
  protected imgsFolder = `${
    __dirname
  }/../../../../../frontend/src/assets/img/pizzas-providers/l-ormeau`;

  private pizzas: any;
  private pizzasCategories: any;
  private ingredients: any;

  fetchParseAndUpdate() {
    return new Promise<OrmeauProvider>(resolve => {
      get(this.url, requestOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // build the response object containing the pizzas and pizzas categories
          const res = {
            pizzeria: {
              name: this.longCompanyName,
              phone: this.phone,
              url: this.url,
            },
            pizzas: [],
            pizzasCategories: [],
            ingredients: [],
          };

          const $ = cheerio.load(body);

          res.pizzeria.phone = $('.header-main .site_info').text();

          const sectionsDom = $('.entry-content .section');

          sectionsDom.map(i => {
            const sectionDom = $(sectionsDom[i]);

            const pizzaCategory = sectionDom
              .find($('.title'))
              .children()
              .remove()
              .end()
              .text();

            const finalPizzaCategory = {
              id: uuid(),
              name: pizzaCategory,
              pizzasIds: [],
            };

            res.pizzasCategories.push(finalPizzaCategory);

            const pizzasDom = sectionDom.find($('.corps'));

            pizzasDom.map(j => {
              const pizzaDom = $(pizzasDom[j]);

              const pizzaName = pizzaDom
                .find($('.nom'))
                .children()
                .remove()
                .end()
                .text();
              const pizzaIngredientsTxt = pizzaDom
                .find($('.composition'))
                .text();
              const pizzaPricesDom = pizzaDom.find($('.prix'));

              const pizzaIngredientsTxtArray = pizzaIngredientsTxt
                .replace('.', '')
                .replace(', ', ',')
                .trim()
                .split(',')
                // some pizzas do not have ingredients as they're already written in their title
                // for example "Poire Williams / chocolat", "Banane / Chocolat" and "Ananas / Chocolat"
                // we do not want to have empty ingredients and thus, they should be removed
                .filter(x => x !== '');

              const pizzaIngredients = pizzaIngredientsTxtArray.map(
                ingredient =>
                  this.ingredientsService.registerIfNewAndGetId(ingredient)
              );

              const pizzaPrices = [];
              pizzaPricesDom.map(k => {
                const price = $(pizzaPricesDom[k])
                  .children()
                  .remove()
                  .end()
                  .text()
                  .replace(',', '.');
                pizzaPrices.push(parseFloat(price));
              });

              const finalPizza = {
                id: uuid(),
                name: pizzaName,
                imgUrl: getPathImgPizza(pizzaName, this.imgsFolder),
                ingredientsIds: pizzaIngredients,
                prices: pizzaPrices,
              };

              finalPizzaCategory.pizzasIds.push(finalPizza.id);
              res.pizzas.push(finalPizza);
            });
          });

          res.ingredients = this.ingredientsService.getIngredients();

          this.phone = res.pizzeria.phone;

          this.pizzas = res.pizzas;
          this.pizzasCategories = res.pizzasCategories;
          this.ingredients = res.ingredients;

          resolve(this as OrmeauProvider);
        }
      });
    }).then(r => this.tmp(r));
  }

  tmp(pizzasAndPizzasCategories): any {
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

    // this._parsePizzaProviderCache = normalizedPizzasAndPizzasCaterogies;

    this.pizzasService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.pizzas
    );
    this.pizzasCategoriesService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.pizzasCategories
    );
    this.ingredientsService.setNormalizedData(
      normalizedPizzasAndPizzasCaterogies.ingredients
    );

    return normalizedPizzasAndPizzasCaterogies;
  }
}
