## Pricing Engine v2 — Import & Export

Build an admin-controlled pricing engine that cleanly separates Import (Ship TO Nigeria) and Export (Ship FROM Nigeria) pricing, with automatic rule matching, multi-currency totals, and NGN conversion at Paystack checkout — without breaking existing shipments, invoices, or payments.

---

### 1. Database (new migration, additive only)

**New table: `pricing_rules`**
- `id`, `shipment_type` (`import` | `export`), `name`
- `origin_country`, `warehouse_country` (nullable, import only), `destination_country`
- `shipping_method` (air | ocean | road), `service_type` (express | standard, nullable)
- `min_weight_kg`, `max_weight_kg` (nullable)
- `flat_price`, `flat_weight_threshold_kg`, `price_per_kg`
- `handling_fee`, `customs_fee`, `vat_percent`, `insurance_percent`
- `currency`, `estimated_days_min`, `estimated_days_max`
- `is_active`, `priority` (int, higher = more specific override), timestamps
- RLS: admins manage all; anyone reads `is_active = true`
- CHECK: if `shipment_type='export'` then `warehouse_country IS NULL`

**New table: `exchange_rates`**
- `id`, `from_currency`, `to_currency`, `rate`, `is_active`, `updated_by`, timestamps
- Unique on (`from_currency`, `to_currency`) where active
- RLS: admins manage; authenticated read

**Migration of existing data**
- Keep `country_pricing_rules` intact (no drop). Backfill its rows into `pricing_rules` as `shipment_type='import'`, `destination_country='Nigeria'`, `origin_country = country`, `warehouse_country = country`, `shipping_method='air'`. Old code keeps working until cut over.

### 2. Pricing engine library (`src/lib/pricingEngineV2.ts`)

- `matchPricingRule({ shipmentType, originCountry, destinationCountry, warehouseCountry, shippingMethod, serviceType, chargeableWeight })` → most specific active rule (priority desc, then exact-match score; respects min/max weight).
- `computeShipmentTotalsV2({ rule, chargeableWeight, declaredValue, packagingCost })`:
  - base = chargeableWeight ≤ threshold ? flat_price : chargeableWeight × price_per_kg
  - subtotal = base + handling + customs + packaging
  - vat = subtotal × vat%
  - insurance = declaredValue × insurance%
  - total = subtotal + vat + insurance
- `convertToNGN(amount, currency)` — reads `exchange_rates` (cached), throws if missing.
- `MissingPricingRuleError` for "No pricing rule found" UX.

Chargeable weight = max(actualWeight, volumetric). Quantity is descriptive only — never multiplied into weight (already true in `computeShipmentTotals`; preserve).

### 3. Admin UI — new page `Pricing Engine`

Route: `/admin/pricing-engine` (replace existing `AdminPricingEngine.tsx` content).

- Tabs: **Import Pricing** | **Export Pricing** | **Exchange Rates**
- Each pricing tab: clean table (rule name, route, method, weight band, base, currency, status badge, actions).
- Add/Edit modal — grouped sections: Route · Method · Weight & Pricing · Fees & Tax · Meta. Export hides warehouse field. Validation per spec section 17.
- Delete = soft (set `is_active=false`) with confirm; hard delete behind admin-only confirm.
- Exchange Rates tab: simple CRUD list (USD→NGN, GBP→NGN, EUR→NGN, CNY→NGN).

Sidebar already links to `/admin/pricing-engine` — keep.

### 4. User shipment flow integration

`AfricaniesShipmentForm.tsx` (the active form):
- Detect `shipmentType` from existing import/export tab/flow param.
- Replace `calculateShippingCost` call with `matchPricingRule` + `computeShipmentTotalsV2`.
- Export branch: hide warehouse selector, skip `warehouse_country`.
- Import branch: keep warehouse selector (already polished).
- If no rule matches → show inline error card "No pricing rule found for this route. Please contact support." and disable Continue/Checkout.

Summary card shows full breakdown (section 12) including `Total in <currency>` and `≈ ₦X,XXX (Paystack)`.

### 5. Checkout / Paystack

- Persist on `shipments` insert: `price` (rule currency total), plus store rule snapshot in `items_json.pricing` (rule_id, currency, breakdown, ngn_total, fx_rate). No schema change needed.
- `paystack-initialize` edge function: read shipment/invoice, if currency ≠ NGN call `convertToNGN` server-side using `exchange_rates` table, send kobo = ngn_total × 100. Add `currency`, `fx_rate`, `original_amount` to Paystack metadata. Existing NGN invoices unaffected.
- Invoice already stores `amount` + `currency` — extend `auto_create_invoice` trigger? No — keep trigger, but write breakdown into invoice via app code right after shipment insert (UPDATE invoices set …).

### 6. Invoice & Admin shipment detail

- Invoice page & PDF: add Import/Export label, route, warehouse (if import), rule name, chargeable weight, VAT, insurance, handling+customs, total + currency, NGN equivalent.
- `AdminShipments` detail drawer: show same breakdown + matched rule name.

### 7. Safety

- Old `country_pricing_rules` table and `calculateShippingCost` function remain callable — no removed exports.
- Old shipments untouched (price/currency stored on row).
- New rules apply only to new shipments.
- All changes additive; no destructive SQL.

---

### Technical notes

- Files to add: `supabase/migrations/<ts>_pricing_engine_v2.sql`, `src/lib/pricingEngineV2.ts`, `src/components/admin/pricing/RuleFormDialog.tsx`, `src/components/admin/pricing/RulesTable.tsx`, `src/components/admin/pricing/ExchangeRatesTab.tsx`.
- Files to edit: `src/pages/admin/AdminPricingEngine.tsx`, `src/components/shipments/AfricaniesShipmentForm.tsx`, `src/components/shipments/CostBreakdown.tsx`, `src/pages/Checkout.tsx`, `supabase/functions/paystack-initialize/index.ts`, `src/pages/admin/AdminShipments.tsx` (detail), `src/pages/dashboard/Invoices.tsx` (display).
- Do NOT touch: `src/integrations/supabase/{client,types}.ts`, `supabase/config.toml` project block, homepage, auth.

After approval I'll run the migration first (single tool call), then implement code in batches.
