// Sends a status-update email for a dog book order
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

const STATUS_INFO: Record<string, { label: string; subject: string; heading: string; text: string; color: string }> = {
  pending: {
    label: 'Čaká sa na platbu',
    subject: 'Vaša objednávka knihy čaká na spracovanie ⏳',
    heading: 'Objednávka čaká na spracovanie ⏳',
    text: 'Vaša objednávka knihy je zaevidovaná a čaká na spracovanie. Ozveme sa vám, keď sa stav zmení.',
    color: '#d97706',
  },
  paid: {
    label: 'Zaplatené',
    subject: 'Platba za knihu prijatá ✅',
    heading: 'Platba prijatá ✅',
    text: 'Vaša platba bola úspešne prijatá. Knihu pripravujeme do tlače a budeme vás informovať o ďalšom kroku.',
    color: '#16a34a',
  },
  in_production: {
    label: 'V produkcii',
    subject: 'Vaša kniha je v tlači 🖨️',
    heading: 'Kniha je v tlači 🖨️',
    text: 'Práve tlačíme vašu knihu — 10 strán A5 v mäkkej lesklej väzbe. Hneď po dokončení ju odošleme.',
    color: '#2563eb',
  },
  shipped: {
    label: 'Odoslané',
    subject: 'Vaša kniha je na ceste 📦',
    heading: 'Kniha je na ceste 📦',
    text: 'Vaša kniha bola odoslaná a mala by k vám doraziť do 3–5 dní. Doprava je zadarmo.',
    color: '#16a34a',
  },
  canceled: {
    label: 'Zrušené',
    subject: 'Vaša objednávka knihy bola zrušená',
    heading: 'Objednávka zrušená',
    text: 'Vaša objednávka knihy bola zrušená. Ak to bolo omylom, napíšte nám a radi to vyriešime.',
    color: '#dc2626',
  },
};

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

function buildEmail(to: string, customerName: string, dogName: string, orderId: string, status: string): string {
  const info = STATUS_INFO[status] ?? STATUS_INFO.pending;
  const subject = encodeRFC2047(info.subject);
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
          <p style="margin:6px 0 0;color:#fff2e9;font-size:14px;">Stav objednávky knihy</p>
        </td></tr>
        <tr><td style="padding:36px 32px 24px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#e2551f;">${info.heading}</h2>
          <p style="margin:0 0 16px;font-size:15px;color:#666;">${greeting},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#333;">
            ${info.text}${dogName ? ` Kniha je o psovi <strong>${dogName}</strong>.` : ''}
          </p>
          <div style="background:#fff2e9;border-radius:12px;padding:16px 20px;margin:20px 0;">
            <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#444;">
              <tr><td style="color:#888;">Číslo objednávky:</td><td align="right"><strong>${orderId}</strong></td></tr>
              <tr><td style="color:#888;">Suma:</td><td align="right"><strong>29,99 €</strong></td></tr>
              <tr><td style="color:#888;">Doprava:</td><td align="right"><strong>ZADARMO</strong></td></tr>
              <tr><td style="color:#888;">Nový stav:</td><td align="right"><strong style="color:${info.color};">${info.label}</strong></td></tr>
            </table>
          </div>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#777;">
            Ak máte otázky, jednoducho odpovedzte na tento e-mail.
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

    const body = await req.json();
    const orderId = String(body?.orderId || '').trim();
    const status = String(body?.status || '').trim();
    if (!orderId || !STATUS_INFO[status]) {
      return new Response(JSON.stringify({ error: 'orderId and valid status required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: order } = await admin
      .from('book_orders')
      .select('email, customer_name, dog_name')
      .eq('id', orderId)
      .maybeSingle();

    const recipient = String(body?.email || order?.email || '').trim();
    if (!recipient) {
      return new Response(JSON.stringify({ error: 'recipient email not found' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const raw = buildEmail(recipient, order?.customer_name || '', order?.dog_name || '', orderId, status);
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
    console.error('send-book-status error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
