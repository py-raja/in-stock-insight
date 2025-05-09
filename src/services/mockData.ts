// Mock data to simulate database

// Types
export interface Product {
  productId: number;
  companyName: string;
  productName: string;
  defaultSalesPrice: number;
  availableQuantity: number;
  orderedQuantity: number;
  actualQuantity: number;
}

export interface Customer {
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  amountBalance: number;
  totalSales: number;
  amountReceived: number;
  profit: number;
}

export interface PurchaseDetail {
  purchaseId: string;
  companyName: string;
  purchaseDate: string;
  products: {
    productId: number;
    productName: string;
    purchasePrice: number;
    quantity: number;
  }[];
}

export interface SalesTransaction {
  salesId: string;
  date: string;
  customerId: number;
  customerName: string;
  products: {
    productId: number;
    productName: string;
    salesPrice: number;
    quantity: number;
  }[];
  amountPaid: number;
  totalAmount: number;
}

export type Order = {
  orderId: string;
  orderDate: string;
  customerId: number;
  customerName: string;
  products: {
    productId: number;
    productName: string;
    salesPrice: number;
    quantity: number;
  }[];
  remarks: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  advanceAmount?: number;
  salesId?: string;
};

export interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

export interface Purchase {
  purchaseId: string;
  supplierName: string;
  purchaseDate: string;
  products: PurchaseItem[];
  totalAmount: number;
}

export interface ProductPrice {
  productId: number;
  productName: string;
  prices: {
    [customerId: number]: number;
  };
}

import { Supplier, SupplierTransaction } from '@/types/supplier';
import { PurchaseProduct, SalesProduct } from '@/types/productPrice';

// Add new types to the export
export type { Supplier, SupplierTransaction, PurchaseProduct, SalesProduct };

// Sample data
export const customers: Customer[] = [
  {
    customerId: 1,
    customerName: 'ABC Electronics',
    customerAddress: '123 Main St, City',
    customerMobile: '9876543210',
    amountBalance: 12500,
    totalSales: 45000,
    amountReceived: 32500,
    profit: 8500
  },
  {
    customerId: 2,
    customerName: 'XYZ Retail',
    customerAddress: '456 Oak St, Town',
    customerMobile: '8765432109',
    amountBalance: 8000,
    totalSales: 60000,
    amountReceived: 52000,
    profit: 9800
  },
  {
    customerId: 3,
    customerName: 'PQR Distributors',
    customerAddress: '789 Pine St, Village',
    customerMobile: '7654321098',
    amountBalance: 5000,
    totalSales: 38000,
    amountReceived: 33000,
    profit: 7200
  },
  {
    customerId: 4,
    customerName: 'LMN Traders',
    customerAddress: '101 Cedar St, County',
    customerMobile: '6543210987',
    amountBalance: 15000,
    totalSales: 72000,
    amountReceived: 57000,
    profit: 12500
  },
  {
    customerId: 5,
    customerName: 'EFG Enterprises',
    customerAddress: '202 Maple St, District',
    customerMobile: '5432109876',
    amountBalance: 3000,
    totalSales: 28000,
    amountReceived: 25000,
    profit: 6300
  }
];

export const products: Product[] = [
  {
    productId: 1,
    companyName: 'Tech Solutions',
    productName: 'Laptop',
    defaultSalesPrice: 25000,
    availableQuantity: 15,
    orderedQuantity: 5,
    actualQuantity: 10
  },
  {
    productId: 2,
    companyName: 'Tech Solutions',
    productName: 'Monitor',
    defaultSalesPrice: 8000,
    availableQuantity: 20,
    orderedQuantity: 10,
    actualQuantity: 10
  },
  {
    productId: 3,
    companyName: 'Office Supplies Inc.',
    productName: 'Printer',
    defaultSalesPrice: 12000,
    availableQuantity: 8,
    orderedQuantity: 2,
    actualQuantity: 6
  },
  {
    productId: 4,
    companyName: 'Office Supplies Inc.',
    productName: 'Scanner',
    defaultSalesPrice: 5000,
    availableQuantity: 10,
    orderedQuantity: 0,
    actualQuantity: 10
  },
  {
    productId: 5,
    companyName: 'Gadget World',
    productName: 'Smartphone',
    defaultSalesPrice: 15000,
    availableQuantity: 25,
    orderedQuantity: 8,
    actualQuantity: 17
  }
];

