import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeMock, toastSuccessMock, toastErrorMock, toastInfoMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastInfoMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

vi.mock("@/contexts/CurrencyContext", () => ({
  useCurrency: () => ({
    formatConverted: (amount: number) => `$${amount.toFixed(2)}`,
    formatMoney: (amount: number) => `$${amount.toFixed(2)}`,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
    info: toastInfoMock,
  },
}));

import PayShipmentDialog from "@/components/shipments/PayShipmentDialog";

describe("PayShipmentDialog", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    toastInfoMock.mockReset();
  });

  it("loads the exact wallet preview and uses it for wallet payment", async () => {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    invokeMock
      .mockResolvedValueOnce({
        data: {
          status: "preview",
          charged_amount: 160000,
          currency: "NGN",
          wallet_balance: 200000,
          has_sufficient_funds: true,
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { status: "success" }, error: null });

    render(
      <PayShipmentDialog
        open
        onOpenChange={onOpenChange}
        shipmentId="shipment-1"
        invoiceId="invoice-1"
        invoiceNumber="INV-001"
        trackingNumber="TRK-001"
        price={100}
        priceCurrency="USD"
        userBalance={5000}
        userId="user-1"
        onSuccess={onSuccess}
      />,
    );

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith("wallet-pay-shipment", {
        body: { shipment_id: "shipment-1", invoice_id: "invoice-1", preview_only: true },
      });
    });

    expect(await screen.findByText("$160000.00")).toBeInTheDocument();
    expect(screen.getAllByText("$200000.00")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /pay from wallet/i }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenLastCalledWith("wallet-pay-shipment", {
        body: { shipment_id: "shipment-1", invoice_id: "invoice-1" },
      });
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Payment successful!");
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows the shortfall when the exact preview says wallet funds are insufficient", async () => {
    invokeMock.mockResolvedValueOnce({
      data: {
        status: "preview",
        charged_amount: 160000,
        currency: "NGN",
        wallet_balance: 50000,
        has_sufficient_funds: false,
      },
      error: null,
    });

    render(
      <PayShipmentDialog
        open
        onOpenChange={vi.fn()}
        shipmentId="shipment-2"
        invoiceId="invoice-2"
        invoiceNumber="INV-002"
        trackingNumber="TRK-002"
        price={100}
        priceCurrency="USD"
        userBalance={5000}
        userId="user-2"
        onSuccess={vi.fn()}
      />,
    );

    expect(await screen.findByText(/Insufficient Wallet Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/\$110000.00/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pay from wallet/i })).not.toBeInTheDocument();
  });
});