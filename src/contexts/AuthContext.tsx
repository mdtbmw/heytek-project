
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentOnboardingData, InvestorPreferencesData } from './AgentOnboardingContext'; // Import InvestorPreferencesData

const ONBOARDING_DATA_LOCAL_KEY = 'heytekAgentOnboardingData_v1';
const USER_LOCAL_KEY = 'heytekUser_v2';

export interface User {
  email: string;
  username: string;
  country: string;
  primaryRole: string;
  secondaryRoles?: string[];
  investorId?: string;
  password?: string;
  investorPreferences?: InvestorPreferencesData; // Added investor preferences
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  onboardingData: AgentOnboardingData | null; // Keep this for general onboarding context if needed
  login: (identifier: string, password?: string) => Promise<void>;
  signup: (email: string, username: string, country: string, role: string, password?: string) => Promise<{success: boolean, message?: string, existingRole?: string}>;
  logout: () => void;
  isLoading: boolean;
  activateInvestorRole: () => void;
  isFounderInvestor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingDataState, setOnboardingDataState] = useState<AgentOnboardingData | null>(null); // Renamed to avoid conflict
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadDataFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_LOCAL_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedOnboardingData = localStorage.getItem(ONBOARDING_DATA_LOCAL_KEY);
      if (storedOnboardingData) {
        setOnboardingDataState(JSON.parse(storedOnboardingData));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.removeItem(USER_LOCAL_KEY);
      localStorage.removeItem(ONBOARDING_DATA_LOCAL_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]);

  const getRedirectPathForRole = (role: string): string => {
    switch (role) {
      case 'tekker': return '/tekker-dashboard';
      case 'brand_consultant': return '/consultant-dashboard';
      case 'investor': return '/investor-dashboard';
      case 'founder_ceo':
      default: return '/dashboard';
    }
  };

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    let existingUser: User | null = null;
    let currentOnboardingData: AgentOnboardingData | null = null;

    try {
      const usersString = localStorage.getItem('allHeytekUsers_mock');
      if (usersString) {
          const allUsersList: User[] = JSON.parse(usersString);
          existingUser = allUsersList.find(
              u => (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase())
          ) || null;
      }

      if (!existingUser || (existingUser.password && existingUser.password !== password)) {
        setIsLoading(false);
        throw new Error("User not found or credentials incorrect (mock).");
      }
      
      const storedOnboardingData = localStorage.getItem(ONBOARDING_DATA_LOCAL_KEY);
      if (storedOnboardingData) { // This might be stale, login doesn't refresh it from user-specific store
        currentOnboardingData = JSON.parse(storedOnboardingData);
      }
      localStorage.setItem(USER_LOCAL_KEY, JSON.stringify(existingUser));
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }

    setUser(existingUser);
    setOnboardingDataState(currentOnboardingData); // This might still be generic onboarding data
    setIsLoading(false);
    router.push(getRedirectPathForRole(existingUser!.primaryRole));
  };

  const signup = async (email: string, username: string, country: string, role: string, password?: string): Promise<{success: boolean, message?: string, existingRole?: string}> => {
    setIsLoading(true);

    let allUsers: User[] = [];
    const allUsersString = localStorage.getItem('allHeytekUsers_mock');
    if (allUsersString) {
        try { allUsers = JSON.parse(allUsersString); } catch(e) { console.error("Error parsing allHeytekUsers_mock", e); }
    }

    const emailExists = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setIsLoading(false);
      return { success: false, message: `Email ${email} is already registered as a ${emailExists.primaryRole.replace(/_/g, ' ')}. Please log in or use a different email.`, existingRole: emailExists.primaryRole };
    }
    const usernameExists = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      setIsLoading(false);
      return { success: false, message: `Username "${username}" is already taken. Please choose another.` };
    }
    
    if ( (role === 'tekker' || role === 'brand_consultant') && emailExists?.primaryRole === 'founder_ceo' ) {
        setIsLoading(false);
        return { success: false, message: `You are already a Founder. You cannot register as a Tekker or Brand Consultant with the same email.`, existingRole: emailExists?.primaryRole };
    }
    if ( role === 'founder_ceo' && (emailExists?.primaryRole === 'tekker' || emailExists?.primaryRole === 'brand_consultant') ) {
        setIsLoading(false);
        return { success: false, message: `Your email is registered as a ${emailExists?.primaryRole}. You cannot register as a Founder with the same email.`, existingRole: emailExists?.primaryRole };
    }

    const newUser: User = { email, username, country, primaryRole: role, password, secondaryRoles: [] };

    // If signing up as an investor, try to attach their preferences
    if (role === 'investor') {
      try {
        const currentOnboardingDataString = localStorage.getItem(ONBOARDING_DATA_LOCAL_KEY);
        if (currentOnboardingDataString) {
          const currentOBData: AgentOnboardingData = JSON.parse(currentOnboardingDataString);
          if (currentOBData.investorPreferences) {
            newUser.investorPreferences = currentOBData.investorPreferences;
          }
        }
      } catch (e) {
        console.error("Error attaching investor preferences during signup:", e);
      }
    }
    
    setUser(newUser);
    localStorage.setItem(USER_LOCAL_KEY, JSON.stringify(newUser));

    allUsers.push(newUser);
    localStorage.setItem('allHeytekUsers_mock', JSON.stringify(allUsers));

    try {
      const storedOnboardingData = localStorage.getItem(ONBOARDING_DATA_LOCAL_KEY);
      if (storedOnboardingData) {
        setOnboardingDataState(JSON.parse(storedOnboardingData));
      } else {
        setOnboardingDataState(null);
      }
    } catch (e) {
      console.error("Error loading onboarding data on signup", e);
      setOnboardingDataState(null);
    }
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_LOCAL_KEY);
    // Optionally clear ONBOARDING_DATA_LOCAL_KEY if it should reset on logout,
    // or leave it if it's meant to persist across sessions for incomplete onboarding.
    // For now, we leave it to allow resuming onboarding.
    // sessionStorage.clear(); // Clear session-specific data like idea details - This is very broad
    router.push('/login');
  };

  const activateInvestorRole = () => {
    if (user && user.primaryRole === 'founder_ceo' && !user.secondaryRoles?.includes('investor')) {
      const investorId = `INV-${user.username.toUpperCase()}`;
      const updatedUser: User = {
        ...user,
        secondaryRoles: [...(user.secondaryRoles || []), 'investor'],
        investorId: investorId,
      };
      setUser(updatedUser);
      localStorage.setItem(USER_LOCAL_KEY, JSON.stringify(updatedUser));

      let allUsers: User[] = [];
      const allUsersString = localStorage.getItem('allHeytekUsers_mock');
      if (allUsersString) {
          try { allUsers = JSON.parse(allUsersString); } catch(e) { console.error("Error parsing allHeytekUsers_mock for investor activation", e); }
      }
      const userIndex = allUsers.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
      if (userIndex > -1) {
          allUsers[userIndex] = updatedUser;
          localStorage.setItem('allHeytekUsers_mock', JSON.stringify(allUsers));
      }
    }
  };

  const isFounderInvestor = () => {
    return !!(user && user.primaryRole === 'founder_ceo' && user.secondaryRoles?.includes('investor'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        onboardingData: onboardingDataState, // Use the state variable
        login,
        signup,
        logout,
        isLoading,
        activateInvestorRole,
        isFounderInvestor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
