
## What I missed last time
You're right — last turn I only patched the floating chat icon. The actual modal structure, form spacing, and footer-button visibility issues across the dashboard were not done. Here is the full plan.

## Goal
Make every popup in the user dashboard behave the same way: centered, capped at 90vh, with a fixed header, an internally-scrolling body, and a sticky footer where the primary button is always visible. No floating element should ever cover an action button.

## 1. Build a single shared modal shell
Create `src/components/ui/modal-shell.tsx` exporting `ModalShell`, `ModalHeader`, `ModalBody`, `ModalFooter`. It wraps Radix `Dialog` with a fixed structure:

```text
ModalShell (DialogContent)
 ├─ ModalHeader   sticky top, title + close (X)
 ├─ ModalBody     flex-1, overflow-y-auto, 16-20px gap
 └─ ModalFooter   sticky bottom, primary right, secondary left
```

Defaults applied automatically:
- `w-[calc(100%-1rem)] max-w-[420px] sm:max-w-[520px]`
- `max-h-[90dvh]`, `flex flex-col`, `p-0 gap-0 overflow-hidden`
- Body padding `px-5 py-5 space-y-4`
- Footer `px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t bg-background`
- Header `px-5 py-4 border-b bg-background`, close button always top-right

This becomes the standard for every dashboard modal.

## 2. Refactor existing modals to use the shell
Apply `ModalShell` to:
- `src/components/shipments/PayShipmentDialog.tsx` (checkout payment popup)
- `src/components/wallet/CustomerAddFundsDialog.tsx`
- `src/components/wallet/AddFundsDialog.tsx`
- `src/pages/dashboard/Support.tsx` (new ticket dialog)
- `src/pages/dashboard/Invoices.tsx` (preview dialog)
- `src/pages/dashboard/ShoppingOrders.tsx` (any inline dialogs)

Backend calls, props, and pricing logic stay untouched — only the JSX wrapper and class names change.

## 3. Fix the Create Shipment "Items" section
File: `src/components/shipments/AfricaniesShipmentForm.tsx`

The Items step is inline (not a modal), but it has the same overflow problem on mobile. Changes:
- Each item becomes a clean card: label-above-input, 48px inputs, 10px radius, light-grey bg, 16px gaps.
- "Add Item" / "Remove" buttons placed in a clear row, never overlapping.
- The wizard's bottom Next/Back bar becomes sticky on mobile (same pattern as Checkout) so the action button is never hidden under the chat icon.

## 4. Form/input baseline (used by shell + wizard)
Verify `src/components/ui/input.tsx`, `select.tsx`, `textarea.tsx` render at:
- height 48px desktop / 44px mobile
- radius 10px
- background `bg-muted/40` (maps to the light-grey requested)
- label always above (no floating labels)
- 16px gap between fields, 24px between sections

These are mostly already correct; only minor class tweaks expected.

## 5. Button system inside modals
Inside any modal footer, enforce:
- Primary: `variant="default"` (already orange `#DF5101`, white text, 12px/20px padding, 8px radius via the existing button.tsx)
- Secondary: `variant="outline"` (white bg, navy `#061043` border + text)

No new variants — just consistent usage.

## 6. Dropdown behavior
Radix `Select` and `Popover` already use a portal so they don't push layout. I'll verify the open ones inside modals get `position="popper"` + `sideOffset={6}` and `onValueChange` immediately closes them. No layout shift, no reset.

## 7. Chat-icon overlay
Already shipped last turn — floating WhatsApp + AI chat buttons hide automatically while any dialog/sheet is open. Keeping that.

## 8. Visual cleanup
Inside modals, remove nested borders / extra cards / heavy shadows. One outer container (the shell), one subtle divider where needed, that's it.

## What I will NOT touch
- Backend logic, edge functions, pricing math, Paystack flow, Supabase schema
- Public homepage
- Any color outside the existing `#061043` / `#DF5101` tokens

## Files changed (estimate)
- new: `src/components/ui/modal-shell.tsx`
- edited: `PayShipmentDialog.tsx`, `CustomerAddFundsDialog.tsx`, `AddFundsDialog.tsx`, `Support.tsx`, `Invoices.tsx`, `AfricaniesShipmentForm.tsx`
- minor: `input.tsx`, `select.tsx`, `textarea.tsx` (only if the heights/radius drift from spec)

## Result
Every dashboard popup will look and behave the same: centered card, never taller than the viewport, body scrolls inside, Pay Now / Submit always visible at the bottom, no chat icon in the way, clean spacing matching the Africaniés-style discipline.
