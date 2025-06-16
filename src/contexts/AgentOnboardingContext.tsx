
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import * as z from 'zod';

// Step 2 Schema
export const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phoneNumber: z.string().min(5, { message: 'Please enter a valid phone number.' }),
  country: z.string().min(1, { message: 'Please select your country.' }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {message: "Invalid date format"}).optional(),
  passportPhoto: z.any().optional(),
  superpower: z.string().optional(),
});
export type ProfileData = z.infer<typeof profileSchema>;

// Step 3 Schema (Vision)
export const visionSchema = z.object({
  path: z.enum(['founder_ceo', 'tekker', 'brand_consultant', 'investor'], {
    required_error: "Please choose your primary path."
  }),
  areasOfInterest: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one area of interest.",
  }),
});
export type VisionData = z.infer<typeof visionSchema>;


// Step 4a: Founder Setup
export const founderSetupSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
  projectStage: z.enum(['idea', 'prototype', 'early_traction', 'scaling'], { required_error: "Please select your project stage."}),
  fundingGoal: z.string().optional(),
});
export type FounderSetupData = z.infer<typeof founderSetupSchema>;

// Step 4b: Tekker Profile
export const tekkerProfileSchema = z.object({
  primarySpecializations: z.array(z.string()).min(1, "Select at least one primary implementation specialization."),
  yearsOfExperience: z.string().min(1, "Please select your years of experience."),
  portfolioUrl: z.string().url("Please enter a valid URL (e.g., https://...)").optional().or(z.literal('')),
  typicalBuildFee: z.string().optional(),
  paymentPreference: z.enum(['daily', 'weekly', 'monthly'], { required_error: "Please select your payment preference."}),
});
export type TekkerProfileData = z.infer<typeof tekkerProfileSchema>;

// Step 5b: Tekker Agreement
export const tekkerAgreementSchema = z.object({
  agreeToPlatformTerms: z.boolean().refine(val => val === true, { message: "You must agree to the platform terms for Tekkers." }),
  understandsEngagementModel: z.boolean().refine(val => val === true, { message: "You must acknowledge understanding of the implementation engagement model." }),
  agreeToCodeOfHonor: z.boolean().refine(val => val === true, { message: "You must agree to the Tekker Code of Honor." }),
});
export type TekkerAgreementData = z.infer<typeof tekkerAgreementSchema>;

// Step 4c: Consultant Focus
export const consultantFocusSchema = z.object({
  expertiseAreas: z.array(z.string()).min(1, "Select at least one area of expertise."),
  targetIndustries: z.array(z.string()).optional(),
  consultingApproach: z.string().min(20, "Briefly describe your consulting approach (min 20 chars)."),
});
export type ConsultantFocusData = z.infer<typeof consultantFocusSchema>;

// Step 5c: Consultant Agreement
export const consultantAgreementSchema = z.object({
  agreeToProfessionalConduct: z.boolean().refine(val => val === true, { message: "You must agree to the code of professional conduct." }),
  confidentialityAcknowledgement: z.boolean().refine(val => val === true, { message: "You must acknowledge the confidentiality terms." }),
});
export type ConsultantAgreementData = z.infer<typeof consultantAgreementSchema>;

// Step 4d: Investor Preferences
export const investorPreferencesSchema = z.object({
  investmentSectors: z.array(z.string()).min(1, "Select at least one preferred investment sector."),
  preferredStage: z.array(z.enum(['pre_seed', 'seed', 'series_a', 'growth', 'any'])).min(1, "Select at least one preferred stage."),
  typicalTicketSize: z.string().min(3, "Specify your typical investment amount (e.g., $25k, $100k+)."),
});
export type InvestorPreferencesData = z.infer<typeof investorPreferencesSchema>;

// Step 5d: Investor Qualification
export const investorQualificationSchema = z.object({
  isAccreditedInvestor: z.boolean().refine(val => val === true, { message: "You must confirm your accredited investor status to proceed (mock confirmation)." }),
  understandInvestmentRisks: z.boolean().refine(val => val === true, { message: "You must acknowledge understanding of investment risks." }),
});
export type InvestorQualificationData = z.infer<typeof investorQualificationSchema>;