export const productPrices: ProductPrice[] = [
  {
    productId: 1,
    productName: 'Laptop',
    prices: {
      1: 24500,
      2: 24000,
      3: 25000,
      4: 24800,
      5: 25000
    }
  },
  {
    productId: 2,
    productName: 'Monitor',
    prices: {
      1: 7800,
      2: 7900,
      3: 8000,
      4: 7850,
      5: 8000
    }
  },
  {
    productId: 3,
    productName: 'Printer',
    prices: {
      1: 11800,
      2: 12000,
      3: 11900,
      4: 12000,
      5: 11800
    }
  },
  {
    productId: 4,
    productName: 'Scanner',
    prices: {
      1: 4900,
      2: 5000,
      3: 4950,
      4: 4980,
      5: 5000
    }
  },
  {
    productId: 5,
    productName: 'Smartphone',
    prices: {
      1: 14800,
      2: 14900,
      3: 15000,
      4: 14850,
      5: 14900
    }
  }
];

export const purchases: PurchaseDetail[] = [
  {
    purchaseId: 'P202104001',
    companyName: 'Tech Solutions',
    purchaseDate: '2024-04-01',
    products: [
      {
        productId: 1,
        productName: 'Laptop',
        purchasePrice: 20000,
        quantity: 5
      },
      {
        productId: 2,
        productName: 'Monitor',
        purchasePrice: 6000,
        quantity: 10
      }
    ]
  },
  {
    purchaseId: 'P202104002',
    companyName: 'Office Supplies Inc.',
    purchaseDate: '2024-04-05',
    products: [
      {
        productId: 3,
        productName: 'Printer',
        purchasePrice: 9000,
        quantity: 5
      },
      {
        productId: 4,
        productName: 'Scanner',
        purchasePrice: 3500,
        quantity: 8
      }
    ]
  },
  {
    purchaseId: 'P202104003',
    companyName: 'Gadget World',
    purchaseDate: '2024-04-10',
    products: [
      {
        productId: 5,
        productName: 'Smartphone',
        purchasePrice: 12000,
        quantity: 15
      }
    ]
  }
];

export const sales: SalesTransaction[] = [
  {
    salesId: 'S202404001',
    date: '2024-04-15',
    customerId: 1,
    customerName: 'ABC Electronics',
    products: [
      {
        productId: 1,
        productName: 'Laptop',
        salesPrice: 24500,
        quantity: 1
      },
      {
        productId: 2,
        productName: 'Monitor',
        salesPrice: 7800,
        quantity: 2
      }
    ],
    amountPaid: 30000,
    totalAmount: 40100
  },
  {
    salesId: 'S202404002',
    date: '2024-04-16',
    customerId: 2,
    customerName: 'XYZ Retail',
    products: [
      {
        productId: 3,
        productName: 'Printer',
        salesPrice: 12000,
        quantity: 2
      },
      {
        productId: 5,
        productName: 'Smartphone',
        salesPrice: 14900,
        quantity: 3
      }
    ],
    amountPaid: 40000,
    totalAmount: 68700
  },
  {
    salesId: 'S202404003',
    date: '2024-04-17',
    customerId: 3,
    customerName: 'PQR Distributors',
    products: [
      {
        productId: 1,
        productName: 'Laptop',
        salesPrice: 25000,
        quantity: 1
      },
      {
        productId: 4,
        productName: 'Scanner',
        salesPrice: 4950,
        quantity: 2
      }
    ],
    amountPaid: 25000,
    totalAmount: 34900
  },
  {
    salesId: 'S202404004',
    date: '2024-04-20',
    customerId: 4,
    customerName: 'LMN Traders',
    products: [
      {
        productId: 2,
        productName: 'Monitor',
        salesPrice: 7850,
        quantity: 5
      },
      {
        productId: 3,
        productName: 'Printer',
        salesPrice: 12000,
        quantity: 1
      }
    ],
    amountPaid: 30000,
    totalAmount: 51250
  },
  {
    salesId: 'S202404005',
    date: '2024-04-21',
    customerId: 5,
    customerName: 'EFG Enterprises',
    products: [
      {
        productId: 5,
        productName: 'Smartphone',
        salesPrice: 14900,
        quantity: 2
      }
    ],
    amountPaid: 20000,
    totalAmount: 29800
  }
];

