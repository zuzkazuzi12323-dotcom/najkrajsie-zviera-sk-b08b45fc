import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const SITE_URL = "https://najkrajsie-zviera-sk.lovable.app";

serve(async (req) => {
  const url = new URL(req.url);
  const dogId = url.searchParams.get("id");

  if (!dogId) {
    return new Response("Missing id", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  if (!dog) {
    return Response.redirect(`${SITE_URL}/galeria`, 302);
  }

  // Get vote count
  const { count } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("dog_id", dogId);

  const dogUrl = `${SITE_URL}/pes/${dog.id}`;
  const title = `${dog.name} – Hlasuj v súťaži NajkrajšíPes.sk! 🐾`;
  const description = dog.description || `${dog.name} (${dog.breed}, ${dog.age}) súťaží o titul Najkrajší pes Slovenska. Už má ${count || 0} hlasov – pridaj svoj! ❤️`;
  const image = dog.image_url || `${SITE_URL}/placeholder.svg`;

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const isCrawler = /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|linkedinbot|slackbot|discordbot|googlebot/i.test(ua);

  if (!isCrawler) {
    return Response.redirect(dogUrl, 302);
  }

  const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${dogUrl}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="NajkrajšíPes.sk" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="canonical" href="${dogUrl}" />
</head>
<body>
  <h1>${escapeHtml(dog.name)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(image)}" alt="${escapeHtml(dog.name)}" />
  <a href="${dogUrl}">Hlasovať za ${escapeHtml(dog.name)}</a>
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
