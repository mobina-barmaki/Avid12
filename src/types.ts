export type PageId =
  | 'dashboard'
  | 'inventory'
  | 'asset_structure'
  | 'calendar'
  | 'tasks'
  | 'messages'
  | 'documents'
  | 'education'
  | 'calibration'
  | 'failures'
  | 'purchase_requests'
  | 'smart_cart'
  | 'vendors'
  | 'reports'
  | 'users'
  | 'my_workgroup'
  | 'settings';

export type PermissionLevel = 'none' | 'view' | 'action';

export interface CategoryApprovalStep {
  roleCode: string;
  roleTitleFa: string;
}

export type AssetFieldType = 'text' | 'number' | 'select' | 'boolean' | 'date' | 'file' | 'image';

export interface AssetRequirementField {
  id: string;
  name: string;
  type: AssetFieldType;
  required: boolean;
  helpText?: string;
  options?: string[];
  order: number;
  assignedRole?: string; // e.g. 'warehouse_keeper' | 'procurement_officer' | 'biomedical_engineer' | 'finance_manager' | 'dept_head'
  assignedRoleTitleFa?: string; // e.g. 'انباردار' | 'مسئول خرید' | 'مهندس پزشکی' | 'مدیر مالی' | 'سرپرست بخش'
}

export interface AssetClassification {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  parentName?: string;
  itemsCount: number;
  isActive: boolean;
  isCustom?: boolean; // آیا این ساختار سفارشی بیمارستان است یا پیش‌فرض مرجع
  level?: 'Category' | 'Subcategory' | 'Type' | string;
  domain?: 'medical' | 'laboratory' | 'hospital' | 'dental' | 'consumables' | 'general_hospital' | 'it' | 'facilities' | 'administrative' | 'custom'; // قلمرو ساختار
  code?: string; // کد رده‌بندی یا استاندارد مرجع
  path?: string; // مسیر کامل سلسله‌مراتبی
  icon?: string;
  isLeaf?: boolean; // آیا این رده، ساختار نهایی جهت ثبت موجودی است
  createdAt: string;
  updatedAt: string;
  fields: AssetRequirementField[];
  defaultFieldsBackup?: AssetRequirementField[]; // پشتیبان فیلدهای استاندارد جهت امکان بازنشانی
  approvalChain?: CategoryApprovalStep[];
}

export type EquipmentStatus =
  | 'active' // فعال و آماده به کار
  | 'in_use' // در حال استفاده
  | 'under_maintenance' // در حال تعمیر
  | 'calibrating' // در حال کالیبراسیون
  | 'idle' // بلااستفاده / آماده واگذاری
  | 'decommissioned' // اسقاط شده / خارج از رده
  | 'in_stock' // موجود در انبار
  | 'low_stock' // کمبود موجودی
  | 'out_of_stock' // ناموجود / تمام شده
  | 'expired' // منقضی شده
  | 'near_expiry' // در شرف انقضا
  | 'draft'; // پیش‌نویس

export type ItemKind = 'device' | 'consumable';

export interface EquipmentAssignmentRecord {
  id: string;
  userId: string;
  userName: string;
  userRoleFa: string;
  userPersonnelCode?: string;
  department: string;
  assignedDate: string;
  endDate?: string;
  status: 'active' | 'temporary' | 'ended' | 'transferred';
  assignedBy: string;
  assignedByRole: string;
  notes?: string;
}

export interface DailyCareChecklistItem {
  id: string;
  title: string;
  category?: 'visual' | 'hygiene' | 'electrical' | 'functional' | 'custom';
  required?: boolean;
}

export interface OperatorDailyCareLog {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  date: string;
  time: string;
  operatorId?: string;
  operatorName: string;
  operatorRole: string;
  shift: 'morning' | 'evening' | 'night';
  visualCheckPassed: boolean;
  cleaningPerformed: boolean;
  cablesAndAccessoriesChecked: boolean;
  powerAndBatteryChecked: boolean;
  generalConditionStatus: 'excellent' | 'normal' | 'needs_attention' | 'fault_suspected';
  notes?: string;
  checklistItems?: { id?: string; title: string; done: boolean }[];
}

export type ActivityActionType =
  | 'daily_care_completed'
  | 'daily_checklist_customized'
  | 'fault_reported'
  | 'repair_completed'
  | 'calibration_completed'
  | 'equipment_assigned'
  | 'asset_transferred'
  | 'inventory_registered'
  | 'draft_finalized'
  | 'qr_code_generated'
  | 'qr_label_printed'
  | 'comment_added'
  | 'stock_restocked'
  | 'status_changed';