export const orders: Order[] = [
  {
    orderId: 'O20250400001',
    orderDate: '2025-04-26',
    customerId: 1,
    customerName: 'ABC Enterprises',
    products: [
      { productId: 1, productName: 'Product A', salesPrice: 250, quantity: 5 },
      { productId: 2, productName: 'Product B', salesPrice: 180, quantity: 3 }
    ],
    remarks: 'Urgent order, needed by end of week',
    status: 'pending',
    advanceAmount: 500
  },
  {
    orderId: 'O20250400002',
    orderDate: '2025-04-27',
    customerId: 2,
    customerName: 'XYZ Corporation',
    products: [
      { productId: 3, productName: 'Product C', salesPrice: 320, quantity: 2 },
      { productId: 4, productName: 'Product D', salesPrice: 450, quantity: 1 }
    ],
    remarks: '',
    status: 'processing'
  },
  {
    orderId: 'O20250400003',
    orderDate: '2025-04-28',
    customerId: 3,
    customerName: 'Smith Industries',
    products: [
      { productId: 2, productName: 'Product B', salesPrice: 180, quantity: 10 }
    ],
    remarks: 'Corporate bulk order',
    status: 'completed',
    salesId: 'S20250400001'
  }
];

// Add suppliers mock data
export const suppliers: Supplier[] = [
  {
    supplierId: 1,
    supplierName: 'ABC Distributors',
    balanceAmount: 15000,
    crateBalance: 25
  },
  {
    supplierId: 2,
    supplierName: 'XYZ Wholesalers',
    balanceAmount: 8700,
    crateBalance: 15
  },
  {
    supplierId: 3,
    supplierName: 'PQR Supplies',
    balanceAmount: 22500,
    crateBalance: 30
  }
];

// Add supplier transactions mock data
export const supplierTransactions: SupplierTransaction[] = [
  {
    transactionId: 'ST20240401001',
    supplierId: 1,
    supplierName: 'ABC Distributors',
    date: '2024-04-01',
    openingAmount: 12000,
    billAmount: 8000,
    paid: 5000,
    damage: 0,
    balance: 15000,
    crateOpening: 20,
    crateSupply: 10,
    crateReturn: 5,
    crateBalance: 25
  },
  {
    transactionId: 'ST20240401002',
    supplierId: 2,
    supplierName: 'XYZ Wholesalers',
    date: '2024-04-01',
    openingAmount: 7500,
    billAmount: 6200,
    paid: 5000,
    damage: 0,
    balance: 8700,
    crateOpening: 12,
    crateSupply: 8,
    crateReturn: 5,
    crateBalance: 15
  },
  {
    transactionId: 'ST20240402001',
    supplierId: 3,
    supplierName: 'PQR Supplies',
    date: '2024-04-02',
    openingAmount: 18000,
    billAmount: 9500,
    paid: 5000,
    damage: 0,
    balance: 22500,
    crateOpening: 25,
    crateSupply: 15,
    crateReturn: 10,
    crateBalance: 30
  }
];

