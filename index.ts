import * as fs from "fs";
import * as path from "path";
import deepEqual from "deep-equal";
import * as diff from "diff";
import { getPoromagiaProducts } from "./src/poromagia";
import type { Product } from "./types";
import {
  getPuolenkuunPelitPage,
  getPuolenkuunPelitProducts,
} from "./src/puolenkuunPelit";

// Save results to file function
function saveProductsToFile(products: Product[], filePath: string): void {
  const outputPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf-8");
  console.log(`Product details saved to ${outputPath}`);
}

// Helper function to compare products
function compareProducts(newProducts: Product[], filePath: string) {
  const outputPath = path.join(__dirname, filePath);
  if (fs.existsSync(outputPath)) {
    const oldProducts: Product[] = JSON.parse(
      fs.readFileSync(outputPath, "utf-8"),
    );

    newProducts.forEach((newProduct) => {
      const oldProduct = oldProducts.find(
        (product) => product.title === newProduct.title,
      );

      if (oldProduct) {
        if (newProduct.price !== oldProduct.price) {
          console.log(
            `Price change detected for ${newProduct.title}: \x1b[${newProduct.price < oldProduct.price ? "92" : "91"}m${oldProduct.price} -> ${newProduct.price}\x1b[0m`,
          );
        }

        if (!deepEqual(newProduct.availability, oldProduct.availability)) {
          const oldAvailability = JSON.stringify(oldProduct.availability);
          const newAvailability = JSON.stringify(newProduct.availability);

          const diffParts = diff.diffWords(oldAvailability, newAvailability);

          const formattedDiff = diffParts
            .map((part: diff.Change) => {
              if (part.added) {
                return `\x1b[92m${part.value}\x1b[0m`;
              } else if (part.removed) {
                return `\x1b[91m${part.value}\x1b[0m`;
              } else {
                return part.value;
              }
            })
            .join("");

          console.log(
            `Availability change detected for ${newProduct.title}:\n${formattedDiff}`,
          );
        }
      } else {
        console.log(`New product detected: ${newProduct.title}`);
      }
    });

    oldProducts.forEach((oldProduct) => {
      const newProduct = newProducts.find(
        (product) => product.title === oldProduct.title,
      );

      if (!newProduct) {
        console.log(`Product removed: ${oldProduct.title}`);
      }
    });
  } else {
    console.log("No previous product data found.");
  }
}

async function main() {
  const products = await getPoromagiaProducts();
  // const products = await getPuolenkuunPelitProducts();

  // Compare and Save results to file
  compareProducts(products, "products/poromagia.json");

  // Save results to file
  saveProductsToFile(products, "products/poromagia.json");
}

// Call the main function
main();
