
export interface ProductPrice {
  productId: number;
  productName: string;
  prices: {
    [customerId: number]: number;
  };
}

export interface PurchaseProduct {
  productId: number;
  supplierId: number;
  supplierName: string;
  productName: string;
  productWeight: string;
  incentiveAmount: number;
  purchaseRate: number;
  productType: string;
  priceHistory: {
    date: string;
    price: number;
  }[];
}

export interface SalesProduct {
  productId: number;
  productName: string;
  defaultSalesPrice: number;
  priceHistory: {
    date: string;
    price: number;
  }[];
  customerPrices: {
    [customerId: number]: number;
  };
}
