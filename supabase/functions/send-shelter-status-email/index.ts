// Sends a shelter application status notification email via Gmail API connector gateway
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://najkrajsie-zviera-sk.lovable.app';
const SITE_NAME = 'NajkrajšíPes.sk';
const FROM_NAME = 'NajkrajšíPes.sk';
const FROM_EMAIL = 'infonajkrajsipes@gmail.com';
const REPLY_TO_EMAIL = 'infonajkrajsipes@gmail.com';
const LOGO_URL = 'https://pkejvzexmlijnoangerw.supabase.co/storage/v1/object/public/dog-images/brand/logo-dog.png';

type Status = 'needs_info' | 'approved' | 'rejected';

const STATUS_INFO: Record<Status, { emoji: string; title: string; color: string; intro: string; body: string }> = {
  needs_info: {
    emoji: '📝',
    title: 'Vaša žiadosť vyžaduje doplnenie',
    color: '#2563eb',
    intro: 'potrebujeme od vás doplňujúce informácie',
    body: 'Vašu žiadosť o spoluprácu sme prijali, no na jej posúdenie potrebujeme ešte doplniť niektoré údaje. Odpovedzte prosím na tento e-mail a pošlite nám chýbajúce informácie, aby sme mohli pokračovať v jej spracovaní.',
  },
  approved: {
    emoji: '✅',
    title: 'Vaša žiadosť bola schválená!',
    color: '#16a34a',
    intro: 'gratulujeme, vaša spolupráca bola schválená',
    body: 'S radosťou vám oznamujeme, že vaša žiadosť o spoluprácu bola schválená. Váš útulok je teraz súčasťou projektu NajkrajšíPes.sk a čoskoro sa zobrazí medzi útulkami, ktorým pomáhame. Ďakujeme, že ste sa zapojili! 🐶❤️',
  },
  rejected: {
    emoji: 'ℹ️',
    title: 'Vaša žiadosť bola zamietnutá',
    color: '#dc2626',
    intro: 'informácia o stave vašej žiadosti',
    body: 'Po zvážení sme sa rozhodli vašu žiadosť o spoluprácu momentálne neschváliť. Ak máte otázky alebo by ste chceli žiadosť podať znova s doplnenými údajmi, neváhajte nás kontaktovať.',
  },
};

function encodeRFC2047(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `=?UTF-8?B?${btoa(bin)}?=`;
}
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildEmail(to: string, shelterName: string, contactName: string, status: Status): string {
  const info = STATUS_INFO[status];
  const subject = encodeRFC2047(`${info.emoji} ${info.title} — ${SITE_NAME}`);
  const fromHeader = `${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`;
  const greeting = contactName ? `Dobrý deň, ${contactName}` : 'Dobrý deň';

  const html = `<!DOCTYPE html>
<html lang="sk"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fdf6ec;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(196,123,42,0.12);">
        <tr><td style="background:linear-gradient(135deg,#e89534 0%,#c47b2a 100%);padding:36px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="96" height="96" style="display:block;margin:0 auto 12px;border-radius:50%;background:#fff;padding:6px;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${SITE_NAME}</h1>
        </td></tr>
        <tr><td style="padding:40px 32px 16px;text-align:center;">
          <div style="font-size:64px;line-height:1;margin-bottom:12px;">${info.emoji}</div>
          <h2 style="margin:0 0 8px;font-size:24px;color:${info.color};">${info.title}</h2>
          <p style="margin:0 0 8px;font-size:16px;color:#666;">${greeting},</p>
          <p style="margin:0 0 24px;font-size:15px;color:#888;">útulok <strong>${shelterName}</strong> — ${info.intro}.</p>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">${info.body}</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${SITE_URL}/spolupraca-utulky" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(196,123,42,0.3);">
              Prejsť na projekt →
            </a>
          </div>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#666;">
            Ak máte otázky, napíšte nám na <a href="mailto:${FROM_EMAIL}" style="color:#c47b2a;">${FROM_EMAIL}</a>.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f1e7d4;text-align:center;">
          <p style="margin:0 0 10px;font-size:12px;color:#999;line-height:1.6;">
            S láskou, tím <strong>${SITE_NAME}</strong> 🐾<br>
            <a href="${SITE_URL}" style="color:#c47b2a;text-decoration:none;">${SITE_NAME}</a>
          </p>
          <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.6;font-style:italic;">
            Tento email bol vygenerovaný automaticky.<br>
            Ak chcete odpovedať, napíšte nám na <a href="mailto:${REPLY_TO_EMAIL}" style="color:#c47b2a;text-decoration:none;">${REPLY_TO_EMAIL}</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const message = [
    `From: ${fromHeader}`, `To: ${to}`, `Reply-To: ${REPLY_TO_EMAIL}`, `Subject: ${subject}`,
    'MIME-Version: 1.0', 'Content-Type: text/html; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit',
    '', html,
  ].join('\r\n');
  return toBase64Url(message);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY || !SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
      throw new Error('Missing env configuration');
    }

    // Only an authenticated admin (or the service role) may trigger these emails
    const authHeader = req.headers.get('authorization');
    let authorized = authHeader === `Bearer ${SERVICE_KEY}`;
    if (!authorized && authHeader) {
      const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        const { data: isAdmin } = await anonClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        authorized = !!isAdmin;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { applicationId, status } = await req.json();
    const validStatuses: Status[] = ['needs_info', 'approved', 'rejected'];
    if (!applicationId || !validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'applicationId and valid status are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: app, error: appErr } = await admin
      .from('shelter_applications')
      .select('name, contact_name, contact_email')
      .eq('id', applicationId)
      .single();
    if (appErr || !app?.contact_email) throw new Error(`Application not found: ${appErr?.message}`);

    const raw = buildEmail(app.contact_email, app.name || 'útulok', app.contact_name || '', status as Status);

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAIL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Gmail API failed [${res.status}]: ${JSON.stringify(data)}`);

    // Append to email history so admins can see when/what was sent
    const { data: current } = await admin
      .from('shelter_applications')
      .select('email_history')
      .eq('id', applicationId)
      .single();
    const history = Array.isArray((current as any)?.email_history) ? (current as any).email_history : [];
    history.push({ status, sent_at: new Date().toISOString(), message_id: data.id });
    await admin
      .from('shelter_applications')
      .update({ email_history: history } as any)
      .eq('id', applicationId);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-shelter-status-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
