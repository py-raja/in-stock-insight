
export interface Supplier {
  supplierId: number;
  supplierName: string;
  balanceAmount: number;
  crateBalance: number;
}

export interface SupplierTransaction {
  transactionId: string;
  supplierId: number;
  supplierName: string;
  date: string;
  openingAmount: number;
  billAmount: number;
  paid: number;
  damage: number;
  balance: number;
  crateOpening: number;
  crateSupply: number;
  crateReturn: number;
  crateBalance: number;
}
