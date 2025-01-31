import axios from "axios";
import * as cheerio from "cheerio";
import type { Product, ProductListPage } from "../types";

const poromagiaStartUrl =
  "https://lautapelit.poromagia.com/fi/catalogue/category/living-card-games/arkham-horror-lcg_760";

/**
 * Fetches the content of a given URL and returns the product details.
 *
 * @param url - The URL of the website to fetch.
 * @returns A promise that resolves to an array of product details, with each product containing a title and price.
 * @throws Will throw an error if the website cannot be fetched.
 */
export async function getPoromagiaPage(url: string): Promise<ProductListPage> {
  console.log("Getting Poromagia products from", url);

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const products: Product[] = [];

    $(".product_line").each((index, element) => {
      const title = $(element).find("h3").text().trim();
      const priceElement = $(element).find(".product_price");
      const price = $(priceElement).find(".price_color").text().trim();
      const availabilityElement = $(priceElement).find(".availability");
      const availabilityOnline = $(availabilityElement)
        .find("span")
        .first()
        .text()
        .trim();
      const storeInventory = $(availabilityElement)
        .find("span")
        .last()
        .text()
        .trim();

      products.push({
        title,
        price,
        availability: {
          online: availabilityOnline,
          stores: [{ location: "Helsinki", count: storeInventory }],
        },
      });
    });

    const nextPageLink = $(".pages li.active")
      .next("li")
      .find("a")
      .attr("href");

    return { products, nextPageLink };
  } catch (error) {
    console.error(`Error fetching the site: ${error}`);
    throw error;
  }
}

export async function getPoromagiaProducts(): Promise<Product[]> {
  const products: Product[] = [];
  let hasNextPage = false;
  let currentPageUrl = poromagiaStartUrl;

  do {
    const { products: pageProducts, nextPageLink } =
      await getPoromagiaPage(currentPageUrl);
    products.push(...pageProducts);

    if (nextPageLink) {
      // `nextPageLink` is a relative URL
      currentPageUrl = `${poromagiaStartUrl}${nextPageLink}`;
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  return products;
}
