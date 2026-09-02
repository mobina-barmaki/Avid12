import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  QrCode,
  Sparkles,
  UserCheck,
  Building2,
  Package,
  Boxes,
  ShieldCheck,
  Clock,
  Edit3,
  History,
  Lock,
  ArrowRight,
  Info,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  EquipmentItem,
  AppUser,
  AssetClassification,
  AssetRequirementField,
  FieldContribution,
} from '../../types';
import {
  calculateInventoryCompletionAnalysis,
  canUserEditField,
  recordFieldContribution,
  hasInventoryRegistrationPermission,
  validateInventoryForFinalization,
  sanitizeInventoryItemUpdate,
  STANDARD_INVENTORY_BASE_FIELDS,
} from '../../utils/inventoryRegistrationHelper';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface MultiUserInventoryCompletionModalProps {
  item: EquipmentItem;
  currentUser?: AppUser;
  classificationsList?: AssetClassification[];
  onClose: () => void;
  onSaveContribution: (updatedItem: EquipmentItem, message: string) => void;
  onFinalize: (finalizedItem: EquipmentItem) => void;
}

export const MultiUserInventoryCompletionModal: React.FC<MultiUserInventoryCompletionModalProps> = ({
  item,
  currentUser,
  classificationsList = [],
  onClose,
  onSaveContribution,
  onFinalize,
}) => {
  // Form State initialized from item
  const [formData, setFormData] = useState<Partial<EquipmentItem>>({
    ...item,
    faName: item.faName || '',
    enName: item.enName || '',
    code: item.code || '',
    brand: item.brand || '',
    model: item.model || '',
    category: item.category || 'تجهیزات پزشکی',
    subcategory: item.subcategory || '',
    type: item.type || '',
    department: item.department || 'انبار مرکزی تجهیزات',
    location: item.location || '',
    serialNumber: item.serialNumber || '',
    owner: item.owner || '',
    supplier: item.supplier || '',
    purchaseDate: item.purchaseDate || '',
    price: item.price || 0,
    quantity: item.quantity || 1,
    unit: item.unit || 'دستگاه',
    batchNo: item.batchNo || '',
    expiryDate: item.expiryDate || '',
    hasQrTag: item.hasQrTag !== false,
    itemKind: item.itemKind || 'device',
    specs: item.specs || {},
    contributionsHistory: item.contributionsHistory || [],
  });

  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'purchasing' | 'warehouse' | 'asset' | 'technical' | 'history'>('all');
  const [finalizeAttemptError, setFinalizeAttemptError] = useState<string | null>(null);
  const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);

  // Find inherited specs from classification if available
  const customSpecs = useMemo(() => {
    // Collect specs from item specs
    const fields: AssetRequirementField[] = [];
    if (formData.specs) {
      Object.keys(formData.specs).forEach((k, idx) => {
        fields.push({
          id: `spec-${k}`,
          name: k,
          type: 'text',
          required: true,
          order: idx + 1,
          assignedRole: 'biomedical_engineer',
          assignedRoleTitleFa: 'مهندس پزشکی و فنی',
        });
      });
    }
    return fields;
  }, [formData.specs]);

  // Real-time Multi-User Completion Analysis
  const analysis = useMemo(() => {
    return calculateInventoryCompletionAnalysis(formData, currentUser, customSpecs);
  }, [formData, currentUser, customSpecs]);

  const canUserFinalize = hasInventoryRegistrationPermission(currentUser);

  // Clear validation error if user modifies fields
  useEffect(() => {
    if (finalizeAttemptError) {
      setFinalizeAttemptError(null);
    }
  }, [formData]);

  // Direct Jump & Highlight to Missing Field (UX requirement 4)
  const handleJumpToMissingField = (missingField: {
    key: string;
    categorySection?: 'purchasing' | 'warehouse' | 'asset' | 'technical';
    canEdit?: boolean;
  }) => {
    if (missingField.categorySection) {
      setActiveSectionTab(missingField.categorySection);
    }

    setHighlightedFieldKey(missingField.key);
    setTimeout(() => {
      setHighlightedFieldKey(null);
    }, 3500);

    setTimeout(() => {
      const el = document.getElementById(`field-input-${missingField.key}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 120);
  };

  // Handle field change and record contributor (strictly enforced)
  const handleFieldChange = (key: string, value: any, fieldLabelFa?: string, responsibleRole?: string, responsibleRoleTitleFa?: string) => {
    if (!canUserEditField(responsibleRole, currentUser)) return;

    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // Log contributor history if user is logged in
      if (currentUser && fieldLabelFa) {
        updated.contributionsHistory = recordFieldContribution(
          prev.contributionsHistory || [],
          key,
          fieldLabelFa,
          value,
          responsibleRole || currentUser.role,
          responsibleRoleTitleFa || currentUser.roleFa,
          currentUser
        );
      }

      return updated;
    });
  };

  const handleSpecChange = (specKey: string, value: string, responsibleRole = 'biomedical_engineer', responsibleRoleTitleFa = 'مهندس پزشکی و فنی') => {
    if (!canUserEditField(responsibleRole, currentUser)) return;

    setFormData((prev) => {
      const newSpecs = { ...(prev.specs || {}), [specKey]: value };
      const updated = { ...prev, specs: newSpecs };

      if (currentUser) {
        updated.contributionsHistory = recordFieldContribution(
          prev.contributionsHistory || [],
          `spec_${specKey}`,
          `مشخصه فنی: ${specKey}`,
          value,
          responsibleRole,
          responsibleRoleTitleFa,
          currentUser
        );
      }

      return updated;
    });
  };

  // Quick generate sequential asset code
  const handleGenerateAssetCode = () => {
    if (!canUserEditField('asset_manager', currentUser)) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    handleFieldChange(
      'code',
      `EQ-1403-${randomNum}`,
      'کد دائم اموال',
      'asset_manager',
      'امین اموال و پلاک‌کوبی'
    );
  };

  // 1. SAVE DRAFT (Save for my role / Save partial draft)
  // CRITICAL: Saving a draft must NEVER finalize the inventory or generate a QR code!
  const handleSaveMyContribution = () => {
    const rawUpdated: EquipmentItem = {
      ...(item as EquipmentItem),
      ...(formData as EquipmentItem),
      isDraft: true,
      status: 'draft',
      registrationProgressStatus: analysis.isFullyComplete ? 'ready_to_finalize' : 'in_progress',
      missingFields: analysis.allMissingFields.map((f) => `${f.labelFa} (${f.responsibleRoleTitleFa})`),
      hasQrTag: false,
      qrGeneratedAt: undefined,
    };

    const sanitized = sanitizeInventoryItemUpdate(
      item as EquipmentItem,
      rawUpdated,
      currentUser,
      customSpecs
    );

    let msg = 'پیش‌نویس با موفقیت ذخیره شد.';
    if (analysis.isMyRoleComplete && !analysis.isFullyComplete) {
      const missingRoles = Array.from(new Set(analysis.allMissingFields.map((f) => f.responsibleRoleTitleFa))).join('، ');
      msg = `فیلدهای مربوط به نقش شما (${currentUser?.roleFa || 'کاربر'}) ذخیره شد. موجودی به صورت پیش‌نویس باقی مانده و در انتظار تکمیل فیلدهای سایر نقش‌ها (${missingRoles}) است.`;
    } else if (analysis.isFullyComplete) {
      msg = 'تمام فیلدهای الزامی تکمیل شدند. موجودی به صورت پیش‌نویس آماده ثبت نهایی ذخیره شد (جهت پلاک‌کوبی نهایی دکمه «ثبت نهایی» را بفشارید).';
    }

    onSaveContribution(sanitized, msg);
  };

  // 2. FINALIZE INVENTORY REGISTRATION (Strict Atomic Re-Validation)
  // ONLY allowed when 100% of required fields are filled AND user has finalization permission
  const handleFinalizeRegistration = () => {
    // Atomic validation at the exact moment of clicking
    const validation = validateInventoryForFinalization(formData, currentUser, customSpecs);

    if (!validation.canFinalize) {
      setFinalizeAttemptError(validation.errorMessage || 'امکان ثبت نهایی وجود ندارد. برخی اطلاعات اجباری هنوز تکمیل نشده‌اند.');
      
      // Focus/scroll smoothly to the inline validation summary card
      setTimeout(() => {
        const valEl = document.getElementById('inventory-validation-summary-card');
        if (valEl) {
          valEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
      return;
    }

    const finalized: EquipmentItem = {
      ...(item as EquipmentItem),
      ...(formData as EquipmentItem),
      isDraft: false,
      status: formData.itemKind === 'device' ? 'active' : 'in_stock',
      registrationProgressStatus: 'finalized',
      missingFields: [],
      hasQrTag: true,
      qrGeneratedAt: new Date().toISOString(),
    };

    onFinalize(finalized);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl lg:max-w-5xl w-full overflow-hidden dir-rtl text-right flex flex-col max-h-[94vh]">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* MODAL HEADER */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2b64f6] text-white flex items-center justify-center font-bold shadow-xs">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  شناسنامه چندکاربره و تکمیل فیلدهای موجودی
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    analysis.isFullyComplete
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : analysis.totalCompletedCount > 0
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {analysis.isFullyComplete
                    ? 'آماده ثبت نهایی و صدور پلاک ✓'
                    : analysis.totalCompletedCount > 0
                    ? 'در حال تکمیل توسط چند کاربر'
                    : 'پیش‌نویس اولیه'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مشارکت غیرترتیبی کاربران | ورود اطلاعات توسط تدارکات، انبار، اموال و مهندسی پزشکی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* COMPLETION PROGRESS & ROLE STATUS BAR */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">پیشرفت کل تکمیل شناسنامه:</span>
                <span className="text-sm font-extrabold text-[#2b64f6]">
                  {toPersianNumber(analysis.overallPercentage)}٪
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({toPersianNumber(analysis.totalCompletedCount)} از {toPersianNumber(analysis.totalRequiredCount)} فیلد الزامی تکمیل شده)
                </span>
              </div>
            </div>

            {/* Current User Status Badge */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] text-slate-600 font-bold">نقش شما:</span>
              <span className="text-[11px] font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {currentUser?.roleFa || 'کاربر سیستم'}
              </span>
              {analysis.isMyRoleComplete ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  فیلدهای نقش شما کامل است
                </span>
              ) : (analysis.myRoleMissingFieldNames || []).length > 0 ? (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                  {toPersianNumber((analysis.myRoleMissingFieldNames || []).length)} فیلد از مسئولیت شما باقی مانده
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                  فیلد الزامی برای نقش شما تعریف نشده
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                analysis.isFullyComplete
                  ? 'bg-emerald-500'
                  : analysis.overallPercentage > 50
                  ? 'bg-[#2b64f6]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${analysis.overallPercentage}%` }}
            />
          </div>

          {/* Role Badges Breakdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            {analysis.roleGroups.map((group) => {
              const isMyGroup = currentUser?.role === group.roleCode;
              return (
                <div
                  key={group.roleCode}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border shrink-0 transition-all ${
                    group.isComplete
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : isMyGroup
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold">{group.roleTitleFa}:</span>
                  <span
                    className={`font-black ${
                      group.isComplete ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {toPersianNumber(group.completedRequired)}/{toPersianNumber(group.totalRequired)}
                  </span>
                  {group.isComplete ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <span className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                      ناقص
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* FILTER SECTIONS TABS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSectionTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSectionTab === 'all'
                ? 'bg-[#2b64f6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            همه بخش‌ها
          </button>
          <button
            onClick={() => setActiveSectionTab('purchasing')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSectionTab === 'purchasing'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>۱. تدارکات و خرید</span>
          </button>
          <button
            onClick={() => setActiveSectionTab('warehouse')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSectionTab === 'warehouse'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>۲. انبارداری و تحویل</span>
          </button>
          <button
            onClick={() => setActiveSectionTab('asset')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSectionTab === 'asset'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>۳. پلاک‌کوبی و اموال</span>
          </button>
          <button
            onClick={() => setActiveSectionTab('technical')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeSectionTab === 'technical'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>۴. مشخصات فنی و مهندسی</span>
          </button>
          <button
            onClick={() => setActiveSectionTab('history')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer mr-auto flex items-center gap-1 ${
              activeSectionTab === 'history'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>تاریخچه مشارکت ({toPersianNumber(formData.contributionsHistory?.length || 0)})</span>
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* MODAL BODY (SECTIONS) */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto text-xs">
          
          {/* History Tab View */}
          {activeSectionTab === 'history' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>لاگ و تاریخچه مشارکت کاربران در تکمیل فیلدهای این موجودی</span>
                </h4>
              </div>

              {formData.contributionsHistory && Array.isArray(formData.contributionsHistory) && formData.contributionsHistory.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {formData.contributionsHistory.map((entry) => (
                    <div key={entry.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{entry.fieldLabel}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                            {entry.responsibleRoleTitleFa || 'نقش مسئول'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          مقدار ثبت‌شده: <strong className="text-slate-900">{String(entry.value)}</strong>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 justify-end">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{entry.completedByUserName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {entry.completedByUserRoleFa} | {entry.completedAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  هنوز لاگ مشارکتی برای این سند ثبت نشده است. با ویرایش هر فیلد، سابقه مشارکت شما ثبت خواهد شد.
                </div>
              )}
            </div>
          )}

          {/* SECTION 1: PURCHASING & PROCUREMENT */}
          {(activeSectionTab === 'all' || activeSectionTab === 'purchasing') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3.5">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ۱
                  </span>
                  <span>اطلاعات خرید و بازرگانی (مسئولیت: مسئول خرید و تدارکات)</span>
                </h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  مسئول خرید: {canUserEditField('procurement_officer', currentUser) ? 'شما مجاز به ویرایش هستید' : 'صرفاً مسئول خرید'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Price */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ارزش دفتری / قیمت خرید (ریال): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-price"
                    type="number"
                    disabled={!canUserEditField('procurement_officer', currentUser)}
                    value={formData.price || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'price',
                        Number(e.target.value),
                        'ارزش دفتری / قیمت خرید',
                        'procurement_officer',
                        'مسئول خرید و تدارکات'
                      )
                    }
                    placeholder="مثلاً: ۲۸۰۰۰۰۰۰۰"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'price'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formData.price ? `${toPersianNumber(Number(formData.price).toLocaleString('fa-IR'))} ریال` : 'قیمت فاکتور'}
                  </span>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    شرکت تأمین‌کننده / فروشنده: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-supplier"
                    type="text"
                    disabled={!canUserEditField('procurement_officer', currentUser)}
                    value={formData.supplier || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'supplier',
                        e.target.value,
                        'شرکت تأمین‌کننده',
                        'procurement_officer',
                        'مسئول خرید و تدارکات'
                      )
                    }
                    placeholder="مثلاً: شرکت مهندسی آریا تدبیر"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'supplier'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تاریخ خرید / صدور فاکتور: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-purchaseDate"
                    type="text"
                    disabled={!canUserEditField('procurement_officer', currentUser)}
                    value={formData.purchaseDate || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'purchaseDate',
                        e.target.value,
                        'تاریخ خرید',
                        'procurement_officer',
                        'مسئول خرید و تدارکات'
                      )
                    }
                    placeholder="۱۴۰۳/۰۵/۲۲"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-mono focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'purchaseDate'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>

                {/* Batch No */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    شماره فاکتور / حواله / Batch:
                  </label>
                  <input
                    id="field-input-batchNo"
                    type="text"
                    disabled={!canUserEditField('procurement_officer', currentUser)}
                    value={formData.batchNo || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'batchNo',
                        e.target.value,
                        'شماره فاکتور / Batch',
                        'procurement_officer',
                        'مسئول خرید و تدارکات'
                      )
                    }
                    placeholder="INV-1403-908"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-mono focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'batchNo'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: WAREHOUSE & PHYSICAL INVENTORY */}
          {(activeSectionTab === 'all' || activeSectionTab === 'warehouse') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                    ۲
                  </span>
                  <span>اطلاعات انبارداری و استقرار فیزیکی (مسئولیت: انباردار تجهیزات)</span>
                </h4>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  انباردار: {canUserEditField('warehouse_keeper', currentUser) ? 'شما مجاز به ویرایش هستید' : 'صرفاً انباردار'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Quantity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تعداد موجودی فیزیکی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-quantity"
                    type="number"
                    disabled={!canUserEditField('warehouse_keeper', currentUser)}
                    value={formData.quantity || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'quantity',
                        Number(e.target.value),
                        'تعداد فیزیکی',
                        'warehouse_keeper',
                        'انباردار تجهیزات'
                      )
                    }
                    placeholder="1"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'quantity'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    واحد سنجش کالا: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-unit"
                    type="text"
                    disabled={!canUserEditField('warehouse_keeper', currentUser)}
                    value={formData.unit || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'unit',
                        e.target.value,
                        'واحد سنجش',
                        'warehouse_keeper',
                        'انباردار تجهیزات'
                      )
                    }
                    placeholder="دستگاه / عدد / بسته"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'unit'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    دپارتمان / بخش مقصد: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="field-input-department"
                    disabled={!canUserEditField('warehouse_keeper', currentUser)}
                    value={formData.department || 'انبار مرکزی تجهیزات'}
                    onChange={(e) =>
                      handleFieldChange(
                        'department',
                        e.target.value,
                        'دپارتمان مقصد',
                        'warehouse_keeper',
                        'انباردار تجهیزات'
                      )
                    }
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'department'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  >
                    <option value="انبار مرکزی تجهیزات">انبار مرکزی تجهیزات</option>
                    <option value="بخش مراقبت‌های ویژه (ICU)">بخش مراقبت‌های ویژه (ICU)</option>
                    <option value="بخش مراقبت‌های قلبی (CCU)">بخش مراقبت‌های قلبی (CCU)</option>
                    <option value="اتاق عمل و جراحی">اتاق عمل و جراحی</option>
                    <option value="اورژانس و فوریت‌ها">اورژانس و فوریت‌ها</option>
                    <option value="بخش بستری داخلی و جراحی">بخش بستری داخلی و جراحی</option>
                    <option value="تصویربرداری و رادیولوژی">تصویربرداری و رادیولوژی</option>
                    <option value="آزمایشگاه و پاتولوژی">آزمایشگاه و پاتولوژی</option>
                    <option value="واحد دندانپزشکی">واحد دندانپزشکی</option>
                    <option value="تأسیسات و نگهداری عمومی">تأسیسات و نگهداری عمومی</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    محل استقرار دقیق فیزیکی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-location"
                    type="text"
                    disabled={!canUserEditField('warehouse_keeper', currentUser)}
                    value={formData.location || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'location',
                        e.target.value,
                        'محل استقرار دقیق',
                        'warehouse_keeper',
                        'انباردار تجهیزات'
                      )
                    }
                    placeholder="قفسه B-12 یا اتاق عمل ۳"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'location'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ASSET IDENTITY & QR TAGGING */}
          {(activeSectionTab === 'all' || activeSectionTab === 'asset') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-3.5">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <h4 className="text-xs font-black text-blue-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    ۳
                  </span>
                  <span>اطلاعات هویتی و پلاک‌کوبی اموال (مسئولیت: امین اموال و پلاک‌کوبی)</span>
                </h4>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  امین اموال: {canUserEditField('asset_manager', currentUser) ? 'شما مجاز به ویرایش هستید' : 'صرفاً امین اموال'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Persian Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    نام فارسی کالا / تجهیز: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-faName"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.faName || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'faName',
                        e.target.value,
                        'نام فارسی تجهیز',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="دستگاه الکتروشوک بای‌فازیک"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'faName'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    برند سازنده: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-brand"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.brand || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'brand',
                        e.target.value,
                        'برند سازنده',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="Mindray / Nihon Kohden"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'brand'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    مدل دستگاه: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-model"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.model || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'model',
                        e.target.value,
                        'مدل دستگاه',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="CardioLife TEC-5631"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'model'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Asset Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      کد دائم اموال / شماره پلاک: <span className="text-rose-500">*</span>
                    </label>
                    {canUserEditField('asset_manager', currentUser) && (
                      <button
                        type="button"
                        onClick={handleGenerateAssetCode}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>تولید خودکار</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="field-input-code"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.code || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'code',
                        e.target.value,
                        'کد اموال',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="EQ-1403-1045"
                    className={`w-full p-2.5 rounded-xl bg-white border text-blue-950 font-mono font-black focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'code'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-blue-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    شماره سریال کارخانه (Serial No): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="field-input-serialNumber"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.serialNumber || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'serialNumber',
                        e.target.value,
                        'شماره سریال',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="SN-NK-89210"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-mono font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'serialNumber'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    امین اموال / مسئول تحویل‌گیرنده:
                  </label>
                  <input
                    id="field-input-owner"
                    type="text"
                    disabled={!canUserEditField('asset_manager', currentUser)}
                    value={formData.owner || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'owner',
                        e.target.value,
                        'امین اموال',
                        'asset_manager',
                        'امین اموال و پلاک‌کوبی'
                      )
                    }
                    placeholder="مهندس کامران حسینی"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'owner'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Live QR Metal Tag Preview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border border-slate-300 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1 shadow-xs shrink-0">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        بیمارستان تخصصی آوید
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">
                        پلاک فلزی
                      </span>
                    </div>
                    <div className="text-xs font-mono font-black text-blue-900 mt-0.5">
                      کد اموال: {formData.code || 'EQ-1403-XXXX'}
                    </div>
                    <p className="text-[10px] text-slate-700 truncate max-w-sm mt-0.5">
                      {formData.faName || 'دستگاه'} | سریال: {formData.serialNumber || 'SN-XXXX'} | استقرار: {formData.department} ({formData.location || 'تعیین‌نشده'})
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-700 font-bold bg-white/70 px-2 py-1 rounded-lg border border-slate-300">
                  پیش‌نمایش زنده پلاک هوشمند QR
                </span>
              </div>
            </div>
          )}

          {/* SECTION 4: TECHNICAL & BIOMEDICAL SPECS */}
          {(activeSectionTab === 'all' || activeSectionTab === 'technical') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3.5">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <h4 className="text-xs font-black text-purple-950 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    ۴
                  </span>
                  <span>مشخصات فنی، گارانتی و استانداردهای تخصصی (مسئولیت: مهندسی پزشکی)</span>
                </h4>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                  مهندس پزشکی: {canUserEditField('biomedical_engineer', currentUser) ? 'شما مجاز به ویرایش هستید' : 'صرفاً مهندس پزشکی'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تاریخ انقضای گارانتی:
                  </label>
                  <input
                    id="field-input-warrantyExpiry"
                    type="text"
                    disabled={!canUserEditField('biomedical_engineer', currentUser)}
                    value={formData.warrantyExpiry || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'warrantyExpiry',
                        e.target.value,
                        'تاریخ گارانتی',
                        'biomedical_engineer',
                        'مهندس پزشکی و فنی'
                      )
                    }
                    placeholder="۱۴۰۵/۰۶/۱۵"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-mono focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'warrantyExpiry'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    سررسید اولین کالیبراسیون:
                  </label>
                  <input
                    id="field-input-nextCalibrationDate"
                    type="text"
                    disabled={!canUserEditField('biomedical_engineer', currentUser)}
                    value={formData.nextCalibrationDate || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'nextCalibrationDate',
                        e.target.value,
                        'سررسید کالیبراسیون',
                        'biomedical_engineer',
                        'مهندس پزشکی و فنی'
                      )
                    }
                    placeholder="۱۴۰۴/۰۵/۰۱"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-mono focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'nextCalibrationDate'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    شاخص سلامت اولیه ایمنی (0 - 100):
                  </label>
                  <input
                    id="field-input-safetyScore"
                    type="number"
                    disabled={!canUserEditField('biomedical_engineer', currentUser)}
                    value={formData.safetyScore || 95}
                    onChange={(e) =>
                      handleFieldChange(
                        'safetyScore',
                        Number(e.target.value),
                        'امتیاز ایمنی',
                        'biomedical_engineer',
                        'مهندس پزشکی و فنی'
                      )
                    }
                    placeholder="95"
                    className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                      highlightedFieldKey === 'safetyScore'
                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                        : 'border-slate-200 focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              {/* Dynamic Inherited Specs from Taxonomy */}
              {formData.specs && Object.keys(formData.specs).length > 0 && (
                <div className="pt-2 border-t border-purple-100 space-y-2">
                  <span className="text-[11px] font-bold text-purple-900 block">
                    مشخصات فنی و استانداردهای متصل به ساختار اموال:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(formData.specs).map(([specKey, specVal]) => (
                      <div key={specKey}>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {specKey}:
                        </label>
                        <input
                          id={`field-input-spec_${specKey}`}
                          type="text"
                          disabled={!canUserEditField('biomedical_engineer', currentUser)}
                          value={specVal || ''}
                          onChange={(e) => handleSpecChange(specKey, e.target.value)}
                          className={`w-full p-2.5 rounded-xl bg-white border text-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 transition-all ${
                            highlightedFieldKey === `spec_${specKey}`
                              ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30 animate-pulse'
                              : 'border-slate-200 focus:border-purple-500'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* OVERALL COMPLETION STATUS & FIELD BREAKDOWN (Requirements 1, 3, 4, 5, 8) */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div id="inventory-validation-summary-card" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2b64f6]" />
                <h4 className="text-xs font-black text-slate-900">وضعیت تکمیل اطلاعات شناسنامه</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">وضعیت کلی موجودی:</span>
                <span
                  className={`text-[11px] font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    analysis.isFullyComplete
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {analysis.isFullyComplete ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>آماده ثبت نهایی</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>در حال تکمیل (پیش‌نویس)</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Section-by-Section Status Checklist (Requirement 5) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">بررسی بخش‌های چهارگانه شناسنامه:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {analysis.sections.map((sec) => (
                  <div
                    key={sec.sectionKey}
                    onClick={() => setActiveSectionTab(sec.sectionKey)}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all cursor-pointer hover:shadow-xs ${
                      sec.isComplete
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/60 border-amber-200 text-slate-800 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">{sec.sectionTitleFa}</span>
                      {sec.isComplete ? (
                        <span className="text-emerald-700 font-black flex items-center gap-1 text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تکمیل ✓</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-black text-[11px] bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span>○ ناقص</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                      <span>مسئول: {sec.responsibleRoleTitleFa}</span>
                      <span className="font-bold text-slate-700">
                        {toPersianNumber(sec.completedRequired)}/{toPersianNumber(sec.totalRequired)} فیلد
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Error Alert if Finalization was attempted while incomplete */}
            {finalizeAttemptError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black block text-xs">{finalizeAttemptError}</span>
                  <span className="text-[11px] text-rose-700 block">
                    برای پلاک‌کوبی نهایی و ثبت قطعی، تمامی فیلدهای الزامی باید کامل باشند. لطفاً فیلدهای مربوط به نقش خود را تکمیل نموده یا پیش‌نویس موقت را ذخیره نمایید.
                  </span>
                </div>
              </div>
            )}

            {/* INLINE VALIDATION WARNING / MISSING FIELDS BREAKDOWN (Requirements 1, 3, 4, 8) */}
            {!analysis.isFullyComplete ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-rose-50/40 to-amber-50/70 border border-amber-300 shadow-2xs space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-900">
                      امکان ثبت نهایی وجود ندارد
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      برخی اطلاعات اجباری هنوز تکمیل نشده‌اند. برای صدور پلاک QR Code و ثبت قطعی در کاردکس اموال، تمامی فیلدهای الزامی زیر باید توسط نقش‌های مسئول تکمیل گردند.
                    </p>
                  </div>
                </div>

                {/* Missing Fields List with Responsible Role Mapping & Direct Action */}
                <div className="space-y-2 pt-2 border-t border-amber-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-slate-800">
                      اطلاعات ناقص ({toPersianNumber((analysis.allMissingFields || []).length)} فیلد الزامی باقیمانده):
                    </span>
                    <span className="text-[10px] text-slate-500">
                      روی فیلدهای مجاز خود کلیک کنید تا مستقیماً به آن فیلد منتقل شوید
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.allMissingFields.map((f, idx) => {
                      const isEditableByMe = f.canEdit;
                      return (
                        <div
                          key={idx}
                          onClick={() => isEditableByMe && handleJumpToMissingField(f)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                            isEditableByMe
                              ? 'bg-white border-amber-300 text-slate-800 shadow-2xs hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer group ring-1 ring-amber-200/60'
                              : 'bg-slate-50/80 border-slate-200 text-slate-600 cursor-not-allowed opacity-90'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-rose-500 font-bold text-xs">○</span>
                              <span className="font-bold text-[11px] text-slate-900 truncate">
                                {f.labelFa}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              مسئول تکمیل: <span className="font-semibold text-slate-700">{f.responsibleRoleTitleFa}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isEditableByMe ? (
                              <span className="text-[10px] bg-[#2b64f6] text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 group-hover:bg-blue-700 transition-colors shadow-2xs">
                                <span>تکمیل فیلد</span>
                                <ArrowRight className="w-3 h-3 rotate-180" />
                              </span>
                            ) : (
                              <span className="text-[9px] bg-slate-200/80 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-300/60 block text-center">
                                این فیلد توسط {f.responsibleRoleTitleFa} تکمیل می‌شود
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block">
                    تمام فیلدهای الزامی شناسنامه تکمیل شده‌اند ✓
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    این موجودی آماده ثبت نهایی، درج در کاردکس دائم و صدور پلاک هوشمند QR Code است.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* MODAL FOOTER ACTIONS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              انصراف
            </button>

            {/* Save My Contribution / Draft (ALWAYS keeps isDraft=true, NEVER finalizes or generates QR) */}
            <button
              onClick={handleSaveMyContribution}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check className="w-4 h-4 text-slate-700" />
              <span>ذخیره فیلدهای من / ذخیره موقت</span>
            </button>
          </div>

          {/* Finalize Registration Button */}
          <div className="flex items-center gap-2">
            {!analysis.isFullyComplete ? (
              <span className="text-[11px] text-amber-700 font-bold hidden sm:inline">
                {toPersianNumber((analysis.allMissingFields || []).length)} فیلد الزامی باقی مانده
              </span>
            ) : !canUserFinalize ? (
              <span className="text-[11px] text-rose-600 font-bold hidden sm:inline">
                نیازمند مجوز ثبت موجودی
              </span>
            ) : null}

            <button
              onClick={handleFinalizeRegistration}
              title={
                !canUserFinalize
                  ? 'شما مجوز ثبت نهایی موجودی را ندارید.'
                  : !analysis.isFullyComplete
                  ? 'ثبت نهایی فقط زمانی انجام می‌شود که تمام فیلدهای الزامی توسط نقش‌های مربوطه تکمیل شده باشند.'
                  : 'تکمیل قطعی شناسنامه، ثبت نهایی و صدور پلاک QR Code'
              }
              className={`px-6 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                analysis.isFullyComplete && canUserFinalize
                  ? 'bg-[#2b64f6] hover:bg-blue-700 text-white hover:shadow-lg scale-100'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-600 border border-slate-300'
              }`}
            >
              {!canUserFinalize ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>ثبت نهایی موجودی و صدور پلاک قطعی اموال</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
