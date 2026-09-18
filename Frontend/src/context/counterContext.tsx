import { FactCheckReport } from '@/components/DataTable2';
import { ClaimAssessment, RiskAssessment } from '@/pages/AnalysisResultv2';
import React, { createContext, useContext, Dispatch, SetStateAction } from 'react';

// Define the structure of your User object
export interface User {
  id: number;
  name: string;
  email: string;
}

// Define the shape of the Context type
export interface UserContextType {
  user: User | undefined;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  setGetuserSignal: Dispatch<SetStateAction<boolean>>;
  GetuserSignal:boolean;
  RecentAnalysis:FactCheckReport[];
  setRecentAnalysis:Dispatch<SetStateAction<FactCheckReport[]>>;
  GlobalLoadingState:boolean
  claim_map:Map<string, ClaimAssessment[]>;
  risk_asses_map:Map<string, RiskAssessment[]>;
  AnalysisChatboatFeedDataSignal:boolean;
  setAnalysisChatboatFeedDataSignal:Dispatch<SetStateAction<boolean>>;
}

// Create the context with an initial value of undefined
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to consume the UserContext safely
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserContext Provider');
  }
  return context;
};