export enum InputMode {
  Text = 'text',
  Voice = 'voice',
  Draw = 'draw',
}

export interface EnhancedPrompts {
  generic: string;
  chatbot: string;
  image_generation: string;
}

export interface FavoritePrompt {
  id: string;
  type: string;
  prompt: string;
  timestamp: number;
}

export interface Settings {
  geminiApiKey: string;
}
