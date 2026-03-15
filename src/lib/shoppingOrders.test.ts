import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingShoppingOrder,
  getPendingShoppingOrder,
  getShoppingOrderDisplayStatus,
  needsShoppingOrderPayment,
  savePendingShoppingOrder,
} from "@/lib/shoppingOrders";

describe("shoppingOrders helpers", () => {
  beforeEach(() => {
    clearPendingShoppingOrder();
  });

  it("persists pending shopping order data across auth", () => {
    const pending = {
      productName: "Laptop",
      productLink: "https://example.com/laptop",
      itemDescription: "16GB RAM",
      itemValue: 1200,
      quantity: 1,
      processingFee: 75,
      totalCost: 1275,
      additionalNotes: "Silver",
    };

    savePendingShoppingOrder(pending);

    expect(getPendingShoppingOrder()).toEqual(pending);
  });

  it("treats unpaid legacy and new shopping orders as pending payment", () => {
    expect(getShoppingOrderDisplayStatus("pending_purchase", "unpaid")).toBe("pending_payment");
    expect(getShoppingOrderDisplayStatus("pending_payment", "unpaid")).toBe("pending_payment");
    expect(needsShoppingOrderPayment("pending_purchase", "unpaid")).toBe(true);
  });

  it("normalizes paid-but-unprogressed orders to paid", () => {
    expect(getShoppingOrderDisplayStatus("pending_payment", "paid")).toBe("paid");
    expect(needsShoppingOrderPayment("pending_payment", "paid")).toBe(false);
  });
});