export interface PlatformData {
  totalFirms: number;
  totalLawyers: number;
  totalClients: number;
  totalCases: number;
  activeFirms: number;
  activeLawyers: number;
  openCases: number;
  closedCases: number;
  successRate: number;
  clientSatisfaction: number;
  monthlyRevenue?: number; 
  monthlyGrowth?:number
}

export interface PlatformOverview {
  successRate?: number;
  clientSatisfaction?: number;
  monthlyRevenue?: number;
  monthlyGrowth?: number;
}

export interface GrowthData {
  month: string;
  [key: string]: number | string;
}

export interface CaseStats {
  month: string;
  open: number;
  closed: number;
  total: number;
}

export interface SubscriptionData {
  plan: string;
  count: number;
  revenue: number;
}

export interface PerformanceData {
  category: string;
  rate: number;
}