export interface PanelActivityLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  userRoleFa: string;
  userPersonnelCode?: string;
  userDepartment?: string;
  actionType: ActivityActionType;
  actionTitleFa: string;
  detailsFa: string;
  equipmentId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  department?: string;
  metadata?: Record<string, any>;
  isAuditOnly?: boolean;
}

export interface RepairPartItem {
  id: string;
  partName: string;
  partNumber?: string;
  condition: 'معیوب' | 'مستهلک' | 'آسیب‌دیده' | 'سالم و تنظیم‌شده';
  action: 'تعویض شد' | 'تعمیر شد' | 'تنظیم و سرویس شد' | 'کالیبره شد';
  quantity?: number;
  cost?: number;
  notes?: string;
}

export type FinalEquipmentStatus =
  | 'ready_for_service' // آماده به کار
  | 'ready_with_limitation' // آماده به کار با محدودیت
  | 'needs_further_repair' // نیازمند تعمیر بیشتر
  | 'needs_parts_procurement' // نیازمند تأمین قطعه
  | 'out_of_service' // خارج از سرویس
  | 'decommissioned'; // غیرقابل استفاده / اسقاط

export interface EquipmentRepairRecord {
  id: string;
  repairNo: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  assignedOperator?: string;
  department: string;
  
  // Originating fault report info
  faultReportId?: string;
  faultReportNo?: string;
  faultReportDate?: string;
  faultType?: string;
  faultDescription?: string;
  faultObservedConditions?: string;
  faultInitialActions?: string;
  faultReporterName?: string;

  // Technical Diagnosis by Biomedical Engineer
  probableCause: string; // احتمالی علت خرابی
  finalDiagnosis: string; // تشخیص نهایی
  severity: 'minor' | 'moderate' | 'critical' | 'overhaul'; // شدت خرابی
  deliveryCondition: string; // وضعیت تجهیز هنگام تحویل برای تعمیر

  // Actions Performed
  actionsDescription: string; // شرح اقدامات انجام‌شده
  repairedComponents?: string; // قطعات تعمیرشده
  replacedComponents?: string; // قطعات تعویض‌شده
  calibrationsAndAdjustments?: string; // تنظیمات انجام‌شده
  testsPerformed?: string; // تست‌ها و بررسی‌های انجام‌شده
  toolsUsed?: string; // ابزار یا تجهیزات مورد استفاده
  
  partsList: RepairPartItem[]; // لیست قطعات

  // Engineer & Dates
  engineerId?: string;
  engineerName: string;
  startDate: string;
  endDate: string;
  returnToServiceDate?: string;

  // Final Technical Result & Tests
  finalStatus: FinalEquipmentStatus;
  finalTestResult: 'pass' | 'conditional_pass' | 'failed' | 'pending';
  functionalTestNotes?: string; // تست عملکرد
  electricalSafetyTestNotes?: string; // تست ایمنی الکتریکی/مکانیکی
  engineerRemarks?: string; // توضیحات کارشناس
  
  // Workflows (Digital vs Printed Scan Upload)
  completionType: 'digital' | 'scanned_upload' | 'both';
  printedFormGeneratedAt?: string;
  uploadedDocumentUrl?: string;
  uploadedDocumentName?: string;
  uploadedAt?: string;
}

export interface CalibrationMeasurementParam {
  id: string;
  parameter: string; // نام پارامتر / متغیر
  beforeValue: string; // مقدار قبل از تنظیم
  referenceValue: string; // مقدار مرجع استاندارد
  afterValue: string; // مقدار بعد از تنظیم
  tolerance?: string; // رواداری مجاز
  result: 'قبول' | 'مردود' | 'نیاز به تنظیم'; // نتیجه
}

export type FinalCalibrationResult =
  | 'pass' // قبول
  | 'conditional_pass' // قبول با محدودیت
  | 'failed' // مردود
  | 'needs_adjustment_repair'; // نیازمند تنظیم / تعمیر

export interface MaintenanceRecord {
  id: string;
  pmNo: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  date: string;
  type: 'periodic_pm' | 'visual_inspection' | 'electrical_safety' | 'overhaul';
  engineerName: string;
  interval: string;
  tasksCompleted: { taskName: string; passed: boolean; remarks?: string }[];
  overallResult: 'pass' | 'needs_followup' | 'failed';
  nextDueDate: string;
  notes?: string;
}