// Add purchase products data
export const purchaseProducts: PurchaseProduct[] = [
  {
    productId: 1,
    supplierId: 1,
    supplierName: 'ABC Distributors',
    productName: 'Milk',
    productWeight: '500ml',
    incentiveAmount: 2,
    purchaseRate: 25,
    productType: 'Dairy',
    priceHistory: [
      { date: '2024-03-01', price: 23 },
      { date: '2024-04-01', price: 25 }
    ]
  },
  {
    productId: 2,
    supplierId: 1,
    supplierName: 'ABC Distributors',
    productName: 'Butter',
    productWeight: '100g',
    incentiveAmount: 1,
    purchaseRate: 45,
    productType: 'Dairy',
    priceHistory: [
      { date: '2024-03-01', price: 42 },
      { date: '2024-04-01', price: 45 }
    ]
  },
  {
    productId: 3,
    supplierId: 2,
    supplierName: 'XYZ Wholesalers',
    productName: 'Cheese',
    productWeight: '200g',
    incentiveAmount: 3,
    purchaseRate: 120,
    productType: 'Dairy',
    priceHistory: [
      { date: '2024-03-01', price: 115 },
      { date: '2024-04-01', price: 120 }
    ]
  },
  {
    productId: 4,
    supplierId: 3,
    supplierName: 'PQR Supplies',
    productName: 'Yogurt',
    productWeight: '400g',
    incentiveAmount: 1.5,
    purchaseRate: 35,
    productType: 'Dairy',
    priceHistory: [
      { date: '2024-03-01', price: 32 },
      { date: '2024-04-01', price: 35 }
    ]
  },
  {
    productId: 5,
    supplierId: 3,
    supplierName: 'PQR Supplies',
    productName: 'Cream',
    productWeight: '200ml',
    incentiveAmount: 2,
    purchaseRate: 70,
    productType: 'Dairy',
    priceHistory: [
      { date: '2024-03-01', price: 65 },
      { date: '2024-04-01', price: 70 }
    ]
  }
];

// Add sales products data
export const salesProducts: SalesProduct[] = [
  {
    productId: 1,
    productName: 'Milk',
    defaultSalesPrice: 30,
    priceHistory: [
      { date: '2024-03-01', price: 28 },
      { date: '2024-04-01', price: 30 }
    ],
    customerPrices: {
      1: 29,
      2: 30,
      3: 31,
      4: 30,
      5: 32
    }
  },
  {
    productId: 2,
    productName: 'Butter',
    defaultSalesPrice: 55,
    priceHistory: [
      { date: '2024-03-01', price: 52 },
      { date: '2024-04-01', price: 55 }
    ],
    customerPrices: {
      1: 54,
      2: 55,
      3: 56,
      4: 55,
      5: 57
    }
  },
  {
    productId: 3,
    productName: 'Cheese',
    defaultSalesPrice: 150,
    priceHistory: [
      { date: '2024-03-01', price: 145 },
      { date: '2024-04-01', price: 150 }
    ],
    customerPrices: {
      1: 145,
      2: 150,
      3: 152,
      4: 150,
      5: 155
    }
  },
  {
    productId: 4,
    productName: 'Yogurt',
    defaultSalesPrice: 45,
    priceHistory: [
      { date: '2024-03-01', price: 42 },
      { date: '2024-04-01', price: 45 }
    ],
    customerPrices: {
      1: 44,
      2: 45,
      3: 46,
      4: 45,
      5: 47
    }
  },
  {
    productId: 5,
    productName: 'Cream',
    defaultSalesPrice: 90,
    priceHistory: [
      { date: '2024-03-01', price: 85 },
      { date: '2024-04-01', price: 90 }
    ],
    customerPrices: {
      1: 88,
      2: 90,
      3: 92,
      4: 90,
      5: 95
    }
  }
];

// Helper functions for suppliers
export const getNextSupplierId = (): number => {
  return suppliers.length > 0 ? 
    Math.max(...suppliers.map(supplier => supplier.supplierId)) + 1 : 1;
};

export const getSupplierById = (supplierId: number): Supplier | undefined => {
  return suppliers.find(supplier => supplier.supplierId === supplierId);
};

export const getSupplierTransactions = (supplierId: number, date?: string): SupplierTransaction[] => {
  return supplierTransactions.filter(transaction => 
    transaction.supplierId === supplierId &&
    (date ? transaction.date === date : true)
  );
};

