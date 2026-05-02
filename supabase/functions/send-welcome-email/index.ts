// Sends a welcome email via Gmail API connector gateway
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://najkrajsipes.sk';
const SITE_NAME = 'NajkrajsiPes.sk';
const FROM_NAME = 'NajkrajsiPes.sk';
const FROM_EMAIL = 'infonajkrajsipes@gmail.com';

function encodeRFC2047(text: string): string {
  // UTF-8 base64 encode for non-ASCII headers
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
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:24px;margin:0 0 16px;color:#c47b2a;">Ďakujeme za registráciu, ${displayName}! 🎉</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Vitaj v komunite <strong>${SITE_NAME}</strong> – charitatívnej súťaži o najkrajšieho psa na Slovensku.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Tešíme sa, že si súčasťou nášho projektu. Spolu pomáhame opusteným psíkom v útulkoch – <strong>20 % zo všetkých nákupov a boostov</strong> a <strong>100 % z priamych darov</strong> putuje útulkom.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}" style="display:inline-block;background:#c47b2a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
        Prejsť na stránku
      </a>
    </div>
    <p style="font-size:14px;line-height:1.6;margin:0 0 8px;">Čo môžeš robiť hneď teraz:</p>
    <ul style="font-size:14px;line-height:1.7;margin:0 0 20px;padding-left:20px;">
      <li>Prihlásiť svojho psa do súťaže – <strong>zadarmo</strong></li>
      <li>Hlasovať za svojho obľúbeného psíka (1 hlas / 24 hod)</li>
      <li>Podporiť útulky priamym darom alebo nákupom v e-shope</li>
    </ul>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="font-size:12px;color:#888;margin:0;">
      Tento email si dostal, lebo si sa zaregistroval na <a href="${SITE_URL}" style="color:#c47b2a;">${SITE_URL}</a>.<br>
      V prípade otázok nás kontaktuj na <a href="mailto:infonajkrajsipes@gmail.com" style="color:#c47b2a;">infonajkrajsipes@gmail.com</a>.
    </p>
  </div>
</body>
</html>`;

  const message = [
    `From: ${fromHeader}`,
    `To: ${to}`,
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
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-welcome-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
