import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Todos os campos são obrigatórios");
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
