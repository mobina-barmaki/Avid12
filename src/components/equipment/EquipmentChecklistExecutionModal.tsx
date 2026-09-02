import React, { useState } from 'react';
import {
  X,
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Calendar,
  User,
  Building2,
  Printer,
  Check,
  RotateCcw,
  Save,
  CheckCircle,
} from 'lucide-react';
import {
  EducationItem,
  EquipmentItem,
  AppUser,
  ChecklistExecutionRecord,
  ChecklistItemExecutionValue,
} from '../../types';

interface EquipmentChecklistExecutionModalProps {
  isOpen?: boolean;
  onClose: () => void;
  checklist: EducationItem;
  equipment?: EquipmentItem | null;
  currentUser?: AppUser;
  onSaveExecution?: (record: ChecklistExecutionRecord) => void;
  onSaveExecutionRecord?: (record: ChecklistExecutionRecord) => void;
}

export const EquipmentChecklistExecutionModal: React.FC<EquipmentChecklistExecutionModalProps> = ({
  isOpen = true,
  onClose,
  checklist,
  equipment: initialEquipment,
  currentUser,
  onSaveExecution,
  onSaveExecutionRecord,
}) => {
  if (!isOpen || !checklist) return null;

  const equipment: EquipmentItem = initialEquipment || {
    id: checklist.targetEquipmentId || checklist.linkedAssetId || 'eq-fallback',
    code: checklist.targetEquipmentCode || checklist.linkedEquipmentCode || 'LMS-GEN',
    faName: checklist.targetEquipmentName || checklist.name || 'تجهیز پزشکی',
    enName: 'Medical Equipment',
    brand: 'استاندارد',
    model: 'GEN-01',
    category: checklist.targetCategoryName || 'تجهیزات پزشکی',
    subcategory: checklist.targetSubcategoryName || 'عمومی',
    type: checklist.targetTypeName || checklist.targetTypeId || 'تجهیز جنرال',
    department: checklist.department || 'بخش بالینی',
    location: 'بیمارستان',
    status: 'active',
    riskClass: 'IIb',
    ownershipType: 'capital',
    entryDate: '۱۴۰۳/۰۱/۰۱',
    createdAt: '۱۴۰۳/۰۱/۰۱',
    updatedAt: 'امروز',
    isDraft: false,
    dailyCareLogs: [],
    repairHistory: [],
    calibrationRecords: [],
    checklistExecutionHistory: [],
  };

  const items = checklist.checklistData?.items || [
    {
      id: `fallback-item-1`,
      order: 1,
      title: 'بررسی وضعیت فیزیکی، بدنه و اتصالات الکتریکی دستگاه',
      description: 'اطمینان از سلامت کابل، نبود شکستگی و عملکرد کلید اصلی برق',
      responseType: 'pass_fail',
      required: true,
    },
    {
      id: `fallback-item-2`,
      order: 2,
      title: 'انجام خودآزمایی اولیه (Self-Test) و بررسی آلارم‌های دیداری و شنیداری',
      description: 'روشن کردن دستگاه و ثبت وضعیت PASS یا بدون خطا',
      responseType: 'done_not_done',
      required: true,
    },
  ];

  // Execution state
  const [shift, setShift] = useState<'صبح' | 'عصر' | 'شب'>('صبح');
  const [generalNotes, setGeneralNotes] = useState('');
  const [values, setValues] = useState<Record<string, ChecklistItemExecutionValue>>(() => {
    const init: Record<string, ChecklistItemExecutionValue> = {};
    items.forEach((it) => {
      init[it.id] = {
        itemId: it.id,
        status: 'pending',
      };
    });
    return init;
  });

  const handleUpdateValue = (itemId: string, updates: Partial<ChecklistItemExecutionValue>) => {
    setValues((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        ...updates,
      },
    }));
  };

  // Completion stats
  const totalItems = items.length;
  const answeredItems = items.filter((it) => {
    const val = values[it.id];
    if (!val) return false;
    if (it.responseType === 'numeric') return val.numericValue !== undefined && !isNaN(val.numericValue);
    if (it.responseType === 'text') return Boolean(val.textValue && val.textValue.trim());
    if (it.responseType === 'single_choice') return Boolean(val.choiceValue);
    return val.status === 'pass' || val.status === 'fail' || val.status === 'done' || val.status === 'not_done';
  }).length;

  const completionPct = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;

  // Auto-calculated evaluation based on failed items
  const failedCount = items.filter((it) => values[it.id]?.status === 'fail' || values[it.id]?.status === 'not_done').length;

  const [evaluation, setEvaluation] = useState<'pass' | 'conditional_pass' | 'failed' | 'completed'>('pass');

  const handleFinish = () => {
    // Check required items
    const missingRequired = items.filter((it) => {
      if (!it.required) return false;
      const val = values[it.id];
      if (!val) return true;
      if (it.responseType === 'numeric') return val.numericValue === undefined || isNaN(val.numericValue);
      if (it.responseType === 'text') return !val.textValue || !val.textValue.trim();
      if (it.responseType === 'single_choice') return !val.choiceValue;
      return val.status === 'pending';
    });

    if (missingRequired.length > 0) {
      alert(`لطفاً تمامی گام‌های اجباری چک‌لیست (${missingRequired.length} مورد باقیمانده) را تکمیل فرمایید.`);
      return;
    }

    const calculatedEvaluation =
      failedCount === 0 ? 'pass' : failedCount === 1 ? 'conditional_pass' : 'failed';

    const newRecord: ChecklistExecutionRecord = {
      id: `exec-${Date.now()}`,
      checklistId: checklist.id,
      checklistTitle: checklist.name,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      performedBy: currentUser?.name || 'کاربر سیستم',
      performerRole: currentUser?.roleFa || 'کارشناس بالینی/تجهیزات',
      department: equipment.department || 'بخش بالینی',
      executedAt: new Date().toLocaleDateString('fa-IR'),
      shift,
      values: Object.values(values),
      evaluation: calculatedEvaluation,
      notes: generalNotes.trim(),
    };

    if (onSaveExecution) {
      onSaveExecution(newRecord);
    }
    if (onSaveExecutionRecord) {
      onSaveExecutionRecord(newRecord);
    }
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200">
                  اجرای برخط چک‌لیست عملیاتی
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  نسخه {checklist.version || '1.0'}
                </span>
              </div>
              <h2 className="text-base font-black mt-0.5 text-white">{checklist.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment Context Banner */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="text-slate-500 font-normal">تجهیز مربوطه:</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-mono text-indigo-700">
                {equipment.code}
              </span>
              <span>{equipment.faName}</span>
            </div>
            <div className="text-slate-500">
              بخش: <strong className="text-slate-700">{equipment.department}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>شیفت:</span>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="bg-transparent font-black text-sky-700 focus:outline-hidden cursor-pointer"
              >
                <option value="صبح">شیفت صبح</option>
                <option value="عصر">شیفت عصر</option>
                <option value="شب">شیفت شب</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>پیشرفت تکمیل:</span>
            <span className="font-mono text-sky-700">
              {answeredItems} از {totalItems} گام ({completionPct}٪)
            </span>
          </div>
          <div className="flex-1 max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Safety Precautions Alert */}
          {checklist.checklistData.safetyPrecautions && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <strong className="font-black block text-amber-950">
                  دستورالعمل‌ها و هشدارهای ایمنی حیاتی:
                </strong>
                <p className="leading-relaxed font-medium">{checklist.checklistData.safetyPrecautions}</p>
              </div>
            </div>
          )}

          {/* Checklist Step List */}
          <div className="space-y-3.5">
            {items.map((item, index) => {
              const currentVal = values[item.id] || { itemId: item.id, status: 'pending' };

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4.5 transition-all shadow-xs space-y-3 ${
                    currentVal.status === 'fail' || currentVal.status === 'not_done'
                      ? 'border-rose-300 bg-rose-50/20'
                      : currentVal.status === 'pass' || currentVal.status === 'done'
                      ? 'border-emerald-300 bg-emerald-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5 ${
                          currentVal.status === 'pass' || currentVal.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentVal.status === 'fail' || currentVal.status === 'not_done'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                          {item.required && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-600 font-bold border border-rose-200">
                              اجباری
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        )}
                        {item.safetyNote && (
                          <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{item.safetyNote}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Response Controls */}
                    <div className="shrink-0 flex items-center gap-2">
                      {/* Pass / Fail */}
                      {item.responseType === 'pass_fail' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'pass' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'pass'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تأیید (PASS)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'fail' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'fail'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>عدم تأیید (FAIL)</span>
                          </button>
                        </div>
                      )}

                      {/* Done / Not Done */}
                      {item.responseType === 'done_not_done' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'done' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'done'
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>انجام شد</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'not_done' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'not_done'
                                ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span>انجام نشد</span>
                          </button>
                        </div>
                      )}

                      {/* Yes / No */}
                      {item.responseType === 'yes_no' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'pass' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'pass'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                            }`}
                          >
                            <span>بله</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateValue(item.id, { status: 'fail' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                              currentVal.status === 'fail'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                            }`}
                          >
                            <span>خیر</span>
                          </button>
                        </div>
                      )}

                      {/* Numeric Input */}
                      {item.responseType === 'numeric' && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="any"
                              value={currentVal.numericValue ?? ''}
                              onChange={(e) => {
                                const num = e.target.value === '' ? undefined : Number(e.target.value);
                                let st: 'pass' | 'fail' | 'pending' = 'pass';
                                if (num !== undefined) {
                                  if (item.minVal !== undefined && num < item.minVal) st = 'fail';
                                  if (item.maxVal !== undefined && num > item.maxVal) st = 'fail';
                                } else {
                                  st = 'pending';
                                }
                                handleUpdateValue(item.id, { numericValue: num, status: st });
                              }}
                              placeholder="مقدار..."
                              className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-white text-center focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                            />
                            {item.unit && (
                              <span className="mr-1.5 text-xs font-bold text-slate-500">
                                {item.unit}
                              </span>
                            )}
                          </div>
                          {(item.minVal !== undefined || item.maxVal !== undefined) && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({item.minVal ?? '-'} الی {item.maxVal ?? '-'})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Single Choice Pill Group */}
                      {item.responseType === 'single_choice' && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.options?.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                handleUpdateValue(item.id, {
                                  choiceValue: opt,
                                  status: 'done',
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                currentVal.choiceValue === opt
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks input for this step */}
                  <div className="pt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={currentVal.remarks || ''}
                      onChange={(e) => handleUpdateValue(item.id, { remarks: e.target.value })}
                      placeholder="یادداشت یا مشاهده خاص در مورد این گام (اختیاری)..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* General Notes & Evaluation Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <label className="text-xs font-black text-slate-800 block">
              توضیحات و جمع‌بندی نهایی ارزیاب / مسئول شیفت:
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="نکات قابل توجه در عملکرد دستگاه، گزارش به مهندسی پزشکی، یا وضعیت عمومی ترالی..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-500">ارزیاب:</span>
                <span className="text-slate-800">{currentUser.name}</span>
                <span className="text-slate-400">({currentUser.roleFa})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">نتیجه خودکار ارزیابی:</span>
                {failedCount === 0 ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تأیید کامل (PASS)
                  </span>
                ) : failedCount === 1 ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    تأیید مشروط ({failedCount} خطا)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    عدم تأیید و نیازمند بررسی فنی ({failedCount} خطا)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>ثبت نهایی و ذخیره آزمون در پرونده هوشمند</span>
          </button>
        </div>
      </div>
    </div>
  );
};
