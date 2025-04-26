
export interface OrderType {
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
}