// Helper functions for product pricing
export const getPurchaseProductById = (productId: number): PurchaseProduct | undefined => {
  return purchaseProducts.find(product => product.productId === productId);
};

export const getSalesProductById = (productId: number): SalesProduct | undefined => {
  return salesProducts.find(product => product.productId === productId);
};

export const getNextProductId = (): number => {
  const productIds = [
    ...products.map(p => p.productId),
    ...purchaseProducts.map(p => p.productId),
    ...salesProducts.map(p => p.productId)
  ];
  
  return productIds.length > 0 ? Math.max(...productIds) + 1 : 1;
};

// Helper functions
export const getNextPurchaseId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const lastPurchaseId = purchases.length > 0 ? 
    parseInt(purchases[purchases.length - 1].purchaseId.slice(-3)) : 0;
  
  return `P${year}${month}${(lastPurchaseId + 1).toString().padStart(3, '0')}`;
};

export const getNextSalesId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const lastSalesId = sales.length > 0 ? 
    parseInt(sales[sales.length - 1].salesId.slice(-3)) : 0;
  
  return `S${year}${month}${(lastSalesId + 1).toString().padStart(3, '0')}`;
};

export const getNextOrderId = (prefix: string = 'O') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const basePrefix = prefix + year + month;
  
  let maxOrderNum = 0;
  
  if (prefix === 'O') {
    orders.forEach(order => {
      if (order.orderId.startsWith(basePrefix)) {
        const orderNum = parseInt(order.orderId.slice(basePrefix.length));
        if (orderNum > maxOrderNum) {
          maxOrderNum = orderNum;
        }
      }
    });
  } else if (prefix === 'S') {
    sales.forEach(sale => {
      if (sale.salesId.startsWith(basePrefix)) {
        const orderNum = parseInt(sale.salesId.slice(basePrefix.length));
        if (orderNum > maxOrderNum) {
          maxOrderNum = orderNum;
        }
      }
    });
  }
  
  const nextNum = maxOrderNum + 1;
  return `${basePrefix}${String(nextNum).padStart(5, '0')}`;
};

export const getNextCustomerId = (): number => {
  return customers.length > 0 ? 
    Math.max(...customers.map(customer => customer.customerId)) + 1 : 1;
};

// Functions to get data
export const getCustomerById = (customerId: number): Customer | undefined => {
  return customers.find(customer => customer.customerId === customerId);
};

export const getProductById = (productId: number): Product | undefined => {
  return products.find(product => product.productId === productId);
};

export const getSaleById = (salesId: string): SalesTransaction | undefined => {
  return sales.find(sale => sale.salesId === salesId);
};

export const getProductsByCompany = (companyName: string): Product[] => {
  return products.filter(product => product.companyName === companyName);
};

export const getCustomerProductPrice = (customerId: number, productId: number): number => {
  const product = productPrices.find(p => p.productId === productId);
  if (product && product.prices[customerId]) {
    return product.prices[customerId];
  }
  const defaultProduct = products.find(p => p.productId === productId);
  return defaultProduct ? defaultProduct.defaultSalesPrice : 0;
};

export const getCompanyNames = (): string[] => {
  return [...new Set(products.map(product => product.companyName))];
};

export const getTopProfitCustomers = (limit: number = 5): Customer[] => {
  return [...customers].sort((a, b) => b.profit - a.profit).slice(0, limit);
};

export const getTopDebtCustomers = (limit: number = 5): Customer[] => {
  return [...customers].sort((a, b) => b.amountBalance - a.amountBalance).slice(0, limit);
};

