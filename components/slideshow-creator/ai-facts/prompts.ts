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
