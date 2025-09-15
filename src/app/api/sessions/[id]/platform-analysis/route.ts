import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServerClient(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
    }
  );
}

// GET analyses for session, joined with platforms
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient(req);

  const { data, error } = await supabase
    .from('platform_analysis')
    .select('id, session_id, platform_id, cost_score, time_score, feasibility_score, maintenance_score, market_fit_score, estimated_cost, estimated_months, risk_level, total_score, platforms(name, type)')
    .eq('session_id', id)
    .order('total_score', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT upsert analysis row for platform in session
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const {
    platform_id,
    cost_score,
    time_score,
    feasibility_score,
    maintenance_score,
    market_fit_score,
    estimated_cost,
    estimated_months,
    risk_level,
    total_score,
  } = body;

  if (!platform_id) {
    return NextResponse.json({ error: 'platform_id is required' }, { status: 400 });
  }

  const supabase = createServerClient(req);

  // Check if exists
  const { data: existing, error: checkErr } = await supabase
    .from('platform_analysis')
    .select('id')
    .eq('session_id', id)
    .eq('platform_id', platform_id)
    .maybeSingle();

  if (checkErr) return NextResponse.json({ error: checkErr.message }, { status: 500 });

  const payload = {
    session_id: id,
    platform_id,
    cost_score,
    time_score,
    feasibility_score,
    maintenance_score,
    market_fit_score,
    estimated_cost,
    estimated_months,
    risk_level,
    total_score,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('platform_analysis')
      .update(payload)
      .eq('id', existing.id)
      .select('*, platforms(name, type)')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from('platform_analysis')
      .insert([payload])
      .select('*, platforms(name, type)')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
