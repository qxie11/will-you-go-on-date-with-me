import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to provide defaults based on language
function getDefaultConfig(lang: string) {
  return {
    general: {
      partnerName: '',
      proposalTitle: 'will you go on a date with me?',
      proposalSubtitle: 'I made this mini-site because just asking in a messenger is too boring.',
      topBadgeText: 'a very small proposal',
      shyNoteText: 'so, here is the thing...',
      yesButtonText: 'Yes, of course ✨',
      noButtonText: 'No',
      noButtonDodges: true,
      dodgeLevel: 'playful',
      theme: 'rose-champagne',
      adminPassword: 'admin',
      language: 'en'
    },
    foods: [],
    flowers: [],
    dates: []
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const lang = searchParams.get('lang') || 'ru';

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const { data: configRow, error } = await supabase
      .from('configs')
      .select('data')
      .eq('id', id)
      .single();

    if (error || !configRow) {
      if (id === 'default') {
        return NextResponse.json(getDefaultConfig(lang));
      }
      // If config doesn't exist, return default for that language
      return NextResponse.json(getDefaultConfig(lang));
    }

    const parsed = configRow.data;
    const def = getDefaultConfig(lang);

    const mergedGen = { ...def.general };
    if (parsed.general) {
      for (const key of Object.keys(parsed.general)) {
        if (parsed.general[key] !== '' && parsed.general[key] !== null && parsed.general[key] !== undefined) {
          (mergedGen as any)[key] = parsed.general[key];
        }
      }
    }

    let guessedLang = parsed.general?.language || lang;
    if (!parsed.general?.language) {
      if (mergedGen.yesButtonText === 'Yes, of course ✨') guessedLang = 'en';
      else if (mergedGen.yesButtonText === 'Так, звісно ✨') guessedLang = 'uk';
      else if (mergedGen.yesButtonText === 'Да, конечно ✨') guessedLang = 'ru';
    }

    const merged = {
      ...def,
      ...parsed,
      general: {
        ...mergedGen,
        language: guessedLang
      },
      foods: parsed.foods && parsed.foods.length > 0 ? parsed.foods : def.foods,
      flowers: parsed.flowers && parsed.flowers.length > 0 ? parsed.flowers : def.flowers,
      dates: parsed.dates && parsed.dates.length > 0 ? parsed.dates : def.dates,
    };

    return NextResponse.json(merged);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Upsert the config
    const { error } = await supabase
      .from('configs')
      .upsert({ id, data: body });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
