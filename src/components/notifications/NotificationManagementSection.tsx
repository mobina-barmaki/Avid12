import React, { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Smartphone,
  Mail,
  AppWindow,
  Radio,
  Edit3,
  Trash2,
  Power,
  ShieldCheck,
  Sparkles,
  Users,
  Building,
  CheckSquare,
  FileText,
  HelpCircle,
  X,
  Play,
  RotateCw,
  Eye,
  Info,
} from 'lucide-react';
import {
  NotificationRule,
  NotificationLogRecord,
  NotificationEventType,
  NotificationChannel,
  NotificationPriority,
  AppUser,
  EquipmentItem,
} from '../../types';
import { INITIAL_NOTIFICATION_RULES, INITIAL_NOTIFICATION_LOGS } from '../../data/mockNotifications';
import { toPersianNumber } from '../../utils/taxonomyAnalytics';

interface NotificationManagementSectionProps {
  currentUser?: AppUser;
  equipmentList?: EquipmentItem[];
  usersList?: AppUser[];
}

const EVENT_TYPE_LABELS: Record<NotificationEventType, { title: string; category: string; icon: string }> = {
  failure_created: { title: 'ثبت خرابی جدید', category: 'فنی', icon: 'wrench' },
  failure_critical: { title: 'خرابی بحرانی (اورژانس/ICU/اتاق عمل)', category: 'فنی / حیاتی', icon: 'alert' },
  repair_completed: { title: 'اتمام تعمیر و آماده‌سازی تجهیز', category: 'بالینی / فنی', icon: 'check' },
  calibration_due: { title: 'سررسید دوره کالیبراسیون', category: 'کنترل کیفی', icon: 'calendar' },
  calibration_expired: { title: 'انقضای گواهی کالیبراسیون', category: 'کنترل کیفی', icon: 'shield' },
  purchase_created: { title: 'ثبت درخواست خرید جدید', category: 'تدارکات', icon: 'cart' },
  purchase_status_changed: { title: 'تغییر وضعیت تاییدیه خرید', category: 'تدارکات و مالی', icon: 'package' },
  training_assigned: { title: 'انتساب آموزش یا چک‌لیست جدید', category: 'آموزش و LMS', icon: 'book' },
  checklist_overdue: { title: 'تاخیر در تکمیل چک‌لیست شیفت', category: 'ایمنی و بالینی', icon: 'clock' },
  stock_low: { title: 'هشدار کاهش موجودی قطعات انبار', category: 'اموال و انبار', icon: 'layers' },
  daily_care_alert: { title: 'هشدار ناهنجاری در پایش روزانه', category: 'بالینی', icon: 'activity' },
};

