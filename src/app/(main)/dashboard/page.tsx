
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Sparkles, Palette, Gavel, Package, LayoutTemplate, Bell, Info, TrendingUp, MessageSquareHeart, ArrowRight, Edit3, CheckSquare, Presentation, Users, Building, FileText, ShieldCheck, BarChart3, Briefcase, UserPlus, Trash2, Download, Upload, PlusCircle, Settings2, DollarSign, Eye, Hammer, Construction, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import type { IdeaDetails } from '@/ai/flows/extract-startup-idea-flow';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import CompanyFolderTree, { type FolderStructureItem } from '@/components/dashboard/CompanyFolderTree';


const IDEA_DETAILS_KEY = 'heytekStartupIdeaDetails';
const BUSINESS_NAME_KEY = 'heytekBusinessName';
const BRAND_ELEMENTS_KEY = 'heytekBrandElements';
const LEGAL_SETUP_COMPLETED_KEY = 'heytekLegalSetupGenerated_v1';
const PRODUCT_PROFILE_GENERATED_KEY = 'heytekProductProfileGenerated_v1';
const PITCH_DECK_GENERATED_KEY = 'heytekPitchDeckGenerated_v1';

// localStorage keys for dashboard data
const DEPARTMENTS_STORAGE_KEY = 'heytekFounderDepartments_v1';
const ROLES_STORAGE_KEY = 'heytekFounderRoles_v1';
const DOCUMENTS_STORAGE_KEY = 'heytekFounderDocuments_v1';
const COMPLIANCE_STORAGE_KEY = 'heytekFounderCompliance_v1';
const TEAM_STORAGE_KEY = 'heytekFounderTeam_v1';


const startupTips = [
  "Clearly define your company's core values; they'll guide your operational structure.",
  "Map out key processes early, even if they're simple. SOPs can evolve from these.",
  "A flexible organizational structure can adapt better to early-stage growth and pivots.",
  "Document roles and responsibilities, even for a small team, to ensure clarity.",
  "User feedback is gold for product development AND refining operations.",
  "Your company culture starts forming from day one. Nurture it intentionally."
];

interface Department { id: string; name: string; type: 'Internal' | 'External'; head?: string; coreFunctions?: string; }
interface Role { id: string; title: string; reportsTo?: string; departmentId?: string; keyResponsibilities?: string; assignedTo?: string;}
interface Document { id: string; name: string; category: 'SOPs' | 'Guides' | 'Contracts' | 'Onboarding' | 'IP Protection' | 'Financial' | 'Marketing_Plans'; uploadedDate: string; version?: string; departmentId?: string; path?: string; }
interface ComplianceItem { id: string; name: string; isCompliant: boolean; details?: string; dueDate?: string; }
interface TeamMember { id: string; name: string; email: string; roleTitle: string; departmentIds?: string[]; status?: 'Active' | 'Invited' | 'Inactive'; }
interface Invoice { id: string; date: string; amount: string; status: 'Paid' | 'Pending' | 'Overdue'; description?: string; }

const initialDepartmentsData: Department[] = [
  { id: 'dept1', name: 'Operations & Strategy', type: 'Internal', head: 'Founder/CEO', coreFunctions: 'Overall direction, product development, core service delivery.' },
  { id: 'dept2', name: 'Marketing & Sales', type: 'Internal', coreFunctions: 'Brand building, customer acquisition, market research.' },
  { id: 'dept3', name: 'Technology (if applicable)', type: 'Internal', coreFunctions: 'Platform development, IT infrastructure.'},
  { id: 'dept4', name: 'Legal Services (Consultant)', type: 'External', coreFunctions: 'Compliance, contracts, IP.' },
  { id: 'dept5', name: 'Finance & Accounting (Consultant)', type: 'External', coreFunctions: 'Bookkeeping, financial planning, tax.' },
];
const initialRolesData: Role[] = [
  { id: 'role1', title: 'Founder / CEO', reportsTo: 'Board/Self', departmentId: 'dept1', keyResponsibilities: 'Vision, strategy, fundraising, key partnerships.' },
  { id: 'role2', title: 'Head of Product/Operations', reportsTo: 'CEO', departmentId: 'dept1', keyResponsibilities: 'Product roadmap, daily operations, team coordination.' },
  { id: 'role3', title: 'Marketing Specialist', reportsTo: 'CEO/Head of Ops', departmentId: 'dept2', keyResponsibilities: 'Digital marketing, content creation, community engagement.' },
];
const initialDocumentsData: Document[] = [
  { id: 'doc1', name: 'Company Vision & Mission Statement.pdf', category: 'Guides', uploadedDate: '2024-07-15', version: '1.0', departmentId: 'dept1', path: 'Strategy/Core' },
  { id: 'doc2', name: 'Standard Client Agreement Template.docx', category: 'Contracts', uploadedDate: '2024-07-10', version: '1.0', departmentId: 'dept4', path: 'Legal/Templates' },
  { id: 'doc3', name: 'Employee Onboarding Checklist.pdf', category: 'Onboarding', uploadedDate: '2024-07-05', version: '1.0', departmentId: 'dept1', path: 'HR/Onboarding' },
  { id: 'doc4', name: 'Q3 Marketing Plan.pptx', category: 'Marketing_Plans', uploadedDate: '2024-07-01', version: '1.0', departmentId: 'dept2', path: 'Marketing/Campaigns' },
  { id: 'doc5', name: 'Seed Round Financial Model.xlsx', category: 'Financial', uploadedDate: '2024-06-25', version: '1.1', departmentId: 'dept5', path: 'Finance/Projections' },
];
const initialComplianceItemsData: ComplianceItem[] = [
  { id: 'comp1', name: 'Business Registration with State/Country Authority', isCompliant: false, details: 'Pending submission of Form X.', dueDate: '2024-08-01' },
  { id: 'comp2', name: 'Website Privacy Policy & ToS Published', isCompliant: false, details: 'Draft ready, awaiting legal review.', dueDate: '2024-07-25' },
  { id: 'comp3', name: 'Basic Data Security Measures (e.g., password policy)', isCompliant: false, details: 'To be defined and implemented.', dueDate: '2024-07-30' },
];
const initialTeamMembersData: TeamMember[] = [
  { id: 'team1', name: 'Ada Lovelace (Founder)', email: 'ada@example.com', roleTitle: 'Founder / CEO', departmentIds: ['dept1'], status: 'Active' },
];
const initialInvoicesData: Invoice[] = [
  { id: 'inv1', date: '2024-07-01', amount: '$99.00', status: 'Paid', description: 'HeyTek Platform Subscription - July' },
  { id: 'inv2', date: '2024-06-15', amount: '$250.00', status: 'Pending', description: 'Tekker Payout - Build X Milestone 1'},
];