export interface EquipmentComment {
  id: string;
  authorName: string;
  authorRole: string;
  department?: string;
  date: string;
  commentType: 'operational_note' | 'usability' | 'shift_handover' | 'general';
  rating?: number; // 1 to 5
  text: string;
}

export type OperatorFeedbackOverallCondition =
  | 'optimal' // عالی و پایدار
  | 'normal' // عادی و مطلوب
  | 'needs_attention' // نیازمند پایش و بررسی
  | 'needs_cleaning' // نیازمند نظافت و ضدعفونی
  | 'degraded_performance'; // افت کارایی / عملکرد ضعیف

export type OperatorFeedbackType =
  | 'performance_optimal' // عملکرد دستگاه مناسب است
  | 'performance_degraded' // عملکرد دستگاه ضعیف شده
  | 'abnormal_noise' // دستگاه صدای غیرعادی دارد
  | 'needs_inspection' // دستگاه نیاز به بررسی دارد
  | 'poor_appearance' // وضعیت ظاهری مناسب نیست
  | 'needs_cleaning' // نیاز به نظافت دارد
  | 'unusual_observation' // یک مورد غیرعادی مشاهده شده
  | 'usage_suggestion' // پیشنهاد یا توضیح برای استفاده بهتر
  | 'custom';

export interface OperatorFeedbackItem {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName?: string;
  operatorId: string;
  operatorName: string;
  operatorRole?: string;
  operatorDepartment?: string;
  date: string;
  time?: string;
  overallCondition: OperatorFeedbackOverallCondition;
  feedbackType: OperatorFeedbackType;
  feedbackTypeLabel?: string;
  comment: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file';
}

export interface FieldContribution {
  id: string;
  fieldName: string;
  fieldLabel: string;
  value: any;
  responsibleRole?: string;
  responsibleRoleTitleFa?: string;
  completedByUserId?: string;
  completedByUserName: string;
  completedByUserRoleFa: string;
  completedAt: string;
}

export interface EquipmentItem {
  id: string;
  code: string; // e.g. EQ-1042
  faName: string;
  enName: string;
  category: string; // Level 1 (Category)
  subcategory?: string; // Level 2 (Subcategory)
  type?: string; // Level 3 (Type)
  classificationPath?: string; // Full Breadcrumb: Category > Subcategory > Type
  brand: string;
  model: string;
  department: string;
  location: string;
  status: EquipmentStatus;
  itemKind?: ItemKind;
  purchaseDate: string;
  price: number; // Toman
  serialNumber: string;
  warrantyExpiry: string;
  nextCalibrationDate: string;
  safetyScore: number; // 0 - 100
  owner: string; // Asset Manager / Owner
  hasQrTag?: boolean; // آیا این قلم دارای پلاک و برچسب فیزیکی QR کد است
  qrGeneratedAt?: string;
  
  // Assignment & Operator Responsibility
  assignedOperator?: string;
  assignedOperatorId?: string;
  authorizedOperators?: string[];
  assignmentDate?: string;
  assignmentEndDate?: string;
  assignmentStatus?: 'active' | 'temporary' | 'ended' | 'transferred';
  assignmentNotes?: string;
  assignmentHistory?: EquipmentAssignmentRecord[];
  
  // Technical & Lifecycle History Records
  repairHistory?: EquipmentRepairRecord[];
  dailyCareLogs?: OperatorDailyCareLog[];
  dailyCareChecklist?: DailyCareChecklistItem[];
  customDailyChecklist?: string[];
  checklistExecutionHistory?: ChecklistExecutionRecord[];
  maintenanceHistory?: MaintenanceRecord[];
  operatorFeedbacks?: OperatorFeedbackItem[];

