import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: responses, error } = await supabase.from('responses').select('payload');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = responses.length;
    let accepted = 0;
    
    responses.forEach(r => {
      // Depending on the structure of your payload, adjust this check.
      // Usually, if a response exists, it means they clicked 'Yes'.
      accepted++; 
    });

    return NextResponse.json({
      total,
      accepted,
      conversionRate: total > 0 ? (accepted / total) * 100 : 0
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
