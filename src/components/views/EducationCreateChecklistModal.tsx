import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  ListChecks,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FolderTree,
  CheckCircle2,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  EducationItem,
  ChecklistItemDefinition,
  ChecklistResponseKind,
  ContentScopeLevel,
  ContentStatus,
  AssetClassification,
  EquipmentItem,
  AppUser,
} from '../../types';
import { SearchableEquipmentPicker } from '../education/SearchableEquipmentPicker';
import { SearchableTaxonomyPicker } from '../education/SearchableTaxonomyPicker';
import { EducationAudienceSection } from '../education/EducationAudienceSection';
import { TrainingAssignment } from '../../types';

interface EducationCreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: EducationItem) => void;
  initialItem?: EducationItem | null;
  initialData?: EducationItem | null;
  classificationsList: AssetClassification[];
  equipmentList: EquipmentItem[];
  currentUser?: AppUser;
  currentFolderId?: string | null;
}

export const EducationCreateChecklistModal: React.FC<EducationCreateChecklistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  initialData,
  classificationsList = [],
  equipmentList = [],
  currentUser,
  currentFolderId,
}) => {
  const itemToEdit = initialItem || initialData;
  if (!isOpen) return null;

  const [title, setTitle] = useState(itemToEdit?.name || '');
  const [description, setDescription] = useState(itemToEdit?.description || '');
  const [objective, setObjective] = useState(itemToEdit?.checklistData?.objective || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(
    itemToEdit?.checklistData?.estimatedMinutes || 5
  );
  const [safetyPrecautions, setSafetyPrecautions] = useState(
    itemToEdit?.checklistData?.safetyPrecautions || ''
  );
  const [version, setVersion] = useState(itemToEdit?.version || '1.0');
  const [status, setStatus] = useState<ContentStatus>(itemToEdit?.status || 'published');
  const [scopeLevel, setScopeLevel] = useState<ContentScopeLevel>(
    itemToEdit?.scopeLevel || 'type'
  );

  // Hierarchy Selection States
  const [targetEquipmentId, setTargetEquipmentId] = useState(
    itemToEdit?.targetEquipmentId || itemToEdit?.linkedAssetId || ''
  );
  const [targetTypeId, setTargetTypeId] = useState(
    itemToEdit?.targetTypeId || itemToEdit?.targetTypeName || ''
  );
  const [targetTypeName, setTargetTypeName] = useState(
    itemToEdit?.targetTypeName || itemToEdit?.targetTypeId || ''
  );
  const [targetSubcategoryId, setTargetSubcategoryId] = useState(
    itemToEdit?.targetSubcategoryId || ''
  );
  const [targetSubcategoryName, setTargetSubcategoryName] = useState(
    itemToEdit?.targetSubcategoryName || ''
  );
  const [targetCategoryId, setTargetCategoryId] = useState(
    itemToEdit?.targetCategoryId || ''
  );
  const [targetCategoryName, setTargetCategoryName] = useState(
    itemToEdit?.targetCategoryName || ''
  );

  // Audience & Assignment Governance State (4 Levels)
  const [assignments, setAssignments] = useState<TrainingAssignment>(
    itemToEdit?.assignments || {
      targetTypes: itemToEdit?.targetTypeName ? [itemToEdit.targetTypeName] : [],
      targetEquipmentIds: itemToEdit?.targetEquipmentId ? [itemToEdit.targetEquipmentId] : [],
      targetEquipmentCodes: itemToEdit?.targetEquipmentCode ? [itemToEdit.targetEquipmentCode] : [],
      targetEquipmentNames: itemToEdit?.targetEquipmentName ? [itemToEdit.targetEquipmentName] : [],
      targetRoles: [],
      targetWorkgroups: [],
      targetUserIds: [],
    }
  );

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Checklist Items State
  const [items, setItems] = useState<ChecklistItemDefinition[]>(
    itemToEdit?.checklistData?.items && Array.isArray(itemToEdit.checklistData.items) && itemToEdit.checklistData.items.length > 0
      ? itemToEdit.checklistData.items
      : [
          {
            id: `item-${Date.now()}-1`,
            order: 1,
            title: 'بررسی وضعیت فیزیکی و اتصالات تغذیه برق اضطراری (UPS)',
            description: 'اطمینان از سلامت کابل، نبود لقی در دوشاخه و اتصال به پریز ایمن',
            responseType: 'pass_fail',
            required: true,
            safetyNote: 'استفاده از رابط‌های غیر استاندارد ممنوع است.',
          },
          {
            id: `item-${Date.now()}-2`,
            order: 2,
            title: 'انجام تست خودکار اولیه و کنترل چراغ‌های هشدار',
            description: 'روشن کردن دستگاه و مشاهده پیام Ready یا PASS',
            responseType: 'done_not_done',
            required: true,
          },
          {
            id: `item-${Date.now()}-3`,
            order: 3,
            title: 'کنترل فشار یا پارامتر عددی ورودی / خروجی',
            description: 'ثبت مقدار گیج یا سنسور دیجیتال',
            responseType: 'numeric',
            unit: 'Bar',
            minVal: 3.5,
            maxVal: 6.0,
            required: true,
            helpText: 'محدوده مجاز بین ۳.۵ تا ۶ بار است.',
          },
        ]
  );

  const handleAddItem = () => {
    const newItem: ChecklistItemDefinition = {
      id: `item-${Date.now()}-${items.length + 1}`,
      order: items.length + 1,
      title: '',
      description: '',
      responseType: 'pass_fail',
      required: true,
    };
    setItems([...items, newItem]);
    setValidationErrors([]);
  };

  const handleUpdateItem = (id: string, updates: Partial<ChecklistItemDefinition>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
    setValidationErrors([]);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      setValidationErrors(['حداقل یک گام در چک‌لیست باید وجود داشته باشد.']);
      return;
    }
    const updated = items.filter((it) => it.id !== id).map((it, idx) => ({ ...it, order: idx + 1 }));
    setItems(updated);
    setValidationErrors([]);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setItems(reordered.map((it, idx) => ({ ...it, order: idx + 1 })));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('عنوان چک‌لیست الزامی است و نمی‌تواند خالی باشد.');
    }

    if (scopeLevel === 'equipment' && !targetEquipmentId) {
      errors.push('سطح اتصال «اختصاصی یک تجهیز» انتخاب شده اما هیچ تجهیزی از فهرست انتخاب نشده است.');
    }

    if (scopeLevel === 'type' && !targetTypeId.trim()) {
      errors.push('سطح اتصال «نوع تجهیز (Type)» انتخاب شده اما نوع تجهیز مشخص نشده است.');
    }

    if (scopeLevel === 'subcategory' && !targetSubcategoryId) {
      errors.push('سطح اتصال «زیردسته ساختار» انتخاب شده اما هیچ زیردسته‌ای انتخاب نشده است.');
    }

    if (scopeLevel === 'category' && !targetCategoryId) {
      errors.push('سطح اتصال «دسته کل اموال» انتخاب شده اما دسته کلی انتخاب نشده است.');
    }

    if (items.length === 0) {
      errors.push('چک‌لیست باید حداقل دارای یک گام ارزیابی باشد.');
    }

    items.forEach((it, idx) => {
      const stepNo = idx + 1;
      if (!it.title.trim()) {
        errors.push(`گام شماره ${stepNo}: عنوان یا شرح آزمون خالی است.`);
      }
      if (it.responseType === 'numeric' && (!it.unit || !it.unit.trim())) {
        errors.push(`گام شماره ${stepNo} (نوع عددی): وارد کردن واحد اندازه‌گیری (مانند Bar، Volt، °C) الزامی است.`);
      }
      if (it.responseType === 'single_choice' && (!it.options || it.options.filter((o) => o.trim()).length < 2)) {
        errors.push(`گام شماره ${stepNo} (نوع چند گزینه‌ای): تعریف حداقل ۲ گزینه پاسخ معتبر الزامی است.`);
      }
    });

    return errors;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setValidationErrors([]);

    // Find selected equipment
    const selectedEq = equipmentList.find((e) => e.id === targetEquipmentId);

    const checklistPayload: EducationItem = {
      id: itemToEdit?.id || `chk-${Date.now()}`,
      name: title.trim(),
      type: 'checklist',
      parentId: itemToEdit?.parentId || currentFolderId || 'f-checklists',
      description: description.trim(),
      status,
      scopeLevel,
      version: version.trim() || '1.0',
      author: itemToEdit?.author || currentUser?.name || 'کارشناس مهندسی پزشکی',
      authorRole: itemToEdit?.authorRole || currentUser?.roleFa || 'کارشناس تجهیزات',
      department: itemToEdit?.department || currentUser?.department || 'مهندسی پزشکی',
      createdAt: itemToEdit?.createdAt || '۱۴۰۴/۰۲/۲۲',
      updatedAt: 'امروز',
      duration: `${estimatedMinutes} دقیقه`,
      tags: [
        'چک‌لیست',
        scopeLevel,
        targetTypeName || targetTypeId,
        selectedEq ? selectedEq.code : '',
        targetSubcategoryName,
        targetCategoryName,
      ].filter(Boolean),
      checklistData: {
        objective: objective.trim(),
        estimatedMinutes,
        safetyPrecautions: safetyPrecautions.trim(),
        items,
      },
      // Target References for smart passport resolution
      targetCategoryId: scopeLevel === 'category' ? targetCategoryId : undefined,
      targetCategoryName: scopeLevel === 'category' ? targetCategoryName : undefined,
      targetSubcategoryId: scopeLevel === 'subcategory' ? targetSubcategoryId : undefined,
      targetSubcategoryName: scopeLevel === 'subcategory' ? targetSubcategoryName : undefined,
      targetTypeId: scopeLevel === 'type' ? (targetTypeName || targetTypeId) : undefined,
      targetTypeName: scopeLevel === 'type' ? (targetTypeName || targetTypeId) : undefined,
      targetEquipmentId: scopeLevel === 'equipment' ? targetEquipmentId : undefined,
      targetEquipmentCode: scopeLevel === 'equipment' ? selectedEq?.code : undefined,
      targetEquipmentName: scopeLevel === 'equipment' ? selectedEq?.faName : undefined,
      // Direct linking for maximum backward compatibility
      linkedAssetId: scopeLevel === 'equipment' ? targetEquipmentId : undefined,
      linkedEquipmentCode: scopeLevel === 'equipment' ? selectedEq?.code : undefined,
      // 4-Level Audience Assignments
      assignments: {
        ...assignments,
        targetTypes: assignments.targetTypes?.length ? assignments.targetTypes : (scopeLevel === 'type' && targetTypeName ? [targetTypeName] : undefined),
        targetEquipmentIds: assignments.targetEquipmentIds?.length ? assignments.targetEquipmentIds : (scopeLevel === 'equipment' && targetEquipmentId ? [targetEquipmentId] : undefined),
        targetEquipmentCodes: assignments.targetEquipmentCodes?.length ? assignments.targetEquipmentCodes : (scopeLevel === 'equipment' && selectedEq ? [selectedEq.code] : undefined),
        targetEquipmentNames: assignments.targetEquipmentNames?.length ? assignments.targetEquipmentNames : (scopeLevel === 'equipment' && selectedEq ? [selectedEq.faName] : undefined),
      },
    };

    onSave(checklistPayload);
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                {itemToEdit ? 'ویرایش چک‌لیست عملیاتی و آموزشی' : 'طراحی و ایجاد چک‌لیست عملیاتی جدید'}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/10">
                  v{version}
                </span>
              </h2>
              <p className="text-xs text-sky-200/80 font-medium mt-0.5">
                تعریف گام‌های بازرسی، انواع پاسخ، الزامات ایمنی و اتصال هوشمند به پرونده اموال
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Validation Error Alert Banner */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-black text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>لطفاً موارد و فیلدهای الزامی زیر را تکمیل فرمایید:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 pr-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Top Row: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>عنوان چک‌لیست</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationErrors([]);
                }}
                placeholder="مثال: چک‌لیست آزمون SST و بازرسی شیفت ونتیلاتور مراقبت‌های ویژه"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 bg-slate-50/50 transition-all ${
                  validationErrors.some((e) => e.includes('عنوان چک‌لیست'))
                    ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>مدت زمان تقریبی اجرا (دقیقه)</span>
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Description & Objective */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">توضیحات کلی چک‌لیست</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح کوتاه درباره دامنه کاربرد و شیفت اجرایی این چک‌لیست..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">هدف اصلی از اجرای این چک‌لیست (Objective)</label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="مثال: سنجش عدم نشتی مدار تنفسی و تضمین عملکرد آلارم‌های قطع گاز قبل از اتصال به بیمار"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Hierarchy & Governance Binding Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-800">
                  اتصال به ساختار و سلسله‌مراتب اموال (Equipment Hierarchy)
                </span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">وضعیت انتشار:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : status === 'draft'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="published">معتبر و منتشرشده (نمایش در پرونده هوشمند اموال)</option>
                  <option value="draft">پیش‌نویس (عدم نمایش در پرونده هوشمند)</option>
                  <option value="deprecated">منسوخ و بایگانی شده</option>
                </select>
              </div>
            </div>

            {/* Scope Level Radio Tabs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600">سطح اتصال در ساختار تجهیزات:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'equipment', label: 'اختصاصی یک تجهیز (پلاک اموال)' },
                  { id: 'type', label: 'نوع تجهیز (Type)' },
                  { id: 'subcategory', label: 'زیردسته ساختار (Subcategory)' },
                  { id: 'category', label: 'دسته کل اموال (Category)' },
                  { id: 'unassigned', label: 'عمومی و آزاد (بدون اتصال)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setScopeLevel(s.id as ContentScopeLevel);
                      setValidationErrors([]);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      scopeLevel === s.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Target Selectors with Search & Auto-fill */}
            {scopeLevel === 'equipment' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                  <span>انتخاب تجهیز مشخص (قابلیت جستجو با نام، کد اموال، بخش، برند و مدل):</span>
                  <span className="text-rose-500 font-normal text-[10px]">* الزامی</span>
                </label>

                <SearchableEquipmentPicker
                  equipmentList={equipmentList}
                  selectedEquipmentId={targetEquipmentId}
                  onSelectEquipment={(eq) => {
                    if (eq) {
                      setTargetEquipmentId(eq.id);
                      if (eq.type) {
                        setTargetTypeId(eq.type);
                        setTargetTypeName(eq.type);
                      }
                      if (eq.subcategory) setTargetSubcategoryName(eq.subcategory);
                      if (eq.category) setTargetCategoryName(eq.category);
                    } else {
                      setTargetEquipmentId('');
                    }
                    setValidationErrors([]);
                  }}
                  error={validationErrors.some((e) => e.includes('اختصاصی یک تجهیز'))}
                />

                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  این چک‌لیست با بالاترین اولویت (Level 1) مستقیماً در پرونده هوشمند همین شماره اموال قرار می‌گیرد.
                </p>
              </div>
            )}

            {scopeLevel === 'type' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                  <span>انتخاب یا جستجوی نوع استاندارد تجهیز (Type):</span>
                  <span className="text-rose-500 font-normal text-[10px]">* الزامی</span>
                </label>

                <SearchableTaxonomyPicker
                  classificationsList={classificationsList}
                  mode="type"
                  selectedId={targetTypeId}
                  onSelect={(item) => {
                    if (item) {
                      setTargetTypeId(item.name);
                      setTargetTypeName(item.name);
                      if (item.parentName) setTargetSubcategoryName(item.parentName);
                    } else {
                      setTargetTypeId('');
                      setTargetTypeName('');
                    }
                    setValidationErrors([]);
                  }}
                  placeholder="جستجو در بین تمامی Typeهای استاندارد (ونتیلاتور، الکتروشوک، پمپ سرنگ و...)"
                  error={validationErrors.some((e) => e.includes('نوع تجهیز'))}
                />

                <p className="text-[11px] text-sky-700 font-medium">
                  این چک‌لیست در پرونده تمامی تجهیزاتی که Type آنها برابر با این عنوان باشد نمایش داده خواهد شد.
                </p>
              </div>
            )}

            {scopeLevel === 'subcategory' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                  <span>انتخاب یا جستجوی زیردسته ساختار (Subcategory):</span>
                  <span className="text-rose-500 font-normal text-[10px]">* الزامی</span>
                </label>

                <SearchableTaxonomyPicker
                  classificationsList={classificationsList}
                  mode="subcategory"
                  selectedId={targetSubcategoryId}
                  onSelect={(item) => {
                    if (item) {
                      setTargetSubcategoryId(item.id);
                      setTargetSubcategoryName(item.name);
                      if (item.parentName) setTargetCategoryName(item.parentName);
                    } else {
                      setTargetSubcategoryId('');
                      setTargetSubcategoryName('');
                    }
                    setValidationErrors([]);
                  }}
                  placeholder="انتخاب زیردسته (تجهیزات تنفسی، مانیتورینگ، تصویربرداری و...)"
                  error={validationErrors.some((e) => e.includes('زیردسته ساختار'))}
                />
              </div>
            )}

            {scopeLevel === 'category' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                  <span>انتخاب یا جستجوی دسته کل اموال (Category):</span>
                  <span className="text-rose-500 font-normal text-[10px]">* الزامی</span>
                </label>

                <SearchableTaxonomyPicker
                  classificationsList={classificationsList}
                  mode="category"
                  selectedId={targetCategoryId}
                  onSelect={(item) => {
                    if (item) {
                      setTargetCategoryId(item.id);
                      setTargetCategoryName(item.name);
                    } else {
                      setTargetCategoryId('');
                      setTargetCategoryName('');
                    }
                    setValidationErrors([]);
                  }}
                  placeholder="انتخاب دسته کل (پزشکی، فناوری اطلاعات، آزمایشگاهی، اداری و...)"
                  error={validationErrors.some((e) => e.includes('دسته کل اموال'))}
                />
              </div>
            )}
          </div>

          {/* Safety Precautions Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-black">دستورالعمل‌ها و هشدارهای ایمنی و بالینی (Safety Precautions)</label>
            </div>
            <textarea
              rows={2}
              value={safetyPrecautions}
              onChange={(e) => setSafetyPrecautions(e.target.value)}
              placeholder="نکات ایمنی حیاتی که قبل از شروع تست باید توسط اپراتور به دقت مطالعه شود..."
              className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 4-Level Audience & Assignment Governance Section */}
          <EducationAudienceSection
            assignments={assignments}
            onChange={setAssignments}
            equipmentList={equipmentList}
          />

          {/* Checklist Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-black text-slate-800">گام‌ها و سؤالات ارزیابی چک‌لیست ({items.length} گام)</h3>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن گام جدید</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const isStepError = validationErrors.some((e) =>
                  e.includes(`گام شماره ${index + 1}`)
                );

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-colors ${
                      isStepError
                        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          placeholder={`عنوان گام ${index + 1} (مثال: بررسی نشتی مدار تنفسی)`}
                          className="font-bold text-xs text-slate-800 border-b border-slate-200 focus:border-sky-500 focus:outline-hidden px-1 py-1 w-full"
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          title="انتقال به بالا"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === items.length - 1}
                          title="انتقال به پایین"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="حذف این گام"
                          className="p-1 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step Configuration Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">نوع پاسخ و ورودی:</label>
                        <select
                          value={item.responseType}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              responseType: e.target.value as ChecklistResponseKind,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
                        >
                          <option value="pass_fail">تأیید / عدم تأیید (Pass / Fail)</option>
                          <option value="done_not_done">انجام شد / نشد (Done / Not Done)</option>
                          <option value="yes_no">بله / خیر (Yes / No)</option>
                          <option value="numeric">مقدار عددی اندازه‌گیری شده (Numeric)</option>
                          <option value="single_choice">انتخاب از گزینه‌ها (Single Choice)</option>
                          <option value="text">متن توضیحی / یادداشت آزاد (Text)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">راهنمای اجرای این گام برای اپراتور:</label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                          placeholder="توضیح کوتاه نحوه تست یا مشاهده..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Additional parameters based on response type */}
                    {item.responseType === 'numeric' && (
                      <div className="grid grid-cols-3 gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                        <div>
                          <label className="text-[10px] font-black text-slate-600">واحد اندازه‌گیری (Unit) *:</label>
                          <input
                            type="text"
                            value={item.unit || ''}
                            onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                            placeholder="مثال: Bar, °C, V, mL"
                            className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs bg-white mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">حداقل مقدار مجاز (Min):</label>
                          <input
                            type="number"
                            step="any"
                            value={item.minVal ?? ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                minVal: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="حداقل"
                            className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs bg-white mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">حداکثر مقدار مجاز (Max):</label>
                          <input
                            type="number"
                            step="any"
                            value={item.maxVal ?? ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                maxVal: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="حداکثر"
                            className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs bg-white mt-0.5"
                          />
                        </div>
                      </div>
                    )}

                    {item.responseType === 'single_choice' && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                        <label className="text-[10px] font-black text-slate-600">
                          گزینه‌های پاسخ (با کاما یا خط تیره جدا کنید - حداقل ۲ گزینه) *:
                        </label>
                        <input
                          type="text"
                          value={item.options?.join(' ، ') || ''}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              options: e.target.value.split(/[،,-]/).map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="مثال: ۱۰۰٪ کامل ، بین ۵۰ تا ۹۰٪ ، کمتر از ۵۰٪"
                          className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 flex-wrap gap-2">
                      <label className="flex items-center gap-1.5 text-slate-600 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.required}
                          onChange={(e) => handleUpdateItem(item.id, { required: e.target.checked })}
                          className="rounded-sm text-sky-600"
                        />
                        <span>پاسخ به این گام الزامی است (Required)</span>
                      </label>

                      <div className="flex items-center gap-1 text-slate-500">
                        <input
                          type="text"
                          value={item.safetyNote || ''}
                          onChange={(e) => handleUpdateItem(item.id, { safetyNote: e.target.value })}
                          placeholder="هشدار ایمنی این گام (اختیاری)..."
                          className="text-[11px] px-2 py-0.5 rounded-md border border-slate-200 w-48 sm:w-64 bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {validationErrors.length > 0 ? (
              <div className="text-rose-700 font-bold flex items-center gap-1.5 bg-rose-100/80 px-3 py-1.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationErrors[0]} (تعداد کل خطاهای تکمیل: {validationErrors.length})</span>
              </div>
            ) : (
              <div className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>چک‌لیست پس از ذخیره بر اساس سطح اتصال فوراً در سیستم LMS و پرونده هوشمند فعال خواهد شد.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{itemToEdit ? 'ذخیره تغییرات چک‌لیست' : 'انتشار و ثبت نهایی چک‌لیست'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
