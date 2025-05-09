
// Custom type definitions for Supabase data
// These types match our database schema but are separate from the auto-generated types

export interface SupplierDB {
  supplier_id: number;
  supplier_name: string;
  balance_amount: number;
  crate_balance: number;
  created_at: string;
}

export interface SupplierTransactionDB {
  transaction_id: string;
  supplier_id: number;
  date: string;
  opening_amount: number;
  bill_amount: number;
  paid: number;
  damage: number;
  balance: number;
  crate_opening: number;
  crate_supply: number;
  crate_return: number;
  crate_balance: number;
  created_at: string;
}

export interface PurchaseDB {
  purchase_id: number;
  supplier_id: number;
  purchase_date: string;
  total_amount: number;
  created_at: string;
}

export interface PurchaseItemDB {
  item_id: number;
  purchase_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  purchase_price: number;
  created_at: string;
}
