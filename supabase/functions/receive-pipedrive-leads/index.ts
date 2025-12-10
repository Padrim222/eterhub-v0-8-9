import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate webhook secret (Pipedrive webhooks don't use JWT)
    const webhookSecret = Deno.env.get('PIPEDRIVE_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('X-Webhook-Secret');

    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    console.log('Received Pipedrive webhook payload:', JSON.stringify(payload));

    const { person, deal, user_id } = payload;

    // user_id is required in payload to identify which user's leads to update
    if (!user_id) {
      throw new Error('user_id é obrigatório no payload');
    }

    if (!person || !person.id) {
      throw new Error('Dados da pessoa são obrigatórios');
    }

    // Mapear stage para ICP
    const stageToICP: { [key: string]: number } = {
      'qualificação': 1,
      'proposta': 2,
      'negociação': 2,
      'fechamento': 3,
      'ganho': 3,
    };

    const stageName = (deal?.stage_name || '').toLowerCase();
    let icpPosition = 0;
    
    for (const [key, value] of Object.entries(stageToICP)) {
      if (stageName.includes(key)) {
        icpPosition = value;
        break;
      }
    }

    // Buscar ICP do usuário
    const { data: icps } = await supabaseAdmin
      .from('icps')
      .select('id')
      .eq('user_id', user_id)
      .eq('position', icpPosition)
      .limit(1);

    const icpId = icps && icps.length > 0 ? icps[0].id : null;

    // Calcular scores
    const dealValue = deal?.value || 0;
    const qualificationScore = Math.min(100, Math.max(0, (dealValue / 1000) * 10));
    const engagementScore = Math.min(100, Math.max(50, 70 + Math.random() * 30));
    const leadScore = (qualificationScore + engagementScore) / 2;
    const isQualified = leadScore >= 75;

    // Buscar posição atual para o lead
    const { data: existingLeads } = await supabaseAdmin
      .from('leads')
      .select('position')
      .eq('user_id', user_id)
      .eq('icp_id', icpId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingLeads && existingLeads.length > 0 
      ? existingLeads[0].position + 1 
      : 0;

    // Criar ou atualizar lead
    const leadData = {
      user_id: user_id,
      icp_id: icpId,
      name: person.name,
      email: person.email || null,
      phone: person.phone || null,
      source_channel: 'Pipedrive',
      income: dealValue,
      qualification_score: qualificationScore,
      engagement_score: engagementScore,
      lead_score: leadScore,
      is_qualified: isQualified,
      position: nextPosition,
      pipedrive_person_id: person.id?.toString(),
      pipedrive_deal_id: deal?.id?.toString() || null,
      pipedrive_stage: deal?.stage_name || null,
      pipedrive_value: dealValue,
      pipedrive_last_sync: new Date().toISOString(),
    };

    // Verificar se lead já existe
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('pipedrive_person_id', person.id.toString())
      .eq('user_id', user_id)
      .limit(1);

    let result;
    if (existingLead && existingLead.length > 0) {
      // Atualizar lead existente
      result = await supabaseAdmin
        .from('leads')
        .update(leadData)
        .eq('id', existingLead[0].id);
      
      console.log('Lead atualizado:', existingLead[0].id);
    } else {
      // Criar novo lead
      result = await supabaseAdmin
        .from('leads')
        .insert(leadData);
      
      console.log('Novo lead criado');
    }

    if (result.error) {
      throw result.error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead do Pipedrive processado com sucesso',
        lead: leadData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
