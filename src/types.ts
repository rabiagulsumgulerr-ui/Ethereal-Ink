export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string[];
  imagePrompt?: string;
  imageUrl?: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  coordinates?: { x: number; y: number };
  imageUrl?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  content: string;
  importance: 'minor' | 'major' | 'critical';
}

export interface StoryState {
  content: string;
  title: string;
  lastSaved: string;
}

export interface AppState {
  story: StoryState;
  characters: Character[];
  world: Location[];
  timeline: TimelineEvent[];
}
