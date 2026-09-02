import React, { useState, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Plus,
  Clock,
  UserCheck,
  Building,
  ShieldAlert,
  FileText,
  X,
  Camera,
  Image as ImageIcon,
  Eye,
  Trash2,
  Paperclip,
  Info,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { FailureReport, EquipmentItem, AppUser } from '../../types';
import { isEligibleForFaultReport } from '../../utils/equipmentEligibility';

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
}

interface FailuresViewProps {
  currentUser?: AppUser;
  failuresList?: FailureReport[];
  equipmentList?: EquipmentItem[];
  onReportFailure: (report: FailureReport) => void;
  onUpdateFailureStatus: (
    id: string,
    status: FailureReport['status'],
    actionsTaken?: string
  ) => void;
}

export const FailuresView: React.FC<FailuresViewProps> = ({
  currentUser,
  failuresList = [],
  equipmentList = [],
  onReportFailure,
  onUpdateFailureStatus,
}) => {
  const isDeptHead = currentUser?.role === 'department_head' || currentUser?.role === 'dept_head';
  const isOperator =
    currentUser?.role === 'clinical_operator' ||
    currentUser?.role === 'nurse_operator' ||
    currentUser?.role === 'operator' ||
    currentUser?.roleFa?.includes('اپراتور') ||
    currentUser?.roleFa?.includes('پرستار');

  const isCalibrationQC =
    currentUser?.username === 'bio_calibration' ||
    currentUser?.roleFa?.includes('کالیبراسیون') ||
    currentUser?.roleFa?.includes('کنترل کیفی');

  const isPropertyWorkgroup =
    currentUser?.role === 'asset_manager' ||
    currentUser?.role === 'warehouse_keeper' ||
    currentUser?.role === 'asset_tagging_officer' ||
    currentUser?.role === 'inventory_clerk' ||
    currentUser?.roleFa?.includes('اموال') ||
    currentUser?.roleFa?.includes('انبار') ||
    currentUser?.roleFa?.includes('موجودی') ||
    currentUser?.roleFa?.includes('پلاک‌کوبی') ||
    currentUser?.department?.includes('اموال') ||
    currentUser?.department?.includes('انبار');

  const isRepairTech =
    (currentUser?.role === 'biomedical_engineer' ||
      currentUser?.role === 'support_tech' ||
      currentUser?.username === 'bio_repair' ||
      currentUser?.roleFa?.includes('تعمیرات')) &&
    !isCalibrationQC;

  // Can submit new failure reports:
  // Allowed: مدیر اموال، انباردار، کارشناس ثبت و کنترل موجودی، کارشناس کالیبراسیون و کنترل کیفی، اپراتورها و کادر مهندسی پزشکی
  // Disallowed: Department Head (view-only), Hospital Admin (view-only), Finance Manager (view-only)
  const canReportFailure =
    (isRepairTech || isCalibrationQC || isPropertyWorkgroup || isOperator) &&
    !isDeptHead &&
    currentUser?.role !== 'hospital_admin' &&
    currentUser?.role !== 'finance_manager';

  // Can manage actions & change maintenance status:
  // Allowed: ONLY Technical repair engineers / support tech
  // Disallowed: Asset Managers, Warehouse Keepers, Inventory Clerks, Calibration QC, Operators, Dept Heads, Admins
  const canManageActions = isRepairTech;

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFailure, setSelectedFailure] = useState<FailureReport | null>(null);
  const [actionNotesInput, setActionNotesInput] = useState('');
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  
  // State for new failure form photos & equipment search
  const [modalPhotos, setModalPhotos] = useState<UploadedPhoto[]>([]);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const modalCameraInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter state for equipment selection in report modal
  const [modalEqSearchTerm, setModalEqSearchTerm] = useState('');
  const [modalDeptFilter, setModalDeptFilter] = useState('all');
  const [selectedModalEqCode, setSelectedModalEqCode] = useState<string>('');
  const [eqSelectError, setEqSelectError] = useState<string | null>(null);

  const serviceableEquipment = (equipmentList || []).filter(isEligibleForFaultReport);

  // Available unique departments for quick filter chips
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    serviceableEquipment.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [serviceableEquipment]);

  // Filtered equipment list based on search term & department
  const filteredModalEquipment = useMemo(() => {
    const q = modalEqSearchTerm.trim().toLowerCase();
    return serviceableEquipment.filter((item) => {
      if (modalDeptFilter !== 'all' && item.department !== modalDeptFilter) {
        return false;
      }
      if (!q) return true;
      const matchName = item.faName?.toLowerCase().includes(q) || item.name?.toLowerCase().includes(q);
      const matchCode = item.code?.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      const matchModel = item.model?.toLowerCase().includes(q);
      const matchDept = item.department?.toLowerCase().includes(q);
      const matchSerial = item.serialNo?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      return matchName || matchCode || matchBrand || matchModel || matchDept || matchSerial || matchCategory;
    });
  }, [serviceableEquipment, modalEqSearchTerm, modalDeptFilter]);

  const selectedEquipmentObj = useMemo(() => {
    return serviceableEquipment.find((e) => e.code === selectedModalEqCode) || null;
  }, [serviceableEquipment, selectedModalEqCode]);

  const handleModalPhotoFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setModalPhotos((prev) => [
            ...prev,
            {
              id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: file.name,
              url: e.target?.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const getReportPhotos = (fail: FailureReport): string[] => {
    if (fail.images && fail.images.length > 0) return fail.images;
    const photos: string[] = [];
    if (fail.imageUrl) photos.push(fail.imageUrl);
    if (fail.photoUrl && !photos.includes(fail.photoUrl)) photos.push(fail.photoUrl);
    if (fail.attachmentUrl && fail.attachmentUrl.startsWith('data:image') && !photos.includes(fail.attachmentUrl)) {
      photos.push(fail.attachmentUrl);
    }
    return photos;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>گزارش خرابی‌ها و پیگیری تعمیرات تجهیزات</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ثبت عیوب کارکرد توسط اپراتور بخش، ارجاع هوشمند به تکنسین، پیگیری قطعات و فرآیند رفع نقص
          </p>
        </div>

        {canReportFailure && (
          <button
            onClick={() => {
              setModalPhotos([]);
              setShowReportModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت گزارش خرابی جدید</span>
          </button>
        )}
      </div>

      {/* Failure Cards List */}
      <div className="space-y-4">
        {failuresList.map((fail) => {
          const isResolved = fail.status === 'resolved';
          const attachedPhotos = getReportPhotos(fail);

          return (
            <div
              key={fail.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      fail.priority === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : fail.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {fail.reportNo.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">
                        {fail.equipmentName} ({fail.equipmentCode})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fail.priority === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : fail.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fail.priority === 'critical'
                          ? 'بحرانی (اتاق عمل/ICU)'
                          : fail.priority === 'high'
                          ? 'اولویت بالا'
                          : 'عادی'}
                      </span>
                      {attachedPhotos.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{attachedPhotos.length} عکس پیوست</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      بخش: <strong className="text-slate-700">{fail.department}</strong> | گزارش‌دهنده: {fail.reporterName} ({fail.reporterRole}) | تاریخ: {fail.reportDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedFailure(fail);
                      setActionNotesInput(fail.actionsTaken || '');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {canManageActions ? 'مدیریت و ثبت اقدامات فنی' : 'مشاهده جزئیات و گردش کار تعمیر'}
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 space-y-1 border border-slate-100">
                <span className="font-bold text-slate-900 block">شرح نقص فنی گزارش‌شده:</span>
                <p className="leading-relaxed">{fail.defectDescription}</p>
              </div>

              {/* Attached Photos Preview */}
              {attachedPhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    عکس‌های ارسالی از وضعیت دستگاه / صفحه خطا:
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {attachedPhotos.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImageUrl(photoUrl)}
                        className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer shadow-2xs hover:border-rose-400 transition-all"
                      >
                        <img
                          src={photoUrl}
                          alt="عکس خرابی دستگاه"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance Progress Flow Bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  مراحل پیشرفت فنی و تعمیرات:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  {/* Step 1 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'reported' || fail.status === 'assigned' || fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۱. ثبت اولیه
                  </div>
                  {/* Step 2 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'assigned' || fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۲. ارجاع به تکنسین
                  </div>
                  {/* Step 3 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'in_repair' || fail.status === 'resolved'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۳. در حال تعمیر
                  </div>
                  {/* Step 4 */}
                  <div
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      fail.status === 'resolved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    ۴. برطرف‌شده و تست نهایی
                  </div>
                </div>
              </div>

              {fail.actionsTaken && (
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold block">اقدامات انجام‌شده توسط تکنسین ({fail.technicianAssigned || 'کادر فنی'}):</span>
                  <p>{fail.actionsTaken}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Failure Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 dir-rtl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                ثبت فرم گزارش خرابی و نقص فنی
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEqSelectError(null);

                if (!selectedModalEqCode) {
                  setEqSelectError('لطفاً دستگاه پزشکی مورد نظر را از لیست جستجو انتخاب فرمایید.');
                  return;
                }

                const form = e.target as HTMLFormElement;
                const eqCode = selectedModalEqCode;
                const selectedEq = equipmentList.find((e) => e.code === eqCode) || selectedEquipmentObj;

                const primaryPhoto = modalPhotos[0];
                const photoUrls = modalPhotos.map((p) => p.url);

                const newReport: FailureReport = {
                  id: `fail-${Date.now()}`,
                  reportNo: `REP-1405-${Math.floor(100 + Math.random() * 900)}`,
                  equipmentCode: eqCode,
                  equipmentName: selectedEq?.faName || 'تجهیز بیمارستانی',
                  department: selectedEq?.department || 'اورژانس',
                  priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as any,
                  reporterName: (form.elements.namedItem('reporterName') as HTMLInputElement).value || currentUser?.name || 'کاربر سیستم',
                  reporterRole: currentUser?.roleFa || 'کاربر ثبت‌کننده خرابی',
                  reportDate: '1405/05/20',
                  defectDescription: (form.elements.namedItem('defectDescription') as HTMLTextAreaElement).value,
                  status: 'reported',
                  imageUrl: primaryPhoto?.url,
                  photoUrl: primaryPhoto?.url,
                  images: photoUrls.length > 0 ? photoUrls : undefined,
                  attachmentName: modalPhotos.map((p) => p.name).join('، ') || undefined,
                  attachmentUrl: primaryPhoto?.url,
                };

                onReportFailure(newReport);
                setShowReportModal(false);
                setSelectedModalEqCode('');
                setModalEqSearchTerm('');
                setModalDeptFilter('all');
                setModalPhotos([]);
              }}
              className="space-y-3.5 text-xs"
            >
              {/* Searchable Equipment Selection Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-rose-600" />
                    <span>انتخاب و جستجوی دستگاه دچار مشکل:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {filteredModalEquipment.length.toLocaleString('fa-IR')} دستگاه در دسترس
                  </span>
                </div>

                {/* Selected Equipment Card Preview */}
                {selectedEquipmentObj ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 border-2 border-rose-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-2xs">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-black text-slate-900 text-xs">
                            {selectedEquipmentObj.faName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-extrabold text-[10px] dir-ltr">
                            {selectedEquipmentObj.code}
                          </span>
                          {selectedEquipmentObj.brand && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({selectedEquipmentObj.brand} {selectedEquipmentObj.model || ''})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            بخش: <strong className="text-slate-700">{selectedEquipmentObj.department || 'نامشخص'}</strong>
                          </span>
                          {selectedEquipmentObj.serialNo && (
                            <span className="text-[10px] text-slate-400 dir-ltr">
                              S/N: {selectedEquipmentObj.serialNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedModalEqCode('')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs hover:border-rose-400"
                    >
                      تغییر دستگاه
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {/* Search Input Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        value={modalEqSearchTerm}
                        onChange={(e) => setModalEqSearchTerm(e.target.value)}
                        placeholder="جستجو با نام دستگاه، کد اموال، مدل، برند، سریال یا بخش..."
                        className="w-full pr-9 pl-8 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800 text-xs shadow-2xs"
                        autoFocus
                      />
                      {modalEqSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setModalEqSearchTerm('')}
                          className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Department Quick Filter Chips */}
                    {availableDepartments.length > 1 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-slate-400" />
                          بخش:
                        </span>
                        <button
                          type="button"
                          onClick={() => setModalDeptFilter('all')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            modalDeptFilter === 'all'
                              ? 'bg-slate-800 text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          همه
                        </button>
                        {availableDepartments.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => setModalDeptFilter(dept)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              modalDeptFilter === dept
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Scrollable Equipment Selection List */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1 pr-0.5">
                      {filteredModalEquipment.length > 0 ? (
                        filteredModalEquipment.map((eq) => (
                          <div
                            key={eq.id}
                            onClick={() => {
                              setSelectedModalEqCode(eq.code);
                              setEqSelectError(null);
                            }}
                            className="p-2.5 rounded-xl bg-white hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 group-hover:text-rose-700 text-xs">
                                  {eq.faName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 group-hover:bg-rose-100 text-slate-700 group-hover:text-rose-800 font-extrabold text-[10px] dir-ltr">
                                  {eq.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="text-slate-600 font-medium">بخش {eq.department || 'عمومی'}</span>
                                {eq.brand && <span>• {eq.brand}</span>}
                                {eq.model && <span>• {eq.model}</span>}
                                {eq.serialNo && <span className="dir-ltr text-slate-400">({eq.serialNo})</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-rose-600 text-slate-600 group-hover:text-white font-bold text-[10px] transition-colors shrink-0"
                            >
                              انتخاب
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-1">
                          <Search className="w-5 h-5 mx-auto text-slate-300" />
                          <p className="text-xs font-bold text-slate-600">دستگاهی مطابق جستجوی شما یافت نشد</p>
                          <p className="text-[10px] text-slate-400">کلمات کلیدی دیگری جستجو کنید یا فیلتر بخش را تغییر دهید</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {eqSelectError && (
                  <p className="text-rose-600 text-[11px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{eqSelectError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    سطح اولویت و حساسیت:
                  </label>
                  <select
                    name="priority"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                  >
                    <option value="critical">بحرانی (توقف عمل / خطر حیاتی)</option>
                    <option value="high">اولویت بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">کم</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نام و نقش گزارش‌دهنده:</label>
                  <input
                    required
                    name="reporterName"
                    defaultValue={currentUser?.name ? `${currentUser.name} (${currentUser.roleFa})` : 'پرستار نسرین کریمی'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح دقیق مشکل و آلارم مشاهده شده:
                </label>
                <textarea
                  required
                  name="defectDescription"
                  rows={3}
                  placeholder="مشکل قطع و وصلی، نمایش خطای سنسور، نویز صدا یا خرابی کابل..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-rose-600" />
                    بارگذاری عکس از دستگاه یا مانیتور ارور (اختیاری):
                  </label>
                  <span className="text-[10px] text-slate-400">عکس‌برداری مستقیم یا انتخاب فایل</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                    <span>انتخاب تصویر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => modalCameraInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>دوربین</span>
                  </button>

                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleModalPhotoFiles(e.target.files);
                      }
                    }}
                  />

                  <input
                    ref={modalCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleModalPhotoFiles(e.target.files);
                      }
                    }}
                  />
                </div>

                {/* Uploaded thumbnails in form */}
                {modalPhotos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {modalPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setModalPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer"
                          title="حذف عکس"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  ارسال گزارش خرابی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Failure Modal */}
      {selectedFailure && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 dir-rtl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                تغییر وضعیت و ثبت اقدامات تعمیر ({selectedFailure.reportNo})
              </h3>
              <button
                onClick={() => setSelectedFailure(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* If Failure has photos, display in manage modal for technician */}
              {getReportPhotos(selectedFailure).length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    تصاویر پیوست‌شده توسط اپراتور:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {getReportPhotos(selectedFailure).map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImageUrl(url)}
                        className="group relative w-16 h-16 rounded-xl border border-slate-300 overflow-hidden cursor-pointer hover:border-rose-400 shadow-2xs"
                      >
                        <img src={url} alt="پیوست" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!canManageActions && (
                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    این بخش صرفاً جهت مشاهده پیشرفت گردش کار و اقدامات مهندسی پزشکی است. تغییر وضعیت و ثبت اقدامات منحصراً در اختیارات کارشناسان مهندسی پزشکی است.
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  وضعیت گام تعمیرات:
                </label>
                <select
                  id="statusSelect"
                  disabled={!canManageActions}
                  defaultValue={selectedFailure.status}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="reported">گزارش شده</option>
                  <option value="assigned">ارجاع شده به تکنسین</option>
                  <option value="in_repair">در حال تعمیر در کارگاه</option>
                  <option value="resolved">برطرف شده و تحویل نهایی</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح اقدامات فنی / قطعات تعویض شده:
                </label>
                <textarea
                  readOnly={!canManageActions}
                  value={actionNotesInput}
                  onChange={(e) => setActionNotesInput(e.target.value)}
                  rows={3}
                  placeholder={canManageActions ? "توضیحات تعویض قطعه یا کالیبراسیون مجدد..." : "اقدامات فنی هنوز توسط مهندسی پزشکی ثبت نشده است."}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400 read-only:bg-slate-100 read-only:text-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFailure(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  {!canManageActions ? 'بستن' : 'انصراف'}
                </button>
                {canManageActions && (
                  <button
                    onClick={() => {
                      const statusSelect = (document.getElementById('statusSelect') as HTMLSelectElement)?.value as any;
                      onUpdateFailureStatus(selectedFailure.id, statusSelect, actionNotesInput);
                      setSelectedFailure(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer transition-colors"
                  >
                    ذخیره وضعیت
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Image Lightbox Modal */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 dir-rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                تصویر پیوست گزارش خرابی دستگاه
              </span>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={lightboxImageUrl}
                alt="تصویر بزرگنمایی نقص دستگاه"
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
