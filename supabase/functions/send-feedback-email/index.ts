import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackPayload {
  name?: string;
  email?: string;
  message: string;
  rating?: number;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, message, rating }: FeedbackPayload = await req.json();

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeName = (name || "Anônimo").toString().slice(0, 120);
    const safeEmail = (email || "").toString().slice(0, 180);
    const safeRating = typeof rating === "number" ? rating : undefined;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Novo feedback recebido</h2>
        <p><strong>Origem:</strong> Servix (site)</p>
        <p><strong>Nome:</strong> ${safeName}</p>
        ${safeEmail ? `<p><strong>Email:</strong> ${safeEmail}</p>` : ""}
        ${safeRating !== undefined ? `<p><strong>Avaliação:</strong> ${safeRating}/5</p>` : ""}
        <p><strong>Mensagem:</strong></p>
        <div style="white-space: pre-wrap; border: 1px solid #eee; padding: 12px; border-radius: 8px;">${
          message.replace(/[<>]/g, "")
        }</div>
        <hr />
        <p style="color: #777; font-size: 12px;">Enviado em ${new Date().toLocaleString()}</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Servix <onboarding@resend.dev>",
      to: ["codejungle8@gmail.com"],
      subject: "Novo feedback do site Servix",
      html,
      reply_to: safeEmail || undefined,
    });

    console.log("Feedback email sent", { id: (emailResponse as any)?.data?.id });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending feedback email:", error);
    return new Response(JSON.stringify({ error: error?.message || "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
