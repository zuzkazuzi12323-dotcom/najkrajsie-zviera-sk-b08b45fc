// Sends the shelter its unique partner referral link via Gmail API connector gateway
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

function buildEmail(to: string, shelterName: string, contactName: string, referralLink: string): string {
  const subject = encodeRFC2047(`✅ Vaša spolupráca bola schválená — váš partnerský odkaz — ${SITE_NAME}`);
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
        <tr><td style="padding:40px 32px 8px;text-align:center;">
          <div style="font-size:64px;line-height:1;margin-bottom:12px;">✅</div>
          <h2 style="margin:0 0 8px;font-size:24px;color:#16a34a;">Vaša spolupráca bola schválená!</h2>
          <p style="margin:0 0 8px;font-size:16px;color:#666;">${greeting},</p>
          <p style="margin:0 0 8px;font-size:15px;color:#888;">útulok <strong>${shelterName}</strong> je teraz naším oficiálnym partnerom. 🐶❤️</p>
        </td></tr>
        <tr><td style="padding:0 32px 8px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            Nižšie nájdete váš <strong>jedinečný partnerský odkaz</strong>. Zdieľajte ho s majiteľmi psov –
            napríklad na Facebooku, webe či e-mailom. Za každú platenú registráciu psa, ktorá príde cez
            tento odkaz, získava váš útulok <strong>20 % odmenu</strong>.
          </p>
          <div style="background:#fdf6ec;border:1px dashed #e0b46b;border-radius:14px;padding:16px;text-align:center;margin:0 0 20px;">
            <a href="${referralLink}" style="font-size:15px;font-weight:700;color:#c47b2a;text-decoration:none;word-break:break-all;">${referralLink}</a>
          </div>
          <div style="text-align:center;margin:20px 0 8px;">
            <a href="${referralLink}" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(196,123,42,0.3);">
              Otvoriť partnerský odkaz →
            </a>
          </div>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#666;">
            Odkaz nájdete kedykoľvek aj vo svojom účte na NajkrajšíPes.sk (sekcia „Môj partnerský odkaz“) –
            stačí sa prihlásiť rovnakým e-mailom, aký ste uviedli v žiadosti.
          </p>
          <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#666;">
            Otázky? Napíšte nám na <a href="mailto:${FROM_EMAIL}" style="color:#c47b2a;">${FROM_EMAIL}</a>.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f1e7d4;text-align:center;">
          <p style="margin:0 0 10px;font-size:12px;color:#999;line-height:1.6;">
            S láskou, tím <strong>${SITE_NAME}</strong> 🐾<br>
            <a href="${SITE_URL}" style="color:#c47b2a;text-decoration:none;">${SITE_NAME}</a>
          </p>
          <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.6;font-style:italic;">
            Tento email bol vygenerovaný automaticky.
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

    // Only an authenticated admin (or the service role) may trigger this
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

    const { shelterId } = await req.json();
    if (!shelterId) {
      return new Response(JSON.stringify({ error: 'shelterId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: shelter, error: sErr } = await admin
      .from('shelters')
      .select('name, contact_email, referral_code')
      .eq('id', shelterId)
      .single();
    if (sErr || !shelter?.contact_email || !shelter?.referral_code) {
      throw new Error(`Shelter not found or missing email/referral code: ${sErr?.message}`);
    }

    const referralLink = `${SITE_URL}/pridat?ref=${shelter.referral_code}`;
    const raw = buildEmail(shelter.contact_email, shelter.name || 'útulok', '', referralLink);

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

    return new Response(JSON.stringify({ success: true, id: data.id, referralLink }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-shelter-partner-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