// Mock folder structure
const initialFolderStructure: FolderStructureItem[] = [
  { id: 'f_admin', name: 'Administration', type: 'folder', children: [
    { id: 'f_admin_corp', name: 'Corporate Records', type: 'folder', children: [
      { id: 'file_biz_reg', name: 'BusinessRegistration.pdf', type: 'file', path: 'Administration/Corporate Records/BusinessRegistration.pdf'},
    ]},
    { id: 'f_admin_hr', name: 'Human Resources', type: 'folder', children: [
      { id: 'doc3_link', name: 'Employee Onboarding Checklist.pdf', type: 'file', documentId: 'doc3' },
      { id: 'file_emp_handbook', name: 'EmployeeHandbook_v1.pdf', type: 'file', path: 'Administration/Human Resources/EmployeeHandbook_v1.pdf'},
    ]},
  ]},
  { id: 'f_finance', name: 'Finance', type: 'folder', children: [
    { id: 'f_finance_proj', name: 'Projections & Models', type: 'folder', children: [
       { id: 'doc5_link', name: 'Seed Round Financial Model.xlsx', type: 'file', documentId: 'doc5' },
    ]},
    { id: 'f_finance_reports', name: 'Financial Reports', type: 'folder' },
  ]},
  { id: 'f_legal', name: 'Legal', type: 'folder', children: [
    { id: 'f_legal_contracts', name: 'Contracts & Agreements', type: 'folder', children: [
      { id: 'doc2_link', name: 'Standard Client Agreement Template.docx', type: 'file', documentId: 'doc2' },
    ]},
    { id: 'f_legal_ip', name: 'Intellectual Property', type: 'folder' },
  ]},
  { id: 'f_marketing', name: 'Marketing & Sales', type: 'folder', children: [
    { id: 'f_marketing_brand', name: 'Brand Assets', type: 'folder', children: [
      { id: 'file_logo_kit', name: 'LogoKit.zip', type: 'file', path: 'Marketing/Brand Assets/LogoKit.zip' },
      { id: 'file_brand_guidelines', name: 'BrandGuidelines.pdf', type: 'file', path: 'Marketing/Brand Assets/BrandGuidelines.pdf' },
    ]},
    { id: 'f_marketing_campaigns', name: 'Campaigns', type: 'folder', children: [
      { id: 'doc4_link', name: 'Q3 Marketing Plan.pptx', type: 'file', documentId: 'doc4' },
    ]},
  ]},
  { id: 'f_operations', name: 'Operations', type: 'folder', children: [
    { id: 'f_ops_sops', name: 'Standard Operating Procedures (SOPs)', type: 'folder' },
    { id: 'f_ops_guides', name: 'Internal Guides', type: 'folder', children: [
      { id: 'doc1_link', name: 'Company Vision & Mission Statement.pdf', type: 'file', documentId: 'doc1' },
    ]},
  ]},
  { id: 'f_product', name: 'Product Development', type: 'folder', children: [
    { id: 'f_prod_roadmap', name: 'Product Roadmap', type: 'folder' },
    { id: 'f_prod_specs', name: 'Specifications', type: 'folder' },
  ]},
];

const loadFromLocalStorage = <T,>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      localStorage.removeItem(key); // Clear corrupted data
      return defaultValue;
    }
  }
  return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};


