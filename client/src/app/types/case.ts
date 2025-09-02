// types/case.ts

export interface CaseDocument {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  caseId: number;
}

export interface CaseClient {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string | null;
}

export interface CaseLawyer {
  id: number;
  name: string;
  email: string;
}

export interface Case {
  id: number;
  title: string;
  caseNumber: string;
  caseType?: string;
  status: "Open" | "Closed" | "On Hold" | "Appeal";
  openedAt: string;
  closedAt?: string | null;
  description?: string;
  firmId: number,
  // associations
  client: CaseClient;
  lawyers: CaseLawyer[];
  documents: CaseDocument[];
}




