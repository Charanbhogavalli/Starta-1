
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'founder' | 'funder' | 'admin';
}

export interface StartupIdea {
  id: string;
  founderId: string;
  title: string;
  description: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  isPublished: boolean;
  createdAt: string;
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  oneLineSummary: string;
  score: number;
  breakdown: {
    innovation: number;
    market: number;
    feasibility: number;
    scalability: number;
    monetization: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  pitch: string;
}

export interface ConnectionRequest {
  id: string;
  ideaId: string;
  founderId: string;
  funderId: string;
  funderName: string;
  funderAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
