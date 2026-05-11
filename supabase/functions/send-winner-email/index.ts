// Sends a winner notification email via Gmail API connector gateway
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

const PLACE_INFO: Record<number, { emoji: string; title: string; color: string }> = {
  1: { emoji: '🥇', title: '1. miesto — VÍŤAZ!', color: '#d4a017' },
  2: { emoji: '🥈', title: '2. miesto', color: '#9aa0a6' },
  3: { emoji: '🥉', title: '3. miesto', color: '#cd7f32' },
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

function buildEmail(to: string, ownerName: string, dogName: string, place: number): string {
  const info = PLACE_INFO[place] ?? { emoji: '🏆', title: `${place}. miesto`, color: '#c47b2a' };
  const subject = encodeRFC2047(`${info.emoji} Gratulujeme! ${dogName} vyhral ${place}. miesto v ${SITE_NAME}`);
  const fromHeader = `${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`;

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
          <h2 style="margin:0 0 8px;font-size:26px;color:${info.color};">${info.title}</h2>
          <p style="margin:0 0 24px;font-size:16px;color:#666;">Gratulujeme, ${ownerName}!</p>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            S radosťou ti oznamujeme, že tvoj psík <strong>${dogName}</strong> sa umiestnil na <strong>${place}. mieste</strong> v charitatívnej súťaži <strong>${SITE_NAME}</strong>! 🎉
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            Vďaka tebe a všetkým hlasujúcim sme spoločne pomohli opusteným psíkom v útulkoch. Ďakujeme za tvoju účasť a podporu! 🐶❤️
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${SITE_URL}/vitazi" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(196,123,42,0.3);">
              Pozrieť tabuľku víťazov →
            </a>
          </div>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#666;">
            Čoskoro ťa budeme kontaktovať ohľadom prevzatia výhry. Ak máš otázky, neváhaj nás kontaktovať na <a href="mailto:${FROM_EMAIL}" style="color:#c47b2a;">${FROM_EMAIL}</a>.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f1e7d4;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
            S láskou, tím <strong>${SITE_NAME}</strong> 🐾<br>
            <a href="${SITE_URL}" style="color:#c47b2a;text-decoration:none;">${SITE_URL}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const message = [
    `From: ${fromHeader}`, `To: ${to}`, `Subject: ${subject}`,
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
    if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      throw new Error('Missing env configuration');
    }

    const { dogId, place } = await req.json();
    if (!dogId || !place || typeof place !== 'number') {
      return new Response(JSON.stringify({ error: 'dogId and place are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: dog, error: dogErr } = await admin
      .from('dogs').select('id, name, owner_id').eq('id', dogId).single();
    if (dogErr || !dog) throw new Error(`Dog not found: ${dogErr?.message}`);

    const { data: profile, error: profErr } = await admin
      .from('profiles').select('email, display_name').eq('user_id', dog.owner_id).single();
    if (profErr || !profile?.email) throw new Error(`Owner email not found: ${profErr?.message}`);

    const raw = buildEmail(profile.email, profile.display_name || 'majiteľ', dog.name, place);

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

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-winner-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
