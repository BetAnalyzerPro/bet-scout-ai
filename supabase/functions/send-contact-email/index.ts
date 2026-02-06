import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit: 3 requests per hour per IP
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
      p_identifier: clientIP,
      p_action: "contact_form",
      p_max_count: 3,
      p_window_minutes: 60,
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (rateLimitOk === false) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      
      // Log rate limit exceeded event
      await supabase.rpc("log_security_event", {
        p_user_id: null,
        p_event_type: "rate_limit_exceeded",
        p_ip_address: clientIP,
        p_metadata: { action: "contact_form" },
        p_severity: "warn",
      });

      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Tente novamente em 1 hora." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Enforce length limits to prevent abuse
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 5000) {
      throw new Error("Um ou mais campos excedem o limite de caracteres");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("E-mail inválido");
    }

    // Sanitize inputs
    const sanitize = (str: string) => 
      str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    const safeName = sanitize(name);
    const safeSubject = sanitize(subject);
    const safeMessage = sanitize(message);

    // Get destination email from environment or use default
    const destinationEmail = Deno.env.get("CONTACT_EMAIL") || "contato@betanalizer.com";

    const emailResponse = await resend.emails.send({
      from: "Bet Analizer <onboarding@resend.dev>",
      to: [destinationEmail],
      replyTo: email,
      subject: `[Contato] ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nova mensagem de contato</h2>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p><strong>Nome:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${safeSubject}</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="color: #333;">Mensagem:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">
            Esta mensagem foi enviada através do formulário de contato do Bet Analizer.
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    // Log successful contact form submission (for monitoring)
    await supabase.rpc("log_security_event", {
      p_user_id: null,
      p_event_type: "suspicious_activity", // Using existing enum value for tracking
      p_ip_address: clientIP,
      p_metadata: { 
        action: "contact_form_success",
        email_masked: email.replace(/(.{2})(.*)(@.*)/, "$1***$3") 
      },
      p_severity: "info",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
