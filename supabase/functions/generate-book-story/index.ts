// Generates a short book story about a dog using Lovable AI (Responses API, streaming)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI nie je nakonfigurované" }, 500);

    const { dogName, breed, age, keywords } = await req.json();
    const name = String(dogName || "").trim();
    if (!name) return json({ error: "Chýba meno psa" }, 400);

    const prompt = [
      `Napíš dojemný, milý príbeh o psovi pre knihu (8 strán A5).`,
      `Meno psa: ${name}`,
      breed ? `Plemeno: ${breed}` : "",
      age ? `Vek: ${age}` : "",
      keywords ? `Slová a poznámky od majiteľa: ${String(keywords).trim()}` : "",
      `Píš po slovensky, v 8 krátkych odsekoch (jeden odsek = jedna strana knihy), spolu 250–400 slov.`,
      `Bez nadpisov, bez odrážok, bez emoji. Vráť iba text príbehu.`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      if (res.status === 429) return json({ error: "Priveľa požiadaviek, skúste to za chvíľu." }, 429);
      if (res.status === 402) return json({ error: "AI kredit je vyčerpaný." }, 402);
      console.error("AI gateway error", res.status, detail);
      return json({ error: "Príbeh sa nepodarilo vygenerovať." }, 500);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") text += evt.delta;
          if (evt.type === "response.completed" && !text && typeof evt.response?.output_text === "string") {
            text = evt.response.output_text;
          }
        } catch { /* ignore partial */ }
      }
    }

    if (!text.trim()) return json({ error: "AI nevrátila žiadny text, skúste znova." }, 502);

    return json({ story: text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("generate-book-story error:", message);
    return json({ error: message }, 500);
  }
});