  specs?: Record<string, string>;
  documents?: { title: string; url: string; date: string }[];
  comments?: EquipmentComment[];
  isDraft?: boolean;
  registrationProgressStatus?: 'draft' | 'in_progress' | 'ready_to_finalize' | 'finalized';
  contributionsHistory?: FieldContribution[];
  quantity?: number;
  unit?: string;
  batchNo?: string;
  expiryDate?: string;
  supplier?: string;
  creator?: string;
  createdAt?: string;
  missingFields?: string[];
  groupKey?: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  isChecked: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TaskEvent {
  id: string;
  title: string;
  type:
    | 'calibration'
    | 'expiry'
    | 'inspection'
    | 'purchase'
    | 'maintenance'
    | 'inventory_audit'
    | 'tagging'
    | 'stock_check'
    | 'asset_transfer'
    | 'draft_completion'
    | 'daily_checklist';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  role: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'completed';
  autoGenerated: boolean;
  equipmentCode?: string;
  equipmentName?: string;
  targetDraftId?: string;
  notes?: string;

  // Daily recurring checklist support
  isDailyRecurring?: boolean;
  recurrence?: 'daily' | 'shift' | 'weekly' | 'none';
  renewalSchedule?: string; // e.g. 'هر روز ساعت ۰۸:۰۰ صبح' یا 'شروع هر شیفت'
  lastRenewedDate?: string;
  checklistItems?: TaskChecklistItem[];
  department?: string;
  createdByUserId?: string;
  createdByName?: string;
}

export interface CustomEquipmentFilterCriteria {
  departments?: string[];
  statuses?: EquipmentStatus[];
  categories?: string[];
  brands?: string[];
  itemKind?: ItemKind | 'all';
  hasWarrantyOnly?: boolean;
  requiresCalibration?: boolean;
  minSafetyScore?: number;
  maxSafetyScore?: number;
  searchKeyword?: string;
}

export interface CustomEquipmentFilter {
  id: string;
  name: string;
  description?: string;
  color?: 'sky' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo' | 'slate';
  icon?: string;
  criteria: CustomEquipmentFilterCriteria;
  createdBy: string;
  creatorRole?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  assignedOperator?: string;
  department?: string;

  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  reason?: 'periodic' | 'post_repair' | 'clinical_request' | 'annual';
  calibrationInterval?: string;
  previousCalibrationDate?: string;
  nextCalibrationDate?: string;
  calibrationMethodStandard?: string;
  agency: string;
  inspector: string;
  
  measurements?: CalibrationMeasurementParam[];
  finalResult?: FinalCalibrationResult;
  safetyNotes: string;
  operatorFeedback: string;
  documentUrl?: string;
  uploadedFormUrl?: string;
  uploadedFormName?: string;
  completionType?: 'digital' | 'scanned_upload' | 'both';
  isSigned?: boolean;
}

export interface FailureReport {
  id: string;
  reportNo: string;
  equipmentId?: string;
  equipmentCode: string;
  equipmentName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  department: string;
  location?: string;
  assignedOperator?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reporterId?: string;
  reporterName: string;
  reporterRole: string;
  reportDate: string;
  faultType?: string;
  defectDescription: string;
  observedConditions?: string;
  initialActionsTaken?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  imageUrl?: string;
  photoUrl?: string;
  images?: string[];
  status: 'reported' | 'assigned' | 'in_repair' | 'resolved';
  technicianAssigned?: string;
  actionsTaken?: string;
  resolvedDate?: string;
  repairRecordId?: string;
  calibrationRecordId?: string;
}

export interface RequestItem {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
}

export interface PurchaseRequest {
  id: string;
  requestNo: string;
  department: string;
  requesterName: string;
  requesterRole: string;
  requesterRoleKey?: UserRole; // 'asset_manager' vs operational roles ('nurse_operator', 'dept_head', 'biomedical_engineer', etc.)
  urgency: 'critical' | 'high' | 'normal';
  date: string;
  reason: string;
  items: RequestItem[];
  totalEstimate: number;
  status:
    | 'pending_asset_manager'
    | 'pending_finance'
    | 'pending_procurement'
    | 'approved'
    | 'rejected'
    | 'purchased'
    | 'pending_dept_head'
    | 'pending_equipment_manager';
  approvalStage: number; // 1: created, 2: asset_manager / finance, 3: finance / procurement, 4: cart / approved
  totalStages?: number; // 3 for asset_manager initiated, 4 for operational user initiated
  comments: { user: string; role: string; text: string; date: string; action: string }[];
}

export interface SmartCartItem {
  id: string;
  equipmentName: string;
  category: string;
  brand: string;
  vendorName: string;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  shippingCost: number;
  discountPercentage: number;
  recommendationReason: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  strategyTag: 'optimized' | 'discount' | 'urgent' | 'low_shipping';
}

export type CartStrategy = 'optimized' | 'discount' | 'urgent' | 'low_shipping';

export interface ClosedCartBatch {
  id: string;
  batchCode: string;
  strategy: CartStrategy;
  strategyTitle: string;
  createdAt: string;
  closedBy: string;
  closedByRole: string;
  totalGross: number;
  totalDiscount: number;
  totalShipping: number;
  netTotal: number;
  itemsCount: number;
  items: SmartCartItem[];
  financialStatus: 'pending_review' | 'approved' | 'rejected' | 'partially_approved';
  financeReviewer?: string;
  financeReviewDate?: string;
  financeNote?: string;
  itemDecisions?: Record<string, { approved: boolean; note?: string }>;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  brandRepresentative?: string;
  categories: string[];
  specialty: string;
  contactPerson: string;
  contactRole?: string;
  phone: string;
  mobile?: string;
  email: string;
  address?: string;
  city: string;
  ircLicenseNumber: string;
  ircStatus: 'valid' | 'renewal_pending' | 'expired';
  slaScore: number; // 0-100%
  slaComplianceRate: number; // 0-100%
  responseTimeHours: number; // ساعت پاسخگویی اورژانسی
  warrantySupportMonths: number; // ماه گارانتی
  contractStatus: 'active' | 'expiring_soon' | 'inactive';
  contractExpiry: string; // تاریخ سررسید قرارداد
  activeContractsCount: number;
  rating: number; // 1-5
  priceScore: number; // 1-10
  qualityScore: number; // 1-10
  status: 'active' | 'under_review' | 'inactive';
}

export type UserRole =
  | 'hospital_admin'
  | 'support_tech'
  | 'procurement_officer'
  | 'biomedical_engineer'
  | 'dept_head'
  | 'asset_manager'
  | 'nurse_operator'
  | 'warehouse_keeper'
  | 'finance_manager'
  | string;

export interface SupervisorResponsibilities {
  manageSubPermissions: boolean;
  supervisePerformance: boolean;
  viewActivityStatus: boolean;
  receiveSubNotifications: boolean;
}

export interface RoleDefinition {
  id: string;
  code: UserRole;
  titleFa: string;
  description: string;
  supervisorRoleId?: string;
  supervisorUserId?: string;
  supervisorName?: string;
  supervisorResponsibilities?: SupervisorResponsibilities;
  permissions: string[];
  modulePermissions?: Record<string, PermissionLevel>;
  isCustom?: boolean;
}

export interface EmployeeFeedback {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  date: string;
}

export interface AppUser {
  id: string;
  personnelCode: string;
  username: string;
  password?: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  roleFa: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
  modulePermissions?: Record<string, PermissionLevel>;
  individualOverrides?: Record<string, boolean>; // legacy compatibility
  pagePermissions?: Record<string, { view: boolean; action: boolean }>;
  supervisorId?: string;
  supervisorName?: string;
  supervisorRoleTitle?: string;
  supervisorLevel?: 1 | 2 | 3;
  allowedPages?: PageId[];
  description?: string;
  performanceScore?: number; // 0 - 100
  feedbacks?: EmployeeFeedback[];
  workgroupTasksCount?: number;
  delayedTasksCount?: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'warning' | 'success' | 'danger' | 'info' | 'draft_alert';
  draftId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  createdByUser?: string;
  requiredAction?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; page?: PageId; actionKey?: string }[];
}

