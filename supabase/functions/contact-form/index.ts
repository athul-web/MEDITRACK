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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // 1. Validate Input
    const validation = ContactSchema.safeParse(body)
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: validatedData } = validation;

    // 2. Initialize Supabase Admin Client (using Service Role Key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Persist to Database
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

    if (dbError) throw dbError

    // 4. Email Notification (Simulated for this implementation,
    // in production this would call Resend/SendGrid API)
    console.log(`NOTIFICATION: New inquiry from ${validatedData.email} [${validatedData.inquiryType}]`)
    // Example: await sendEmail({ to: 'support@meditrack.in', subject: '...', body: '...' })

    return new Response(
      JSON.stringify({ message: 'Inquiry submitted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
