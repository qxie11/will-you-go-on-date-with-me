import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('configs')
      .select('id, data');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const configs = data.map((row) => ({
      id: row.id,
      partnerName: row.data?.general?.partnerName || row.id,
      hasResponses: false, // We'll mock this for now, or you could do a join if needed
    }));

    // Optionally check if they have responses
    const { data: responses } = await supabase
      .from('responses')
      .select('config_id');
      
    if (responses) {
      const respSet = new Set(responses.map(r => r.config_id));
      configs.forEach(c => {
        if (respSet.has(c.id)) {
          c.hasResponses = true;
        }
      });
    }

    return NextResponse.json(configs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
