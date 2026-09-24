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
        // Future: verify signature using process.env.CALENDLY_WEBHOOK_SECRET
        let body: any;
        try {
          body = await request.json();
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