export type EducationFileType =
  | 'folder'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'image'
  | 'document'
  | 'presentation'
  | 'archive'
  | 'link'
  | 'structured_guide'
  | 'checklist';

export type ContentScopeLevel =
  | 'equipment'
  | 'type'
  | 'subcategory'
  | 'category'
  | 'unassigned';

export type ContentStatus = 'draft' | 'published' | 'deprecated';

export type ChecklistResponseKind =
  | 'done_not_done' // انجام شد / انجام نشد
  | 'yes_no' // بله / خیر
  | 'pass_fail' // تأیید / عدم تأیید
  | 'numeric' // مقدار عددی
  | 'text' // متن / یادداشت
  | 'single_choice'; // انتخاب از گزینه‌ها

export interface ChecklistItemDefinition {
  id: string;
  order: number;
  title: string;
  description?: string;
  responseType: ChecklistResponseKind;
  options?: string[]; // For single_choice
  unit?: string; // For numeric (e.g. bar, psi, °C, V, mAh)
  minVal?: number;
  maxVal?: number;
  required: boolean;
  safetyNote?: string;
  helpText?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface ChecklistData {
  objective?: string;
  estimatedMinutes?: number;
  safetyPrecautions?: string;
  items: ChecklistItemDefinition[];
}

export interface StructuredGuideSection {
  id: string;
  order: number;
  title: string;
  content: string; // Detailed guide text / instructions
  keyTakeaways?: string[];
  safetyWarning?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'pdf';
}

export interface StructuredGuideData {
  objectives?: string[];
  prerequisites?: string[];
  readingDuration?: string;
  sections: StructuredGuideSection[];
  keyTopics?: string[];
}

export interface ChecklistItemExecutionValue {
  itemId: string;
  status: 'pass' | 'fail' | 'done' | 'not_done' | 'pending' | 'na';
  numericValue?: number;
  textValue?: string;
  choiceValue?: string;
  notes?: string;
  remarks?: string;
}

export interface ChecklistExecutionAnswer {
  itemId: string;
  itemTitle: string;
  responseType: ChecklistResponseKind;
  value: any; // boolean | string | number
  passed: boolean;
  remarks?: string;
}

export interface ChecklistExecutionRecord {
  id: string;
  checklistId: string;
  checklistTitle: string;
  checklistVersion?: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName?: string;
  executorUserId?: string;
  executorUserName?: string;
  executorUserRoleFa?: string;
  date?: string;
  time?: string;
  shift?: 'morning' | 'evening' | 'night' | 'صبح' | 'عصر' | 'شب' | string;
  overallResult?: 'pass' | 'conditional_pass' | 'failed' | 'completed';
  answers?: ChecklistExecutionAnswer[];
  notes?: string;
  completionPercentage?: number;
  
