export const SHOPPING_ORDER_PAYMENT_ROUTE = "/dashboard/shopping-orders/pay";

const PENDING_SHOPPING_ORDER_KEY = "pending_shopping_order_data";

export interface PendingShoppingOrderData {
  productName: string;
  productLink: string;
  itemDescription: string;
  itemValue: number;
  quantity: number;
  processingFee: number;
  totalCost: number;
  additionalNotes: string;
}

export const shoppingOrderStatusOptions = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "purchased", label: "Purchased" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

export const shoppingOrderStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_payment: { label: "Pending Payment", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
  processing: { label: "Processing", variant: "outline" },
  purchased: { label: "Purchased", variant: "default" },
  shipped: { label: "Shipped", variant: "outline" },
  delivered: { label: "Delivered", variant: "default" },
  pending_purchase: { label: "Pending Payment", variant: "secondary" },
  arrived_warehouse: { label: "Shipped", variant: "outline" },
  ready_for_shipment: { label: "Processing", variant: "outline" },
};

export function savePendingShoppingOrder(data: PendingShoppingOrderData) {
  localStorage.setItem(PENDING_SHOPPING_ORDER_KEY, JSON.stringify(data));
}

export function getPendingShoppingOrder(): PendingShoppingOrderData | null {
  const raw = localStorage.getItem(PENDING_SHOPPING_ORDER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingShoppingOrderData;
  } catch {
    return null;
  }
}

export function clearPendingShoppingOrder() {
  localStorage.removeItem(PENDING_SHOPPING_ORDER_KEY);
}

export function getShoppingOrderDisplayStatus(status: string, paymentStatus: string) {
  if (paymentStatus === "paid" && ["pending_payment", "pending_purchase", ""].includes(status || "")) {
    return "paid";
  }

  if (paymentStatus !== "paid" && ["pending_payment", "pending_purchase", ""].includes(status || "")) {
    return "pending_payment";
  }

  return status || "pending_payment";
}

export function needsShoppingOrderPayment(status: string, paymentStatus: string) {
  return paymentStatus !== "paid" && getShoppingOrderDisplayStatus(status, paymentStatus) === "pending_payment";
}

export function canAdvanceShoppingOrder(newStatus: string, paymentStatus: string) {
  return paymentStatus === "paid" || newStatus === "pending_payment";
}