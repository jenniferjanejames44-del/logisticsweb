## Goal

Move dimensions OFF individual items and ONTO the package/box. Calculate volumetric and chargeable weight from the package, then keep checkout, invoice, admin, and shipment summary in perfect sync.

## What changes

### 1. Database (migration)

Extend `packaging_materials`:
- `length_cm`, `width_cm`, `height_cm` (numeric, nullable — null means custom)
- `description` (text, nullable)
- `icon_key` (text, nullable — e.g. `envelope`, `small-box`, `vacuum-bag`, `warm-bag`, `custom`)
- `is_custom` (boolean, default false) — only one row should be Custom

Extend `shipments` (do NOT remove existing columns — keep `length_cm/width_cm/height_cm/weight` for backwards compat):
- `package_id` (uuid, nullable) — link to packaging_materials
- `package_name` (text), `package_price` (numeric default 0)
- `actual_weight` (numeric), `volumetric_weight` (numeric), `chargeable_weight` (numeric)
- `volumetric_divisor` (numeric, default 5000)
- `items_json` (jsonb) — full item list snapshot

New row in `app_settings` key `pricing_config`:
```json
{ "volumetric_divisor": 5000 }
```

Seed/upsert the standard packaging set: Envelope, Small Box, Medium Box, Large Box, Vacuum Bag, Warm Bag, Custom Package — with sensible default L×W×H and prices.

### 2. Pricing engine (`src/lib/pricingEngine.ts`)

Add a single source of truth used by form, checkout, invoice, admin:

```ts
computeShipmentTotals({
  packageDims: { l, w, h },        // cm
  divisor: 5000,
  items: [{ qty, weightKg }],
  packagePrice,
  countryRule,                      // existing country_pricing_rules row
  declaredValue,
}) => {
  actualWeight, volumetricWeight, chargeableWeight,
  shippingCost, packagingCost, vat, insurance, handlingFee, total
}
```

Rules:
- `actualWeight = Σ(qty × weightKg)`
- `volumetricWeight = (l × w × h) / divisor` (0 if any dim missing)
- `chargeableWeight = max(actual, volumetric)`
- `shippingCost` uses `chargeableWeight` against country rule (flat threshold or per-kg)
- `total = shippingCost + packagingCost + handling + vat + insurance`

### 3. Shipment form (`AfricaniesShipmentForm.tsx`)

Replace the current "Items" step with two sub-steps:

**Step A — Select Package** (card grid):
- Each card: icon, name, dims (e.g. `40 × 30 × 20 cm`), price, short description
- Predefined packages auto-load dimensions (read-only display)
- Custom Package card reveals 3 inputs (L, W, H in cm) with `> 0` validation

**Step B — Add Items** (inside selected package):
- Fields per item: name, quantity (− N +), weight per item (kg), declared value, optional description
- Remove all length/width/height inputs from item rows
- Validation: name + qty ≥ 1 + weight > 0 required

Summary step shows: package + dims, item table, actual/volumetric/chargeable weight, packaging cost, shipping cost, VAT, insurance, total — all from `computeShipmentTotals`.

Submit persists: `package_id`, `package_name`, `package_price`, dims, `actual_weight`, `volumetric_weight`, `chargeable_weight`, `volumetric_divisor`, `items_json`, plus existing fields.

### 4. Checkout (`src/pages/Checkout.tsx` + `CheckoutSummaryCard`)

Read `chargeable_weight` and stored breakdown from the shipment row instead of recomputing from raw weight. Show same line items as summary.

### 5. Invoice + Admin

- `generate-invoice-pdf` edge function: include package, dims, chargeable weight, line items
- `AdminShipments` + `ShipmentDetail` (user + admin): display package card, dimensions, items table, actual/volumetric/chargeable weights, full breakdown — guard against null

### 6. Admin Packaging (`src/pages/admin/AdminPackaging.tsx`)

Extend the dialog with: description, icon picker (select from preset keys), L/W/H, is_custom toggle. Table shows dims column. Add a "Volumetric Divisor" setting row that writes to `app_settings.pricing_config`.

### 7. Mobile polish

Package card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, full-width tap targets, sticky bottom Continue button on mobile, quantity stepper sized for touch (min 44px).

## Files touched

- new migration (schema + seed)
- `src/lib/pricingEngine.ts` (add `computeShipmentTotals`, keep existing exports)
- `src/components/shipments/AfricaniesShipmentForm.tsx` (package step + item refactor)
- new `src/components/shipments/PackageSelector.tsx`
- `src/pages/Checkout.tsx`, `src/components/checkout/CheckoutSummaryCard.tsx`
- `src/pages/dashboard/ShipmentDetail.tsx`
- `src/pages/admin/AdminShipments.tsx`
- `src/pages/admin/AdminPackaging.tsx`
- `supabase/functions/generate-invoice-pdf/index.ts`

## What I will NOT touch

- Auth, RLS policies, role system
- Paystack flow, wallet, webhook handlers
- Homepage, marketing pages
- Existing shipments already in the DB will keep working — new columns are nullable and code falls back to legacy `weight` when `chargeable_weight` is null.

## QA checklist before handoff

- 1 item × 2 kg → actual 2 kg
- 10 items × 2 kg → actual 20 kg
- Large box 60×40×40 / divisor 5000 = 19.2 kg volumetric → chargeable picks volumetric when actual < it
- Heavy items override volumetric correctly
- Checkout total === Summary total === Invoice total
- Custom package requires L/W/H; predefined locks them
- Mobile: cards don't overflow, stepper buttons tappable
