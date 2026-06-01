// Sends a payment confirmation email after successful dog registration (2,99 €)
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
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61573665324373';

function encodeRFC2047(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `=?UTF-8?B?${btoa(bin)}?=`;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildEmail(to: string, dogName: string, dogId: string): string {
  const subject = encodeRFC2047(`Potvrdenie platby – ${dogName} je v súťaži! 🐾`);
  const fromHeader = `${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`;
  const dogUrl = `${SITE_URL}/pes/${dogId}`;

  const html = `<!DOCTYPE html>
<html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6ec;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(196,123,42,0.12);">
        <tr><td style="background:linear-gradient(135deg,#e89534 0%,#c47b2a 100%);padding:36px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="96" height="96" style="display:block;margin:0 auto 12px;border-radius:50%;background:#fff;padding:6px;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${SITE_NAME}</h1>
          <p style="margin:6px 0 0;color:#fff8ee;font-size:14px;">Potvrdenie platby</p>
        </td></tr>
        <tr><td style="padding:36px 32px 24px;">
          <h2 style="margin:0 0 16px;font-size:22px;color:#c47b2a;">Ďakujeme za platbu! ✅</h2>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            Vaša platba <strong>2,99 €</strong> za registráciu psa <strong>${dogName}</strong> bola úspešne prijatá.
            ${dogName} je teraz oficiálne zaradený do súťaže <strong>${SITE_NAME}</strong>! 🎉
          </p>
          <div style="background:#fdf6ec;border-radius:12px;padding:16px 20px;margin:20px 0;">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#444;">
              <tr><td style="color:#888;">Pes:</td><td align="right"><strong>${dogName}</strong></td></tr>
              <tr><td style="color:#888;">Registračný poplatok:</td><td align="right"><strong>2,99 €</strong></td></tr>
              <tr><td style="color:#888;">Stav:</td><td align="right"><strong style="color:#16a34a;">Zaplatené</strong></td></tr>
              <tr><td style="color:#888;">Darované útulkom (20 %):</td><td align="right"><strong>0,60 €</strong></td></tr>
            </table>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${dogUrl}" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;">
              Zobraziť profil psa →
            </a>
          </div>
          <div style="background:#f1e7d4;border-radius:12px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#c47b2a;">📜 Podmienky súťaže (zhrnutie):</p>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.7;color:#555;">
              <li>Registrácia psa je jednorazová a neopakuje sa</li>
              <li>1 bezplatný hlas za 24 hodín z jedného účtu</li>
              <li>20 % zo všetkých platieb a 100 % z darov ide útulkom</li>
              <li>Víťazi sa vyhlasujú na konci každého kola súťaže</li>
              <li>Profil psa je verejne dostupný v galérii a v archíve</li>
            </ul>
            <p style="margin:10px 0 0;font-size:12px;color:#888;">
              Úplné <a href="${SITE_URL}/pravidla" style="color:#c47b2a;">pravidlá</a> a <a href="${SITE_URL}/ochrana-udajov" style="color:#c47b2a;">ochrana údajov</a>.
            </p>
          </div>
          <div style="text-align:center;margin:24px 0 8px;padding:16px;background:#eff6ff;border-radius:12px;">
            <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">🐶 Sleduj súťaž aj na Facebooku!</p>
            <a href="${FACEBOOK_URL}" style="display:inline-block;background:#1877F2;color:#fff;text-decoration:none;padding:10px 24px;border-radius:999px;font-weight:600;font-size:14px;">
              Sledovať na Facebooku
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f1e7d4;">
          <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.6;text-align:center;font-style:italic;">
            Tento email bol vygenerovaný automaticky — prosím, neodpovedajte naň.<br>
            Pre otázky napíšte na <a href="mailto:${REPLY_TO_EMAIL}" style="color:#c47b2a;text-decoration:none;">${REPLY_TO_EMAIL}</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const message = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Reply-To: ${REPLY_TO_EMAIL}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
  ].join('\r\n');

  return toBase64Url(message);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Only the Stripe webhook (service role) may call this
    const authHeader = req.headers.get('authorization');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!authHeader || authHeader !== `Bearer ${SERVICE_KEY}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');

    const { email, dogName, dogId } = await req.json();
    if (!email || !dogName || !dogId) {
      return new Response(JSON.stringify({ error: 'email, dogName, dogId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = buildEmail(email, dogName, dogId);
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
    console.error('send-payment-confirmation error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