export default function DashboardPage() {
  const { user, activateInvestorRole, isFounderInvestor, onboardingData: authOnboardingData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [startupNameForDisplay, setStartupNameForDisplay] = useState<string | null>(null);
  const [currentStageText, setCurrentStageText] = useState('Idea Validation');
  const [progressPercentage, setProgressPercentage] = useState(15);
  const [dynamicTip, setDynamicTip] = useState(startupTips[0]);
  const [notificationsArray, setNotificationsArray] = useState<string[]>([]);
  const [ideaSummary, setIdeaSummary] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [departments, setDepartments] = useState<Department[]>(initialDepartmentsData);
  const [roles, setRoles] = useState<Role[]>(initialRolesData);
  const [documents, setDocuments] = useState<Document[]>(initialDocumentsData);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(initialComplianceItemsData);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembersData);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoicesData); // Invoices remain mock for now
  const [folderStructure, setFolderStructure] = useState<FolderStructureItem[]>(initialFolderStructure); // Folder structure remains mock for now

  const [tekkingProgress] = useState([
    { week: 1, task: "Initial Setup & Config", progress: 100, status: "Completed" },
    { week: 2, task: "Core AI Flow Integration", progress: 75, status: "In Progress"},
    { week: 3, task: "Frontend User Auth", progress: 50, status: "In Progress"},
    { week: 4, task: "Branding Application", progress: 20, status: "Planned"},
  ]);

  useEffect(() => {
    setDepartments(loadFromLocalStorage(DEPARTMENTS_STORAGE_KEY, initialDepartmentsData));
    setRoles(loadFromLocalStorage(ROLES_STORAGE_KEY, initialRolesData));
    setDocuments(loadFromLocalStorage(DOCUMENTS_STORAGE_KEY, initialDocumentsData));
    setComplianceItems(loadFromLocalStorage(COMPLIANCE_STORAGE_KEY, initialComplianceItemsData));
    setTeamMembers(loadFromLocalStorage(TEAM_STORAGE_KEY, initialTeamMembersData));
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalStorage(DEPARTMENTS_STORAGE_KEY, departments);
    }
  }, [departments, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalStorage(ROLES_STORAGE_KEY, roles);
    }
  }, [roles, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalStorage(DOCUMENTS_STORAGE_KEY, documents);
    }
  }, [documents, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalStorage(COMPLIANCE_STORAGE_KEY, complianceItems);
    }
  }, [complianceItems, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      saveToLocalStorage(TEAM_STORAGE_KEY, teamMembers);
    }
  }, [teamMembers, isDataLoaded]);


  useEffect(() => {
    const ideaDetailsString = sessionStorage.getItem(IDEA_DETAILS_KEY);
    const businessName = sessionStorage.getItem(BUSINESS_NAME_KEY);
    const brandElementsString = sessionStorage.getItem(BRAND_ELEMENTS_KEY);
    const legalSetupGenerated = sessionStorage.getItem(LEGAL_SETUP_COMPLETED_KEY) === 'true';
    const productProfileGenerated = sessionStorage.getItem(PRODUCT_PROFILE_GENERATED_KEY) === 'true';
    const pitchDeckGenerated = sessionStorage.getItem(PITCH_DECK_GENERATED_KEY) === 'true';


    let idea: IdeaDetails | null = null;
    if (ideaDetailsString) {
      try {
        idea = JSON.parse(ideaDetailsString);
        if (idea && idea.summary && !idea.summary.startsWith("Let's define this core concept") && !idea.summary.startsWith("User opted to skip")) {
          setIdeaSummary(idea.summary);
        } else if (idea && idea.title && !idea.title.startsWith("A Sparkling New Vision") && !idea.title.startsWith("Sparkling New Idea")) {
          setIdeaSummary(idea.title);
        }
      } catch (e) { console.error("Error parsing ideaDetails from sessionStorage", e); }
    }

    let nameDisplay = businessName || (idea?.title && !idea.title.startsWith("A Sparkling New Vision") && !idea.title.startsWith("Sparkling New Idea")) ? idea.title : (authOnboardingData?.founderSetup?.companyName || "Your Startup");
    if (nameDisplay && (nameDisplay.startsWith("Sparkling New Idea") || nameDisplay.startsWith("A Sparkling New Vision"))) nameDisplay = authOnboardingData?.founderSetup?.companyName || "Your Startup";
    setStartupNameForDisplay(nameDisplay);

    let stage = 'Idea Validation';
    let progress = 15;
    const notifications: string[] = [];

    if (idea && (idea.summary && !idea.summary.startsWith("Let's define this core concept")) ) {
      stage = 'Naming & Branding';
      progress = 30;
      notifications.push(`Idea for "${nameDisplay}" is looking solid! Time to choose a great name.`);
    }

    if (businessName) {
      stage = 'Brand Definition';
      progress = 45;
      notifications.push(`"${businessName}" is a great name! Craft your brand identity next.`);
    }

    if (brandElementsString) {
      try {
        const brandElements = JSON.parse(brandElementsString);
        if (brandElements && (brandElements.taglines?.length > 0 || brandElements.visionStatement)) {
          stage = 'Product & Legal Profiling';
          progress = 60;
          notifications.push('Brand elements defined! Solidify your product profile and legal basics.');
        }
      } catch (e) { console.error("Error parsing brandElements from sessionStorage", e); }
    }
    
    if (productProfileGenerated) {
        stage = 'Legal Setup & Pitch Prep';
        progress = Math.max(progress, 70); 
        notifications.push('Product profile is sharp! Time for legal setup and pitch deck outline.');
    }
    
    if (legalSetupGenerated) {
      stage = 'Pitch Prep & Operational Structuring';
      progress = Math.max(progress, 80); 
      notifications.push('Legal guidance generated! Outline your pitch deck and start structuring operations.');
    }

    if (pitchDeckGenerated) {
        stage = 'Funding Prep & Ops Buildout';
        progress = Math.max(progress, 90);
        notifications.push('Pitch deck outline ready! Focus on funding and building out your company structure.');
    }


    setCurrentStageText(stage);
    setProgressPercentage(progress);
    setDynamicTip(startupTips[Math.floor(Math.random() * startupTips.length)]);
    if (notifications.length === 0) {
        notifications.push(`Welcome, ${nameDisplay === "Your Startup" && authOnboardingData?.founderSetup?.companyName ? authOnboardingData.founderSetup.companyName : (nameDisplay || 'Founder')}! Let's start building your company.`);
    }
    setNotificationsArray(notifications.slice(-2));

  }, [authOnboardingData?.founderSetup?.companyName, isDataLoaded]); // Added isDataLoaded dependency

  const userName = user?.username || user?.email?.split('@')[0] || 'Founder';

  const aiPrompts = [
    { title: 'AI Idea Igniter', description: 'Chat with Sparky to refine your startup concept and vision.', href: '/idea-extractor', icon: Lightbulb, color: 'text-primary dark:text-primary' },
    { title: 'AI Business Name Generator', description: 'Find the perfect name with AI suggestions & mock checks.', href: '/name-generator', icon: Sparkles, color: 'text-primary dark:text-primary' },
    { title: 'AI Brand Identity Suite', description: 'Develop taglines, vision, mission statements, and more.', href: '/brand-generator', icon: Palette, color: 'text-primary dark:text-primary' },
    { title: 'AI Product Profile Generator', description: 'Craft a concise, impactful profile for your product/service.', href: '/product-profile-generator', icon: FileText, color: 'text-primary dark:text-primary' },
    { title: 'AI Pitch Deck Outline Generator', description: 'Get an AI-generated outline for your investor pitch deck.', href: '/pitch-deck-generator', icon: Presentation, color: 'text-primary dark:text-primary' },
    { title: 'AI Legal Setup Guidance', description: 'Receive guidance on legal requirements for your business.', href: '/legal-setup', icon: Gavel, color: 'text-foreground dark:text-primary' },
  ];

  const devTools = [
     { title: 'Your Branding Kit (Mock)', description: 'Access logos, color palettes, and mood boards.', href: '/branding-package', icon: Package, color: 'text-primary dark:text-primary' },
     { title: 'Digital Presence (Conceptual)', description: 'Visualize AI-generated website concepts.', href: '/branding-package', icon: MonitorPlay, color: 'text-foreground dark:text-primary' },
  ];

  // Department Handlers
  const handleAddDepartment = () => setDepartments(prev => [...prev, {id: `dept${Date.now()}`, name: 'New Department', type: 'Internal', coreFunctions: ''}]);
  const handleDepartmentChange = (id: string, field: keyof Department, value: string) => {
    setDepartments(prev => prev.map(dept => dept.id === id ? {...dept, [field]: value} : dept));
  };
  const handleDeleteDepartment = (id: string) => setDepartments(prev => prev.filter(dept => dept.id !== id));

  // Role Handlers
  const handleAddRole = () => setRoles(prev => [...prev, {id: `role${Date.now()}`, title: 'New Role', keyResponsibilities: ''}]);
  const handleRoleChange = (id: string, field: keyof Role, value: string) => {
    setRoles(prev => prev.map(role => role.id === id ? {...role, [field]: value} : role));
  };
  const handleDeleteRole = (id: string) => setRoles(prev => prev.filter(role => role.id !== id));

  // Document Handlers
  const handleAddDocument = (category: Document['category']) => {
    setDocuments(prev => [...prev, {id: `doc${Date.now()}`, name: `New ${category} Doc - ${new Date().toLocaleDateString()}`, category, uploadedDate: new Date().toISOString().split('T')[0], version: '1.0'}]);
  };
  const handleDeleteDocument = (id: string) => setDocuments(prev => prev.filter(doc => doc.id !== id));
  const handleDocumentChange = (id: string, field: keyof Document, value: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? {...doc, [field]:value} : doc));
  };


  // Compliance Handlers
  const handleComplianceToggle = (itemId: string) => {
    setComplianceItems(prev => prev.map(item => item.id === itemId ? {...item, isCompliant: !item.isCompliant} : item));
  };
  const handleAddComplianceItem = () => setComplianceItems(prev => [...prev, {id: `comp${Date.now()}`, name: 'New Compliance Item', isCompliant: false}]);
  const handleDeleteComplianceItem = (id: string) => setComplianceItems(prev => prev.filter(item => item.id !== id));
  const handleComplianceItemChange = (id: string, field: keyof ComplianceItem, value: string | boolean) => {
    setComplianceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };


  // Team Member Handlers
  const handleAddTeamMember = () => setTeamMembers(prev => [...prev, {id: `team${Date.now()}`, name: 'New Team Member', email: '', roleTitle: '', status: 'Invited'}]);
  const handleTeamMemberChange = (id: string, field: keyof TeamMember, value: string | string[] | undefined) => {
    setTeamMembers(prev => prev.map(member => member.id === id ? {...member, [field]: value} : member));
  };
  const handleDeleteTeamMember = (id: string) => setTeamMembers(prev => prev.filter(member => member.id !== id));


  const handleActivateInvestor = () => {
    activateInvestorRole();
    toast({
      title: "Investor Profile Activated!",
      description: `You can now access Investor features. Your Investor ID is ${user?.investorId || 'generating...'}. Use your profile menu to switch views.`,
      icon: <DollarSign className="h-5 w-5 text-primary"/>,
      duration: 7000,
    });
  };

  const handleFileClick = (file: FolderStructureItem) => {
    if (file.type === 'file') {
      if (file.documentId) {
        const doc = documents.find(d => d.id === file.documentId);
        toast({ title: "Opening Document (Mock)", description: `Would open: ${doc?.name || file.name}` });
      } else {
        toast({ title: "Opening File (Mock)", description: `Would open: ${file.name} from path: ${file.path}` });
      }
    }
  };


  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-card via-background to-secondary/20 dark:from-card dark:via-background dark:to-secondary/30 border-border shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-foreground">
                Welcome back, <span className="text-primary">{userName}</span>!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground dark:text-foreground/80 mt-1">
                Let's continue building <span className="font-semibold text-primary">{startupNameForDisplay || "your venture"}</span> into a thriving company!
                 HeyTek helps you Ideate, Build, Operate, and Grow.
              </CardDescription>
            </div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 mt-[-20px] mr-[-20px] hidden sm:block">
              <Image src="https://placehold.co/300x300.png" alt="Startup illustration" fill data-ai-hint="abstract tech company" className="object-contain opacity-70 dark:opacity-90"/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-foreground/70 mb-4 max-w-2xl">
            Your company-building journey is powered by AI. Use the AI Tools to generate assets, structure your company, and organize your operations.
          </p>
           <div className="flex items-center gap-4">
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground text-md px-6 py-3 group">
              <Link href="/idea-extractor">
                {progressPercentage < 30 ? "Start with Idea Extraction" : "Refine Your Company Idea"}
                <Lightbulb className="ml-2 h-5 w-5 group-hover:animate-pulse-once" />
              </Link>
            </Button>
            <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Company Setup Progress: {currentStageText}</span>
                    <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 [&>div]:bg-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {isFounderInvestor() && (
        <Alert variant="default" className="bg-green-500/10 dark:bg-green-700/20 border-green-500/30 dark:border-green-600/40 text-green-700 dark:text-green-300">
          <Eye className="h-5 w-5"/>
          <AlertTitle>Investor Profile Active!</AlertTitle>
          <AlertDescription>
            You have activated your Investor profile. You can switch to your Investor Dashboard from your profile menu in the header.
          </AlertDescription>
        </Alert>
      )}

      {ideaSummary && (
        <Card className="bg-secondary/50 dark:bg-secondary/70 border-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-foreground dark:text-foreground/90">
              <CheckSquare className="mr-2 h-5 w-5 text-primary"/> Current Focus: <span className="text-primary ml-1">{startupNameForDisplay}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-foreground/80 italic line-clamp-2">"{ideaSummary}"</p>
          </CardContent>
          <CardFooter>
             <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20">
                <Link href="/idea-extractor"><Edit3 className="mr-2 h-4 w-4"/>Refine Company Idea</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="ai_tools" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="ai_tools"><Sparkles className="mr-2 h-4 w-4"/>AI Tools</TabsTrigger>
          <TabsTrigger value="structure_builder"><Building className="mr-2 h-4 w-4"/>Structure</TabsTrigger>
          <TabsTrigger value="company_assets"><FolderKanban className="mr-2 h-4 w-4"/>Assets</TabsTrigger>
          <TabsTrigger value="team_access"><Users className="mr-2 h-4 w-4"/>Team</TabsTrigger>
          <TabsTrigger value="billing"><DollarSign className="mr-2 h-4 w-4"/>Billing</TabsTrigger>
          <TabsTrigger value="investor_mode" className={!user || user.primaryRole !== 'founder_ceo' ? "hidden" : ""}>
            <Eye className="mr-2 h-4 w-4"/>Investor Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai_tools" className="mt-6">
          <Card className="dark:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-foreground dark:text-foreground/90">AI Power Tools for Founders</CardTitle>
              <CardDescription>Leverage AI for every step of your company creation journey.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {aiPrompts.map((prompt) => (
                <Card key={prompt.href} className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] flex flex-col border-muted-foreground/20 dark:bg-card/80 dark:border-border">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <div className={`p-3 rounded-lg bg-muted dark:bg-secondary ${prompt.color}/20`}>
                      <prompt.icon className={`h-7 w-7 ${prompt.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground dark:text-foreground/90">{prompt.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">{prompt.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow"></CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 group">
                      <Link href={prompt.href}>Go to {prompt.title} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure_builder" className="mt-6 space-y-6">
          <Card className="dark:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/>Company Departments</CardTitle>
              <CardDescription>Define internal and external departments. AI can help suggest these based on your industry and idea.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department Name</TableHead><TableHead>Type</TableHead><TableHead>Head (Optional)</TableHead><TableHead>Core Functions</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.map(dept => (
                            <TableRow key={dept.id}>
                                <TableCell><Input type="text" value={dept.name} onChange={(e) => handleDepartmentChange(dept.id, 'name', e.target.value)} className="h-8 text-xs font-medium bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell>
                                    <Select value={dept.type} onValueChange={(val: 'Internal' | 'External') => handleDepartmentChange(dept.id, 'type', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="Internal">Internal</SelectItem><SelectItem value="External">External</SelectItem></SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell><Input type="text" placeholder="N/A" value={dept.head || ''} onChange={(e) => handleDepartmentChange(dept.id, 'head', e.target.value)} className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell><Input type="text" placeholder="Define functions..." value={dept.coreFunctions || ''} onChange={(e) => handleDepartmentChange(dept.id, 'coreFunctions', e.target.value)} className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(dept.id)} className="text-destructive hover:text-destructive"><Trash2 size={16}/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button className="mt-4" onClick={handleAddDepartment}><PlusCircle className="mr-2"/>Add Department</Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-card/80">
            <CardHeader><CardTitle className="text-xl font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Roles & Responsibilities</CardTitle><CardDescription>Outline key roles. AI can suggest roles based on your departments and company stage.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Job Title</TableHead><TableHead>Reports To</TableHead><TableHead>Department</TableHead><TableHead>Key Responsibilities</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {roles.map(role => (
                            <TableRow key={role.id}>
                                <TableCell><Input type="text" value={role.title} onChange={(e) => handleRoleChange(role.id, 'title', e.target.value)} className="h-8 text-xs font-medium bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell><Input type="text" placeholder="e.g., CEO" value={role.reportsTo || ''} onChange={(e) => handleRoleChange(role.id, 'reportsTo', e.target.value)} className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell>
                                    <Select value={role.departmentId || ''} onValueChange={(val) => handleRoleChange(role.id, 'departmentId', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary"><SelectValue placeholder="Select Dept." /></SelectTrigger>
                                        <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell><Textarea placeholder="Define responsibilities..." value={role.keyResponsibilities || ''} onChange={(e) => handleRoleChange(role.id, 'keyResponsibilities', e.target.value)} className="h-16 text-xs min-h-[40px] resize-y bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)} className="text-destructive hover:text-destructive"><Trash2 size={16}/></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <Button className="mt-4" onClick={handleAddRole}><PlusCircle className="mr-2"/>Add Role</Button>
            </CardContent>
          </Card>
           <Card className="dark:bg-card/80">
            <CardHeader><CardTitle className="text-xl font-headline flex items-center"><Hammer className="mr-2 h-5 w-5 text-primary"/>Build Implementation Tracker (Mock)</CardTitle><CardDescription>Oversee the "Tekking" progress if HeyTek is building parts of your company or product.</CardDescription></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">High-level overview of the implementation plan being executed by Tekkers.</p>
                <div className="space-y-3">
                    {tekkingProgress.slice(0,4).map(item => (
                        <div key={item.week}>
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Phase {item.week}: {item.task} <Badge variant={item.status === "Completed" ? "default" : "secondary"} className={`ml-1 text-[10px] ${item.status === "Completed" ? "bg-green-500 text-white" : ""}`}>{item.status}</Badge></span>
                                <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2 mt-1 [&>div]:bg-primary" />
                        </div>
                    ))}
                </div>
                <Button variant="link" className="p-0 h-auto text-primary mt-3" onClick={() => alert("This would show the full Tekker implementation plan and communication channel.")}>View Full Implementation Plan & Communicate (Mock)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company_assets" className="mt-6 space-y-6">
          <Card className="dark:bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center"><FolderKanban className="mr-2 h-5 w-5 text-primary"/>Company Asset Organizer</CardTitle>
              <CardDescription>Browse your AI-organized company folder structure. HeyTek creates and manages this to keep your assets streamlined. (Conceptual UI)</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyFolderTree structure={folderStructure} onFileClick={handleFileClick} />
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Sparky can help you find documents or generate new ones directly into this structure in the future!</p>
                <Button variant="outline" onClick={() => toast({title: "AI Organization (Soon!)", description: "AI-powered folder structure generation and asset management is coming soon."})}>
                  <Sparkles className="mr-2 h-4 w-4"/> Let AI Re-organize Folders (Mock)
                </Button>
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">This folder tree is a visual representation. Actual file system integration is a future enhancement.</p>
            </CardFooter>
          </Card>
           <Card className="dark:bg-card/80">
            <CardHeader><CardTitle className="text-xl font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Company Documentation Hub</CardTitle><CardDescription>Manage SOPs, guides, contracts, and other essential documents. AI can help generate templates.</CardDescription></CardHeader>
            <CardContent>
                {(['SOPs', 'Guides', 'Contracts', 'Onboarding', 'IP Protection', 'Financial', 'Marketing_Plans'] as Document['category'][]).map(category => (
                    <div key={category} className="mb-4">
                        <h4 className="font-semibold mb-2 text-md text-muted-foreground">{category.replace(/_/g, ' ')}</h4>
                        {documents.filter(d => d.category === category).map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md mb-1 text-sm hover:bg-muted/30">
                                <Input type="text" value={doc.name} onChange={(e) => handleDocumentChange(doc.id, 'name', e.target.value)} className="h-7 text-xs flex-1 bg-transparent border-transparent hover:border-border focus:border-primary mr-2"/>
                                <span className="text-xs text-muted-foreground">(v{doc.version || '1.0'} - {doc.uploadedDate})</span>
                                <div>
                                    <Button variant="ghost" size="sm" onClick={() => alert(`Download ${doc.name}`)}><Download size={14}/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)} className="text-destructive hover:text-destructive"><Trash2 size={14}/></Button>
                                </div>
                            </div>
                        ))}
                         <div className="flex gap-2 mt-1">
                            <Button variant="outline" size="sm" onClick={() => handleAddDocument(category)}><Upload className="mr-2" size={14}/>Upload New to {category.replace(/_/g, ' ')}</Button>
                            <Button variant="outline" size="sm" onClick={() => alert(`AI will help generate a template for ${category.replace(/_/g, ' ')}!`)} className="text-primary border-primary hover:bg-primary/10"><Sparkles className="mr-2" size={14}/>Generate {category.replace(/_/g, ' ')} Template (AI)</Button>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>
           <Card className="dark:bg-card/80">
            <CardHeader><CardTitle className="text-xl font-headline flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>Compliance & Legal Dashboard</CardTitle><CardDescription>Track key compliance items. AI can help identify requirements for your industry and region.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
                {complianceItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/30">
                        <Checkbox id={`compliance-${item.id}`} checked={item.isCompliant} onCheckedChange={() => handleComplianceToggle(item.id)} className="mt-1"/>
                        <div className="flex-1">
                            <Input type="text" value={item.name} onChange={(e) => handleComplianceItemChange(item.id, 'name', e.target.value)} className={`h-8 text-sm ${item.isCompliant ? 'line-through text-muted-foreground' : 'font-medium'} bg-transparent border-border/50 hover:border-primary/50 focus:border-primary`}/>
                            <Input type="text" placeholder="Details..." value={item.details || ''} onChange={(e) => handleComplianceItemChange(item.id, 'details', e.target.value)} className="h-7 text-xs mt-1 bg-transparent border-border/50 hover:border-primary/50 focus:border-primary"/>
                            <Input type="text" placeholder="Due Date (YYYY-MM-DD)" value={item.dueDate || ''} onChange={(e) => handleComplianceItemChange(item.id, 'dueDate', e.target.value)} className="h-7 text-xs mt-1 w-1/2 bg-transparent border-border/50 hover:border-primary/50 focus:border-primary"/>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-primary hover:text-primary/80" onClick={() => alert(`AI details for ${item.name}`)}>AI Insights</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteComplianceItem(item.id)} className="text-destructive hover:text-destructive"><Trash2 size={16}/></Button>
                    </div>
                ))}
                 <Button className="mt-4" onClick={handleAddComplianceItem}><PlusCircle className="mr-2"/>Add Compliance Item</Button>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="team_access" className="mt-6 space-y-6">
            <Card className="dark:bg-card/80">
                <CardHeader><CardTitle className="text-xl font-headline flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary"/>Team Management</CardTitle><CardDescription>Build and manage your core team. AI can suggest roles needed based on your company stage.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role / Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {teamMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell><Input type="text" value={member.name} onChange={e => handleTeamMemberChange(member.id, 'name', e.target.value)} className="h-8 text-xs font-medium bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                    <TableCell><Input type="email" value={member.email} onChange={e => handleTeamMemberChange(member.id, 'email', e.target.value)} className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                    <TableCell><Input type="text" value={member.roleTitle} onChange={e => handleTeamMemberChange(member.id, 'roleTitle', e.target.value)} className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary" /></TableCell>
                                    <TableCell>
                                      <Select value={member.status || ''} onValueChange={(val: 'Active' | 'Invited' | 'Inactive') => handleTeamMemberChange(member.id, 'status', val)}>
                                        <SelectTrigger className="h-8 text-xs bg-transparent border-border/50 hover:border-primary/50 focus:border-primary"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Active">Active</SelectItem>
                                          <SelectItem value="Invited">Invited</SelectItem>
                                          <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTeamMember(member.id)} className="text-destructive hover:text-destructive"><Trash2 size={16}/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button className="mt-4" onClick={handleAddTeamMember}><PlusCircle className="mr-2"/>Add Team Member</Button>
                </CardContent>
            </Card>
            <Card className="dark:bg-card/80">
                <CardHeader><CardTitle className="text-xl font-headline flex items-center"><Construction className="mr-2 h-5 w-5 text-primary"/>Tekker Collaboration (Placeholder)</CardTitle><CardDescription>Manage access and collaboration with HeyTek Tekkers implementing your Builds.</CardDescription></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Assign Tekkers to specific Builds, share necessary documentation (from your Company Assets), and monitor progress. (Feature coming soon)</p>
                    <Button className="mt-2" variant="outline" disabled>Invite Tekker to Build (Mock)</Button>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
             <Card className="dark:bg-card/80">
                <CardHeader><CardTitle className="text-xl font-headline flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Subscription Plan</CardTitle><CardDescription>Manage your HeyTek platform subscription.</CardDescription></CardHeader>
                <CardContent>
                    <p><strong>Current Plan:</strong> HeyTek Company Builder Pro (Mock)</p>
                    <p><strong>Billing:</strong> Monthly ($199.00/month)</p>
                    <p><strong>Next Billing Date:</strong> August 1, 2024</p>
                    <Button className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Upgrade Plan (Mock)</Button>
                </CardContent>
            </Card>
            <Card className="dark:bg-card/80">
                <CardHeader><CardTitle className="text-xl font-headline flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Invoices & Payments</CardTitle><CardDescription>View your HeyTek subscription invoices and Tekker payment history.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {invoices.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.date}</TableCell>
                                    <TableCell>{inv.description || "N/A"}</TableCell>
                                    <TableCell>{inv.amount}</TableCell>
                                    <TableCell><Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Pending' ? 'secondary' : 'destructive'} className={inv.status === 'Paid' ? 'bg-green-500 text-white dark:bg-green-600' : ''}>{inv.status}</Badge></TableCell>
                                    <TableCell className="text-right"><Button variant="link" size="sm" className="text-primary p-0 h-auto">Download PDF</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <Button className="mt-4" onClick={() => alert('Generate Payment Report')}><FileText className="mr-2"/>Generate Report (Mock)</Button>
                </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="investor_mode" className="mt-6 space-y-6">
            <Card className="dark:bg-card/80">
                <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Investor Mode Activation</CardTitle>
                </CardHeader>
                <CardContent>
                    {!isFounderInvestor() ? (
                        <>
                            <p className="text-muted-foreground mb-3">As a Founder, you can also activate an Investor profile to explore opportunities, manage personal investments, and see your own company from an investor's perspective.</p>
                            <Button onClick={handleActivateInvestor} className="bg-primary hover:bg-primary/80 text-primary-foreground">
                                <Sparkles className="mr-2 h-4 w-4"/> Activate Investor Profile
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-3">Your Investor profile is active! Use your profile menu in the header to switch to your Investor Dashboard, or click below.</p>
                            <p className="text-sm text-muted-foreground mb-3">Your Investor ID (mock): <Badge variant="secondary">{user?.investorId || "N/A"}</Badge></p>
                            <Button onClick={() => router.push('/investor-dashboard')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Eye className="mr-2 h-4 w-4"/> Go to Investor Dashboard
                            </Button>
                        </>
                    )}
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">Activating Investor Mode is a mock feature. A real platform might have verification or subscription requirements.</p>
                </CardFooter>
            </Card>
             {isFounderInvestor() && startupNameForDisplay && startupNameForDisplay !== "Your Startup" && (
                <Card className="dark:bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-headline flex items-center"><Eye className="mr-2 h-5 w-5 text-primary"/>Your Company as an Investment (Mock)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">See how <strong className="text-primary">{startupNameForDisplay}</strong> might appear to other investors.</p>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                            <li>Industry: (AI derived from your idea)</li>
                            <li>Stage: {currentStageText}</li>
                            <li>Funding Ask: {authOnboardingData?.founderSetup?.fundingGoal || (ideaSummary ? '(Based on Idea)' : 'Not yet defined.')}</li>
                            <li>Summary: {ideaSummary || "Not yet defined."}</li>
                        </ul>
                        <Button variant="link" className="p-0 h-auto text-accent mt-2" onClick={() => toast({title: "Coming Soon!", description:"Detailed investor preview of your company is planned."})}>
                            View Full Investor Preview (Mock)
                        </Button>
                    </CardContent>
                </Card>
             )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow dark:bg-card/80">
            <CardHeader>
                <CardTitle className="text-md font-medium flex items-center"><MessageSquareHeart className="h-5 w-5 text-muted-foreground dark:text-foreground/70 mr-2" />Founder's Wisdom (Daily Tip)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-md font-semibold text-foreground dark:text-foreground/90">{dynamicTip.split(':')[0]}</div>
                <p className="text-xs text-muted-foreground dark:text-foreground/60">
                {dynamicTip.includes(':') ? dynamicTip.substring(dynamicTip.indexOf(':')+1).trim() : "Keep building!"}
                </p>
            </CardContent>
        </Card>
        {notificationsArray.length > 0 && (
            <Alert className="bg-card dark:bg-card/80 border-border hover:shadow-md transition-shadow">
            <Bell className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">Key Notifications</AlertTitle>
            {notificationsArray.map((note, index) => (
                <AlertDescription key={index} className="mt-1 text-muted-foreground dark:text-foreground/80 text-sm">{note}</AlertDescription>
            ))}
            </Alert>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 font-headline text-foreground dark:text-foreground/90">Development & Branding Tools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {devTools.map((tool) => (
            <Card key={tool.href} className="hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] flex flex-col border-muted-foreground/20 dark:bg-card/80 dark:border-border">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                 <div className={`p-3 rounded-lg bg-muted dark:bg-secondary ${tool.color}/20`}>
                    <tool.icon className={`h-7 w-7 ${tool.color}`} />
                  </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground dark:text-foreground/90">{tool.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground dark:text-foreground/70">{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20 group">
                  <Link href={tool.href}>Explore {tool.title} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

    