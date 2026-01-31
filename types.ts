export interface Party {
  id: string;
  name: string;
  symbolName: string; // Text description of symbol
  imageUrl?: string; // URL for party symbol or flag
  color: string;
  voteCount: number;
  shortCode: string;
}

export interface VoteRecord {
  timestamp: number;
  partyId: string;
}

export enum ViewState {
  VOTING = 'VOTING',
  RESULTS = 'RESULTS',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

export interface AiAnalysisResult {
  text: string;
  timestamp: number;
}