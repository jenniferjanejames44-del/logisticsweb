import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Detect device type from user agent
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "Tablet";
  }
  if (/Mobile|iPhone|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
};

// Get browser name from user agent
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Unknown";
};

export const useLoginTracking = () => {
  const { user } = useAuth();

  useEffect(() => {
    const trackLogin = async () => {
      if (!user) return;

      // Check if we already tracked this session
      const sessionKey = `login_tracked_${user.id}`;
      if (sessionStorage.getItem(sessionKey)) return;

      try {
        // Get location from IP (using a free API)
        let location = "Unknown";
        try {
          const response = await fetch("https://ipapi.co/json/");
          if (response.ok) {
            const data = await response.json();
            location = `${data.city || "Unknown"}, ${data.country_name || "Unknown"}`;
          }
        } catch (e) {
          console.log("Could not fetch location");
        }

        // Insert login history
        const { error } = await supabase.from("login_history").insert({
          user_id: user.id,
          device_type: getDeviceType(),
          browser: getBrowser(),
          location: location,
        });

        if (error) {
          console.error("Error tracking login:", error);
        } else {
          sessionStorage.setItem(sessionKey, "true");

          // Send welcome email on first-ever login (account just verified)
          try {
            const { count } = await supabase
              .from("login_history")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

            if (count !== null && count <= 1) {
              await supabase.functions.invoke("send-notification-email", {
                body: {
                  type: "account_verified",
                  data: {
                    user_email: user.email,
                    user_name: user.user_metadata?.full_name || "",
                  },
                },
              });
            }
          } catch (welcomeErr) {
            console.error("Failed to send welcome email:", welcomeErr);
          }
        }
      } catch (error) {
        console.error("Error tracking login:", error);
      }
    };

    trackLogin();
  }, [user]);
};
