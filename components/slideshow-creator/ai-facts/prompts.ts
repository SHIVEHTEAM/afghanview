// AI Facts Prompt Bank for Afghan Nationalities, Languages, and Subjects

export type FactCategory =
  | "Poetry"
  | "History"
  | "Quotes"
  | "Food"
  | "Geography"
  | "Art"
  | "Music"
  | "FamousPeople"
  | "Traditions"
  | "Proverbs"
  | "Religion"
  | "FunFacts";

export type FactLanguage =
  | "Dari"
  | "Pashto"
  | "Uzbeki"
  | "Hazaragi"
  | "Turkmeni"
  | "Pashai"
  | "Balochi"
  | "English";

export type FactNationality =
  | "Pashtun"
  | "Tajik"
  | "Hazara"
  | "Uzbek"
  | "Turkmen"
  | "Nuristani"
  | "Aimaq"
  | "Baloch"
  | "Pashai"
  | "Other";

export interface PromptEntry {
  prompt: string;
  language: FactLanguage;
  nationality: FactNationality;
}

export interface PromptBank {
  [category: string]: PromptEntry[];
}

export const promptBank: PromptBank = {
  Poetry: [
    {
      prompt: "Share a famous Pashto landay or poem.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a well-known Dari poem or couplet.",
      language: "Dari",
      nationality: "Tajik",
    },
    {
      prompt: "Share a Hazaragi folk poem or song.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Share a traditional Uzbeki poem or proverb.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a Turkmeni lullaby or poetic saying.",
      language: "Turkmeni",
      nationality: "Turkmen",
    },
    {
      prompt: "Share a Balochi epic or poetic line.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a Pashai folk poem.",
      language: "Pashai",
      nationality: "Pashai",
    },
  ],
  History: [
    {
      prompt: "Tell a historical fact about the Pashtun people in Afghanistan.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a milestone in Hazara history.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe an important event in Uzbek history in Afghanistan.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a key event in Turkmen history.",
      language: "Turkmeni",
      nationality: "Turkmen",
    },
    {
      prompt: "Describe a famous Baloch leader or event.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a historical fact about the Pashai community.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Describe an ancient event from Ariana or Khorasan.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Quotes: [
    {
      prompt: "Share a famous quote from a Pashtun leader or poet.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a proverb or saying from the Hazara community.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Share a well-known Uzbeki proverb.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a Turkmeni proverb or wise saying.",
      language: "Turkmeni",
      nationality: "Turkmen",
    },
    {
      prompt: "Share a Balochi proverb.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a Pashai proverb.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a famous quote from an Afghan leader or poet.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Food: [
    {
      prompt: "Describe a traditional Pashtun dish and its story.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Describe a unique Hazara food.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Share a famous Uzbeki or Turkmeni dish.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi specialty.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai food tradition.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Describe a traditional dish from the Tajik cuisine.",
      language: "Dari",
      nationality: "Tajik",
    },
  ],
  Geography: [
    {
      prompt:
        "Describe a beautiful place in Afghanistan associated with the Pashtun people.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Describe a famous Hazara region or landscape.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe a notable Uzbeki or Turkmeni area.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi region or natural wonder.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai valley or mountain.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Describe a famous mountain, river, or valley in Afghan history.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Art: [
    {
      prompt: "Share a fact about Pashtun embroidery or art.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Describe Hazara pottery or art.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe Uzbeki or Turkmeni carpet weaving.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi jewelry tradition.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai art form.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a fact about Afghan miniature painting or calligraphy.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Music: [
    {
      prompt: "What is a traditional Pashtun musical instrument?",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a famous Hazara song or melody.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe an Uzbeki or Turkmeni musical tradition.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi musical instrument.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai musical tradition.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a famous Afghan song or melody.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  FamousPeople: [
    {
      prompt: "Tell a fact about a famous Pashtun from Afghanistan.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a story about a renowned Hazara figure.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Tell a fact about a famous Uzbek or Turkmen person.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a story about a Balochi leader.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a story about a Pashai notable person.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Tell a fact about a famous Afghan from any community.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Traditions: [
    {
      prompt: "Describe a unique Pashtun wedding or Nowruz tradition.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Describe a Hazara custom or celebration.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe an Uzbeki or Turkmeni tradition.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi custom.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai tradition.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt:
        "Describe a unique wedding or Nowruz tradition from the Tajik people.",
      language: "Dari",
      nationality: "Tajik",
    },
  ],
  Proverbs: [
    {
      prompt: "Share a Pashto proverb or wise saying.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a Hazaragi proverb.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Share an Uzbeki or Turkmeni proverb.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a Balochi proverb.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a Pashai proverb.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a proverb or wise saying from Afghan culture.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  Religion: [
    {
      prompt: "Share a fact about religious diversity among Pashtuns.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Describe a religious festival or practice among the Hazara.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Describe a religious tradition among Uzbeks or Turkmen.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Describe a Balochi religious custom.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Describe a Pashai religious practice.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a fact about religious diversity in Afghanistan.",
      language: "Dari",
      nationality: "Other",
    },
  ],
  FunFacts: [
    {
      prompt: "Share a fun or surprising fact about Pashtuns.",
      language: "Pashto",
      nationality: "Pashtun",
    },
    {
      prompt: "Share a fun or surprising fact about Hazaras.",
      language: "Hazaragi",
      nationality: "Hazara",
    },
    {
      prompt: "Share a fun or surprising fact about Uzbeks or Turkmen.",
      language: "Uzbeki",
      nationality: "Uzbek",
    },
    {
      prompt: "Share a fun or surprising fact about Baloch people.",
      language: "Balochi",
      nationality: "Baloch",
    },
    {
      prompt: "Share a fun or surprising fact about Pashai people.",
      language: "Pashai",
      nationality: "Pashai",
    },
    {
      prompt: "Share a fun or surprising fact about Afghanistan or its people.",
      language: "Dari",
      nationality: "Other",
    },
  ],
};

export const AI_FACTS_PROMPTS = [
  {
    id: "afghan-culture",
    name: "Afghan Culture",
    description: "Fascinating facts about Afghan traditions and customs",
    prompt:
      "Share an interesting and engaging fact about Afghan culture, traditions, or customs. Make it educational and inspiring. Include a relevant emoji and suggest a beautiful background color that complements the content.",
    category: "Culture",
    emoji: "🏛️",
  },
  {
    id: "afghan-cuisine",
    name: "Afghan Cuisine",
    description: "Delicious facts about Afghan food and cooking",
    prompt:
      "Tell me about a traditional Afghan dish, ingredient, or cooking technique. Make it mouth-watering and educational. Include a food-related emoji and suggest a warm, appetizing background color.",
    category: "Cuisine",
    emoji: "🍽️",
  },
  {
    id: "afghan-hospitality",
    name: "Afghan Hospitality",
    description: "Heartwarming facts about Afghan hospitality",
    prompt:
      "Share a beautiful story or fact about Afghan hospitality and guest traditions. Make it heartwarming and inspiring. Include a welcoming emoji and suggest a warm, inviting background color.",
    category: "Hospitality",
    emoji: "🤝",
  },
  {
    id: "afghan-history",
    name: "Afghan History",
    description: "Historical facts about Afghanistan",
    prompt:
      "Share an interesting historical fact about Afghanistan, its people, or its significance in world history. Make it educational and engaging. Include a historical emoji and suggest a dignified background color.",
    category: "History",
    emoji: "📜",
  },
  {
    id: "afghan-geography",
    name: "Afghan Geography",
    description: "Facts about Afghanistan's beautiful landscapes",
    prompt:
      "Describe a beautiful place, mountain, or landscape in Afghanistan. Make it vivid and inspiring. Include a nature emoji and suggest a color that matches the landscape described.",
    category: "Geography",
    emoji: "🏔️",
  },
  {
    id: "afghan-poetry",
    name: "Afghan Poetry",
    description: "Beautiful Afghan poetry and literature",
    prompt:
      "Share a famous Afghan poem, quote, or literary work. Make it poetic and meaningful. Include a literary emoji and suggest an elegant background color.",
    category: "Literature",
    emoji: "📖",
  },
  {
    id: "afghan-music",
    name: "Afghan Music",
    description: "Facts about Afghan music and instruments",
    prompt:
      "Tell me about traditional Afghan music, instruments, or musical traditions. Make it melodic and engaging. Include a music emoji and suggest a harmonious background color.",
    category: "Music",
    emoji: "🎵",
  },
  {
    id: "afghan-art",
    name: "Afghan Art",
    description: "Facts about Afghan arts and crafts",
    prompt:
      "Share information about Afghan arts, crafts, or artistic traditions. Make it colorful and inspiring. Include an art emoji and suggest a vibrant background color.",
    category: "Art",
    emoji: "🎨",
  },
  {
    id: "afghan-proverbs",
    name: "Afghan Proverbs",
    description: "Wisdom from Afghan proverbs",
    prompt:
      "Share a traditional Afghan proverb or saying with its meaning. Make it wise and thought-provoking. Include a wisdom emoji and suggest a contemplative background color.",
    category: "Wisdom",
    emoji: "💭",
  },
  {
    id: "afghan-celebrations",
    name: "Afghan Celebrations",
    description: "Facts about Afghan festivals and celebrations",
    prompt:
      "Tell me about a traditional Afghan festival, celebration, or holiday. Make it festive and joyful. Include a celebration emoji and suggest a festive background color.",
    category: "Celebrations",
    emoji: "🎉",
  },
  {
    id: "afghan-architecture",
    name: "Afghan Architecture",
    description: "Facts about Afghan buildings and architecture",
    prompt:
      "Share information about traditional Afghan architecture, buildings, or construction techniques. Make it impressive and educational. Include an architecture emoji and suggest a majestic background color.",
    category: "Architecture",
    emoji: "🏛️",
  },
  {
    id: "afghan-trade",
    name: "Afghan Trade",
    description: "Facts about Afghan trade and commerce",
    prompt:
      "Tell me about traditional Afghan trade, markets, or commerce. Make it interesting and informative. Include a trade emoji and suggest a prosperous background color.",
    category: "Trade",
    emoji: "🛍️",
  },
  {
    id: "afghan-nature",
    name: "Afghan Nature",
    description: "Facts about Afghanistan's natural beauty",
    prompt:
      "Share information about Afghanistan's natural resources, wildlife, or environmental features. Make it beautiful and inspiring. Include a nature emoji and suggest a natural background color.",
    category: "Nature",
    emoji: "🌿",
  },
  {
    id: "afghan-innovation",
    name: "Afghan Innovation",
    description: "Facts about Afghan inventions and innovations",
    prompt:
      "Share information about Afghan inventions, innovations, or contributions to science and technology. Make it impressive and educational. Include an innovation emoji and suggest a modern background color.",
    category: "Innovation",
    emoji: "💡",
  },
  {
    id: "afghan-heroes",
    name: "Afghan Heroes",
    description: "Facts about famous Afghan figures",
    prompt:
      "Tell me about a famous Afghan historical figure, leader, or hero. Make it inspiring and educational. Include a hero emoji and suggest a noble background color.",
    category: "Heroes",
    emoji: "👑",
  },
];

export const CUSTOM_PROMPT_TEMPLATES = [
  "Share an interesting fact about {topic} in Afghanistan",
  "Tell me about traditional {topic} in Afghan culture",
  "What makes Afghan {topic} unique and special?",
  "Describe a beautiful {topic} from Afghanistan",
  "Share a story about {topic} in Afghan history",
  "What is the significance of {topic} in Afghan society?",
  "Tell me about the art of {topic} in Afghanistan",
  "Share wisdom about {topic} from Afghan traditions",
  "Describe the beauty of {topic} in Afghan culture",
  "What can we learn from Afghan {topic}?",
];

export const BACKGROUND_COLORS = [
  "#1f2937", // Dark blue-gray
  "#dc2626", // Red
  "#059669", // Green
  "#7c3aed", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#be185d", // Pink
  "#854d0e", // Amber
  "#166534", // Dark green
  "#7c2d12", // Dark orange
  "#1e40af", // Blue
  "#9d174d", // Rose
  "#15803d", // Emerald
  "#a855f7", // Violet
  "#f59e0b", // Yellow
];

export const getRandomBackgroundColor = (): string => {
  return BACKGROUND_COLORS[
    Math.floor(Math.random() * BACKGROUND_COLORS.length)
  ];
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - for dark backgrounds, use white text
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};
