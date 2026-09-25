import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, calendly-webhook-signature",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

export const Route = createFileRoute("/api/public/calendly-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => json({ error: "Method not allowed" }, 405),
      POST: async ({ request }) => {
        console.log("[calendly-webhook] request received");
        const rawBody = await request.text();
        const secret = process.env["CALENDLY_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("[calendly-webhook] CALENDLY_WEBHOOK_SECRET missing");
          return json({ error: "Server misconfigured" }, 500);
        }
        const header = request.headers.get("calendly-webhook-signature") ?? "";
        const parts = Object.fromEntries(
          header.split(",").map((kv) => {
            const i = kv.indexOf("=");
            return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
          }),
        );
        const t = parts["t"];
        const v1 = parts["v1"];
        console.log("[calendly-webhook] timestamp received:", t ?? "none");
        const invalid = (reason: string) => {
          console.warn("[calendly-webhook] Signature invalid:", reason);
          return new Response("Invalid signature", { status: 401, headers: CORS });
        };
        if (!t || !v1) return invalid("missing t or v1");
        const ts = Number(t);
        if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300)
          return invalid("timestamp outside 5 min tolerance");
        const { createHmac, timingSafeEqual } = await import("crypto");
        const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
        const a = Buffer.from(expected, "utf8");
        const b = Buffer.from(v1, "utf8");
        if (a.length !== b.length || !timingSafeEqual(a, b)) return invalid("mismatch");
        console.log("[calendly-webhook] Signature valid");

        let body: any;
        try {
          body = JSON.parse(rawBody);
        } catch {
          console.error("[calendly-webhook] invalid JSON");
          return json({ error: "Invalid JSON body" }, 400);
        }
        const event: string | undefined = body?.event;
        const p = body?.payload;
        if (!event || !p || !["invitee.created", "invitee.canceled"].includes(event)) {
          console.error("[calendly-webhook] unsupported payload", event);
          return json({ error: "Missing or unsupported event/payload" }, 400);
        }
        const se = p.scheduled_event ?? {};
        const row = {
          event_type: event === "invitee.created" ? "created" : "canceled",
          invitee_name: p.name ?? null,
          invitee_email: p.email ?? null,
          invitee_uri: p.uri ?? null,
          event_uri: p.event ?? se.uri ?? null,
          status: p.status ?? null,
          start_time: se.start_time ?? null,
          end_time: se.end_time ?? null,
          cancel_url: p.cancel_url ?? null,
          reschedule_url: p.reschedule_url ?? null,
          timezone: p.timezone ?? null,
          questions_answers: p.questions_and_answers ?? null,
          raw_payload: body,
        };
        console.log("[calendly-webhook] parsed", row.event_type, row.invitee_email);
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("bookings").insert(row);
          if (error) {
            console.error("[calendly-webhook] insert error", error);
            return json({ error: `Database error: ${error.message}` }, 500);
          }
        } catch (e) {
          console.error("[calendly-webhook] unexpected error", e);
          return json({ error: "Internal server error" }, 500);
        }
        console.log("[calendly-webhook] saved");
        return new Response("OK", { status: 200, headers: CORS });
      },
    },
  },
});
