import React, { useState } from 'react';
import {
  X,
  Users,
  CheckCircle2,
  Clock,
  CircleDot,
  UserCheck,
  Shield,
  Save,
  Check,
  Sparkles,
  BarChart2,
  BookOpen,
} from 'lucide-react';
import { EducationItem, TrainingAssignment, EquipmentItem, AppUser, UserTrainingProgress } from '../../types';
import { EducationAudienceSection } from './EducationAudienceSection';
import { MOCK_USERS } from '../../data/mockData';

interface TrainingAssignmentModalProps {
  item: EducationItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: EducationItem) => void;
  equipmentList: EquipmentItem[];
  allUsers?: AppUser[];
}

export const TrainingAssignmentModal: React.FC<TrainingAssignmentModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  equipmentList,
  allUsers = MOCK_USERS,
}) => {
  if (!isOpen) return null;

  const [assignments, setAssignments] = useState<TrainingAssignment>(
    item.assignments || {
      targetTypes: item.targetTypeName ? [item.targetTypeName] : [],
      targetEquipmentIds: item.targetEquipmentId ? [item.targetEquipmentId] : [],
      targetEquipmentCodes: item.targetEquipmentCode ? [item.targetEquipmentCode] : [],
      targetEquipmentNames: item.targetEquipmentName ? [item.targetEquipmentName] : [],
      targetRoles: [],
      targetWorkgroups: [],
      targetUserIds: [],
    }
  );

  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'progress'>('assignments');
  const [isSaved, setIsSaved] = useState(false);

  const progressRecords: Record<string, UserTrainingProgress> = (item.userProgressRecords || {}) as Record<string, UserTrainingProgress>;
  const progressList: UserTrainingProgress[] = Object.values(progressRecords);

  const completedCount = progressList.filter((p) => p.status === 'completed').length;
  const inProgressCount = progressList.filter((p) => p.status === 'in_progress').length;
  const notStartedCount = Math.max(0, (assignments.targetUserIds?.length || 0) - completedCount - inProgressCount);

  const handleSave = () => {
    const updated: EducationItem = {
      ...item,
      assignments,
      // Keep legacy fields in sync for backward compatibility
      targetTypeName: assignments.targetTypes?.[0] || item.targetTypeName,
      targetEquipmentId: assignments.targetEquipmentIds?.[0] || item.targetEquipmentId,
      targetEquipmentCode: assignments.targetEquipmentCodes?.[0] || item.targetEquipmentCode,
      targetEquipmentName: assignments.targetEquipmentNames?.[0] || item.targetEquipmentName,
    };

    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs text-right dir-rtl animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-sky-50/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  مدیریت انتساب و مخاطبان آموزش
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  {item.type === 'checklist' ? 'چک‌لیست تعاملی' : 'راهنما / محتوا'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {item.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'assignments'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>تنظیم مخاطبان (۴ سطح انتساب)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('progress')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'progress'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>گزارش وضعیت مطالعه پرسنل</span>
            {progressList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {progressList.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeSubTab === 'assignments' ? (
            <EducationAudienceSection
              assignments={assignments}
              onChange={setAssignments}
              equipmentList={equipmentList}
              allUsers={allUsers}
            />
          ) : (
            /* Progress Tracking Tab */
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-800 font-bold block">تکمیل شده (Completed)</span>
                    <span className="text-xl font-black text-emerald-950 font-mono">{completedCount} نفر</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-800 font-bold block">در حال مطالعه (In Progress)</span>
                    <span className="text-xl font-black text-amber-950 font-mono">{inProgressCount} نفر</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-500 text-white flex items-center justify-center shrink-0">
                    <CircleDot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-700 font-bold block">شروع نشده (Not Started)</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{notStartedCount} نفر</span>
                  </div>
                </div>
              </div>

              {/* Progress Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>لیست وضعیت ثبت‌شده برای کاربران منتسب:</span>
                  <span className="text-[11px] text-slate-500 font-normal">بروزرسانی خودکار با مطالعه و ثبت چک‌لیست</span>
                </div>

                {progressList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    هنوز سابقه‌ای از مطالعه یا آزمون توسط کاربران ثبت نشده است.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {progressList.map((p) => {
                      const isComplete = p.status === 'completed';
                      const isInProg = p.status === 'in_progress';
                      return (
                        <div key={p.userId} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isComplete
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isInProg
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.userName.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{p.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p.userRole || 'اپراتور'} • شروع: {p.startedAt || 'ثبت نشده'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {p.score !== undefined && (
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                نمره: {p.score}٪
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                                isComplete
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isInProg
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {isComplete && <CheckCircle2 className="w-3 h-3" />}
                              {isInProg && <Clock className="w-3 h-3" />}
                              <span>
                                {isComplete ? 'تکمیل شده' : isInProg ? 'در حال مطالعه' : 'شروع نشده'}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            انصراف
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'ذخیره شد' : 'ذخیره انتساب مخاطبان'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
