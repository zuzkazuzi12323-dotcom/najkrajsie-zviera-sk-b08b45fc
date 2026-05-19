// Sends a welcome email via Gmail API connector gateway
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

function buildEmail(to: string, displayName: string): string {
  const subject = encodeRFC2047(`Vitaj v ${SITE_NAME}! 🐶`);
  const fromHeader = `${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`;

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6ec;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(196,123,42,0.12);">
        <tr><td style="background:linear-gradient(135deg,#e89534 0%,#c47b2a 100%);padding:36px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="96" height="96" style="display:block;margin:0 auto 12px;border-radius:50%;background:#fff;padding:6px;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${SITE_NAME}</h1>
          <p style="margin:6px 0 0;color:#fff8ee;font-size:14px;">Charitatívna súťaž o najkrajšieho psa</p>
        </td></tr>
        <tr><td style="padding:36px 32px 24px;">
          <h2 style="margin:0 0 16px;font-size:22px;color:#c47b2a;">Ďakujeme za registráciu, ${displayName}! 🎉</h2>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            Vitaj v komunite <strong>${SITE_NAME}</strong>. Sme veľmi radi, že si súčasťou nášho projektu.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#333;">
            Spolu pomáhame opusteným psíkom v útulkoch — <strong>20 % zo všetkých nákupov a boostov</strong> a <strong>100 % z priamych darov</strong> putuje útulkom. ❤️
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(196,123,42,0.3);">
              Prejsť na ${SITE_NAME} →
            </a>
          </div>
          <div style="background:#fdf6ec;border-radius:12px;padding:18px 22px;margin:24px 0;">
            <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#c47b2a;">Čo môžeš robiť hneď teraz:</p>
            <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.8;color:#444;">
              <li>Prihlásiť svojho psa do súťaže (jednorazový poplatok <strong>2,99 €</strong>) 🐕</li>
              <li>Hlasovať za obľúbeného psíka (1 hlas / 24 hod)</li>
              <li>Podporiť útulky priamym darom alebo nákupom v e-shope</li>
            </ul>
          </div>
          <div style="text-align:center;margin:24px 0 8px;padding:18px;background:#eff6ff;border-radius:12px;">
            <p style="margin:0 0 10px;font-size:14px;color:#1e40af;">🐶 Chceš sledovať súťaž aj na Facebooku?</p>
            <a href="https://www.facebook.com/profile.php?id=61573665324373" style="display:inline-block;background:#1877F2;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:999px;font-weight:600;font-size:14px;">
              Sleduj nás na Facebooku
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f1e7d4;">
          <p style="margin:0 0 10px;font-size:12px;color:#999;line-height:1.6;text-align:center;">
            Tento email si dostal/a, lebo si práve potvrdil/a registráciu na <a href="${SITE_URL}" style="color:#c47b2a;text-decoration:none;">${SITE_NAME}</a>.
          </p>
          <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.6;text-align:center;font-style:italic;">
            Tento email bol vygenerovaný automaticky — prosím, neodpovedajte naň.<br>
            Ak chcete odpovedať, napíšte nám na <a href="mailto:${REPLY_TO_EMAIL}" style="color:#c47b2a;text-decoration:none;">${REPLY_TO_EMAIL}</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');

    const { email, displayName } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = buildEmail(email, displayName || 'priateľ psíkov');

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
    if (!res.ok) {
      console.error('Gmail send failed', res.status, data);
      throw new Error(`Gmail API failed [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-welcome-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