  // Backwards-compatible / alternate field mappings
  performedBy?: string;
  performerRole?: string;
  department?: string;
  executedAt?: string;
  values?: (ChecklistItemExecutionValue | ChecklistExecutionAnswer)[];
  evaluation?: 'pass' | 'conditional_pass' | 'failed' | 'completed' | string;
}

export interface EducationItem {
  id: string;
  name: string;
  type: EducationFileType;
  parentId: string | null; // null for root directory
  size?: string;
  sizeBytes?: number;
  extension?: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  authorRole?: string;
  department?: string;
  description?: string;
  tags?: string[];
  url?: string;
  content?: string;
  duration?: string;
  itemCount?: number; // For folders: count of direct children
  viewCount?: number;
  downloadCount?: number;
  starred?: boolean;
  isSystem?: boolean;
  requiredRole?: string[]; // Allowed roles to access or manage

  // Equipment Linkage & Lifecycle Governance
  status?: ContentStatus; // 'draft' | 'published' | 'deprecated' (default 'published')
  scopeLevel?: ContentScopeLevel; // 'equipment' | 'type' | 'subcategory' | 'category' | 'unassigned'
  targetCategoryId?: string;
  targetCategoryName?: string;
  targetSubcategoryId?: string;
  targetSubcategoryName?: string;
  targetTypeId?: string;
  targetTypeName?: string;
  targetEquipmentId?: string;
  targetEquipmentCode?: string;
  targetEquipmentName?: string;
  linkedAssetId?: string;
  linkedEquipmentCode?: string;
  version?: string;

  // Structured Content Payloads
  checklistData?: ChecklistData;
  guideData?: StructuredGuideData;

  // Comprehensive Audience & Assignment Governance
  assignments?: TrainingAssignment;
  userProgressRecords?: Record<string, UserTrainingProgress>; // keyed by userId
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAINING AUDIENCE & ASSIGNMENT GOVERNANCE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type TrainingAssignmentLevel =
  | 'equipment_type'
  | 'specific_equipment'
  | 'role_workgroup'
  | 'specific_user';

export interface TrainingAssignment {
  // 1. Equipment Type Level (نوع تجهیز)
  targetTypes?: string[];

  // 2. Specific Equipment Level (تجهیز مشخص)
  targetEquipmentIds?: string[];
  targetEquipmentCodes?: string[];
  targetEquipmentNames?: string[];

  // 3. Role or Workgroup Level (نقش یا کارگروه)
  targetRoles?: UserRole[];
  targetWorkgroups?: string[]; // workgroup ids or titles

