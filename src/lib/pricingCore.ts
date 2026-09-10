// Re-export of the ONE authoritative pricing core that also runs on the server.
// The frontend uses this only for types and display helpers — never to
// calculate a price it then charges the customer.
export * from "../../supabase/functions/_shared/pricing-core.ts";
