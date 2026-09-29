// Supabase Edge Function — Webhook CinetPay (notification serveur-à-serveur)
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    let transactionId = "";
    let paymentMethod = "";
    let amount = 0;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      transactionId = body.cpm_trans_id || body.transaction_id;
      paymentMethod = body.payment_method || body.cpm_payid;
      amount = Number(body.cpm_amount || body.amount || 0);
    } else {
      const form = await req.formData();
      transactionId = String(form.get("cpm_trans_id") || form.get("transaction_id") || "");
      paymentMethod = String(form.get("payment_method") || form.get("cpm_payid") || "");
      amount = Number(form.get("cpm_amount") || form.get("amount") || 0);
    }

    if (!transactionId) {
      return new Response("MISSING_TX_ID", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const checkRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: Deno.env.get("CINETPAY_APIKEY"),
        site_id: Deno.env.get("CINETPAY_SITE_ID"),
        transaction_id: transactionId,
      }),
    });

    const check = await checkRes.json();
    const isPaid = check?.code === "00" && check?.data?.status === "ACCEPTED";

    const { data: tx } = await supabase
      .from("cinetpay_transactions")
      .select("*")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (!tx) {
      return new Response("TX_NOT_FOUND", { status: 404 });
    }

    if (isPaid) {
      await supabase
        .from("cinetpay_transactions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId);

      if (tx.user_id) {
        const now = new Date();
        const expires = new Date(now);
        if (tx.cycle === "yearly") expires.setFullYear(expires.getFullYear() + 1);
        else expires.setMonth(expires.getMonth() + 1);

        await supabase.from("user_premium").upsert({
          user_id: tx.user_id,
          plan: tx.plan,
          cycle: tx.cycle,
          status: "active",
          activated_at: now.toISOString(),
          expires_at: expires.toISOString(),
          payment_method: "cinetpay",
          last_transaction_id: transactionId,
          updated_at: now.toISOString(),
        }, { onConflict: "user_id" });

        await supabase.from("notifications").insert({
          user_id: tx.user_id,
          type: "premium_activated",
          title: "Abonnement activé 🎉",
          body: `Votre abonnement ${tx.plan} est actif jusqu'au ${expires.toLocaleDateString("fr-FR")}.`,
          link: "abonnement.html",
          icon: "fa-crown",
        });
      }
    } else {
      await supabase
        .from("cinetpay_transactions")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("transaction_id", transactionId);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("[cinetpay-notify] error:", err);
    return new Response("ERROR", { status: 500 });
  }
});