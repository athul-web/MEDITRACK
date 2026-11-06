import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { z } from "https://deno.land/x/zod@v3.21.4/zod.ts"

// Validation Schema
const ContactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().optional(),
  inquiryType: z.enum(["General Support / Feedback", "Hospital Partner Registration", "Report Data Discrepancy", "API & Developer Integration"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  honeypot: z.string().max(0, "Bot detected").optional(), // Honeypot should be empty
});

const trustedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
];

const allowedOrigins = trustedOrigins.length > 0 ? trustedOrigins : defaultOrigins;

function corsHeaders(origin: string | null): Record<string, string> | null {
  if (!origin || !allowedOrigins.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function json(status: number, body: unknown, cors: Record<string, string> | null) {
  const headers = { "Content-Type": "application/json", ...(cors ?? {}) };
  return new Response(JSON.stringify(body), { status, headers });
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (!cors) return new Response("Forbidden", { status: 403 });
    return new Response("ok", { headers: { ...cors } })
  }

  if (!cors) {
    return json(403, { error: "Request origin is not allowed." }, null);
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "Invalid request payload." }, cors);
    }

    // 1. Validate Input
    const validation = ContactSchema.safeParse(body)
    if (!validation.success) {
      return json(400, { error: validation.error.issues[0]?.message ?? "Invalid request." }, cors);
    }

    const { data: validatedData } = validation;

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // 2. Initialize Supabase Admin Client (using Service Role Key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Persistent server-side rate limiting (requires contact_rate_limits migration)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentCount, error: countError } = await supabaseAdmin
      .from("contact_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("requester_ip", clientIp)
      .gte("created_at", fifteenMinutesAgo);

    if (countError) throw new Error("Rate-limit check unavailable.");

    if ((recentCount ?? 0) >= 5) {
      return json(429, { error: "Too many submissions. Please try again later." }, cors);
    }

    await supabaseAdmin.from("contact_rate_limits").insert({ requester_ip: clientIp });

    // 4. Persist to Database
    const { error: dbError } = await supabaseAdmin
      .from('contact_inquiries')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        inquiry_type: validatedData.inquiryType,
        message: validatedData.message,
      })

    if (dbError) throw new Error("Unable to store inquiry.");

    // 5. Email Notification (server-side only; never log full payloads)
    console.log(`NOTIFICATION: New contact inquiry (${validatedData.inquiryType})`);

    return json(200, { message: 'Inquiry submitted successfully' }, cors);

  } catch (error) {
    console.error("Contact function error:", error);
    return json(500, { error: "Unable to process inquiry. Please try again later." }, cors);
  }
})