import React, { useState, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  Upload,
  Calendar,
  Clock,
  User,
  Building,
  ShieldAlert,
  FileText,
  Paperclip,
  CheckCircle2,
  Stethoscope,
  HelpCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';
import { EquipmentItem, AppUser, FailureReport } from '../../types';

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  size?: string;
}

interface EquipmentFaultReportModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  onSubmitFaultReport: (report: FailureReport) => void;
  onClose: () => void;
}

export const EquipmentFaultReportModal: React.FC<EquipmentFaultReportModalProps> = ({
  equipment,
  currentUser,
  onSubmitFaultReport,
  onClose,
}) => {
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [faultType, setFaultType] = useState<string>('خطای سنسور و آلارم مداوم');
  const [defectDescription, setDefectDescription] = useState<string>('');
  const [occurrenceDate, setOccurrenceDate] = useState<string>('۱۴۰۳/۰۵/۲۲');
  const [occurrenceTime, setOccurrenceTime] = useState<string>('۱۰:۴۵');
  const [canContinueUsing, setCanContinueUsing] = useState<string>('خیر، دستگاه بلافاصله متوقف و از مدار خارج شد');
  const [observedConditions, setObservedConditions] = useState<string>(
    'در حین کار بالینی بر بالین بیمار'
  );
  const [initialActionsTaken, setInitialActionsTaken] = useState<string>(
    'دستگاه خاموش و از بیمار جدا شد و دستگاه جایگزین متصل گردید.'
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const faultTypeOptions = [
    'قطع و وصلی برق و روشن نشدن دستگاه',
    'خطای سنسور و آلارم مداوم',
    'نقص مکانیکی و خرابی قطعات متحرک',
    'نویز، خطای نمایشگر و کیفیت نامناسب سیگنال',
    'انحراف کالیبراسیون و عدم دقت اندازه‌گیری',
    'نشت گاز / مایعات / گرفتگی خطوط',
    'آسیب دیدگی فیزیکی کابل، پروب یا بدنه',
    'سایر موارد / نیاز به بررسی مهندسی',
  ];

  const observedConditionsOptions = [
    'در حین کار بالینی بر بالین بیمار',
    'هنگام تست و بازرسی صبحگاهی شیفت',
    'بلافاصله پس از روشن کردن دستگاه',
    'پس از قطع ناگهانی برق شهری',
    'در هنگام فرآیند ضدعفونی و تمیزکاری',
    'در زمان جابجایی بین بخش‌ها',
  ];

  const canContinueOptions = [
    'خیر، دستگاه بلافاصله متوقف و از مدار خارج شد',
    'بله، عملکرد با احتیاط و محدودیت امکان‌پذیر است',
    'فقط در شرایط اورژانسی با نظارت مستقیم',
  ];

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const photoUrl = e.target.result as string;
          const formattedSize =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} مگابایت`
              : `${Math.round(file.size / 1024)} کیلوبایت`;

          setUploadedPhotos((prev) => [
            ...prev,
            {
              id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: file.name,
              url: photoUrl,
              size: formattedSize,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectDescription.trim()) return;

    const newReportNo = `FL-${Math.floor(1000 + Math.random() * 9000)}`;
    const primaryPhoto = uploadedPhotos[0];
    const photoUrls = uploadedPhotos.map((p) => p.url);

    const newReport: FailureReport = {
      id: `fail-${Date.now()}`,
      reportNo: newReportNo,
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      equipmentName: equipment.faName,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      department: equipment.department,
      location: equipment.location,
      assignedOperator: equipment.assignedOperator || currentUser?.name,
      priority,
      reporterId: currentUser?.id || 'usr-7',
      reporterName: currentUser?.name || 'نسرین کریمی',
      reporterRole: currentUser?.roleFa || 'اپراتور بخش',
      reportDate: occurrenceDate,
      faultType,
      defectDescription: defectDescription.trim(),
      observedConditions: `${observedConditions} (زمان مشاهده: ${occurrenceTime} - وضعیت ادامه استفاده: ${canContinueUsing})`,
      initialActionsTaken: initialActionsTaken.trim(),
      status: 'reported',
      attachmentName: uploadedPhotos.map((p) => p.name).join('، ') || undefined,
      attachmentUrl: primaryPhoto?.url || undefined,
      imageUrl: primaryPhoto?.url || undefined,
      photoUrl: primaryPhoto?.url || undefined,
      images: photoUrls.length > 0 ? photoUrls : undefined,
    };

    onSubmitFaultReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden dir-rtl my-8 text-right font-sans">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                ثبت و ارجاع گزارش خرابی تجهیز پزشکی
              </h2>
              <p className="text-xs text-rose-200 mt-0.5">
                اتصال خودکار به شناسنامه دستگاه و کارتابل مهندسی پزشکی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pre-populated Equipment Info Box */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-500">اطلاعات خودکار دستگاه هدف:</span>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              کد: {equipment.code}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">نام تجهیز:</span>
              <strong className="text-slate-900 block truncate">{equipment.faName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">برند و مدل:</span>
              <span className="text-slate-800 font-bold block truncate">{equipment.brand} • {equipment.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">محل استقرار:</span>
              <span className="text-slate-800 font-bold block truncate">{equipment.location || equipment.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">اپراتور مسئول:</span>
              <span className="text-slate-800 font-bold block truncate">{equipment.assignedOperator || 'اپراتور بخش'}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Priority & Fault Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                سطح فوریت و اولویت خرابی <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500"
              >
                <option value="critical">بحرانی / توقف فرآیند درمانی بیمار (فوری)</option>
                <option value="high">بالا / نیازمند اعزام سریع مهندس</option>
                <option value="medium">متوسط / اختلال جزئی در کارکرد</option>
                <option value="low">کم / اشکال غیراورژانسی و ظاهری</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                نوع و دسته‌بندی خطا <span className="text-rose-500">*</span>
              </label>
              <select
                value={faultType}
                onChange={(e) => setFaultType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500"
              >
                {faultTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Occurrence Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاریخ مشاهده مشکل
              </label>
              <input
                type="text"
                value={occurrenceDate}
                onChange={(e) => setOccurrenceDate(e.target.value)}
                placeholder="۱۴۰۳/۰۵/۲۲"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                زمان دقیق مشاهده (ساعت)
              </label>
              <input
                type="text"
                value={occurrenceTime}
                onChange={(e) => setOccurrenceTime(e.target.value)}
                placeholder="۱۰:۴۵"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Observed Conditions & Can Continue Using */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                شرایط مشاهده مشکل
              </label>
              <select
                value={observedConditions}
                onChange={(e) => setObservedConditions(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500"
              >
                {observedConditionsOptions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                امکان ادامه استفاده از تجهیز
              </label>
              <select
                value={canContinueUsing}
                onChange={(e) => setCanContinueUsing(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-rose-500"
              >
                {canContinueOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fault Description */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">
              شرح دقیق مشکل و مشاهدات بالینی <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={defectDescription}
              onChange={(e) => setDefectDescription(e.target.value)}
              placeholder="کد خطای نمایش‌داده‌شده، صدای غیرعادی، بوی سوختگی، عدم پاسخ‌دهی تاچ‌اسکرین یا رفتار نامناسب دستگاه را به دقت شرح دهید..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Initial Actions Taken by Operator */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اقدامات اولیه انجام‌شده توسط اپراتور / کادر درمان
            </label>
            <input
              type="text"
              value={initialActionsTaken}
              onChange={(e) => setInitialActionsTaken(e.target.value)}
              placeholder="مثال: دستگاه بلافاصله خاموش شد، برچسب نقص الصاق گردید و از مدار خارج شد"
              className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Device Photo / Defect Image Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800">
                بارگذاری تصویر از دستگاه یا کد خطا (اختیاری)
              </label>
              <span className="text-[11px] text-slate-400">
                فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۱۰ مگابایت)
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFiles(e.dataTransfer.files);
                }
              }}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center ${
                isDragging
                  ? 'border-rose-500 bg-rose-50/50'
                  : 'border-slate-200 hover:border-rose-300 bg-slate-50/70 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/70 text-rose-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    عکس صفحه نمایش دستگاه، ارور مانیتور، قطعه آسیب‌دیده یا وضعیت فیزیکی را اضافه کنید
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    فایل عکس را به اینجا بکشید یا از دکمه‌های زیر استفاده نمایید
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-rose-400 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-rose-50/40 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                    <span>انتخاب عکس از گالری / سیستم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>عکس‌برداری مستقیم با دوربین</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                  }}
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                  }}
                />
              </div>
            </div>

            {/* Uploaded Photos Gallery */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600 block">
                  تصاویر بارگذاری‌شده ({uploadedPhotos.length}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-24 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setPreviewPhotoUrl(photo.url)}
                      />
                      <div className="p-1.5 bg-white/95 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[80px] font-medium text-slate-700" title={photo.name}>
                          {photo.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(photo.url)}
                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="مشاهده بزرگنمایی"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف تصویر"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ارسال گزارش خرابی به مهندسی پزشکی</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal Lightbox */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 dir-rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                تصویر پیوست‌شده دستگاه
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={previewPhotoUrl}
                alt="تصویر بزرگنمایی خرابی"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

