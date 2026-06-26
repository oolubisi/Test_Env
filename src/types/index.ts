/* ───────────────────────────────────────────
   FieldScan Pro — Type Definitions
   ─────────────────────────────────────────── */

export interface Project {
  projectId: string;
  clientName: string;
  siteLocation: string;
  clientPhone: string;
  clientEmail: string;
  projectStatus: string;
  scope: string;
  contractSubtotal: number;
  notes: string;
  lastModified: string;
}

export interface TakeOffItem {
  itemId: string;
  projectId: string;
  roomArea: string;
  tradeCategory: string;
  description: string;
  quantity: number;
  unit: string;
  beforePhotoUrl: string;
  scopeNotes: string;
  lastModified: string;
}

export interface ProgressLog {
  logId: string;
  projectId: string;
  tradeCategory: string;
  completionPercentage: number;
  commentNarrative: string;
  progressPhotoUrl: string;
  dateRecorded: string;
  lastModified: string;
}

export interface Snag {
  snagId: string;
  projectId: string;
  notes: string;
  photoUrl: string;
  assigned: string;
  dateLogged: string;
  dateCompleted: string;
  status: string;
  lastModified: string;
}

export interface Vendor {
  vendorId: string;
  company: string;
  trade: string;
  contactName: string;
  phone1: string;
  phone2: string;
  email: string;
  passport: string;
  attachments: string;
  archived: string;
  lastModified: string;
}

export interface WorkOrder {
  workOrderId: string;
  projectId: string;
  vendorId: string;
  description: string;
  amount: number;
  status: string;
  attachments: string;
  dateCreated: string;
  lastModified: string;
}

export interface Payment {
  paymentId: string;
  projectId: string;
  paymentDate: string;
  paymentDirection: string;
  payee: string;
  expenseCategory: string;
  referenceId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  stage: string;
  totalInvoice: number;
  paymentGroupId: string;
  notes: string;
  attachments: string;
  lastModified: string;
}

export interface Variation {
  variationId: string;
  projectId: string;
  variationNumber: string;
  date: string;
  title: string;
  status: string;
  lineItems: string;
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
  approvedBy: string;
  lastModified: string;
}

export interface TakeOff {
  takeOffId: string;
  projectId: string;
  title: string;
  lineItems: string;
  notes: string;
  date: string;
  lastModified: string;
}

export interface AppCache {
  projects: Project[];
  takeoffs: TakeOffItem[];
  progressLogs: ProgressLog[];
  snags: Snag[];
  vendors: Vendor[];
  workorders: WorkOrder[];
  payments: Payment[];
  variations: Variation[];
  takeOffs: TakeOff[];
  settings: Settings;
  [key: string]: unknown;
}

export interface Settings {
  VAT: number;
  WHT: number;
  Logo: string;
  Name_Signed: string;
  Sign_Signed: string;
  [key: string]: string | number;
}

/* ─── API response types ─── */

export interface ApiResponse {
  status: string;
  data?: unknown;
  message?: string;
  [key: string]: unknown;
}

export interface QueuedRequest {
  id?: number;
  action: string;
  data: Record<string, unknown>;
  timestamp: number;
}

/* ─── UI helper types ─── */

export type PaymentDirection = "out" | "in" | "";

export interface SignatureOptions {
  name?: string;
  signImage?: string;
  date?: string;
}

export interface PageOptions {
  title?: string;
  subtitle?: string;
  date?: string;
  signature?: SignatureOptions;
  hideFooter?: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  content: string;
  builtIn: boolean;
}
