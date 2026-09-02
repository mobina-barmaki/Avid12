import React, { useState } from 'react';
import {
  Users,
  Layers,
  Wrench,
  Shield,
  User,
  Plus,
  X,
  Search,
  Check,
  Building,
  Info,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { TrainingAssignment, EquipmentItem, AppUser, UserRole } from '../../types';
import { MOCK_USERS } from '../../data/mockData';
import { HOSPITAL_WORKGROUPS } from '../../data/mockNotifications';

interface EducationAudienceSectionProps {
  assignments?: TrainingAssignment;
  onChange: (updated: TrainingAssignment) => void;
  equipmentList?: EquipmentItem[];
  allUsers?: AppUser[];
  disabled?: boolean;
}

const AVAILABLE_ROLES: { key: UserRole; titleFa: string; description: string }[] = [
  { key: 'hospital_admin', titleFa: 'ادمین بیمارستان', description: 'مدیران ارشد و دسترسی جامع' },
  { key: 'biomedical_engineer', titleFa: 'مهندس تجهیزات پزشکی', description: 'مسئول فنی و سرپرست تجهیزات' },
  { key: 'biomedical_technician', titleFa: 'کارشناس تعمیرات و کالیبراسیون', description: 'تکنسین فنی تعمیرگاه' },
  { key: 'nurse_operator', titleFa: 'پرستار و اپراتور بخش', description: 'کاربران بالینی و بهره‌برداران دستگاه' },
  { key: 'dept_head', titleFa: 'رئیس دپارتمان / سرپرستار', description: 'مدیریت بخش‌های درمانی و نظارت' },
  { key: 'procurement_officer', titleFa: 'کارشناس خرید و تدارکات', description: 'تامین و بازرگانی' },
  { key: 'finance_officer', titleFa: 'امور مالی و اعتبارات', description: 'تخصیص بودجه و بررسی هزینه' },
  { key: 'inventory_keeper', titleFa: 'مسئول انبار و اموال', description: 'انبارداری و تحویل و تحول اموال' },
  { key: 'safety_inspector', titleFa: 'کارشناس ایمنی و اعتباربخشی', description: 'کنترل کیفی و استانداردهای ایمنی' },
];

export const EducationAudienceSection: React.FC<EducationAudienceSectionProps> = ({
  assignments = {} as TrainingAssignment,
  onChange,
  equipmentList = [],
  allUsers = MOCK_USERS,
  disabled = false,
}) => {
  const currentAssignments: TrainingAssignment = assignments || {};
  const [activeTab, setActiveTab] = useState<'type' | 'equipment' | 'role_workgroup' | 'user'>('type');

  // Search queries
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [customTypeInput, setCustomTypeInput] = useState('');

  // Current values
  const targetTypes = currentAssignments.targetTypes || [];
  const targetEquipmentIds = currentAssignments.targetEquipmentIds || [];
  const targetRoles = currentAssignments.targetRoles || [];
  const targetWorkgroups = currentAssignments.targetWorkgroups || [];
  const targetUserIds = currentAssignments.targetUserIds || [];

  // Available unique types from equipment list
  const availableEquipmentTypes = Array.from(
    new Set([
      'ونتیلاتور',
      'الکتروشوک',
      'تنفسی',
      'مانیتورینگ علائم حیاتی',
      'پمپ تزریق سرنگ و سرم',
      'دستگاه بیهوشی',
      'اتوکلاو و استریلایزر',
      'دستگاه دیالیز',
      'الکتروکوتر جراحی',
      'سی‌تی اسکن و رادیولوژی',
      'سونوگرافی داپلر',
      ...equipmentList.map((e) => e.type).filter(Boolean),
    ])
  );

  // Handlers for Equipment Types
  const toggleType = (type: string) => {
    if (disabled) return;
    const exists = targetTypes.includes(type);
    const updated = exists ? targetTypes.filter((t) => t !== type) : [...targetTypes, type];
    onChange({ ...assignments, targetTypes: updated });
  };

  const addCustomType = () => {
    if (!customTypeInput.trim() || disabled) return;
    const trimmed = customTypeInput.trim();
    if (!targetTypes.includes(trimmed)) {
      onChange({ ...assignments, targetTypes: [...targetTypes, trimmed] });
    }
    setCustomTypeInput('');
  };

  // Handlers for Specific Equipment
  const toggleEquipment = (eq: EquipmentItem) => {
    if (disabled) return;
    const exists = targetEquipmentIds.includes(eq.id) || (assignments.targetEquipmentCodes || []).includes(eq.code);
    let updatedIds = [...targetEquipmentIds];
    let updatedCodes = [...(assignments.targetEquipmentCodes || [])];
    let updatedNames = [...(assignments.targetEquipmentNames || [])];

    if (exists) {
      updatedIds = updatedIds.filter((id) => id !== eq.id);
      updatedCodes = updatedCodes.filter((c) => c !== eq.code);
      updatedNames = updatedNames.filter((n) => n !== eq.faName);
    } else {
      updatedIds.push(eq.id);
      if (!updatedCodes.includes(eq.code)) updatedCodes.push(eq.code);
      if (!updatedNames.includes(eq.faName)) updatedNames.push(eq.faName);
    }

    onChange({
      ...assignments,
      targetEquipmentIds: updatedIds,
      targetEquipmentCodes: updatedCodes,
      targetEquipmentNames: updatedNames,
    });
  };

  // Handlers for Roles & Workgroups
  const toggleRole = (roleKey: UserRole) => {
    if (disabled) return;
    const exists = targetRoles.includes(roleKey);
    const updated = exists ? targetRoles.filter((r) => r !== roleKey) : [...targetRoles, roleKey];
    onChange({ ...assignments, targetRoles: updated });
  };

  const toggleWorkgroup = (wgId: string) => {
    if (disabled) return;
    const exists = targetWorkgroups.includes(wgId);
    const updated = exists ? targetWorkgroups.filter((w) => w !== wgId) : [...targetWorkgroups, wgId];
    onChange({ ...assignments, targetWorkgroups: updated });
  };

  // Handlers for Users
  const toggleUser = (user: AppUser) => {
    if (disabled) return;
    const exists = targetUserIds.includes(user.id);
    let updatedIds = [...targetUserIds];
    let updatedNames = [...(assignments.targetUserNames || [])];

    if (exists) {
      updatedIds = updatedIds.filter((id) => id !== user.id);
      updatedNames = updatedNames.filter((n) => n !== user.name);
    } else {
      updatedIds.push(user.id);
      if (!updatedNames.includes(user.name)) updatedNames.push(user.name);
    }

    onChange({
      ...assignments,
      targetUserIds: updatedIds,
      targetUserNames: updatedNames,
    });
  };

  // Filtered lists
  const filteredEquipment = equipmentList.filter((eq) => {
    if (!equipmentSearch.trim()) return true;
    const q = equipmentSearch.toLowerCase();
    return (
      eq.faName.toLowerCase().includes(q) ||
      eq.code.toLowerCase().includes(q) ||
      (eq.brand && eq.brand.toLowerCase().includes(q)) ||
      (eq.department && eq.department.toLowerCase().includes(q))
    );
  });

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.roleFa && u.roleFa.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const totalAudienceSelections =
    targetTypes.length +
    targetEquipmentIds.length +
    targetRoles.length +
    targetWorkgroups.length +
    targetUserIds.length;

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-4 text-right dir-rtl">
      {/* Header & Priority Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>مخاطبان و انتساب آموزش (Training Audience & Assignments)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            تعیین کنید این محتوا برای چه نوع تجهیزاتی، چه دستگاه مشخصی، چه نقش‌ها یا چه کاربرانی نمایش داده شود.
          </p>
        </div>

        {/* Selected count badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
            تعداد مخاطبان منتسب: <strong className="text-sky-700 font-mono text-xs">{totalAudienceSelections}</strong>
          </span>
        </div>
      </div>

      {/* Priority Rule Indicator Bar */}
      <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between gap-2 flex-wrap text-[11px]">
        <div className="flex items-center gap-1.5 text-sky-900 font-bold">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>قانون اولویت انتساب (بدون تکرار و Duplicate):</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-700 font-semibold flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">۱. کاربر مشخص</span>
          <span className="text-slate-400">←</span>
          <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-900 font-bold border border-teal-200">۲. تجهیز مشخص</span>
          <span className="text-slate-400">←</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">۳. نقش / کارگروه</span>
          <span className="text-slate-400">←</span>
          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-bold border border-sky-200">۴. نوع تجهیز</span>
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl flex-wrap text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('type')}
          className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'type'
              ? 'bg-white text-sky-700 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>۱. نوع تجهیز</span>
          {targetTypes.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {targetTypes.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'equipment'
              ? 'bg-white text-teal-700 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>۲. تجهیز مشخص</span>
          {targetEquipmentIds.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {targetEquipmentIds.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('role_workgroup')}
          className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'role_workgroup'
              ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>۳. نقش / کارگروه</span>
          {targetRoles.length + targetWorkgroups.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {targetRoles.length + targetWorkgroups.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('user')}
          className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'user'
              ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>۴. کاربر مشخص</span>
          {targetUserIds.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {targetUserIds.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: EQUIPMENT TYPES */}
      {activeTab === 'type' && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              انتخاب انواع تجهیزات تحت پوشش این آموزش:
            </span>
            <span className="text-[11px] text-slate-400">
              برای تمام دستگاه‌های متعلق به انواع انتخاب‌شده نمایش داده می‌شود
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="افزودن نوع سفارشی (مثلاً: پمپ ساکشن جراحی)..."
              value={customTypeInput}
              onChange={(e) => setCustomTypeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomType())}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-sky-500 outline-none"
            />
            <button
              type="button"
              onClick={addCustomType}
              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
            {availableEquipmentTypes.map((type) => {
              const isSelected = targetTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SPECIFIC EQUIPMENT */}
      {activeTab === 'equipment' && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              انتخاب دستگاه‌های مشخص (شناسه و پلاک اموال):
            </span>
            <span className="text-[11px] text-slate-400">
              {targetEquipmentIds.length} دستگاه انتخاب شده
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو با نام دستگاه، کد اموال، برند یا بخش..."
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-teal-500 outline-none"
            />
          </div>

          {/* Selected chips */}
          {targetEquipmentIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-teal-50/50 border border-teal-200/60 max-h-24 overflow-y-auto">
              {targetEquipmentIds.map((id) => {
                const eq = equipmentList.find((e) => e.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold"
                  >
                    <span>{eq?.faName || id} ({eq?.code || id})</span>
                    <button
                      type="button"
                      onClick={() => eq && toggleEquipment(eq)}
                      className="hover:text-rose-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Available list */}
          <div className="space-y-1 max-h-52 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
            {filteredEquipment.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">تجهیزی مطابق با جستجو یافت نشد.</p>
            ) : (
              filteredEquipment.slice(0, 30).map((eq) => {
                const isSelected = targetEquipmentIds.includes(eq.id);
                return (
                  <div
                    key={eq.id}
                    onClick={() => toggleEquipment(eq)}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50 font-bold text-teal-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold block truncate">{eq.faName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {eq.code} • {eq.department || 'بخش نامشخص'} • {eq.brand || ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {eq.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & WORKGROUPS */}
      {activeTab === 'role_workgroup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Roles Box */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>نقش‌های کاربری مجاز (Roles):</span>
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {AVAILABLE_ROLES.map((r) => {
                const isSelected = targetRoles.includes(r.key);
                return (
                  <div
                    key={r.key}
                    onClick={() => toggleRole(r.key)}
                    className={`p-2 rounded-lg text-xs flex items-start gap-2 transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold">{r.titleFa}</span>
                      <span className="text-[10px] text-slate-500">{r.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workgroups Box */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>کارگروه‌های تخصصی بیمارستان (Workgroups):</span>
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {HOSPITAL_WORKGROUPS.map((wg) => {
                const isSelected = targetWorkgroups.includes(wg.id);
                return (
                  <div
                    key={wg.id}
                    onClick={() => toggleWorkgroup(wg.id)}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold block truncate">{wg.titleFa}</span>
                        <span className="text-[10px] text-slate-500">{wg.description}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold shrink-0">
                      کارگروه
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPECIFIC USERS */}
      {activeTab === 'user' && (
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              انتساب مستقیم به کاربران مشخص (پرسنل):
            </span>
            <span className="text-[11px] text-slate-400">
              {targetUserIds.length} کاربر انتخاب شده
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو با نام پرسنل، نام کاربری، سمت یا بخش..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Selected user chips */}
          {targetUserIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/60 max-h-24 overflow-y-auto">
              {targetUserIds.map((uId) => {
                const u = allUsers.find((user) => user.id === uId);
                return (
                  <span
                    key={uId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                  >
                    <span>{u?.name || uId} ({u?.roleFa || 'کاربر'})</span>
                    <button
                      type="button"
                      onClick={() => u && toggleUser(u)}
                      className="hover:text-rose-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Users List */}
          <div className="space-y-1 max-h-52 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">کاربری مطابق با جستجو یافت نشد.</p>
            ) : (
              filteredUsers.slice(0, 30).map((u) => {
                const isSelected = targetUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u)}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50 font-bold text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold block truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {u.roleFa || u.role} • {u.department || 'بخش نامشخص'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono dir-ltr shrink-0">
                      {u.personnelCode || u.username}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Summary Chips Footer */}
      {totalAudienceSelections > 0 && (
        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
          <span className="font-black text-slate-800">خلاصه مخاطبان:</span>
          {targetTypes.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-bold border border-sky-200">
              {targetTypes.length} نوع تجهیز
            </span>
          )}
          {targetEquipmentIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-bold border border-teal-200">
              {targetEquipmentIds.length} تجهیز مشخص
            </span>
          )}
          {targetRoles.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
              {targetRoles.length} نقش
            </span>
          )}
          {targetWorkgroups.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
              {targetWorkgroups.length} کارگروه
            </span>
          )}
          {targetUserIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
              {targetUserIds.length} کاربر
            </span>
          )}
        </div>
      )}
    </div>
  );
};
