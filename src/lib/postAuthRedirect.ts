import { supabase } from "@/integrations/supabase/client";
import { getPendingShoppingOrder, SHOPPING_ORDER_PAYMENT_ROUTE } from "@/lib/shoppingOrders";

export const getPostAuthRedirectPath = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Post-auth redirect: role lookup failed", error);
    return "/dashboard";
  }

  if (data?.role === "admin") {
    return "/admin";
  }

  const hasPendingShoppingOrder = !!getPendingShoppingOrder();
  const postAuthRedirect = localStorage.getItem("post_auth_redirect");
  const pendingRedirect =
    postAuthRedirect ||
    localStorage.getItem("pending_shipment_redirect") ||
    (hasPendingShoppingOrder ? SHOPPING_ORDER_PAYMENT_ROUTE : null);

  if (pendingRedirect) {
    if (postAuthRedirect) {
      localStorage.removeItem("post_auth_redirect");
    }
    localStorage.removeItem("pending_shipment_redirect");
    return pendingRedirect;
  }

  return "/dashboard";
};