import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Simplistic global password check. You can change this to query Supabase configs or env.
    if (password === 'admin' || password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: 'fake-jwt-token-123' });
    }
    
    // Check against configs
    const { data: configs } = await supabase.from('configs').select('data');
    if (configs) {
      for (const config of configs) {
        if (config.data?.general?.adminPassword === password) {
          return NextResponse.json({ success: true, token: 'fake-jwt-token-123' });
        }
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
