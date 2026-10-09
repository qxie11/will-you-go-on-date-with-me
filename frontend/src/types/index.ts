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
  foods: FoodItem[];
  flowers: FlowerItem[];
  dates: DateItem[];
}

export interface FoodItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface FlowerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface DateItem {
  id: string;
  label: string;
  sublabel: string;
}

export interface DateResponse {
  id: string;
  createdAt: string;
  partnerName?: string;
  food?: { id: string; title: string };
  flowers?: { id: string; title: string };
  date?: { id: string; label: string };
  customDateTime?: string;
  contact?: string;
  note?: string;
  status: string;
}