  // 4. Specific User Level (کاربر مشخص)
  targetUserIds?: string[];
  targetUserNames?: string[];
}

export type TrainingProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserTrainingProgress {
  userId: string;
  userName: string;
  userRole?: string;
  status: TrainingProgressStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  progressPercent?: number;
  lastAccessedAt?: string;
  notes?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CENTRAL NOTIFICATION & ALERT ENGINE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type NotificationEventCategory =
  | 'maintenance'
  | 'preventive_maintenance'
  | 'sla'
  | 'equipment'
  | 'calibration_safety'
  | 'purchasing'
  | 'training_checklist';

export type NotificationEventKey =
  // Maintenance (تعمیرات و نگهداری)
  | 'fault_reported' // ثبت خرابی
  | 'fault_approved' // تأیید خرابی
  | 'workorder_created' // ایجاد Work Order
  | 'workorder_assigned' // تخصیص Work Order
  | 'workorder_status_changed' // تغییر وضعیت Work Order
  | 'fault_resolved' // رفع خرابی
  | 'workorder_closed' // بسته‌شدن Work Order
  // Preventive Maintenance (نگهداری پیشگیرانه PM)
  | 'pm_approaching' // نزدیک‌شدن موعد PM
  | 'pm_due' // سررسید PM
  | 'pm_overdue' // عقب‌افتادن PM
  | 'pm_completed' // تکمیل PM
  // SLA (توافق‌نامه سطح خدمت)
  | 'sla_approaching_breach' // نزدیک‌شدن به نقض SLA
  | 'sla_breached' // نقض SLA
  | 'sla_escalated' // ارجاع بحرانی (Escalation)
  // Equipment (تجهیزات و اموال)
  | 'equipment_status_changed' // تغییر وضعیت تجهیز
  | 'equipment_out_of_service' // خارج‌شدن تجهیز از سرویس
  | 'equipment_assigned' // تخصیص تجهیز به کاربر
  | 'equipment_reassigned' // تغییر تخصیص تجهیز
  | 'equipment_unassigned' // لغو تخصیص تجهیز
  // Calibration & Safety (کالیبراسیون و ایمنی)
  | 'calibration_approaching' // نزدیک‌شدن موعد کالیبراسیون
  | 'calibration_due' // سررسید کالیبراسیون
  | 'calibration_expired' // منقضی‌شدن کالیبراسیون
  | 'safety_incident_logged' // ثبت رویداد مهم ایمنی
  // Purchasing (خرید و تدارکات)
  | 'purchase_request_created' // ایجاد درخواست خرید
  | 'purchase_approval_needed' // نیاز به تأیید درخواست
  | 'purchase_approved' // تأیید درخواست
  | 'purchase_rejected' // رد درخواست
  | 'purchase_status_changed' // تغییر وضعیت خرید
  // Training & Checklist (آموزش و چک‌لیست)
  | 'training_assigned' // اختصاص آموزش جدید
  | 'checklist_assigned' // اختصاص چک‌لیست جدید
  | 'training_checklist_due_soon' // نزدیک‌شدن موعد تکمیل
  | 'checklist_overdue' // عقب‌افتادن چک‌لیست
  | 'training_checklist_completed'; // تکمیل آموزش/چک‌لیست

export type NotificationRecipientType =
  | 'specific_user' // کاربر مشخص
  | 'specific_role' // Role مشخص
  | 'specific_workgroup' // Workgroup مشخص
  | 'current_equipment_responsible' // مسئول فعلی تجهیز
  | 'workorder_technician' // تکنسین/مسئول Work Order
  | 'direct_supervisor' // مدیر مستقیم یا Supervisor
  | 'department_head' // واحد یا بخش مرتبط با تجهیز
  | 'event_requester'; // درخواست‌دهنده رویداد

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push_system';

export interface NotificationRuleRecipient {
  type: NotificationRecipientType;
  labelFa: string;
  userIds?: string[];
  userNames?: string[];
  roles?: UserRole[];
  workgroups?: string[];
  departments?: string[];
}

export interface NotificationRuleCondition {
  timeThresholdMinutes?: number; // e.g. 15 minutes for SLA escalation
  daysBeforeDue?: number; // e.g. 15 or 30 days before calibration/PM
  priorityFilter?: ('critical' | 'high' | 'normal' | 'low')[];
  departmentFilter?: string[];
  equipmentCategoryFilter?: string[];
  notes?: string;
}

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationEventType = NotificationEventKey | string;

export interface NotificationRule {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: NotificationEventCategory | string;
  eventKey?: NotificationEventKey;
  eventType?: NotificationEventType;
  eventCategory?: string;
  eventTitleFa?: string;
  recipients?: NotificationRuleRecipient[];
  targetRoles?: string[];
  targetWorkgroups?: string[];
  targetUserIds?: string[];
  targetDepartments?: string[];
  notifyDynamicAssignee?: boolean;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  status?: 'active' | 'inactive';
  isActive?: boolean;
  condition?: NotificationRuleCondition;
  templateTitle?: string;
  templateBody?: string;
  departmentScope?: string;
  equipmentCategoryScope?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  createdByName?: string;
  lastModifiedById?: string;
  lastModifiedByName?: string;
}

export interface NotificationLogItem {
  id: string;
  ruleId?: string;
  ruleTitle?: string;
  ruleName?: string;
  eventKey?: NotificationEventKey;
  eventType?: NotificationEventType;
  eventTitleFa?: string;
  category?: NotificationEventCategory | string;
  title?: string;
  message?: string;
  recipientId?: string;
  recipientName: string;
  recipientRoleFa?: string;
  recipientUserId?: string;
  recipientTarget?: string;
  channel?: NotificationChannel;
  channelsDelivered?: {
    channel: NotificationChannel;
    status: 'delivered' | 'pending' | 'failed';
    details?: string;
  }[];
  sentAt?: string;
  timestamp?: string;
  deliveryStatus?: 'delivered' | 'pending' | 'failed';
  errorMessage?: string;
  messageTitle?: string;
  messageBody?: string;
  relatedEntityId?: string;
  relatedEntityCode?: string;
  relatedEntityName?: string;
  relatedEquipmentCode?: string;
  relatedEquipmentName?: string;
  relatedRecordId?: string;
  relatedRecordType?: string;
  relatedEntityType?: 'equipment' | 'workorder' | 'failure' | 'calibration' | 'purchase' | 'training';
  isRead?: boolean;
}

export type NotificationLogRecord = NotificationLogItem;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGING & WORKPLACE COMMUNICATION MODULE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MessageRecordType =
  | 'equipment'
  | 'inventory'
  | 'purchase_request'
  | 'failure'
  | 'calibration'
  | 'task'
  | 'education';

export interface MessageRecordAttachment {
  type: MessageRecordType;
  id: string;
  title: string;
  subtitle?: string;
  code?: string;
  statusFa?: string;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'purple' | 'slate';
  department?: string;
  additionalInfo?: string;
  actionLabel: string; // e.g. 'مشاهده تجهیز' | 'مشاهده درخواست' | 'مشاهده گزارش' | 'مشاهده کالیبراسیون' | 'مشاهده وظیفه' | 'مشاهده در آموزش'
  targetPage: PageId;
  targetRecordId?: string;
}

export type MessageFileType =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'doc'
  | 'sheet'
  | 'presentation'
  | 'archive'
  | 'other';

export interface MessageFileAttachment {
  id: string;
  name: string;
  size: string;
  sizeBytes?: number;
  type: MessageFileType;
  url?: string;
  thumbnailUrl?: string;
  duration?: string;
}

export interface HospitalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRoleFa: string;
  senderAvatar?: string;
  senderDepartment?: string;
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  isStarred?: boolean;
  isImportant?: boolean;
  fileAttachment?: MessageFileAttachment;
  recordAttachment?: MessageRecordAttachment;
}

export interface HospitalConversation {
  id: string;
  type: 'direct' | 'workgroup';
  title: string;
  avatar?: string;
  targetUserId?: string;
  targetUserRoleFa?: string;
  targetUserDepartment?: string;
  targetUserPersonnelCode?: string;
  workgroupId?: string;
  workgroupMembersCount?: number;
  workgroupMemberIds?: string[];
  lastMessage?: string;
  lastMessageTime: string;
  lastMessageTimestamp?: number;
  unreadCount: number;
  isPinned?: boolean;
  allowedUserIds?: string[];
  allowedRoles?: string[];
  department?: string;
}

export type HospitalDocCategory =
  | 'calibration'
  | 'repairs'
  | 'failures'
  | 'periodic_reports'
  | 'equipment_manuals'
  | 'purchase_invoices'
  | 'clinical_guidelines'
  | 'administrative'
  | 'user_custom';

export type HospitalDocExtension =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'jpg'
  | 'png'
  | 'zip'
  | 'dicom'
  | 'txt'
  | 'other';

export interface HospitalDocumentFolder {
  id: string;
  name: string;
  parentId: string | null; // null for root directories in virtual C: drive
  category: HospitalDocCategory;
  isSystemRoot?: boolean; // folders auto-managed by hospital data sync
  isLocked?: boolean;
  password?: string;
  color?: string;
  iconName?: string;
  description?: string;
  createdDate: string;
  createdByName: string;
  createdByRoleFa: string;
  department?: string;
}

export interface HospitalDocumentFile {
  id: string;
  folderId: string;
  title: string;
  originalFileName: string;
  extension: HospitalDocExtension;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  category: HospitalDocCategory;
  isAutoGenerated?: boolean; // auto-generated from calibration, repairs, failures, reports
  sourceRecordType?: 'equipment' | 'calibration' | 'failure' | 'task' | 'purchase_request' | 'report';
  sourceRecordId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  department?: string;
  uploadDate: string;
  uploadedByName: string;
  uploadedByRoleFa: string;
  isLocked?: boolean;
  password?: string;
  passwordHint?: string;
  isStarred?: boolean;
  isConfidential?: boolean;
  description?: string;
  tags?: string[];
  downloadUrl?: string;
  version?: string;
}


