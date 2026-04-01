import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const SITE_URL = "https://najkrajsie-zviera-sk.lovable.app";

serve(async (req) => {
  const url = new URL(req.url);
  const productId = url.searchParams.get("id");

  if (!productId) {
    return new Response("Missing id", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) {
    return Response.redirect(`${SITE_URL}/eshop`, 302);
  }

  const productUrl = `${SITE_URL}/eshop/${product.id}`;
  const title = `${product.name} – E-shop NajkrajšíPes.sk`;
  const description = product.description || `${product.name} – kúpou podporíte útulky ❤️`;
  const image = product.image_url || `${SITE_URL}/placeholder.svg`;
  const price = (product.price / 100).toFixed(2);

  // Check if it's a bot/crawler
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isCrawler = /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|linkedinbot|slackbot|discordbot|googlebot/i.test(ua);

  if (!isCrawler) {
    // Real user - redirect to the SPA product page
    return Response.redirect(productUrl, 302);
  }

  // Crawler - serve OG HTML
  const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${productUrl}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="NajkrajšíPes.sk" />
  <meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="EUR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="canonical" href="${productUrl}" />
</head>
<body>
  <h1>${escapeHtml(product.name)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Cena: ${price} €</p>
  <a href="${productUrl}">Zobraziť produkt</a>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
