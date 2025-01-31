import type { Product, ProductListPage } from "../types";
import axios from "axios";
import * as cheerio from "cheerio";

const startUrl =
  "https://www.puolenkuunpelit.com/kauppa/default.php?cPath=33_694_839";

/**
 * Fetches the content of a given URL and returns the product details.
 *
 * @param url - The URL of the website to fetch.
 * @returns A promise that resolves to an array of product details, with each product containing a title and price.
 * @throws Will throw an error if the website cannot be fetched.
 */
export async function getPuolenkuunPelitPage(
  url: string,
): Promise<ProductListPage> {
  console.log("Getting Puolenkuun Pelit products from", url);

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      },
    });
    const $ = cheerio.load(data);
    const products: Product[] = [];

    $("tbody").each((index, element) => {
      $(element)
        .find("tr")
        .each((rowIndex, rowElement) => {
          const columns = $(rowElement).find("td.productListing-data");
          if (columns.length === 5) {
            const title = $(columns[1]).text().trim();
            const price = $(columns[2]).text().trim();

            products.push({
              title,
              price,
              availability: {
                online: "",
                stores: [],
              },
            });
          }
        });
    });

    return { products, nextPageLink: undefined };
  } catch (error) {
    console.error(`Error fetching the site: ${error}`);
    throw error;
  }
}

export async function getPuolenkuunPelitProducts(): Promise<Product[]> {
  const products: Product[] = [];

  const fetched = await getPuolenkuunPelitPage(startUrl);
  fetched.products.forEach((product) => {
    products.push(product);
  });

  return products;
}
