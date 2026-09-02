import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Search,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2,
  History,
  Tag,
  UserMinus,
  ArrowRightLeft,
  Lock,
  Clock,
} from 'lucide-react';
import { EquipmentItem, AppUser, EquipmentAssignmentRecord } from '../../types';
import { MOCK_USERS } from '../../data/mockData';
import { hasEquipmentAssignmentPermission } from '../../utils/equipmentAssignmentHelper';

interface EquipmentAssignmentModalProps {
  equipment: EquipmentItem;
  currentUser?: AppUser;
  usersList?: AppUser[];
  onSaveAssignment: (
    equipmentId: string,
    assignment: {
      userId: string;
      userName: string;
      userRoleFa: string;
      userPersonnelCode?: string;
      department: string;
      assignedDate: string;
      endDate?: string;
      status: 'active' | 'temporary' | 'ended' | 'transferred';
      notes?: string;
      authorizedOperators?: string[];
    }
  ) => void;
  onUnassignEquipment?: (equipmentId: string, reason: string) => void;
  onClose: () => void;
}

export const EquipmentAssignmentModal: React.FC<EquipmentAssignmentModalProps> = ({
  equipment,
  currentUser,
  usersList = MOCK_USERS,
  onSaveAssignment,
  onUnassignEquipment,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'assign' | 'history' | 'unassign'>('assign');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    equipment.assignedOperatorId || ''
  );
  const [assignmentStatus, setAssignmentStatus] = useState<'active' | 'temporary' | 'ended' | 'transferred'>(
    equipment.assignmentStatus === 'ended' ? 'active' : (equipment.assignmentStatus || 'active')
  );
  const [assignedDate, setAssignedDate] = useState<string>(
    equipment.assignmentDate || '۱۴۰۳/۰۵/۲۲'
  );
  const [endDate, setEndDate] = useState<string>(equipment.assignmentEndDate || '');
  const [notes, setNotes] = useState<string>(equipment.assignmentNotes || '');
  const [unassignReason, setUnassignReason] = useState<string>('تحویل به انبار مرکزی / جابجایی دپارتمان');
  const [selectedAuthOperators, setSelectedAuthOperators] = useState<string[]>(
    equipment.authorizedOperators || []
  );

  // Check if current user has the dedicated equipment assignment permission
  const canAssign = hasEquipmentAssignmentPermission(currentUser);

  // Filter users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.personnelCode && u.personnelCode.includes(searchTerm))
  );

  const selectedUser = usersList.find((u) => u.id === selectedUserId);

  const toggleAuthOperator = (userName: string) => {
    setSelectedAuthOperators((prev) =>
      prev.includes(userName)
        ? prev.filter((name) => name !== userName)
        : [...prev, userName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAssign || !selectedUser) return;

    onSaveAssignment(equipment.id, {
      userId: selectedUser.id,
      userName: selectedUser.name,
      userRoleFa: selectedUser.roleFa,
      userPersonnelCode: selectedUser.personnelCode,
      department: selectedUser.department,
      assignedDate,
      endDate: endDate || undefined,
      status: assignmentStatus,
      notes,
      authorizedOperators: selectedAuthOperators.length > 0 ? selectedAuthOperators : [selectedUser.name],
    });
    onClose();
  };

  const handleUnassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAssign) return;

    if (onUnassignEquipment) {
      onUnassignEquipment(equipment.id, unassignReason);
    } else {
      // Fallback: save ended status
      onSaveAssignment(equipment.id, {
        userId: equipment.assignedOperatorId || 'usr-ended',
        userName: equipment.assignedOperator || 'اپراتور پیشین',
        userRoleFa: 'لغو تخصیص',
        department: equipment.department,
        assignedDate: equipment.assignmentDate || '۱۴۰۳/۰۵/۲۲',
        endDate: '۱۴۰۳/۰۵/۲۲',
        status: 'ended',
        notes: `لغو تخصیص و عودت به موجودی عمومی. علت: ${unassignReason}`,
        authorizedOperators: [],
      });
    }
    onClose();
  };

  const historyList: EquipmentAssignmentRecord[] = equipment.assignmentHistory || [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden dir-rtl my-8 text-right font-sans">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                تخصیص و تعیین مسئولیت دستگاه
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {equipment.faName} ({equipment.code}) • {equipment.department}
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

        {/* Current State Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">مسئول دفتری اموال:</span>
            <strong className="text-slate-800">{equipment.owner || 'مدیریت اموال'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#2b64f6]" />
            <span className="text-slate-500">اپراتور تخصیص‌یافته کنونی:</span>
            {equipment.assignedOperator ? (
              <strong className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 font-bold">
                {equipment.assignedOperator}
              </strong>
            ) : (
              <span className="text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-lg font-bold">
                بدون تخصیص (موجودی عمومی)
              </span>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('assign')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'assign'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{equipment.assignedOperator ? 'تغییر یا تمدید تخصیص' : 'تخصیص به کاربر'}</span>
          </button>

          {equipment.assignedOperator && (
            <button
              type="button"
              onClick={() => setActiveTab('unassign')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'unassign'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <UserMinus className="w-4 h-4" />
              <span>لغو تخصیص و آزادسازی</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سوابق تخصیص ({historyList.length})</span>
          </button>
        </div>

        {/* Tab 1: Form Body */}
        {activeTab === 'assign' && (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {!canAssign && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">دسترسی تخصیص تجهیز ندارید</span>
                  <span className="text-[11px] text-amber-700">
                    تخصیص تجهیز یک مجوز مستقل در بخش «کاربران و دسترسی‌ها» است. ثبت تغییرات صرفاً توسط کاربران مجاز امکان‌پذیر است.
                  </span>
                </div>
              </div>
            )}

            {/* User Selection Section */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                انتخاب اپراتور یا مسئول مستقیم استفاده <span className="text-rose-500">*</span>
              </label>
              
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجو در بین کارکنان، پرستاران و اپراتورها براساس نام، نقش یا کد پرسنلی..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* User List Radio/Cards */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    کاربری با این مشخصات یافت نشد
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserId === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              <span className="text-[10px] font-normal text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                                {user.roleFa}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>بخش: {user.department}</span>
                              {user.personnelCode && (
                                <span>• کد: {user.personnelCode}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2b64f6] shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Dates & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وضعیت تخصیص <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignmentStatus}
                  onChange={(e) => setAssignmentStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="active">فعال و تحویل دائم</option>
                  <option value="temporary">تخصیص موقت / شیفت مشخص</option>
                  <option value="transferred">در حال انتقال به کاربر دیگر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاریخ شروع تخصیص <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                  <input
                    type="text"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    placeholder="۱۴۰۳/۰۵/۲۲"
                    className="w-full pl-2.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاریخ پایان تخصیص (اختیاری)
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="اختیاری یا انتهای شیفت"
                    className="w-full pl-2.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Authorized Secondary Operators */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                سایر اپراتورهای مجاز (همکاران شیفت و جانشین)
              </label>
              <div className="flex flex-wrap gap-2">
                {['زهرا کریمی (پرستار بخش)', 'علی باقری (تکنسین ICU)', 'مریم حسینی (پرستار شیفت)', 'مهندس محمدی (کارشناس بالینی)'].map(
                  (op) => {
                    const isAuth = selectedAuthOperators.includes(op);
                    return (
                      <button
                        type="button"
                        key={op}
                        onClick={() => toggleAuthOperator(op)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isAuth
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{op}</span>
                        {isAuth && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Assignment Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                توضیحات و شرایط تحویل دستگاه
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="نکات مربوط به تحویل سلامت، پروتکل کاربری، لوازم جانبی تحویل داده شده و..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
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
                disabled={!canAssign || !selectedUser}
                className="px-5 py-2.5 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت تخصیص و تحویل دستگاه</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Unassign Modal */}
        {activeTab === 'unassign' && (
          <form onSubmit={handleUnassign} className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>آیا از لغو تخصیص دستگاه از کاربر کنونی اطمینان دارید؟</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                با لغو تخصیص، دستگاه از فهرست «تجهیزات من» کاربر <strong>{equipment.assignedOperator}</strong> خارج شده و وضعیت دستگاه به «بدون تخصیص / موجود در انبار» تغییر خواهد یافت. سوابق این تخصیص در تاریخچه تجهیز بایگانی خواهد شد.
              </p>
            </div>

            {!canAssign && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>شما مجوز «تخصیص تجهیز به کاربر» را برای لغو تخصیص ندارید.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                علت لغو تخصیص / بازگشت به انبار <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={unassignReason}
                onChange={(e) => setUnassignReason(e.target.value)}
                placeholder="مثلاً: پایان شیفت، انتقال به بخش دیگر، تعمیرات دوره‌ای یا عدم نیاز بالینی..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('assign')}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={!canAssign || !unassignReason.trim()}
                className="px-5 py-2.5 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <UserMinus className="w-4 h-4" />
                <span>تایید لغو تخصیص و آزادسازی تجهیز</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: History List */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4">
            {historyList.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">هیچ سابقه تخصیص قبلی برای این دستگاه ثبت نشده است.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {historyList.map((record, index) => {
                  const isActive = record.status === 'active';
                  const isEnded = record.status === 'ended';
                  return (
                    <div
                      key={record.id || index}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="font-bold text-xs text-slate-900">{record.userName}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {record.userRoleFa}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isEnded
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isActive ? 'تخصیص فعال' : isEnded ? 'پایان‌یافته' : 'انتقال‌یافته'}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                        <div>
                          <span>تاریخ شروع: </span>
                          <strong className="text-slate-700">{record.assignedDate}</strong>
                        </div>
                        {record.endDate && (
                          <div>
                            <span>تاریخ پایان: </span>
                            <strong className="text-slate-700">{record.endDate}</strong>
                          </div>
                        )}
                        <div>
                          <span>تخصیص‌دهنده: </span>
                          <strong className="text-slate-700">{record.assignedBy}</strong>
                        </div>
                        <div>
                          <span>دپارتمان: </span>
                          <strong className="text-slate-700">{record.department}</strong>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {record.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
