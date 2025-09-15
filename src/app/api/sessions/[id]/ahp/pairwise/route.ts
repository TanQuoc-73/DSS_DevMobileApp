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

// GET pairwise comparisons for a session
// Query: level=1|2, parent_id (optional for level 2)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient(req);
  const { searchParams } = new URL(req.url);
  const level = Number(searchParams.get('level') || '1');
  const parent_id = searchParams.get('parent_id');

  let query = supabase
    .from('ahp_pairwise_comparisons')
    .select('id, session_id, criteria_level, parent_criteria_id, criteria_i_id, criteria_j_id, comparison_value')
    .eq('session_id', id)
    .eq('criteria_level', level);

  if (level === 1) {
    query = query.is('parent_criteria_id', null);
  } else if (parent_id) {
    query = query.eq('parent_criteria_id', parent_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// PUT upsert one or many pairwise comparisons
// Body can be a single object or an array of objects with fields:
// { criteria_level, parent_criteria_id (nullable), criteria_i_id, criteria_j_id, comparison_value }
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
    const { criteria_level, parent_criteria_id, criteria_i_id, criteria_j_id, comparison_value } = it || {};
    if (!criteria_level || !criteria_i_id || !criteria_j_id || !comparison_value) {
      return NextResponse.json({ error: 'Missing fields in pairwise item' }, { status: 400 });
    }

    // Check existing
    let query = supabase
      .from('ahp_pairwise_comparisons')
      .select('id')
      .eq('session_id', id)
      .eq('criteria_level', criteria_level)
      .eq('criteria_i_id', criteria_i_id)
      .eq('criteria_j_id', criteria_j_id);

    if (criteria_level === 1) {
      query = query.is('parent_criteria_id', null);
    } else {
      query = query.eq('parent_criteria_id', parent_criteria_id ?? null);
    }

    const { data: existing, error: checkErr } = await query.maybeSingle();
    if (checkErr) return NextResponse.json({ error: checkErr.message }, { status: 500 });

    const payload = {
      session_id: id,
      criteria_level,
      parent_criteria_id: criteria_level === 1 ? null : (parent_criteria_id ?? null),
      criteria_i_id,
      criteria_j_id,
      comparison_value,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('ahp_pairwise_comparisons')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      results.push(data);
    } else {
      const { data, error } = await supabase
        .from('ahp_pairwise_comparisons')
        .insert([payload])
        .select('*')
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      results.push(data);
    }
  }

  return NextResponse.json(results);
}