const CHANNEL_ICONS: Record<NotificationChannel, { label: string; icon: React.ReactNode; color: string }> = {
  in_app: {
    label: 'درون برنامه‌ای (In-App)',
    icon: <AppWindow className="w-3.5 h-3.5" />,
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  sms: {
    label: 'پیامک هوشمند (SMS)',
    icon: <Smartphone className="w-3.5 h-3.5" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  email: {
    label: 'پست الکترونیک (Email)',
    icon: <Mail className="w-3.5 h-3.5" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  push_system: {
    label: 'سیستمی و Push',
    icon: <Radio className="w-3.5 h-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const PRIORITY_BADGES: Record<NotificationPriority, { label: string; bg: string }> = {
  critical: { label: 'بسیار بحرانی', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
  high: { label: 'اولویت بالا', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  medium: { label: 'اولویت متوسط', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
  low: { label: 'اولویت عادی', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const AVAILABLE_ROLES = [
  { id: 'hospital_admin', label: 'مدیر ارشد بیمارستان' },
  { id: 'biomedical_engineer', label: 'مهندس تجهیزات پزشکی' },
  { id: 'department_head', label: 'سرپرستار / مسئول بخش' },
  { id: 'clinical_operator', label: 'اپراتور بالینی / پرستار' },
  { id: 'support_tech', label: 'تکنسین فنی و تعمیرات' },
  { id: 'asset_manager', label: 'مدیر اموال و انبار' },
  { id: 'finance_manager', label: 'مدیر امور مالی' },
  { id: 'procurement_officer', label: 'مسئول خرید و تدارکات' },
];

const AVAILABLE_WORKGROUPS = [
  { id: 'wg_biomedical', label: 'کارگروه مهندسی پزشکی و کالیبراسیون' },
  { id: 'wg_ccu_icu', label: 'کارگروه بخش‌های مراقبت ویژه (ICU/CCU)' },
  { id: 'wg_operation_theatre', label: 'کارگروه اتاق‌های عمل' },
  { id: 'wg_procurement', label: 'کارگروه تامین، اموال و تدارکات' },
];

export const NotificationManagementSection: React.FC<NotificationManagementSectionProps> = ({
  currentUser,
  equipmentList = [],
  usersList = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'logs'>('rules');
  const [rules, setRules] = useState<NotificationRule[]>(INITIAL_NOTIFICATION_RULES);
  const [logs, setLogs] = useState<NotificationLogRecord[]>(INITIAL_NOTIFICATION_LOGS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [activeFilterOnly, setActiveFilterOnly] = useState<boolean>(false);

  // Modals
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [simulatingRule, setSimulatingRule] = useState<NotificationRule | null>(null);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  // -------------------------------------------------------------
  // RULE CREATION & EDIT STATE
  // -------------------------------------------------------------
  const [formData, setFormData] = useState<Partial<NotificationRule>>({
    name: '',
    description: '',
    eventType: 'failure_critical',
    eventCategory: 'technical',
    targetRoles: ['biomedical_engineer'],
    targetWorkgroups: [],
    targetDepartments: [],
    notifyDynamicAssignee: true,
    channels: ['in_app', 'sms'],
    priority: 'high',
    isActive: true,
    templateTitle: '',
    templateBody: '',
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      eventType: 'failure_critical',
      eventCategory: 'technical',
      targetRoles: ['biomedical_engineer'],
      targetWorkgroups: [],
      targetDepartments: [],
      notifyDynamicAssignee: true,
      channels: ['in_app', 'sms'],
      priority: 'high',
      isActive: true,
      templateTitle: '🚨 اعلان هشدار: {equipmentName}',
      templateBody: 'رویداد در بخش {department} برای تجهیز {equipmentName} (کد: {equipmentCode}) رخ داده است.',
    });
    setIsCreatingRule(true);
  };

  const openEditModal = (rule: NotificationRule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
  };

  const handleSaveRule = () => {
    if (!formData.name || !formData.eventType) return;

    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? ({
                ...r,
                ...formData,
                updatedAt: '۱۴۰۳/۱۱/۲۸',
              } as NotificationRule)
            : r
        )
      );
      setEditingRule(null);
    } else {
      const newRule: NotificationRule = {
        id: `rule-${Date.now()}`,
        name: formData.name || 'قانون اعلان جدید',
        description: formData.description || '',
        eventType: formData.eventType || 'failure_critical',
        eventCategory: formData.eventCategory || 'technical',
        targetRoles: formData.targetRoles || [],
        targetWorkgroups: formData.targetWorkgroups || [],
        targetDepartments: formData.targetDepartments || [],
        notifyDynamicAssignee: formData.notifyDynamicAssignee ?? true,
        channels: formData.channels || ['in_app'],
        priority: formData.priority || 'medium',
        isActive: formData.isActive ?? true,
        templateTitle: formData.templateTitle || 'اعلان سامانه',
        templateBody: formData.templateBody || 'شرح اعلان...',
        createdAt: '۱۴۰۳/۱۱/۲۸',
        updatedAt: '۱۴۰۳/۱۱/۲۸',
      };
      setRules((prev) => [newRule, ...prev]);
      setIsCreatingRule(false);
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleRuleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // -------------------------------------------------------------
  // SIMULATE NOTIFICATION ENGINE DISPATCH
  // -------------------------------------------------------------
  const handleSimulateDispatch = (rule: NotificationRule) => {
    setSimulatingRule(rule);
    const sampleEquipment = equipmentList[0] || {
      faName: 'ونتیلاتور Puritan Bennett 980',
      code: 'EQ-1002',
      department: 'بخش مراقبت‌های ویژه (ICU)',
    };

    const renderedTitle = rule.templateTitle
      .replace('{equipmentName}', sampleEquipment.faName)
      .replace('{equipmentCode}', sampleEquipment.code)
      .replace('{department}', sampleEquipment.department || 'ICU')
      .replace('{trainingTitle}', 'راهنمای ایمنی و کاربری ونتیلاتور')
      .replace('{requestCode}', 'PR-104')
      .replace('{itemName}', 'سنسور اکسیژن')
      .replace('{newStatus}', 'تایید مالی')
      .replace('{dueDate}', '۱۴۰۳/۱۲/۱۵');

    const renderedBody = rule.templateBody
      .replace('{equipmentName}', sampleEquipment.faName)
      .replace('{equipmentCode}', sampleEquipment.code)
      .replace('{department}', sampleEquipment.department || 'ICU')
      .replace('{issueSummary}', 'خطای فشار گاز ورودی و نیاز به بررسی فوری')
      .replace('{trainingTitle}', 'راهنمای ایمنی و کاربری ونتیلاتور')
      .replace('{requestCode}', 'PR-104')
      .replace('{itemName}', 'سنسور اکسیژن')
      .replace('{newStatus}', 'تایید مالی')
      .replace('{dueDate}', '۱۴۰۳/۱۲/۱۵');

    const newLog: NotificationLogRecord = {
      id: `log-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      eventType: rule.eventType,
      title: renderedTitle,
      message: renderedBody,
      recipientName: currentUser?.name || 'کاربر جاری',
      recipientRoleFa: currentUser?.roleFa || 'کاربر سیستم',
      recipientUserId: currentUser?.id || 'usr-current',
      channelsDelivered: rule.channels.map((ch) => ({
        channel: ch,
        status: 'delivered',
        details:
          ch === 'sms'
            ? 'شبیه‌سازی پیامک به گیرنده'
            : ch === 'email'
            ? 'شبیه‌سازی ارسال ایمیل'
            : 'ارسال موفق به کارتابل کاربر',
      })),
      timestamp: '۱۴۰۳/۱۱/۲۸ - هم‌اکنون',
      relatedEquipmentCode: sampleEquipment.code,
      relatedEquipmentName: sampleEquipment.faName,
      isRead: false,
    };

    setLogs((prev) => [newLog, ...prev]);
    setSimulationSuccess(`اعلان «${rule.name}» با موفقیت تست و به ${toPersianNumber(rule.channels.length)} کانال ارسال گردید.`);
    setTimeout(() => {
      setSimulationSuccess(null);
      setSimulatingRule(null);
    }, 2800);
  };

  // -------------------------------------------------------------
  // FILTERED RULES & LOGS
  // -------------------------------------------------------------
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch =
        r.name.includes(searchQuery) ||
        (r.description && r.description.includes(searchQuery)) ||
        r.templateTitle.includes(searchQuery);

      const matchEvent = selectedEventType === 'all' || r.eventType === selectedEventType;
      const matchChannel = selectedChannel === 'all' || r.channels.includes(selectedChannel as NotificationChannel);
      const matchActive = !activeFilterOnly || r.isActive;

      return matchSearch && matchEvent && matchChannel && matchActive;
    });
  }, [rules, searchQuery, selectedEventType, selectedChannel, activeFilterOnly]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.title.includes(searchQuery) ||
        l.message.includes(searchQuery) ||
        l.recipientName.includes(searchQuery) ||
        l.ruleName.includes(searchQuery);

      const matchEvent = selectedEventType === 'all' || l.eventType === selectedEventType;

      return matchSearch && matchEvent;
    });
  }, [logs, searchQuery, selectedEventType]);

  return (
    <div className="space-y-5">
      {/* Simulation Feedback Alert */}
      {simulationSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{simulationSuccess}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">سوابق در تب لاگ‌ها درج شد</span>
        </div>
      )}

      {/* Top Controls & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'rules'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>قوانین و Ruleهای اعلان ({toPersianNumber(rules.length)})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تاریخچه و لاگ ارسال‌ها ({toPersianNumber(logs.length)})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'rules' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف قانون اعلان جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & RBAC Guard Notice */}
      <div className="bg-gradient-to-r from-sky-50/70 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-sky-100 flex items-start gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-sky-900">
            موتور مرکزی اعلانات بیمارستانی (Centralized Notification Engine)
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            سیستم اعلانات مجهز به تفکیک دسترسی چندسطحی (RBAC) است. کلیه پیام‌ها، هشدارها و پیامک‌ها منحصراً به گیرندگان دارای مجوز مشاهده ارسال شده و مانع از نشت اطلاعات بالینی، مالی یا حریم خصوصی دستگاه‌ها به کاربران غیرمجاز می‌شود.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو در نام قانون، متن پیام یا گیرنده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden text-slate-700 font-medium"
          >
            <option value="all">همه رویدادها (Event Type)</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        {activeSubTab === 'rules' && (
          <div>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden text-slate-700 font-medium"
            >
              <option value="all">همه کانال‌های ارسال</option>
              <option value="in_app">درون برنامه‌ای</option>
              <option value="sms">پیامک (SMS)</option>
              <option value="email">ایمیل</option>
              <option value="push_system">سیستمی / Push</option>
            </select>
          </div>
        )}

        {activeSubTab === 'rules' && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeFilterOnly}
                onChange={(e) => setActiveFilterOnly(e.target.checked)}
                className="rounded text-sky-600 cursor-pointer"
              />
              <span>فقط قوانین فعال</span>
            </label>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* SUB-TAB 1: RULES LIST */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeSubTab === 'rules' && (
        <div className="space-y-3">
          {filteredRules.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">هیچ قانون اعلانی مطابق فیلتر یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRules.map((rule) => {
                const eventInfo = EVENT_TYPE_LABELS[rule.eventType] || { title: rule.eventType, category: 'عمومی' };
                const priorityBadge = PRIORITY_BADGES[rule.priority];

                return (
                  <div
                    key={rule.id}
                    className={`bg-white rounded-2xl border p-4.5 space-y-3.5 shadow-xs transition-all flex flex-col justify-between ${
                      rule.isActive ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${priorityBadge.bg}`}>
                            {priorityBadge.label}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                            {eventInfo.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRuleActive(rule.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer ${
                              rule.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="تغییر وضعیت فعال/غیرفعال"
                          >
                            <Power className="w-3 h-3" />
                            <span>{rule.isActive ? 'فعال' : 'غیرفعال'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-xs font-black text-slate-900 leading-snug">{rule.name}</h3>
                        {rule.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {rule.description}
                          </p>
                        )}
                      </div>

                      {/* Event Trigger & Audience Summary */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-bold text-slate-500">رویداد محرک:</span>
                          <span className="font-bold text-sky-800">{eventInfo.title}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700 flex-wrap gap-1">
                          <span className="font-bold text-slate-500">مخاطبان:</span>
                          <div className="flex items-center gap-1 flex-wrap font-medium text-[10px]">
                            {rule.targetRoles?.slice(0, 2).map((r) => (
                              <span key={r} className="bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded">
                                {AVAILABLE_ROLES.find((ro) => ro.id === r)?.label || r}
                              </span>
                            ))}
                            {(rule.targetRoles?.length || 0) > 2 && (
                              <span className="text-slate-400">+{toPersianNumber((rule.targetRoles?.length || 0) - 2)} نقش دیگر</span>
                            )}
                            {rule.notifyDynamicAssignee && (
                              <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                                اپراتور/تکنسین جاری
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Channels Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-bold">کانال‌های فعال:</span>
                        {rule.channels.map((ch) => {
                          const chInfo = CHANNEL_ICONS[ch];
                          return (
                            <span
                              key={ch}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${chInfo.color}`}
                            >
                              {chInfo.icon}
                              <span>{chInfo.label.split(' ')[0]}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleSimulateDispatch(rule)}
                        disabled={simulatingRule?.id === rule.id}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="ارسال تستی و شبیه‌سازی نوتیفیکیشن"
                      >
                        <Play className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                        <span>تست و شبیه‌سازی</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          title="ویرایش قانون"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                          title="حذف قانون"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* SUB-TAB 2: NOTIFICATION DISPATCH LOGS */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">عنوان و شرح پیام</th>
                  <th className="py-3 px-4">قانون مربوطه / رویداد</th>
                  <th className="py-3 px-4">گیرنده پیام</th>
                  <th className="py-3 px-4">کانال‌های تحویل</th>
                  <th className="py-3 px-4 text-center font-mono">زمان ارسال</th>
                  <th className="py-3 px-4 text-center">وضعیت تحویل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">{log.title}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">{log.message}</p>
                          {log.relatedEquipmentName && (
                            <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-mono inline-block">
                              تجهیز: {log.relatedEquipmentName} ({log.relatedEquipmentCode})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5">
                          <span className="font-bold block text-slate-800">{log.ruleName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {EVENT_TYPE_LABELS[log.eventType]?.title || log.eventType}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">{log.recipientName}</span>
                          <span className="text-[10px] text-slate-400 block">{log.recipientRoleFa}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {log.channelsDelivered.map((cd, i) => {
                            const chInfo = CHANNEL_ICONS[cd.channel];
                            return (
                              <span
                                key={i}
                                className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border ${chInfo.color}`}
                                title={cd.details || cd.status}
                              >
                                {chInfo.icon}
                                <span>{chInfo.label.split(' ')[0]}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>تحویل موفق</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* MODAL: CREATE / EDIT NOTIFICATION RULE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {(isCreatingRule || editingRule) && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {editingRule ? 'ویرایش قانون اعلان' : 'تعریف قانون اعلان جدید'}
                </h3>
              </div>

              <button
                onClick={() => {
                  setIsCreatingRule(false);
                  setEditingRule(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Name & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">نام قانون اعلان *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: اعلان فوری خرابی ونتیلاتورها"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">سطح اولویت</label>
                  <select
                    value={formData.priority || 'high'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as NotificationPriority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="critical">بسیار بحرانی</option>
                    <option value="high">اولویت بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>

              {/* Event Trigger & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رویداد محرک (Event Trigger) *</label>
                  <select
                    value={formData.eventType || 'failure_critical'}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as NotificationEventType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden"
                  >
                    {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.title} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">دسته‌بندی حوزه عملیاتی</label>
                  <select
                    value={formData.eventCategory || 'technical'}
                    onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="technical">فنی و مهندسی پزشکی</option>
                    <option value="clinical">بالینی و پرستاری</option>
                    <option value="procurement">تدارکات و مالی</option>
                    <option value="education">آموزش و یادگیری (LMS)</option>
                    <option value="safety">ایمنی و کنترل کیفی</option>
                  </select>
                </div>
              </div>

              {/* Channels Selection */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-700">کانال‌های ارسال پیام *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CHANNEL_ICONS).map(([chKey, chVal]) => {
                    const isSelected = formData.channels?.includes(chKey as NotificationChannel);
                    return (
                      <button
                        key={chKey}
                        type="button"
                        onClick={() => {
                          const current = formData.channels || [];
                          const updated = isSelected
                            ? current.filter((c) => c !== chKey)
                            : [...current, chKey as NotificationChannel];
                          setFormData({ ...formData, channels: updated });
                        }}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 text-sky-900 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {chVal.icon}
                        </div>
                        <span className="text-[11px] leading-tight">{chVal.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience Assignment: Roles */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-700">نقش‌های سازمانی هدف (Recipients)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = formData.targetRoles?.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const cur = formData.targetRoles || [];
                            const upd = isChecked ? cur.filter((x) => x !== r.id) : [...cur, r.id];
                            setFormData({ ...formData, targetRoles: upd });
                          }}
                          className="rounded text-sky-600 cursor-pointer"
                        />
                        <span className="truncate">{r.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Assignee Toggle */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block">ارسال خودکار به اپراتور / مسئول جاری تجهیز</span>
                  <span className="text-[10px] text-indigo-700">در صورت فعال بودن، اعلان مستقیما برای اپراتور شیفت یا تکنسین تخصیص یافته ارسال می‌شود.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyDynamicAssignee ?? true}
                  onChange={(e) => setFormData({ ...formData, notifyDynamicAssignee: e.target.checked })}
                  className="rounded text-indigo-600 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Message Templates */}
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الگوی عنوان پیام (Template Title)</label>
                  <input
                    type="text"
                    value={formData.templateTitle || ''}
                    onChange={(e) => setFormData({ ...formData, templateTitle: e.target.value })}
                    placeholder="مثال: 🚨 اعلام خرابی: {equipmentName}"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden font-sans text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الگوی متن پیام (Template Body)</label>
                  <textarea
                    rows={2}
                    value={formData.templateBody || ''}
                    onChange={(e) => setFormData({ ...formData, templateBody: e.target.value })}
                    placeholder="مثال: تجهیز {equipmentName} در بخش {department} دچار خرابی گردید."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:outline-hidden font-sans text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    متغیرهای قابل استفاده: {`{equipmentName}`}, {`{equipmentCode}`}, {`{department}`}, {`{dueDate}`}, {`{issueSummary}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingRule(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSaveRule}
                disabled={!formData.name || !formData.channels?.length}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 cursor-pointer"
              >
                {editingRule ? 'ذخیره ویرایش قانون' : 'ایجاد و فعال‌سازی قانون'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
