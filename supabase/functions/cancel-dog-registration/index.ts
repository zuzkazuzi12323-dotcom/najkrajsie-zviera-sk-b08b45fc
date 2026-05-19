import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dogId } = await req.json();
    if (!dogId || typeof dogId !== "string") {
      return new Response(JSON.stringify({ error: "dogId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    // Only delete if dog belongs to the user AND is still unapproved (i.e. not paid for)
    const { data: dog } = await admin
      .from("dogs")
      .select("id, owner_id, approved, image_url")
      .eq("id", dogId)
      .single();

    if (!dog || dog.owner_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (dog.approved) {
      // Already paid — don't delete
      return new Response(JSON.stringify({ deleted: false, reason: "already_paid" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete pending payment record(s)
    await admin.from("payments").delete().eq("dog_id", dogId).eq("status", "pending");

    // Try to delete the image from storage
    try {
      const url = new URL(dog.image_url);
      const pathMatch = url.pathname.match(/\/dog-images\/(.+)$/);
      if (pathMatch) await admin.storage.from("dog-images").remove([pathMatch[1]]);
    } catch { /* ignore storage cleanup errors */ }

    // Delete the dog
    const { error: delError } = await admin.from("dogs").delete().eq("id", dogId);
    if (delError) throw delError;

    return new Response(JSON.stringify({ deleted: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("cancel-dog-registration error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
