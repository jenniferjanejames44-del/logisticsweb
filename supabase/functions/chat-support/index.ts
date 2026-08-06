import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are RAC Logistics' friendly and professional customer support assistant. You help customers with questions about our logistics services.

ABOUT RAC LOGISTICS:
- We are a premier global logistics company specializing in freight forwarding and supply chain solutions
- Founded with a mission to simplify international shipping for businesses of all sizes
- We operate across 150+ countries worldwide

OUR SERVICES:
1. Air Shipping - Fast, reliable air freight for time-sensitive cargo (2-5 days delivery)
2. Ocean Shipping - Cost-effective sea freight for large shipments (10-30 days delivery)
3. Personal Shopping - We buy and ship products from any store worldwide
4. Procurement - Sourcing and purchasing goods on behalf of clients
5. Import/Export - Full customs documentation and compliance handling
6. Warehousing - Secure storage facilities with inventory management
7. Customs Clearance - Expert handling of all customs procedures and documentation

PRICING:
- Air Shipping: Starting from $15/kg (varies by destination)
- Ocean Shipping: Starting from $5/kg for standard cargo
- Personal Shopping: 10% service fee + shipping costs
- Custom quotes available for bulk shipments

CONTACT INFORMATION:
- Email: info@raclogisticltd.com
- Phone: +1 (555) 123-4567
- Address: 123 Logistics Way, Lagos, Nigeria
- Operating Hours: Monday-Friday 8AM-6PM, Saturday 9AM-2PM

TRACKING:
- Customers can track shipments on our website using their tracking number
- Real-time updates are provided via email notifications
- They can subscribe to email notifications for status changes

RESPONSE GUIDELINES:
- Be helpful, friendly, and professional
- Keep responses concise but informative (2-4 sentences when possible)
- If you don't know something specific, suggest they contact our support team
- Always offer to help with anything else
- Use a warm, approachable tone`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AI Gateway error:", errorData);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I apologize, I'm having trouble responding right now. Please try again or contact our support team directly.";

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat support error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process message",
        message: "I apologize, I'm experiencing technical difficulties. Please contact our support team directly at info@raclogisticltd.com or call +1 (555) 123-4567."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
