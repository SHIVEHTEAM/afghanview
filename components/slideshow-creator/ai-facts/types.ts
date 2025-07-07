export interface Fact {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
  prompt: string;
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: number;
  emoji?: string;
}

export interface SlideshowSettings {
  backgroundMusic?: string;
  musicVolume: number;
  musicLoop: boolean;
  slideDuration: number;
  transition: string;
  autoPlay: boolean;
  showControls: boolean;
  theme: string;
  loopSlideshow: boolean;
  shuffleSlides: boolean;
  autoRandomFact: boolean;
  randomFactInterval: number;
}

export interface TajikCulturePrompt {
  id: string;
  name: string;
  prompt: string;
  icon: any;
  color: string;
  description: string;
}

export interface Theme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  colors?: string[];
}

export interface Transition {
  id: string;
  name: string;
  duration: number;
}
