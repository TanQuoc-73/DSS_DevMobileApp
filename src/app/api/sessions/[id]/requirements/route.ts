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

// ================= GET =================
export async function GET(
  req: Request,
  context: { params: { id: string } }   // ⬅ params là object, KHÔNG phải Promise
) {
  const { id } = context.params;
  const supabase = createServerClient(req);

  const { data, error } = await supabase
    .from('project_requirements')
    .select('*')
    .eq('session_id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? null);
}

// ================= PUT =================
export async function PUT(
  req: Request,
  context: { params: { id: string } }   // ⬅ tương tự ở đây
) {
  const { id } = context.params;
  const supabase = createServerClient(req);
  const payload = await req.json();

  // Kiểm tra đã có requirements cho session chưa
  const { data: existing, error: checkError } = await supabase
    .from('project_requirements')
    .select('id')
    .eq('session_id', id)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existing?.id) {
    // Update
    const { data, error } = await supabase
      .from('project_requirements')
      .update({ ...payload })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } else {
    // Insert mới
    const { data, error } = await supabase
      .from('project_requirements')
      .insert([{ ...payload, session_id: id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
}