export const accountSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  verifyPassword: z.string(),
  enable2FA: z.boolean().default(false),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the Terms of Use." }),
  agreeToPrivacy: z.boolean().refine(val => val === true, { message: "You must agree to the Data Privacy Policy." }),
  agreeToCodeOfHonor: z.boolean().optional(),
}).refine(data => data.password === data.verifyPassword, {
  message: "Passwords don't match",
  path: ["verifyPassword"],
});
export type AccountData = z.infer<typeof accountSchema>;

export interface AgentOnboardingData {
  profile?: ProfileData;
  vision?: VisionData;
  founderSetup?: FounderSetupData;
  tekkerProfile?: TekkerProfileData;
  tekkerAgreement?: TekkerAgreementData;
  consultantFocus?: ConsultantFocusData;
  consultantAgreement?: ConsultantAgreementData;
  investorPreferences?: InvestorPreferencesData;
  investorQualification?: InvestorQualificationData;
  account?: AccountData;
  initialPath?: string;
}

const initialOnboardingState: AgentOnboardingData = {
  profile: undefined,
  vision: undefined,
  founderSetup: undefined,
  tekkerProfile: undefined,
  tekkerAgreement: undefined,
  consultantFocus: undefined,
  consultantAgreement: undefined,
  investorPreferences: undefined,
  investorQualification: undefined,
  account: undefined,
  initialPath: undefined,
};

interface AgentOnboardingContextType {
  onboardingData: AgentOnboardingData;
  updateOnboardingData: (data: Partial<AgentOnboardingData>) => void;
  resetOnboardingData: () => void;
  currentStep: number;
  setCurrentStep: (step: number | ((prevStep: number) => number)) => void;
  totalSteps: number;
}

const AgentOnboardingContext = createContext<AgentOnboardingContextType | undefined>(undefined);

const ONBOARDING_DATA_LOCAL_KEY = 'heytekAgentOnboardingData_v1'; // Changed to localStorage key
// Keys for Idea Extractor page, managed by IdeaExtractorPage itself now for session history
// const IDEA_SESSION_KEY = 'heytekIdeaIgniterSession';
// const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
// const FOUNDER_BACKGROUND_KEY = 'heytekFounderBackground';
// const BUSINESS_NAME_KEY = 'heytekBusinessName';
// const BRAND_TAGLINE_KEY = 'heytekBrandTagline';
// const BRAND_ELEMENTS_KEY = 'heytekBrandElements';


export const AgentOnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingData, setOnboardingDataState] = useState<AgentOnboardingData>(initialOnboardingState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem(ONBOARDING_DATA_LOCAL_KEY);
        if (storedData) {
          setOnboardingDataState(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Failed to load onboarding data from localStorage:", error);
        localStorage.removeItem(ONBOARDING_DATA_LOCAL_KEY); // Clear potentially corrupted data
      }
      setIsLoaded(true);
    }
  }, []);

  const updateOnboardingData = useCallback((data: Partial<AgentOnboardingData>) => {
    setOnboardingDataState(prev => {
      const newState = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARDING_DATA_LOCAL_KEY, JSON.stringify(newState));
      }
      return newState;
    });
  }, []);

  const resetOnboardingData = useCallback(() => {
    setOnboardingDataState(initialOnboardingState);
    setCurrentStep(1); 
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_DATA_LOCAL_KEY);
      // Clear Idea Extractor session storage items if needed, though it's better managed by IdeaExtractorPage itself.
      // sessionStorage.removeItem(IDEA_SESSION_KEY); // Example, these specific keys will be managed by IdeaExtractorPage
    }
  }, []);

  const totalSteps = useMemo(() => {
    if (onboardingData.vision?.path === 'founder_ceo') {
      return 7; 
    }
    return 8; 
  }, [onboardingData.vision?.path]);

  if (!isLoaded && typeof window !== 'undefined') {
    return null; // Or a loading spinner, to prevent rendering with initial empty state before localStorage is checked
  }

  return (
    <AgentOnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        resetOnboardingData,
        currentStep,
        setCurrentStep,
        totalSteps,
      }}
    >
      {children}
    </AgentOnboardingContext.Provider>
  );
};

export const useAgentOnboarding = () => {
  const context = useContext(AgentOnboardingContext);
  if (context === undefined) {
    throw new Error('useAgentOnboarding must be used within an AgentOnboardingProvider');
  }
  return context;
};

export type { AgentOnboardingData as AuthOnboardingDataType }; // Export type for AuthContext
