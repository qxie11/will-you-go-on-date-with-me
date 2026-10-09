import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  general: {
    partnerName?: string;
    proposalTitle: string;
    proposalSubtitle: string;
    topBadgeText: string;
    shyNoteText: string;
    yesButtonText: string;
    noButtonText: string;
    noButtonDodges: boolean;
    dodgeLevel: string;
    theme: string;
    adminPassword?: string;
    language?: string;
  };
  foods: Array<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  }>;
  flowers: Array<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  }>;
  dates: Array<{
    id: string;
    label: string;
    sublabel: string;
  }>;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly configPath = path.join(this.dataDir, 'config.json');

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getConfigPath(id: string = 'default') {
    return id === 'default' ? this.configPath : path.join(this.dataDir, `config-${id}.json`);
  }

  getProfiles(): string[] {
    this.ensureDataDir();
    try {
      const files = fs.readdirSync(this.dataDir);
      return files
        .filter(f => f.startsWith('config-') && f.endsWith('.json'))
        .map(f => f.replace('config-', '').replace('.json', ''));
    } catch {
      return [];
    }
  }


  private getDefaultConfig(lang: string): AppConfig {
    const loc = {
      ru: {
        title: 'пойдёшь со мной на свидание?',
        sub: 'Я сделал этот мини-сайт, потому что просто позвать в мессенджере — это слишком скучно.',
        badge: 'очень маленькое предложение',
        shy: 'в общем, такое дело...',
        yes: 'Да, конечно ✨',
        no: 'Нет',
        foods: [
          { id: 'pasta', title: 'Итальянская паста', subtitle: 'вино, долгие разговоры и вкусная еда', image: '/images/food_pasta.jpg' },
          { id: 'sushi', title: 'Суши и Вино', subtitle: 'красиво, вкусно и эстетично', image: '/images/food_sushi.jpg' },
          { id: 'tacos', title: 'Мексика и Маргарита', subtitle: 'остро, весело и со вкусом', image: '/images/food_tacos.jpg' },
          { id: 'pizza', title: 'Вкуснейшая пицца', subtitle: 'тот случай, когда забываешь про диету', image: '/images/food_pizza.jpg' }
        ],
        flowers: [
          { id: 'pink_peonies', title: 'Нежные пионы', subtitle: 'пышные, мечтательные и очень красивые', image: '/images/flowers_pink.jpg' },
          { id: 'yellow_sunflowers', title: 'Яркие подсолнухи', subtitle: 'тёплые, солнечные и заставляют улыбаться', image: '/images/flowers_yellow.jpg' },
          { id: 'blue_hydrangeas', title: 'Голубые гортензии', subtitle: 'как облака, спокойные и эстетичные', image: '/images/flowers_blue.jpg' },
          { id: 'red_roses', title: 'Классические розы', subtitle: 'страстные, бархатные и вне времени', image: '/images/flowers_red.jpg' }
        ],
        dates: [
          { id: 'friday_night', label: 'В эту пятницу', sublabel: '19:30 • Ужин и прогулка по городу' },
          { id: 'saturday_eve', label: 'В эту субботу', sublabel: '18:00 • Закат, уют и вкусная еда' },
          { id: 'sunday_brunch', label: 'В это воскресенье', sublabel: '15:00 • Спокойный расслабленный день' },
          { id: 'custom', label: 'Удиви меня / Свой день', sublabel: 'Я напишу об этом в заметке!' }
        ]
      },
      uk: {
        title: 'підеш зі мною на побачення?',
        sub: 'Я зробив цей міні-сайт, тому що просто покликати в месенджері — це занадто нудно.',
        badge: 'дуже маленька пропозиція',
        shy: 'загалом, така справа...',
        yes: 'Так, звісно ✨',
        no: 'Ні',
        foods: [
          { id: 'pasta', title: 'Італійська паста', subtitle: 'вино, довгі розмови та смачна їжа', image: '/images/food_pasta.jpg' },
          { id: 'sushi', title: 'Суші та Вино', subtitle: 'красиво, смачно та естетично', image: '/images/food_sushi.jpg' },
          { id: 'tacos', title: 'Мексика і Маргарита', subtitle: 'гостро, весело і зі смаком', image: '/images/food_tacos.jpg' },
          { id: 'pizza', title: 'Смачна піца', subtitle: 'той випадок, коли забуваєш про дієту', image: '/images/food_pizza.jpg' }
        ],
        flowers: [
          { id: 'pink_peonies', title: 'Ніжні півонії', subtitle: 'пухнасті, мрійливі та дуже красиві', image: '/images/flowers_pink.jpg' },
          { id: 'yellow_sunflowers', title: 'Яскраві соняшники', subtitle: 'теплі, сонячні і змушують посміхатися', image: '/images/flowers_yellow.jpg' },
          { id: 'blue_hydrangeas', title: 'Блакитні гортензії', subtitle: 'як хмарки, спокійні та естетичні', image: '/images/flowers_blue.jpg' },
          { id: 'red_roses', title: 'Класичні троянди', subtitle: 'пристрасні, оксамитові та поза часом', image: '/images/flowers_red.jpg' }
        ],
        dates: [
          { id: 'friday_night', label: 'Цієї п\'ятниці', sublabel: '19:30 • Вечеря та прогулянка містом' },
          { id: 'saturday_eve', label: 'Цієї суботи', sublabel: '18:00 • Захід сонця, затишок та смачна їжа' },
          { id: 'sunday_brunch', label: 'Цієї неділі', sublabel: '15:00 • Спокійний розслаблений день' },
          { id: 'custom', label: 'Здивуй мене / Свій день', sublabel: 'Я напишу про це в нотатці!' }
        ]
      },
      en: {
        title: 'will you go on a date with me?',
        sub: 'I made this mini-site because just asking in a messenger is too boring.',
        badge: 'a very small proposal',
        shy: 'so, here is the thing...',
        yes: 'Yes, of course ✨',
        no: 'No',
        foods: [
          { id: 'pasta', title: 'Italian Pasta', subtitle: 'wine, long talks and delicious food', image: '/images/food_pasta.jpg' },
          { id: 'sushi', title: 'Sushi & Wine', subtitle: 'beautiful, tasty and aesthetic', image: '/images/food_sushi.jpg' },
          { id: 'tacos', title: 'Mexico & Margarita', subtitle: 'spicy, fun and tasteful', image: '/images/food_tacos.jpg' },
          { id: 'pizza', title: 'Delicious Pizza', subtitle: 'that moment you forget about the diet', image: '/images/food_pizza.jpg' }
        ],
        flowers: [
          { id: 'pink_peonies', title: 'Gentle Peonies', subtitle: 'fluffy, dreamy and very beautiful', image: '/images/flowers_pink.jpg' },
          { id: 'yellow_sunflowers', title: 'Bright Sunflowers', subtitle: 'warm, sunny and make you smile', image: '/images/flowers_yellow.jpg' },
          { id: 'blue_hydrangeas', title: 'Blue Hydrangeas', subtitle: 'like clouds, calm and aesthetic', image: '/images/flowers_blue.jpg' },
          { id: 'red_roses', title: 'Classic Roses', subtitle: 'passionate, velvet and timeless', image: '/images/flowers_red.jpg' }
        ],
        dates: [
          { id: 'friday_night', label: 'This Friday', sublabel: '19:30 • Dinner and a walk in the city' },
          { id: 'saturday_eve', label: 'This Saturday', sublabel: '18:00 • Sunset, coziness and delicious food' },
          { id: 'sunday_brunch', label: 'This Sunday', sublabel: '15:00 • A calm and relaxed day' },
          { id: 'custom', label: 'Surprise me / My own day', sublabel: 'I will write about it in the note!' }
        ]
      }
    };
    
    const langDefaults = loc[lang as keyof typeof loc] || loc.ru;

    return {
      general: {
        partnerName: '',
        proposalTitle: langDefaults.title,
        proposalSubtitle: langDefaults.sub,
        topBadgeText: langDefaults.badge,
        shyNoteText: langDefaults.shy,
        yesButtonText: langDefaults.yes,
        noButtonText: langDefaults.no,
        noButtonDodges: true,
        dodgeLevel: 'playful',
        theme: 'rose-champagne',
        adminPassword: 'admin',
        language: lang,
      },
      foods: langDefaults.foods,
      flowers: langDefaults.flowers,
      dates: langDefaults.dates,
    };
  }

  getConfig(includePassword = false, id: string = 'default', lang: string = 'ru'): AppConfig {
    this.ensureDataDir();
    const targetPath = this.getConfigPath(id);
    try {
      if (fs.existsSync(targetPath)) {
        const raw = fs.readFileSync(targetPath, 'utf8');
        const parsed = JSON.parse(raw);
        
        // Merge missing defaults for safety
        const def = this.getDefaultConfig(lang);
        
        // Deep merge but ignore empty strings
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
        
        if (!includePassword && merged.general) {
          const { adminPassword, ...safeGeneral } = merged.general;
          return { ...merged, general: safeGeneral };
        }
        return merged;
      }
    } catch (err) {
      this.logger.error('Error reading config.json', err);
    }

    // Default fallback
    return this.getDefaultConfig(lang);
  }

  updateConfig(newConfig: Partial<AppConfig>, id: string = 'default', lang: string = 'ru'): AppConfig {
    this.ensureDataDir();
    const current = this.getConfig(true, id, lang);

    // Preserve existing password if not provided
    const adminPassword = newConfig.general?.adminPassword || current.general?.adminPassword || 'admin';
    const merged: AppConfig = {
      ...current,
      ...newConfig,
      general: {
        ...current.general,
        ...(newConfig.general || {}),
        adminPassword,
        language: newConfig.general?.language || lang,
      },
    };

    const targetPath = this.getConfigPath(id);
    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf8');
    return this.getConfig(false, id, lang);
  }

  validateAdminPassword(password: string): boolean {
    const config = this.getConfig(true, 'default', 'ru');
    const expected = config.general?.adminPassword || 'admin';
    return password === expected;
  }
}
