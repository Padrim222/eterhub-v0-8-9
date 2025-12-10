import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching Pipedrive data for user: ${user.id}`);

    // Get user's Pipedrive credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pipedrive_api_token, pipedrive_company_domain')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.pipedrive_api_token || !userData.pipedrive_company_domain) {
      return new Response(
        JSON.stringify({ error: 'Pipedrive not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiToken = userData.pipedrive_api_token;
    const domain = userData.pipedrive_company_domain;
    const baseUrl = `https://${domain}.pipedrive.com/api/v1`;

    // Fetch persons (leads) from Pipedrive
    console.log("Fetching persons from Pipedrive...");
    const personsResponse = await fetch(
      `${baseUrl}/persons?api_token=${apiToken}&limit=500`,
      { method: 'GET' }
    );

    if (!personsResponse.ok) {
      const errorText = await personsResponse.text();
      console.error("Pipedrive persons API error:", errorText);
      throw new Error(`Pipedrive API error: ${personsResponse.status}`);
    }

    const personsData = await personsResponse.json();
    const persons = personsData.data || [];
    console.log(`Fetched ${persons.length} persons from Pipedrive`);

    // Fetch deals from Pipedrive
    console.log("Fetching deals from Pipedrive...");
    const dealsResponse = await fetch(
      `${baseUrl}/deals?api_token=${apiToken}&limit=500&status=all_not_deleted`,
      { method: 'GET' }
    );

    if (!dealsResponse.ok) {
      const errorText = await dealsResponse.text();
      console.error("Pipedrive deals API error:", errorText);
      throw new Error(`Pipedrive API error: ${dealsResponse.status}`);
    }

    const dealsData = await dealsResponse.json();
    const deals = dealsData.data || [];
    console.log(`Fetched ${deals.length} deals from Pipedrive`);

    // Get or create default ICP
    let { data: existingIcps } = await supabase
      .from('icps')
      .select('id, name, position')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (!existingIcps || existingIcps.length === 0) {
      // Create default ICPs based on Pipedrive stages
      const defaultIcps = [
        { name: 'Lead Frio', color: '#6b7280', position: 0, user_id: user.id },
        { name: 'Qualificado', color: '#22c55e', position: 1, user_id: user.id },
        { name: 'Proposta', color: '#3b82f6', position: 2, user_id: user.id },
        { name: 'Negociação', color: '#f59e0b', position: 3, user_id: user.id },
      ];

      const { data: newIcps } = await supabase
        .from('icps')
        .insert(defaultIcps)
        .select();
      
      existingIcps = newIcps || [];
    }

    // Map persons to leads
    let leadsImported = 0;
    for (const person of persons) {
      const email = person.email?.[0]?.value || null;
      const phone = person.phone?.[0]?.value || null;
      
      // Determine ICP based on associated deals
      let icpId = existingIcps[0]?.id;
      
      const leadData = {
        user_id: user.id,
        name: person.name || 'Sem nome',
        email: email,
        phone: phone,
        pipedrive_person_id: String(person.id),
        source_channel: 'pipedrive',
        qualification_score: 50,
        engagement_score: 50,
        lead_score: 50,
        is_qualified: false,
        icp_id: icpId,
        metadata: {
          pipedrive_org: person.org_name,
          pipedrive_owner: person.owner_name,
        }
      };

      // Upsert lead
      const { error: leadError } = await supabase
        .from('leads')
        .upsert(leadData, { 
          onConflict: 'pipedrive_person_id,user_id',
          ignoreDuplicates: false 
        });

      if (leadError) {
        console.error("Error upserting lead:", leadError);
      } else {
        leadsImported++;
      }
    }

    // Map deals
    let dealsImported = 0;
    let wonDeals = 0;
    let totalValue = 0;

    for (const deal of deals) {
      const status = deal.status === 'won' ? 'won' : deal.status === 'lost' ? 'lost' : 'open';
      
      if (status === 'won') {
        wonDeals++;
        totalValue += deal.value || 0;
      }

      const dealData = {
        user_id: user.id,
        pipedrive_deal_id: String(deal.id),
        title: deal.title || 'Sem título',
        value: deal.value || 0,
        currency: deal.currency || 'BRL',
        status: status,
        stage_name: deal.stage_id ? String(deal.stage_id) : null,
        won_at: deal.won_time || null,
        lost_at: deal.lost_time || null,
      };

      const { error: dealError } = await supabase
        .from('deals')
        .upsert(dealData, { 
          onConflict: 'pipedrive_deal_id,user_id',
          ignoreDuplicates: false 
        });

      if (dealError) {
        console.error("Error upserting deal:", dealError);
      } else {
        dealsImported++;
      }
    }

    // Update MOVQL metrics for current month
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: qualifiedLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_qualified', true);

    const { error: movqlError } = await supabase
      .from('movql_metrics')
      .upsert({
        user_id: user.id,
        month_year: monthYear,
        leads_count: leadsImported,
        qualified_count: qualifiedLeads?.length || 0,
      }, { 
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false 
      });

    if (movqlError) {
      console.error("Error updating MOVQL metrics:", movqlError);
    }

    // Update user's CRM sync timestamp
    await supabase
      .from('users')
      .update({ crm_last_sync_at: new Date().toISOString() })
      .eq('id', user.id);

    console.log(`Sync complete: ${leadsImported} leads, ${dealsImported} deals imported`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadsImported, 
        dealsImported,
        wonDeals,
        totalValue,
        message: `Importados ${leadsImported} leads e ${dealsImported} deals do Pipedrive`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in fetch-pipedrive-data:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
