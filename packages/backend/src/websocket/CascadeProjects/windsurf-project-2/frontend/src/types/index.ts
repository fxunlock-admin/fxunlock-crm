export type UserRole = 'ADMIN' | 'STAFF' | 'VIEWER';
export type AffiliateStatus = 'ACTIVE' | 'PAUSED' | 'TERMINATED';
export type DealType = 'CPA' | 'PNL' | 'HYBRID' | 'REBATES';
export type CommissionStatus = 'PENDING' | 'PAID';
export type NoteType = 'CALL' | 'MEETING' | 'EMAIL' | 'GENERAL';

export interface CPATier {
  tierName: string;
  depositAmount: number;
  cpaAmount: number;
}

export interface CPADealDetails {
  ftdsPerMonth: number;
  cpaTiers: CPATier[];
  expectedROI: number;
  additionalNotes?: string;
}

export interface RebatesDealDetails {
  netDepositsPerMonth: number;
  expectedVolumePerMonth: number;
  rebatesPerLot: number;
  additionalNotes?: string;
}

export interface HybridDealDetails {
  netDepositsPerMonth: number;
  expectedVolumePerMonth: number;
  cpaTiers: CPATier[];
  rebatesPerLot: number;
  additionalNotes?: string;
}

export interface PNLDealDetails {
  netDepositsPerMonth: number;
  pnlDealNeeded: string;
  additionalNotes?: string;
}

export type DealDetails = CPADealDetails | RebatesDealDetails | HybridDealDetails | PNLDealDetails;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Broker {
  id: string;
  name: string;
  accountManager?: string;
  contactEmail?: string;
  contactPhone?: string;
  agreementDate?: string;
  renewalDate?: string;
  dealTypes?: string; // Comma-separated string: "CPA,REBATES,HYBRID,PNL"
  masterDealTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    affiliates: number;
    commissions: number;
  };
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  region?: string;
  country?: string;
  trafficRegion?: string; // Asia, Europe, North America, South America, Africa, Oceania
  trafficTypes?: string; // Comma-separated string
  dealType: DealType;
  dealTerms?: string;
  dealDetails?: string; // JSON string
  status: AffiliateStatus;
  startDate: string;
  renewalDate?: string;
  source?: string; // Who introduced this affiliate
  website?: string; // Social: Website URL
  instagram?: string; // Social: Instagram handle
  telegram?: string; // Social: Telegram handle
  x?: string; // Social: X (Twitter) handle
  notes?: string;
  brokerId: string;
  managerId: string;
  broker?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    commissions: number;
  };
}

export interface Commission {
  id: string;
  month: number;
  year: number;
  dealType: DealType;
  revenueAmount: number;
  status: CommissionStatus;
  paidDate?: string;
  notes?: string;
  affiliateId: string;
  brokerId: string;
  staffMemberId?: string;
  affiliate?: {
    id: string;
    name: string;
    email: string;
  };
  broker?: {
    id: string;
    name: string;
  };
  staffMember?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalBrokers: number;
  totalCommissions: number;
  pendingCommissions: number;
  totalRevenue: number;
  pendingRevenue: number;
  paidRevenue: number;
}

export interface RevenueData {
  period: string;
  total: number;
  paid: number;
  pending: number;
  byDealType: {
    CPA: number;
    IB: number;
    PNL: number;
  };
}

export interface TopAffiliate {
  affiliate: Affiliate;
  totalRevenue: number;
  commissionCount: number;
}

export interface BrokerPerformance {
  broker: Broker;
  totalRevenue: number;
  commissionCount: number;
  affiliateCount: number;
}

export interface StaffPerformance {
  staff: User;
  affiliateCount: number;
  activeAffiliateCount: number;
  totalRevenue: number;
  commissionCount: number;
}

export interface AffiliateNote {
  id: string;
  content: string;
  noteType: NoteType;
  affiliateId: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
