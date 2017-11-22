import { Component } from '@nestjs/common';
import { get } from 'request';
import { v4 as uuid } from 'uuid';
import * as cheerio from 'cheerio';

import { PizzasProvider } from '../pizzas-provider.class';
import { requestOptions } from '../../../helpers/http.helper';
import { IngredientsService } from '../../models/ingredients/ingredients.component';
import { getPathImgPizza } from '../../../helpers/file.helper';
import { INormalizedInformation } from '../pizzas-providers.interface';

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

  fetchAndParseData() {
    return new Promise<{
      pizzeria: {
        name: string;
        phone: string;
        url: string;
        pizzasCategories: {
          name: string;
          pizzas: {
            name: string;
            imgUrl: string;
            ingredients: { name: string }[];
            prices: number[];
          }[];
        }[];
      };
    }>((resolve, reject) => {
      get(this.url, requestOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // build the response object containing the pizzas and pizzas categories
          const res = {
            pizzeria: {
              name: this.longCompanyName,
              phone: this.phone,
              url: this.url,
              pizzasCategories: [] as any[],
            },
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
              name: pizzaCategory,
              pizzas: [],
            };

            res.pizzeria.pizzasCategories.push(finalPizzaCategory);

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
                .filter(x => x !== '')
                .map(x => ({ name: x.trim() }));

              // const pizzaIngredients = pizzaIngredientsTxtArray.map(
              //   ingredient =>
              //     this.ingredientsService.registerIfNewAndGetId(ingredient)
              // );

              const pizzaIngredients = pizzaIngredientsTxtArray;

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
                name: pizzaName,
                imgUrl: getPathImgPizza(pizzaName, this.imgsFolder),
                ingredients: pizzaIngredients,
                prices: pizzaPrices,
              };

              finalPizzaCategory.pizzas.push(finalPizza);
            });
          });

          // res.ingredients = this.ingredientsService.getIngredients();

          // this.phone = res.pizzeria.phone;

          // this.pizzas = res.pizzas;
          // this.pizzasCategories = res.pizzasCategories;
          // this.ingredients = res.ingredients;
          console.log(JSON.stringify(res, null, 2));
          resolve(res);
        } else {
          const err = `Error while trying to fetch the pizza provider "${
            this.longCompanyName
          }" with the following URL: "${this.url}"`;

          reject(err);
        }
      });
    });
    // .then(result => this.saveNormalizedData(result));
  }
}
