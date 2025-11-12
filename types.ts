
export interface ScriptRequest {
  title: string;
  channelName: string;
  channelDescription: string;
  playlist: string;
  videoLength: string;
  language: string;
}

export interface ScriptMainContent {
  part: number;
  content: string;
}

export interface GeneratedScript {
  titles: string[];
  hook: string;
  introduction: string;
  mainContent: ScriptMainContent[];
  conclusion: string;
  videoDescription: string;
  keywords: string;
  thumbnailTexts: string[];
  thumbnailPrompts: string[];
}
