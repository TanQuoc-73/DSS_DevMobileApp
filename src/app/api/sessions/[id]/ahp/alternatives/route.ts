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

// GET alternative pairwise for a criteria
// Query: criteria_id=<uuid>
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient(req);
  const { searchParams } = new URL(req.url);
  const criteria_id = searchParams.get('criteria_id');

  if (!criteria_id) {
    return NextResponse.json({ error: 'criteria_id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ahp_alternative_evaluations')
    .select('id, session_id, criteria_id, alternative_i_id, alternative_j_id, comparison_value')
    .eq('session_id', id)
    .eq('criteria_id', criteria_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// PUT upsert alternative pairwise comparisons
// Body: array or single { criteria_id, alternative_i_id, alternative_j_id, comparison_value }
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient(req);
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];

  const results: any[] = [];
  for (const it of items) {
    const { criteria_id, alternative_i_id, alternative_j_id, comparison_value } = it || {};
    if (!criteria_id || !alternative_i_id || !alternative_j_id || !comparison_value) {
      return NextResponse.json({ error: 'Missing fields in alternative pairwise item' }, { status: 400 });
    }

    // Check existing row
    const { data: existing, error: checkErr } = await supabase
      .from('ahp_alternative_evaluations')
      .select('id')
      .eq('session_id', id)
      .eq('criteria_id', criteria_id)
      .eq('alternative_i_id', alternative_i_id)
      .eq('alternative_j_id', alternative_j_id)
      .maybeSingle();

    if (checkErr) return NextResponse.json({ error: checkErr.message }, { status: 500 });

    const payload = {
      session_id: id,
      criteria_id,
      alternative_i_id,
      alternative_j_id,
      comparison_value,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('ahp_alternative_evaluations')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      results.push(data);
    } else {
      const { data, error } = await supabase
        .from('ahp_alternative_evaluations')
        .insert([payload])
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      results.push(data);
    }
  }

  return NextResponse.json(results);
}
