import React, { useState, useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FolderTree,
  CheckCircle2,
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import {
  EducationItem,
  StructuredGuideSection,
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

interface EducationCreateGuideModalProps {
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

export const EducationCreateGuideModal: React.FC<EducationCreateGuideModalProps> = ({
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
  const [readingDuration, setReadingDuration] = useState(
    itemToEdit?.guideData?.readingDuration || '۱۰ دقیقه'
  );
  const [objectivesInput, setObjectivesInput] = useState(
    itemToEdit?.guideData?.objectives?.join('\n') ||
      'تسلط بر راه‌اندازی و مدهای کاری دستگاه\nشناخت و رفع آلارم‌های بحرانی بالینی\nرعایت پروتکل‌های ایمنی بیمار و استریلیزاسیون'
  );
  const [prerequisitesInput, setPrerequisitesInput] = useState(
    itemToEdit?.guideData?.prerequisites?.join('\n') ||
      'آشنایی با مبانی مراقبت‌های ویژه و ایمنی الکتریکی بیمار'
  );
  const [keyTopicsInput, setKeyTopicsInput] = useState(
    itemToEdit?.guideData?.keyTopics?.join(' ، ') || 'راه‌اندازی ، مدهای تهویه ، کالیبراسیون ، عیب‌یابی'
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

  // Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Structured Sections
  const [sections, setSections] = useState<StructuredGuideSection[]>(
    itemToEdit?.guideData?.sections && Array.isArray(itemToEdit.guideData.sections) && itemToEdit.guideData.sections.length > 0
      ? itemToEdit.guideData.sections
      : [
          {
            id: `sec-${Date.now()}-1`,
            order: 1,
            title: '۱. معرفی، مشخصات عمومی و الزامات محیطی',
            content:
              'دستگاه باید در محیط تمیز و با تهویه مناسب قرار گیرد. اتصال به پریز برق اضطراری قرمز رنگ بیمارستان و بررسی سلامت کابل تغذیه الزامی است.',
            keyTakeaways: ['اتصال به سیستم UPS الزامی است.', 'دمای کاری استاندارد بین ۱۵ الی ۳۰ درجه سانتی‌گراد است.'],
          },
          {
            id: `sec-${Date.now()}-2`,
            order: 2,
            title: '۲. مراحل گام‌به‌گام راه‌اندازی و آزمون اولیه',
            content:
              'کلید پاور دستگاه را روشن کرده و اجازه دهید خودآزمایی اولیه تکمیل شود. از اتصال محکم اتصالات و عدم وجود صدای ناهنجار اطمینان حاصل نمایید.',
            safetyWarning: 'در صورت مشاهده دود، بوی سوختگی یا جرقه بلافاصله دستگاه را خاموش و کابل را جدا کنید.',
          },
        ]
  );

  const handleAddSection = () => {
    const newSection: StructuredGuideSection = {
      id: `sec-${Date.now()}-${sections.length + 1}`,
      order: sections.length + 1,
      title: `${sections.length + 1}. عنوان سرفصل جدید`,
      content: '',
      keyTakeaways: [],
    };
    setSections([...sections, newSection]);
    setValidationErrors([]);
  };

  const handleUpdateSection = (id: string, updates: Partial<StructuredGuideSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setValidationErrors([]);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      setValidationErrors(['حداقل یک سرفصل در محتوای آموزشی باید وجود داشته باشد.']);
      return;
    }
    const updated = sections
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(updated);
    setValidationErrors([]);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setSections(reordered.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('عنوان آموزش / دوره الزامی است.');
    }

    if (scopeLevel === 'equipment' && !targetEquipmentId) {
      errors.push('سطح اتصال «اختصاصی یک تجهیز» انتخاب شده ولی هیچ تجهیزی انتخاب نشده است.');
    }

    if (scopeLevel === 'type' && !targetTypeId.trim()) {
      errors.push('سطح اتصال «نوع تجهیز (Type)» انتخاب شده ولی نوع تجهیز مشخص نشده است.');
    }

    if (scopeLevel === 'subcategory' && !targetSubcategoryId) {
      errors.push('سطح اتصال «زیردسته ساختار» انتخاب شده ولی زیردسته‌ای انتخاب نشده است.');
    }

    if (scopeLevel === 'category' && !targetCategoryId) {
      errors.push('سطح اتصال «دسته کل اموال» انتخاب شده ولی دسته کلی انتخاب نشده است.');
    }

    if (sections.length === 0) {
      errors.push('حداقل یک سرفصل آموزشی برای این راهنما باید تعریف شود.');
    }

    sections.forEach((sec, idx) => {
      const secNo = idx + 1;
      if (!sec.title.trim()) {
        errors.push(`سرفصل شماره ${secNo}: عنوان سرفصل خالی است.`);
      }
      if (!sec.content.trim()) {
        errors.push(`سرفصل شماره ${secNo}: متن و شرح آموزشی سرفصل خالی است.`);
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

    const selectedEq = equipmentList.find((e) => e.id === targetEquipmentId);

    const objectives = objectivesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const prerequisites = prerequisitesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const keyTopics = keyTopicsInput
      .split(/[،,-]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const guidePayload: EducationItem = {
      id: itemToEdit?.id || `guide-${Date.now()}`,
      name: title.trim(),
      type: 'structured_guide',
      parentId: itemToEdit?.parentId || currentFolderId || 'f-biomedical',
      description: description.trim(),
      status,
      scopeLevel,
      version: version.trim() || '1.0',
      author: itemToEdit?.author || currentUser?.name || 'کارشناس آموزش بالینی',
      authorRole: itemToEdit?.authorRole || currentUser?.roleFa || 'کارشناس آموزش',
      department: itemToEdit?.department || currentUser?.department || 'آموزش بالینی',
      createdAt: itemToEdit?.createdAt || '۱۴۰۴/۰۲/۲۲',
      updatedAt: 'امروز',
      duration: readingDuration,
      tags: [
        'آموزش ساختاریافته',
        scopeLevel,
        targetTypeName || targetTypeId,
        selectedEq ? selectedEq.code : '',
        targetSubcategoryName,
        targetCategoryName,
      ].filter(Boolean),
      guideData: {
        objectives,
        prerequisites,
        readingDuration,
        keyTopics,
        sections,
      },
      // Target References
      targetCategoryId: scopeLevel === 'category' ? targetCategoryId : undefined,
      targetCategoryName: scopeLevel === 'category' ? targetCategoryName : undefined,
      targetSubcategoryId: scopeLevel === 'subcategory' ? targetSubcategoryId : undefined,
      targetSubcategoryName: scopeLevel === 'subcategory' ? targetSubcategoryName : undefined,
      targetTypeId: scopeLevel === 'type' ? (targetTypeName || targetTypeId) : undefined,
      targetTypeName: scopeLevel === 'type' ? (targetTypeName || targetTypeId) : undefined,
      targetEquipmentId: scopeLevel === 'equipment' ? targetEquipmentId : undefined,
      targetEquipmentCode: scopeLevel === 'equipment' ? selectedEq?.code : undefined,
      targetEquipmentName: scopeLevel === 'equipment' ? selectedEq?.faName : undefined,
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

    onSave(guidePayload);
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                {itemToEdit ? 'ویرایش محتوای آموزشی ساختاریافته' : 'ایجاد محتوای آموزشی و دوره تعاملی جدید'}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10">
                  v{version}
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
                تدوین سرفصل‌های آموزشی، اهداف یادگیری، هشدارهای بالینی و اتصال به سلسله‌مراتب اموال
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
          {/* Validation Errors Banner */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-black text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>لطفاً موارد الزامی زیر را تکمیل فرمایید:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 pr-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>عنوان آموزش / دوره</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationErrors([]);
                }}
                placeholder="مثال: دوره جامع اپراتوری و تنظیم مدهای تنفسی ونتیلاتور PB840"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 bg-slate-50/50 transition-all ${
                  validationErrors.some((e) => e.includes('عنوان آموزش'))
                    ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>مدت زمان تقریبی مطالعه</span>
              </label>
              <input
                type="text"
                value={readingDuration}
                onChange={(e) => setReadingDuration(e.target.value)}
                placeholder="مثال: ۱۵ دقیقه مطالعه"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">توضیح و خلاصه دوره آموزشی</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="خلاصه کاربرد و محتوای این راهنما برای کادر درمانی و مهندسی..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Objectives & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">اهداف یادگیری دوره (در هر خط یک مورد)</label>
              <textarea
                rows={3}
                value={objectivesInput}
                onChange={(e) => setObjectivesInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">پیش‌نیازها و کلمات کلیدی سرفصل‌ها</label>
              <textarea
                rows={3}
                value={prerequisitesInput}
                onChange={(e) => setPrerequisitesInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Hierarchy Binding Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
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
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Selectors with Search & Taxonomy */}
            {scopeLevel === 'equipment' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                  <span>انتخاب تجهیز مشخص (قابلیت جستجو با نام، پلاک، بخش و برند):</span>
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
                  placeholder="جستجو در بین تمامی Typeهای استاندارد..."
                  error={validationErrors.some((e) => e.includes('نوع تجهیز'))}
                />
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
                  placeholder="انتخاب زیردسته..."
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
                  placeholder="انتخاب دسته کل..."
                  error={validationErrors.some((e) => e.includes('دسته کل اموال'))}
                />
              </div>
            )}
          </div>

          {/* 4-Level Audience & Assignment Governance Section */}
          <EducationAudienceSection
            assignments={assignments}
            onChange={setAssignments}
            equipmentList={equipmentList}
          />

          {/* Structured Sections Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-800">
                  سرفصل‌های آموزشی دوره ({sections.length} فصل)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن سرفصل جدید</span>
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section, index) => {
                const isSecError = validationErrors.some((e) =>
                  e.includes(`سرفصل شماره ${index + 1}`)
                );

                return (
                  <div
                    key={section.id}
                    className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-colors ${
                      isSecError
                        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleUpdateSection(section.id, { title: e.target.value })
                          }
                          placeholder={`عنوان سرفصل ${index + 1}`}
                          className="font-bold text-xs text-slate-800 border-b border-slate-200 focus:border-emerald-500 focus:outline-hidden px-1 py-1 w-full"
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, 'up')}
                          disabled={index === 0}
                          title="انتقال به بالا"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(index, 'down')}
                          disabled={index === sections.length - 1}
                          title="انتقال به پایین"
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          title="حذف سرفصل"
                          className="p-1 text-rose-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">متن کامل سرفصل آموزشی:</label>
                      <textarea
                        rows={3}
                        value={section.content}
                        onChange={(e) =>
                          handleUpdateSection(section.id, { content: e.target.value })
                        }
                        placeholder="توضیحات جامع گام‌به‌گام برای یادگیری کادر درمان و اپراتورها..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">نکات کلیدی (با ویرگول جدا کنید):</label>
                        <input
                          type="text"
                          value={section.keyTakeaways?.join(' ، ') || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, {
                              keyTakeaways: e.target.value.split(/[،,-]/).map((s) => s.trim()).filter(Boolean),
                            })
                          }
                          placeholder="نکته ۱ ، نکته ۲"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-amber-700">هشدار ایمنی این بخش (اختیاری):</label>
                        <input
                          type="text"
                          value={section.safetyWarning || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, { safetyWarning: e.target.value })
                          }
                          placeholder="هشدار بالینی ویژه این فصل..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs bg-amber-50/50"
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
                <span>آموزش پس از ذخیره مستقیماً در سامانه LMS و شناسنامه پرونده هوشمند تجهیز فعال خواهد شد.</span>
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{itemToEdit ? 'ذخیره تغییرات آموزش' : 'انتشار و ثبت نهایی آموزش'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
