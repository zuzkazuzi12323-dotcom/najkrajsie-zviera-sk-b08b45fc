// Sends a confirmation email after a successful shelter donation or platform support payment
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

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

type SupportType = 'donation' | 'platform_support';

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

async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (authHeader && authHeader === `Bearer ${SERVICE_KEY}`) return true;
  if (!authHeader?.startsWith('Bearer ')) return false;
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl || !SERVICE_KEY) return false;
  const admin = createClient(supabaseUrl, SERVICE_KEY, { auth: { persistSession: false } });
  const { data } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!data.user) return false;
  const { data: allowed } = await admin.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
  return allowed === true;
}

function buildEmail(to: string, type: SupportType, amountCents: number, name: string, variableSymbol = '', paymentId = ''): string {
  const amountLabel = `${(amountCents / 100).toFixed(2).replace('.', ',')} €`;
  const isPlatform = type === 'platform_support';

  const title = isPlatform ? 'Ďakujeme za podporu platformy! 💛' : 'Ďakujeme za váš príspevok útulkom! 🐾';
  const subject = encodeRFC2047(
    isPlatform
      ? `Potvrdenie podpory platformy – ${amountLabel} 💛`
      : `Potvrdenie príspevku útulkom – ${amountLabel} 🐾`,
  );
  const intro = isPlatform
    ? `Vaša dobrovoľná podpora <strong>${amountLabel}</strong> na prevádzku projektu <strong>${SITE_NAME}</strong> bola úspešne prijatá. Vďaka vám môže projekt ďalej rásť a pomáhať útulkom. 🙏`
    : `Váš príspevok <strong>${amountLabel}</strong> pre útulky bol úspešne prijatý. Celá vaša podpora poputuje na pomoc zvieratám v núdzi. ❤️`;
  const splitNote = isPlatform
    ? '20 % z vašej podpory automaticky putuje útulkom, zvyšok pokrýva prevádzku projektu.'
    : '100 % vášho príspevku putuje na podporu útulkov.';

  const fromHeader = `${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`;
  const greeting = name ? `Dobrý deň, ${name}` : 'Dobrý deň';

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
          <h2 style="margin:0 0 8px;font-size:22px;color:#c47b2a;">${title}</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#666;">${greeting},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">${intro}</p>
          <div style="background:#fdf6ec;border-radius:12px;padding:16px 20px;margin:20px 0;">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#444;">
              <tr><td style="color:#888;">Suma:</td><td align="right"><strong>${amountLabel}</strong></td></tr>
              <tr><td style="color:#888;">Typ platby:</td><td align="right"><strong>${isPlatform ? 'Podpora platformy' : 'Príspevok útulkom'}</strong></td></tr>
              ${variableSymbol ? `<tr><td style="color:#888;">Variabilný symbol / ID:</td><td align="right"><strong>${variableSymbol}</strong></td></tr>` : ''}
              ${paymentId ? `<tr><td style="color:#888;">Interné ID platby:</td><td align="right"><strong>${paymentId}</strong></td></tr>` : ''}
              <tr><td style="color:#888;">Stav:</td><td align="right"><strong style="color:#16a34a;">Zaplatené</strong></td></tr>
            </table>
          </div>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#777;">${splitNote}</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${SITE_URL}/transparentnost" style="display:inline-block;background:linear-gradient(135deg,#e89534,#c47b2a);color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-weight:700;font-size:15px;">
              Zobraziť transparentnosť →
            </a>
          </div>
          <div style="text-align:center;margin:24px 0 8px;padding:16px;background:#eff6ff;border-radius:12px;">
            <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">🐶 Sleduj projekt aj na Facebooku!</p>
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
    if (!(await isAuthorized(req))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAIL_API_KEY = Deno.env.get('GOOGLE_MAIL_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAIL_API_KEY) throw new Error('GOOGLE_MAIL_API_KEY is not configured');

    const { email, type, amount, name, variableSymbol, paymentId } = await req.json();
    if (!email || !type || !amount) {
      return new Response(JSON.stringify({ error: 'email, type, amount required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = buildEmail(email, type as SupportType, Number(amount), String(name ?? '').trim(), String(variableSymbol || ''), String(paymentId || ''));
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
    console.error('send-support-confirmation error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
