import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    const { error } = await supabase
      .from('responses')
      .insert({
        config_id: payload.configId,
        payload: payload
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    let query = supabase.from('responses').select('id, config_id, payload, created_at').order('created_at', { ascending: false });
    
    if (id) {
      query = query.eq('config_id', id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map payload into root level to match old NestJS structure
    const responses = data.map((row) => ({
      id: row.id,
      configId: row.config_id,
      timestamp: row.created_at,
      ...row.payload,
    }));
    
    return NextResponse.json(responses);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
