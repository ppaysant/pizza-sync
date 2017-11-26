import { get } from 'request';
import * as cheerio from 'cheerio';

import { INormalizedInformation } from './pizzas-providers.interface';
import { normalizeArray } from '../../helpers/normalize.helper';
import { requestOptions } from '../../helpers/http.helper';
import { getPathImgPizza } from '../../helpers/file.helper';

export abstract class PizzasProvider {
  //  used to display in lists
  abstract longCompanyName: string;

  //  used to write in console autocomplete
  abstract shortCompanyName: string;

  protected abstract phone: string;
  // the URL of the website in case a user wants to visit it
  protected abstract url: string;
  private imgsBaseFolder = `${
    __dirname
  }/../../../../frontend/src/assets/img/pizzas-providers`;

  // the URLs of the differents pages to parse the pizzas
  // most pizzas website only have one but some of them have many
  protected abstract urlsPizzasPages: string[];

  constructor() {}

  getPizzeriaInformation() {
    return {
      name: this.longCompanyName,
      phone: this.phone,
      url: this.url,
    };
  }

  async fetchAndParseData(): Promise<{
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
  }> {
    const pages = await this.fetchPages();

    const pizzasCategories = this.parsePagesAndMergePizzasCategories(pages);

    return {
      pizzeria: {
        ...this.getPizzeriaInformation(),
        pizzasCategories,
      },
    };
  }

  private parsePagesAndMergePizzasCategories(pages: CheerioStatic[]) {
    return pages.reduce((acc, page) => {
      const { pizzasCategories } = this.parsePage(page);

      return [...acc, ...pizzasCategories];
    }, []);
  }

  private fetchPages(): Promise<CheerioStatic[]> {
    const pages: Promise<CheerioStatic>[] = this.urlsPizzasPages.map(url => {
      return new Promise((resolve, reject) => {
        get(url, requestOptions, (error, response, body) => {
          if (error || response.statusCode !== 200) {
            const err = `Error while trying to fetch the pizza provider "${
              this.longCompanyName
            }" with the following URL: "${this.url}"`;

            reject(err);
          } else {
            resolve(cheerio.load(body));
          }
        });
      });
    });

    return Promise.all(pages);
  }

  // every pizza provider can override this method
  // and define how to parse ONE page directly
  // BUT, it'd be a better idea not to override it
  // and simply define the parsing methods `getPhone`, etc
  protected parsePage(
    $: CheerioStatic
  ): {
    pizzasCategories: {
      name: string;
      pizzas: {
        name: string;
        imgUrl: string;
        ingredients: { name: string }[];
        prices: number[];
      }[];
    }[];
  } {
    const res = {
      pizzasCategories: [] as {
        name: string;
        pizzas: {
          name: string;
          imgUrl: string;
          ingredients: { name: string }[];
          prices: number[];
        }[];
      }[],
    };

    const pizzasCategories = this.getPizzasCategoriesWrapper($);

    pizzasCategories.map((i, pizzaCategoryHtml) => {
      const pizzaCategoryDom = $(pizzaCategoryHtml);

      const pizzaCategory = this.getPizzaCategory(pizzaCategoryDom);

      const finalPizzaCategory = {
        name: pizzaCategory,
        pizzas: [],
      };

      res.pizzasCategories.push(finalPizzaCategory);

      const pizzasDom = this.getPizzasWrappers(pizzaCategoryDom);

      pizzasDom.map((j, pizzaHtml) => {
        const pizzaDom = $(pizzaHtml);

        const pizzaName = this.getPizzaName(pizzaDom);

        const pizzaIngredients = this.getPizzaIngredients(pizzaDom)
          // some pizzas do not have ingredients as they're already written in their title
          // for example "Poire Williams / chocolat", "Banane / Chocolat" and "Ananas / Chocolat"
          // we do not want to have empty ingredients and thus, they should be removed
          .filter(x => x !== '')
          .map(x => ({ name: x.trim() }));

        const pizzaPrices = this.getPrices(pizzaDom, $);

        const imgUrlTmp = this.getPizzaImage();

        let imgUrl;
        if (imgUrlTmp[`localFolderName`]) {
          const imgFolderName = `${this.imgsBaseFolder}/${
            imgUrlTmp[`localFolderName`]
          }`;

          imgUrl = getPathImgPizza(pizzaName, imgFolderName);
        } else {
          imgUrl = imgUrlTmp[`distantUrl`];
        }

        const finalPizza = {
          name: pizzaName,
          imgUrl,
          ingredients: pizzaIngredients,
          prices: pizzaPrices,
        };

        finalPizzaCategory.pizzas.push(finalPizza);
      });
    });

    return res;
  }

  // following methods are helpers to parse a page
  abstract getPhone();
  abstract getPizzasCategoriesWrapper($: CheerioStatic): Cheerio;
  abstract getPizzaCategory(pizzaCategoryWrapper: Cheerio): string;
  abstract getPizzasWrappers(pizzaCategoryWrapper: Cheerio): Cheerio;
  abstract getPizzaName(pizzaWrapper: Cheerio): string;
  abstract getPizzaIngredients(pizzaWrapper: Cheerio): string[];
  abstract getPrices(pizzaWrapper: Cheerio, $: CheerioStatic): number[];
  abstract getPizzaImage(
    pizzaWrapper?: Cheerio
  ): { localFolderName: string } | { distantUrl: string };
}
