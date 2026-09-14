UPDATE public.zone_pricing_rates
SET vat_percent = 7.5,
    insurance_percent = 1.5,
    updated_at = now()
WHERE vat_percent = 0 AND insurance_percent = 0;