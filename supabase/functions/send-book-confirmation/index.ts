// Sends an order confirmation email for a dog book order (29,99 € with free shipping)
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_NAME = 'NajkrajšíPes.eu';
const FROM_NAME = 'NajkrajšíPes.eu';
const FROM_EMAIL = 'infonajkrajsipes@gmail.com';
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

function buildEmail(to: string, customerName: string, dogName: string, orderId: string): string {
  const subject = encodeRFC2047('Ďakujeme za objednávku knihy o vašom psovi 📖');
  const greeting = customerName ? `Dobrý deň, ${customerName}` : 'Dobrý deň';
  const html = `<!DOCTYPE html>
<html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fff7f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7f2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(255,107,53,0.14);">
        <tr><td style="background:linear-gradient(135deg,#ff6b35 0%,#e2551f 100%);padding:36px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="${SITE_NAME}" width="88" height="88" style="display:block;margin:0 auto 12px;border-radius:50%;background:#fff;padding:6px;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${SITE_NAME}</h1>
          <p style="margin:6px 0 0;color:#fff2e9;font-size:14px;">Potvrdenie objednávky knihy</p>
        </td></tr>
        <tr><td style="padding:36px 32px 24px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#e2551f;">Ďakujeme za objednávku! 📖</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#666;">${greeting},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            Vaša objednávka knihy${dogName ? ` o psovi <strong>${dogName}</strong>` : ''} za <strong>29,99 €</strong> s <strong>dopravou ZADARMO</strong> bola prijatá a zaplatená.
            Tlačíme <strong>10 strán A5</strong> v mäkkej lesklej väzbe a knihu vám pošleme <strong>do 3–5 dní</strong>.
          </p>
          <div style="background:#fff2e9;border-radius:12px;padding:16px 20px;margin:20px 0;">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#444;">
              <tr><td style="color:#888;">Suma:</td><td align="right"><strong>29,99 €</strong></td></tr>
              <tr><td style="color:#888;">Doprava:</td><td align="right"><strong>ZADARMO</strong></td></tr>
              <tr><td style="color:#888;">Rozsah:</td><td align="right"><strong>10 strán A5 + PDF do e-mailu</strong></td></tr>
              <tr><td style="color:#888;">Dodanie:</td><td align="right"><strong>3–5 dní</strong></td></tr>
              <tr><td style="color:#888;">Číslo objednávky:</td><td align="right"><strong>${orderId}</strong></td></tr>
              <tr><td style="color:#888;">Stav:</td><td align="right"><strong style="color:#16a34a;">Zaplatené</strong></td></tr>
            </table>
          </div>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#777;">
            Ak budeme potrebovať doplniť fotky alebo príbeh, ozveme sa vám na tento e-mail.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 32px;border-top:1px solid #f6e2d6;">
          <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.6;text-align:center;font-style:italic;">
            Tento e-mail bol vygenerovaný automaticky.<br>
            Otázky a reklamácie do 14 dní na <a href="mailto:${FROM_EMAIL}" style="color:#e2551f;text-decoration:none;">${FROM_EMAIL}</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const message = [
    `From: ${encodeRFC2047(FROM_NAME)} <${FROM_EMAIL}>`,
    `To: ${to}`,
    `Reply-To: ${FROM_EMAIL}`,
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

    const { orderId, email, customerName, dogName } = await req.json();

    let recipient = String(email || '').trim();
    let name = String(customerName || '').trim();
    let dog = String(dogName || '').trim();

    if (orderId) {
      const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data: order } = await admin
        .from('book_orders')
        .select('email, customer_name, dog_name')
        .eq('id', orderId)
        .maybeSingle();
      if (order) {
        recipient = recipient || order.email;
        name = name || order.customer_name || '';
        dog = dog || order.dog_name || '';
      }
    }

    if (!recipient) {
      return new Response(JSON.stringify({ error: 'email or orderId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = buildEmail(recipient, name, dog, String(orderId || ''));
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
    console.error('send-book-confirmation error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
