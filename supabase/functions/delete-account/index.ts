import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get user from auth header
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const userId = user.id;

  try {
    // Delete user data in order (respecting foreign keys)
    await supabase.from("comments").delete().eq("user_id", userId);
    await supabase.from("votes").delete().eq("user_id", userId);
    
    // Get user's dogs and delete votes on them
    const { data: dogs } = await supabase.from("dogs").select("id").eq("owner_id", userId);
    if (dogs && dogs.length > 0) {
      const dogIds = dogs.map(d => d.id);
      await supabase.from("comments").delete().in("dog_id", dogIds);
      await supabase.from("votes").delete().in("dog_id", dogIds);
      await supabase.from("dogs").delete().eq("owner_id", userId);
    }

    await supabase.from("payments").delete().eq("user_id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("user_id", userId);
    
    // Delete auth user
    await supabase.auth.admin.deleteUser(userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