export const getTopSellingProducts = (limit: number = 5): any[] => {
  const productSales = products.map(product => {
    const totalSales = sales.reduce((sum, sale) => {
      const productSale = sale.products.find(p => p.productId === product.productId);
      return sum + (productSale ? productSale.salesPrice * productSale.quantity : 0);
    }, 0);

    const totalQuantity = sales.reduce((sum, sale) => {
      const productSale = sale.products.find(p => p.productId === product.productId);
      return sum + (productSale ? productSale.quantity : 0);
    }, 0);

    const profit = totalSales * 0.2;

    return {
      productId: product.productId,
      productName: product.productName,
      totalSales,
      totalQuantity,
      profit
    };
  });

  return productSales.sort((a, b) => b.totalSales - a.totalSales).slice(0, limit);
};

export const getRecentSales = (limit: number = 20): SalesTransaction[] => {
  return [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
};

export const getPurchaseById = (purchaseId: string): PurchaseDetail | undefined => {
  return purchases.find(purchase => purchase.purchaseId === purchaseId);
};

export const getRecentPurchases = (limit: number = 10): PurchaseDetail[] => {
  return [...purchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()).slice(0, limit);
};

// Mock data for charts
export const getSalesPurchaseData = () => {
  return [
    { name: 'Jan', sales: 4000, purchases: 2400, profit: 1600 },
    { name: 'Feb', sales: 3000, purchases: 1398, profit: 1602 },
    { name: 'Mar', sales: 2000, purchases: 9800, profit: -7800 },
    { name: 'Apr', sales: 2780, purchases: 3908, profit: -1128 },
    { name: 'May', sales: 1890, purchases: 4800, profit: -2910 },
    { name: 'Jun', sales: 2390, purchases: 3800, profit: -1410 },
    { name: 'Jul', sales: 3490, purchases: 4300, profit: -810 },
    { name: 'Aug', sales: 4000, purchases: 2400, profit: 1600 },
    { name: 'Sep', sales: 5000, purchases: 3000, profit: 2000 },
    { name: 'Oct', sales: 6000, purchases: 3500, profit: 2500 },
    { name: 'Nov', sales: 7000, purchases: 4000, profit: 3000 },
    { name: 'Dec', sales: 9000, purchases: 5000, profit: 4000 },
  ];
};

// Helper function to update inventory based on orders
export const updateInventoryFromOrder = (order: Order, action: 'order' | 'cancel' | 'complete') => {
  order.products.forEach(orderProduct => {
    const product = products.find(p => p.productId === orderProduct.productId);
    
    if (product) {
      switch (action) {
        case 'order':
          product.orderedQuantity += orderProduct.quantity;
          break;
        
        case 'cancel':
          product.orderedQuantity = Math.max(0, product.orderedQuantity - orderProduct.quantity);
          break;
          
        case 'complete':
          product.orderedQuantity = Math.max(0, product.orderedQuantity - orderProduct.quantity);
          product.availableQuantity = Math.max(0, product.availableQuantity - orderProduct.quantity);
          break;
      }
      
      product.actualQuantity = product.availableQuantity - product.orderedQuantity;
    }
  });
};

// Helper function to update customer balance
export const updateCustomerBalance = (customerId: number, amount: number) => {
  const customer = customers.find(c => c.customerId === customerId);
  
  if (customer) {
    customer.amountReceived += amount;
    customer.amountBalance = customer.totalSales - customer.amountReceived;
  }
};

// Helper function to update inventory from purchase
export const updateInventoryFromPurchase = (purchase: Purchase) => {
  purchase.products.forEach(purchaseItem => {
    const product = products.find(p => p.productId === purchaseItem.productId);
    
    if (product) {
      // Update available quantity when new purchase is added
      product.availableQuantity += purchaseItem.quantity;
      product.actualQuantity = product.availableQuantity - product.orderedQuantity;
    }
  });
};

// Fix for the Purchase type mismatch

// Convert PurchaseDetail to Purchase for compatibility
export const getPurchasesFromDetails = (): Purchase[] => {
  return purchases.map(detail => ({
    purchaseId: detail.purchaseId,
    supplierName: detail.companyName,
    purchaseDate: detail.purchaseDate,
    products: detail.products.map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: p.quantity,
      purchasePrice: p.purchasePrice
    })),
    totalAmount: detail.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  }));
};
