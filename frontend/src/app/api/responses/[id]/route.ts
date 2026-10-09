import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { status } = await request.json();
    
    // In Supabase, the actual payload is inside the 'payload' jsonb column.
    // If you want to update status, it depends on whether you have a native column 
    // or if it's inside payload. Assuming it's inside payload for now.
    
    // First fetch current
    const { data } = await supabase.from('responses').select('payload').eq('id', id).single();
    if (data) {
      const updatedPayload = { ...data.payload, status };
      const { error } = await supabase.from('responses').update({ payload: updatedPayload }).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const { error } = await supabase.from('responses').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
