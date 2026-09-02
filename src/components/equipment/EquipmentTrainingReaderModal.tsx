import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Download,
  Share2,
  Bookmark,
  Layers,
  Award,
} from 'lucide-react';
import { EducationItem, EquipmentItem, AppUser } from '../../types';

interface EquipmentTrainingReaderModalProps {
  isOpen?: boolean;
  onClose: () => void;
  training?: EducationItem;
  item?: EducationItem;
  equipment?: EquipmentItem | null;
  currentUser?: AppUser;
  onOpenChecklist?: (checklist: EducationItem) => void;
}

export const EquipmentTrainingReaderModal: React.FC<EquipmentTrainingReaderModalProps> = ({
  isOpen = true,
  onClose,
  training: propTraining,
  item: propItem,
  equipment,
  currentUser,
}) => {
  const training = propTraining || propItem;
  if (!isOpen || !training) return null;

  const guide = training.guideData;
  const sections = guide?.sections && Array.isArray(guide.sections) && guide.sections.length > 0 ? guide.sections : [
    {
      id: 'sec-default-1',
      order: 1,
      title: '۱. مبانی کاربری، آماده‌سازی و الزامات ایمنی',
      content: training.description || 'پیش از شروع کار با دستگاه، از صحت اتصالات، سلامت کابل‌ها و استقرار در محل استاندارد اطمینان حاصل فرمایید.',
      keyTakeaways: ['رعایت دستورالعمل کاربری الزامی است.', 'در صورت بروز آلارم بحرانی بلافاصله به مهندسی پزشکی اطلاع دهید.'],
    }
  ];
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});

  const currentSection = sections[activeSectionIndex];

  const handleMarkSectionComplete = (secId: string) => {
    setCompletedSections((prev) => ({
      ...prev,
      [secId]: true,
    }));
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              {training.type === 'structured_guide' ? (
                <BookOpen className="w-6 h-6" />
              ) : training.type === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                  {training.type === 'structured_guide'
                    ? 'دوره آموزشی ساختاریافته'
                    : training.type === 'video'
                    ? 'ویدیوی آموزشی بالینی'
                    : 'دستورالعمل استاندارد (SOP)'}
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  نسخه {training.version || '1.0'}
                </span>
                {training.duration && (
                  <span className="text-[11px] text-emerald-200/80 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {training.duration}
                  </span>
                )}
              </div>
              <h2 className="text-base font-black mt-0.5 text-white">{training.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left / Navigation Sidebar (For Structured Guides) */}
          {training.type === 'structured_guide' && sections.length > 0 && (
            <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-l border-slate-200 p-4.5 overflow-y-auto space-y-4 shrink-0">
              {/* Objectives summary */}
              {guide?.objectives && Array.isArray(guide.objectives) && guide.objectives.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>اهداف یادگیری دوره</span>
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium list-disc list-inside">
                    {guide.objectives.map((obj, i) => (
                      <li key={i} className="leading-relaxed">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Table of contents */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 px-1">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-emerald-700" />
                    <span>سرفصل‌های آموزشی ({sections.length})</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {Object.keys(completedSections).length}/{sections.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {sections.map((sec, idx) => {
                    const isCurrent = idx === activeSectionIndex;
                    const isDone = completedSections[sec.id];

                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSectionIndex(idx)}
                        className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">{sec.title}</span>
                        </div>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Right / Main Reading Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {training.type === 'structured_guide' && currentSection ? (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      بخش {activeSectionIndex + 1} از {sections.length}
                    </span>
                    {equipment && (
                      <span className="text-xs text-slate-500 font-bold">
                        تجهیز: <strong className="text-slate-800">[{equipment.code}] {equipment.faName}</strong>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{currentSection.title}</h3>
                </div>

                {/* Section Content */}
                <div className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white font-normal">
                  {currentSection.content}
                </div>

                {/* Key Takeaways */}
                {currentSection?.keyTakeaways && Array.isArray(currentSection.keyTakeaways) && currentSection.keyTakeaways.length > 0 && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>نکات کلیدی این سرفصل (Key Takeaways):</span>
                    </h5>
                    <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside font-medium">
                      {currentSection.keyTakeaways.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Safety Warning */}
                {currentSection.safetyWarning && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <strong className="font-black block text-rose-950">هشدار ایمنی:</strong>
                      <p className="font-medium leading-relaxed">{currentSection.safetyWarning}</p>
                    </div>
                  </div>
                )}

                {/* Section Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    disabled={activeSectionIndex === 0}
                    onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>سرفصل قبلی</span>
                  </button>

                  <button
                    onClick={() => {
                      handleMarkSectionComplete(currentSection.id);
                      if (activeSectionIndex < sections.length - 1) {
                        setActiveSectionIndex((prev) => prev + 1);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>
                      {activeSectionIndex === sections.length - 1
                        ? 'تکمیل و پایان مطالعه دوره'
                        : 'تأیید مطالعه و سرفصل بعدی'}
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback for PDF / Video / Standard SOP */
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900">{training.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {training.description}
                    </p>
                  </div>

                  {training.content && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                      {training.content}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                    <div>
                      تهیه‌کننده: <strong className="text-slate-700">{training.author}</strong> ({training.authorRole})
                    </div>
                    <div>
                      بخش: <strong className="text-slate-700">{training.department}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            سیستم مدیریت آموزش و یادگیری (LMS) پرونده هوشمند تجهیزات
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
