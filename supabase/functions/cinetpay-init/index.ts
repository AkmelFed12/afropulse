// Supabase Edge Function — Initialise un paiement CinetPay
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const {
      plan, cycle, amount, currency = "XOF",
      customer_name, customer_email, customer_phone,
    } = await req.json();

    if (!plan || !amount || !customer_email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userId: string | null = null;
    if (authHeader) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id || null;
    }

    const transactionId = `AP-${plan.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const CINETPAY_APIKEY = Deno.env.get("CINETPAY_APIKEY");
    const CINETPAY_SITE_ID = Deno.env.get("CINETPAY_SITE_ID");
    const CINETPAY_MODE = Deno.env.get("CINETPAY_MODE") || "SANDBOX";

    if (!CINETPAY_APIKEY || !CINETPAY_SITE_ID) {
      throw new Error("CinetPay secrets missing");
    }

    const baseUrl = Deno.env.get("APP_URL") || "https://afro-pulse.netlify.app";

    const payload = {
      apikey: CINETPAY_APIKEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: Number(amount),
      currency,
      description: `AfroPulse ${plan} (${cycle})`,
      return_url: `${baseUrl}/paiement-retour.html?tx=${transactionId}`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/cinetpay-notify`,
      channels: "ALL",
      customer_name: customer_name || "Client",
      customer_email,
      customer_phone_number: customer_phone || "+22500000000",
      customer_address: "Abidjan",
      customer_city: "Abidjan",
      customer_country: "CI",
      customer_state: "CI",
      customer_zip_code: "00225",
      metadata: JSON.stringify({ user_id: userId, plan, cycle }),
      lang: "fr",
    };

    const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.code !== "201") {
      await supabase.from("cinetpay_transactions").insert({
        user_id: userId,
        transaction_id: transactionId,
        plan, cycle,
        amount: Number(amount),
        currency,
        status: "failed",
        customer_email,
        customer_name,
        customer_phone,
        metadata: { cinetpay_response: json },
      });

      return new Response(JSON.stringify({ error: json.message || "CinetPay error", details: json }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    await supabase.from("cinetpay_transactions").insert({
      user_id: userId,
      transaction_id: transactionId,
      plan, cycle,
      amount: Number(amount),
      currency,
      status: "pending",
      payment_url: json.data.payment_url,
      customer_email,
      customer_name,
      customer_phone,
      cinetpay_payment_token: json.data.payment_token,
      metadata: { mode: CINETPAY_MODE },
    });

    return new Response(JSON.stringify({
      ok: true,
      transaction_id: transactionId,
      payment_url: json.data.payment_url,
      payment_token: json.data.payment_token,
    }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[cinetpay-init] error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});