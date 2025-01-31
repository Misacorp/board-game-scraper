export interface StoreInventory {
  location: string;
  count: string;
}

export interface Product {
  title: string;
  price: string;
  availability: {
    stores: StoreInventory[];
    online: string;
  };
}

export interface ProductListPage {
  products: Product[];
  nextPageLink: string | undefined;
}

