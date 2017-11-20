import * as cheerio from 'cheerio';

export abstract class PizzasParser {
  parse() {}

  getHtmlAsCheerioObject(html: string): CheerioStatic {
    return cheerio.load(html);
  }

  abstract getPhone();
}
