import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  AlertTriangle,
  FileEdit,
  ArrowLeft,
  Filter,
  UserCheck,
  Sparkles,
  Calendar as CalendarIcon,
  X,
  Shield,
  Layers,
  ArrowUpRight,
  CheckSquare,
  FileCheck2,
  Award,
  Wrench,
  Users,
  Check,
  Info,
  Repeat,
  RotateCcw,
  ListChecks,
  Search,
  Trash2,
  Building,
} from 'lucide-react';
import { AppUser, TaskEvent, PageId, EquipmentItem, TaskChecklistItem } from '../../types';
import {
  getWorkgroupMembers,
  getTaskTypesForRole,
} from '../../utils/workgroupHelpers';
import { isEligibleForFaultReport } from '../../utils/equipmentEligibility';

interface TasksCalendarViewProps {
  currentUser?: AppUser;
  allUsers?: AppUser[];
  tasksList: TaskEvent[];
  equipmentList?: EquipmentItem[];
  onAddTask: (task: TaskEvent) => void;
  onUpdateTask?: (task: TaskEvent) => void;
  onToggleTaskStatus: (taskId: string) => boolean | void;
  setActivePage?: (page: PageId) => void;
  onNavigateToInventoryWithAction?: (state: {
    initialTab?: 'inventory' | 'drafts' | 'add_manual' | 'grouped_products';
    initialLayout?: 'table' | 'cards' | 'grouped';
    initialStatusFilter?: string;
    actionGuidance?: {
      type: 'draft_tagging' | 'transfer' | 'restock' | 'calibration';
      targetDraftId?: string;
      message: string;
    };
    openAssetTransferModal?: boolean;
    openQuickRestockModal?: boolean;
  }) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  currentUser,
  allUsers = [],
  tasksList,
  equipmentList = [],
  onAddTask,
  onUpdateTask,
  onToggleTaskStatus,
  setActivePage,
  onNavigateToInventoryWithAction,
}) => {
  const [filterRoleScope, setFilterRoleScope] = useState<'role_only' | 'all_hospital'>('role_only');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskEvent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [warningDraftAlert, setWarningDraftAlert] = useState<{
    task: TaskEvent;
    draft: EquipmentItem;
  } | null>(null);

  // Workgroup members & allowed task types for the active user/role
  const workgroupMembers = getWorkgroupMembers(currentUser, allUsers);
  const allowedTaskTypes = getTaskTypesForRole(currentUser?.role);

  // Quick Preset Templates for Daily Repeating Checklists based on role
  const roleChecklistPresets = useMemo(() => {
    const role = currentUser?.role;
    if (role === 'nurse_operator' || role === 'dept_head') {
      return [
        {
          title: 'چک‌لیست روزانه تحویل شیفت و ترالی احیا اورژانس',
          schedule: 'هر روز ساعت ۰۷:۳۰ صبح (شروع شیفت)',
          items: [
            'تست شارژ باتری و دیس‌شارژ آزمایشی الکتروشوک ترالی',
            'بررسی فشار مانومتر کپسول اکسیژن پرتابل و ماسک‌ها',
            'کنترل تاریخ انقضای داروهای ترالی احیا و سرنگ‌های استریل',
            'تست مکش و پاکسازی شلنگ‌های ساکشن پرتابل اورژانس',
            'ثبت و امضای برگه تحویل فیزیکی ترالی در کاردکس بخش',
          ],
        },
        {
          title: 'کنترل روزانه فشار گازهای بیهوشی و تبخیرکننده‌ها',
          schedule: 'شروع هر شیفت کاری',
          items: [
            'بررسی فشار گازهای طبی O2 و N2O و هوای فشرده',
            'تست نشتی کاف و اتصالات شلنگ‌های تنفسی',
            'بررسی کارکرد دیافراگم و سنسور اکسیژن',
          ],
        },
      ];
    }
    if (role === 'biomedical_engineer' || role === 'support_tech' || role === 'biomedical_technician') {
      return [
        {
          title: 'چک‌لیست روزانه پایش و بازرسی ایمنی ونتیلاتورها و مانیتورهای ICU',
          schedule: 'هر روز ساعت ۰۸:۰۰ صبح',
          items: [
            'کالیبراسیون و بررسی خطای سنسور O2 ونتیلاتورهای فعال بخش',
            'تست عملکرد آلارم صوتی و بصری مانیتورهای علائم حیاتی تخت‌ها',
            'کنترل دمای محیط اتاق سرور سیستم پکس و تصویربرداری',
            'بازرسی چشمی سلامت کابل‌های ارت و برق اضطراری UPS',
          ],
        },
        {
          title: 'تست روزانه کالیبراسیون و خروجی دفیبریلاتورها و الکتروشوک',
          schedule: 'هر روز ساعت ۰۸:۳۰ صبح',
          items: [
            'تست ژول خروجی روی شبیه‌ساز (۵۰ و ۱۰۰ ژول)',
            'بررسی سلامت پدال‌های اطفال و بزرگسال',
            'کنترل شارژ نگهدارنده باتری داخلی',
          ],
        },
      ];
    }
    if (role === 'warehouse_keeper' || role === 'inventory_clerk') {
      return [
        {
          title: 'چک‌لیست روزانه پایش دمای انبار مرکزی و کنترل اقلام قرنطینه',
          schedule: 'هر روز ساعت ۰۸:۳۰ صبح',
          items: [
            'ثبت و کنترل دمای یخچال نگهداری کیت‌ها (بازه استاندارد ۲ تا ۸ درجه سانتی‌گراد)',
            'تطبیق فیزیکی کاردکس حواله‌های تحویل داده شده در شیفت قبل',
            'پایش و دسته‌بندی پیش‌نویس‌های جدید ورودی جهت الصاق پلاک اموال',
            'بررسی ایمنی فیزیکی، قفل‌ها و اطفای حریق انبار قطعات گران‌قیمت',
          ],
        },
        {
          title: 'کنترل روزانه نقطه سفارش و موجودی اقلام حیاتی',
          schedule: 'هر روز کاری',
          items: [
            'شمارش فیزیکی رندوم ۵ قلم قطعات پرمصرف',
            'بررسی لیست اقلام رسیده به نقطه سفارش بحرانی',
            'صدور درخواست خرید برای کسری‌های فوری',
          ],
        },
      ];
    }
    if (role === 'asset_manager' || role === 'asset_tagging_officer') {
      return [
        {
          title: 'چک‌لیست روزانه ممیزی پلاک‌کوبی و صورت‌جلسات جابجایی اموال',
          schedule: 'هر روز ساعت ۰۹:۰۰ صبح',
          items: [
            'تطبیق بارکد QR پلاک‌های الصاق شده روز قبل با اطلاعات شاسی در سیستم',
            'پیگیری و تایید صورت‌جلسات انتقال تجهیزات بین بخش‌های درمانی',
            'رسیدگی به اقلام راکد و تعیین تکلیف قطعات اسقاطی کارگاه',
          ],
        },
      ];
    }
    // Default fallback preset
    return [
      {
        title: 'چک‌لیست روزانه بازرسی عمومی، ایمنی و آماده‌سازی تجهیزات',
        schedule: 'هر روز صبح',
        items: [
          'بررسی روشن بودن و سلامت اولیه تجهیزات کاری',
          'کنترل اتصالات کابل‌ها و پریزهای برق',
          'بررسی و ثبت موارد نقایص در کارتابل',
        ],
      },
    ];
  }, [currentUser?.role]);

  // Daily Recurring Checklist State Form
  const [recurringTitle, setRecurringTitle] = useState('');
  const [recurringSchedule, setRecurringSchedule] = useState('هر روز ساعت ۰۸:۰۰ صبح (تجدید خودکار)');
  const [recurringRecurrence, setRecurringRecurrence] = useState<'daily' | 'shift' | 'weekly'>('daily');
  const [recurringPriority, setRecurringPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [recurringDepartment, setRecurringDepartment] = useState(currentUser?.department || 'اورژانس');
  const [recurringEquipmentCode, setRecurringEquipmentCode] = useState('');
  const [recurringEqSearchTerm, setRecurringEqSearchTerm] = useState('');
  const [recurringItemsList, setRecurringItemsList] = useState<string[]>([
    'بررسی و تست اولیه عملکردی دستگاه',
    'چک کابل‌های اتصالات و سنسورها',
    'ثبت در کاردکس بخش',
  ]);
  const [newChecklistSubItem, setNewChecklistSubItem] = useState('');
  const [recurringAssigneeIds, setRecurringAssigneeIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [recurringNotes, setRecurringNotes] = useState('');

  const serviceableEquipment = (equipmentList || []).filter(isEligibleForFaultReport);

  const filteredEquipmentForRecurring = useMemo(() => {
    const q = recurringEqSearchTerm.trim().toLowerCase();
    if (!q) return serviceableEquipment.slice(0, 10);
    return serviceableEquipment.filter(
      (e) =>
        e.faName?.toLowerCase().includes(q) ||
        e.code?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [serviceableEquipment, recurringEqSearchTerm]);

  const handleValidateAndToggleTask = (task: TaskEvent) => {
    // If attempting to complete a draft completion task
    if (task.status !== 'completed') {
      const isDraftTask =
        task.type === 'draft_completion' ||
        task.targetDraftId ||
        task.title.includes('پیش‌نویس') ||
        task.equipmentCode?.toUpperCase().includes('DRAFT');

      if (isDraftTask) {
        const draft = equipmentList.find(
          (e) =>
            (task.targetDraftId && e.id === task.targetDraftId) ||
            (task.equipmentCode && (e.code === task.equipmentCode || e.id === task.equipmentCode)) ||
            (e.isDraft &&
              (task.title.includes(e.faName) ||
                task.title.includes(e.name) ||
                (task.equipmentName && (e.faName.includes(task.equipmentName) || task.equipmentName.includes(e.faName)))))
        );

        if (draft && (draft.isDraft || draft.status === 'draft')) {
          setWarningDraftAlert({
            task,
            draft,
          });
          setToastMsg('⚠️ پیش‌نویس هنوز در انبار ناقص است. تا تکمیل نهایی در انبار، امکان بستن تسک وجود ندارد.');
          setTimeout(() => setToastMsg(null), 5000);
          return false;
        }
      }
    }

    const result = onToggleTaskStatus(task.id);
    if (result === false) {
      return false;
    }
    return true;
  };

  // Toggle individual checklist sub-item
  const handleToggleChecklistItem = (task: TaskEvent, itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!task.checklistItems) return;

    const updatedItems = task.checklistItems.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.isChecked;
        return {
          ...item,
          isChecked: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : undefined,
          completedBy: nextState ? currentUser?.name : undefined,
        };
      }
      return item;
    });

    const allChecked = updatedItems.length > 0 && updatedItems.every((it) => it.isChecked);
    const anyChecked = updatedItems.some((it) => it.isChecked);
    const newStatus: TaskEvent['status'] = allChecked ? 'completed' : anyChecked ? 'in_progress' : 'open';

    const updatedTask: TaskEvent = {
      ...task,
      checklistItems: updatedItems,
      status: newStatus,
    };

    if (onUpdateTask) {
      onUpdateTask(updatedTask);
    }
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(updatedTask);
    }

    if (allChecked) {
      setToastMsg(`🎉 کلیه موارد چک‌لیست «${task.title}» تکمیل شد.`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  // Manual Reset / Renew of Daily Checklist for today's shift
  const handleRenewDailyChecklist = (task: TaskEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const resetItems = (task.checklistItems || []).map((item) => ({
      ...item,
      isChecked: false,
      completedAt: undefined,
      completedBy: undefined,
    }));

    const updatedTask: TaskEvent = {
      ...task,
      checklistItems: resetItems,
      status: 'open',
      lastRenewedDate: '1405/05/20',
      dueDate: '1405/05/20',
    };

    if (onUpdateTask) {
      onUpdateTask(updatedTask);
    }
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(updatedTask);
    }

    setToastMsg(`🔄 چک‌لیست «${task.title}» برای امروز تجدید و ریست شد.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Modal State for standard task
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );
  const [selectedTaskType, setSelectedTaskType] = useState<string>(
    allowedTaskTypes[0]?.id || 'tagging'
  );
  const [assigneeError, setAssigneeError] = useState<string | null>(null);

  // Filter states
  const isBiomedicalEngineer = currentUser?.role === 'biomedical_engineer';
  const isFinanceManager = currentUser?.role === 'finance_manager';
  const isAssetManager = currentUser?.role === 'asset_manager';
  const isProcurementOfficer = currentUser?.role === 'procurement_officer';
  const [selectedBiomedMemberFilter, setSelectedBiomedMemberFilter] = useState<string>('all');
  const [selectedFinanceMemberFilter, setSelectedFinanceMemberFilter] = useState<string>('all');
  const [selectedAssetMemberFilter, setSelectedAssetMemberFilter] = useState<string>('all');
  const [selectedProcurementMemberFilter, setSelectedProcurementMemberFilter] = useState<string>('all');

  // Role-Aware Task Filtering
  const filteredTasks = tasksList.filter((task) => {
    const isPersonalChecklist =
      task.createdByUserId === currentUser?.id ||
      (currentUser && task.assignedTo.includes(currentUser.name)) ||
      (currentUser && task.role.includes(currentUser.roleFa));

    if (currentUser) {
      const userName = currentUser.name.trim();
      const userRoleFa = currentUser.roleFa.trim();

      if (isBiomedicalEngineer) {
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مهندس تجهیزات') || isPersonalChecklist;
        const isWorkgroupMember =
          task.assignedTo.includes('نگار احمدی') ||
          task.assignedTo.includes('رضا صابری') ||
          task.assignedTo.includes('حامد باقری') ||
          task.role.includes('کالیبراسیون') ||
          task.role.includes('تعمیرات') ||
          task.role.includes('پشتیبانی فنی') ||
          task.role.includes('مهندسی پزشکی');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        if (selectedBiomedMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'negar' && !task.assignedTo.includes('نگار احمدی')) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'reza' && !task.assignedTo.includes('رضا صابری')) {
          return false;
        }
        if (selectedBiomedMemberFilter === 'hamed' && !task.assignedTo.includes('حامد باقری')) {
          return false;
        }
      } else if (isFinanceManager) {
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes(userRoleFa) || isPersonalChecklist;
        const isWorkgroupMember = 
          task.assignedTo.includes('فاطمه محمدی') ||
          task.assignedTo.includes('امیرحسین کاظمی') ||
          task.assignedTo.includes('مینا حسینی') ||
          task.role.includes('مالی') ||
          task.role.includes('حسابدار') ||
          task.role.includes('بودجه') ||
          task.role.includes('حسابرس');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        if (selectedFinanceMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'fatemeh' && !task.assignedTo.includes('فاطمه محمدی')) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'amir' && !task.assignedTo.includes('امیرحسین کاظمی')) {
          return false;
        }
        if (selectedFinanceMemberFilter === 'mina' && !task.assignedTo.includes('مینا حسینی')) {
          return false;
        }
      } else if (isAssetManager) {
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مدیر اموال') || isPersonalChecklist;
        const isWorkgroupMember =
          task.assignedTo.includes('رضا محمودی') ||
          task.assignedTo.includes('علی رستمی') ||
          task.assignedTo.includes('سمیرا شمس') ||
          task.role.includes('انبار') ||
          task.role.includes('پلاک‌کوبی') ||
          task.role.includes('کنترل موجودی') ||
          task.role.includes('اموال');

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        if (selectedAssetMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedAssetMemberFilter === 'reza' && !task.assignedTo.includes('رضا محمودی')) {
          return false;
        }
        if (selectedAssetMemberFilter === 'rostami' && !task.assignedTo.includes('علی رستمی')) {
          return false;
        }
        if (selectedAssetMemberFilter === 'shams' && !task.assignedTo.includes('سمیرا شمس')) {
          return false;
        }
      } else if (isProcurementOfficer) {
        const isPersonal = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || task.role.includes('مسئول خرید') || task.role.includes('بازرگانی') || isPersonalChecklist;
        const isWorkgroupMember =
          task.assignedTo.includes('پویا شایان') ||
          task.assignedTo.includes('مهسا نوری') ||
          task.assignedTo.includes('احسان فلاح') ||
          task.role.includes('استعلام') ||
          task.role.includes('تامین') ||
          task.role.includes('قرارداد') ||
          task.role.includes('بازرگانی') ||
          task.type === 'purchase';

        if (!isPersonal && !isWorkgroupMember) {
          return false;
        }

        if (selectedProcurementMemberFilter === 'me' && !isPersonal) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'pouya' && !task.assignedTo.includes('پویا شایان')) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'mahsa' && !task.assignedTo.includes('مهسا نوری')) {
          return false;
        }
        if (selectedProcurementMemberFilter === 'ehsan' && !task.assignedTo.includes('احسان فلاح')) {
          return false;
        }
      } else if (currentUser.role === 'hospital_admin') {
        const isAssignedToUser = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || isPersonalChecklist;
        const isMatchingRole = task.role.includes(userRoleFa) || userRoleFa.includes(task.role) || task.role.includes('مدیر') || task.role.includes('ادمین');
        if (!isAssignedToUser && !isMatchingRole) {
          return false;
        }
      } else if (filterRoleScope === 'role_only') {
        const isAssignedToUser = task.assignedTo.includes(userName) || userName.includes(task.assignedTo) || isPersonalChecklist;
        const isMatchingRole = task.role.includes(userRoleFa) || userRoleFa.includes(task.role);

        let isRoleDomainMatch = false;
        if (currentUser.role === 'procurement_officer' && task.type === 'purchase') isRoleDomainMatch = true;
        if (currentUser.role === 'biomedical_engineer' && (task.type === 'calibration' || task.type === 'inspection')) isRoleDomainMatch = true;
        if (currentUser.role === 'support_tech' && task.type === 'maintenance') isRoleDomainMatch = true;
        if (currentUser.role === 'warehouse_keeper' && (task.type === 'inspection' || task.type === 'inventory_audit' || task.type === 'stock_check')) isRoleDomainMatch = true;
        if (currentUser.role === 'nurse_operator' && (task.type === 'inspection' || task.type === 'daily_checklist')) isRoleDomainMatch = true;
        if (task.type === 'daily_checklist') isRoleDomainMatch = true;

        if (!isAssignedToUser && !isMatchingRole && !isRoleDomainMatch) {
          return false;
        }
      }
    }

    if (filterType === 'daily_recurring') {
      const isDaily = task.isDailyRecurring || task.type === 'daily_checklist' || (task.checklistItems && task.checklistItems.length > 0);
      if (!isDaily) return false;
    } else if (filterType !== 'all') {
      if (task.type !== filterType) return false;
    }

    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesPriority;
  });

  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;
  const dailyChecklistsCount = tasksList.filter((t) => t.isDailyRecurring || t.type === 'daily_checklist' || (t.checklistItems && t.checklistItems.length > 0)).length;

  const navigateToPageForTask = (type: string) => {
    if (!setActivePage) return;
    setSelectedTask(null);
    if (currentUser?.role === 'asset_manager') {
      setActivePage('inventory');
      return;
    }
    if (type === 'calibration' || type === 'expiry') setActivePage('calibration');
    else if (type === 'purchase') setActivePage('purchase_requests');
    else if (type === 'maintenance') setActivePage('failures');
    else setActivePage('inventory');
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-bounce border border-slate-700">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-600" />
            <span>چک‌لیست و وظایف عملیاتی</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ثبت و پایش وظایف روزمره، آزمون‌ها و چک‌لیست‌های تکرارشونده روزانه به تفکیک شیفت و نقش
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button for Daily Repeating Checklists */}
          <button
            onClick={() => setShowRecurringModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <Repeat className="w-4 h-4" />
            <span>ساخت چک‌لیست روزانه تکرارشونده</span>
          </button>

          {/* Standard Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>ثبت وظیفه جدید</span>
          </button>
        </div>
      </div>

      {/* Filter & Progress Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 border border-sky-200/80 p-5 rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>مدیریت و پایش وظایف عملیاتی</span>
          </div>

          {/* Scope Toggle */}
          {isBiomedicalEngineer ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه مهندسی پزشکی:</span>
              </span>
              <select
                value={selectedBiomedMemberFilter}
                onChange={(e) => setSelectedBiomedMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه مهندسی پزشکی ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس امین رضایی)</option>
                <option value="negar">مهندس نگار احمدی (کالیبراسیون و کنترل کیفی)</option>
                <option value="reza">مهندس رضا صابری (تعمیرات و PM)</option>
                <option value="hamed">مهندس حامد باقری (پشتیبانی فنی)</option>
              </select>
            </div>
          ) : isFinanceManager ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر نمایش:</span>
              </span>
              <select
                value={selectedFinanceMemberFilter}
                onChange={(e) => setSelectedFinanceMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه مالی ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (استاد صادقی)</option>
                <option value="fatemeh">فاطمه محمدی (حسابداری)</option>
                <option value="amir">امیرحسین کاظمی (بودجه)</option>
                <option value="mina">مینا حسینی (حسابرسی)</option>
              </select>
            </div>
          ) : isAssetManager ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه اموال:</span>
              </span>
              <select
                value={selectedAssetMemberFilter}
                onChange={(e) => setSelectedAssetMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه اموال و انبار ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس کامران حسینی)</option>
                <option value="reza">مهندس رضا محمودی (انباردار)</option>
                <option value="rostami">علی رستمی (کارشناس پلاک‌کوبی)</option>
                <option value="shams">سمیرا شمس (کنترل موجودی)</option>
              </select>
            </div>
          ) : isProcurementOfficer ? (
            <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <span className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>فیلتر کارگروه خرید:</span>
              </span>
              <select
                value={selectedProcurementMemberFilter}
                onChange={(e) => setSelectedProcurementMemberFilter(e.target.value)}
                className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">همه وظایف کارگروه خرید ({filteredTasks.length})</option>
                <option value="me">فقط وظایف من (مهندس سارا ابراهیمی)</option>
                <option value="pouya">پویا شایان (استعلام قیمت)</option>
                <option value="mahsa">مهسا نوری (تامین و سفارشات)</option>
                <option value="ehsan">احسان فلاح (قراردادها و SLA)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border border-sky-200 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setFilterRoleScope('role_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterRoleScope === 'role_only'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>وظایف نقش من</span>
              </button>
              <button
                onClick={() => setFilterRoleScope('all_hospital')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterRoleScope === 'all_hospital'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>کل بیمارستان</span>
              </button>
            </div>
          )}
        </div>

        {/* Completion Progress Bar */}
        <div className="bg-white/90 p-3 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>پیشرفت انجام چک‌لیست و وظایف:</span>
            </span>
            <span className="text-sky-700">
              {completedCount} از {filteredTasks.length} مورد ({progressPercent}٪)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه موارد ({filteredTasks.length})
            </button>

            {/* Daily Repeating Checklists Filter Tab */}
            <button
              onClick={() => setFilterType('daily_recurring')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'daily_recurring'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>چک‌لیست‌های روزانه تکرارشونده ({dailyChecklistsCount})</span>
            </button>

            <button
              onClick={() => setFilterType('calibration')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'calibration'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              کالیبراسیون و انقضا
            </button>
            <button
              onClick={() => setFilterType('maintenance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'maintenance'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              تعمیر و نگهداری
            </button>
            <button
              onClick={() => setFilterType('purchase')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'purchase'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              خرید و تاییدات
            </button>
            <button
              onClick={() => setFilterType('inspection')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === 'inspection'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              بازرسی و اموال
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">اولویت:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="high">اولویت بالا / حیاتی</option>
              <option value="medium">اولویت متوسط</option>
              <option value="low">اولویت معمولی</option>
            </select>
          </div>
        </div>

        {/* Tasks List Stream */}
        <div className="space-y-3.5 pt-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isDaily = task.isDailyRecurring || task.type === 'daily_checklist' || (task.checklistItems && task.checklistItems.length > 0);
              const checkedSubItemsCount = (task.checklistItems || []).filter((it) => it.isChecked).length;
              const totalSubItemsCount = task.checklistItems ? task.checklistItems.length : 0;
              const subItemsProgress = totalSubItemsCount > 0 ? Math.round((checkedSubItemsCount / totalSubItemsCount) * 100) : (task.status === 'completed' ? 100 : 0);

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 cursor-pointer group ${
                    task.status === 'completed'
                      ? 'bg-slate-50/90 border-slate-200 opacity-80'
                      : isDaily
                      ? 'bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/20 border-emerald-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs'
                      : 'bg-white border-slate-200/80 shadow-2xs hover:border-sky-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidateAndToggleTask(task);
                        }}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-sky-500'
                        }`}
                        title={task.status === 'completed' ? 'غیرتکمیل' : 'تکمیل'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-black text-xs group-hover:text-sky-700 transition-colors ${
                              task.status === 'completed'
                                ? 'line-through text-slate-500'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </span>

                          {isDaily && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-300 flex items-center gap-1 shadow-2xs">
                              <Repeat className="w-3 h-3 text-sky-600" />
                              <span>تکرار روزانه (تجدید خودکار)</span>
                            </span>
                          )}

                          {task.autoGenerated ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>تولید هوشمند AI</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              ثبت مستقیم
                            </span>
                          )}

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {task.priority === 'high'
                              ? 'فوری'
                              : task.priority === 'medium'
                              ? 'متوسط'
                              : 'عادی'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500">
                          مسئول اجرا: <strong className="text-slate-700">{task.assignedTo}</strong> ({task.role})
                        </p>

                        {task.renewalSchedule && (
                          <p className="text-[10px] text-sky-700 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sky-600" />
                            زمان‌بندی تجدید: <span>{task.renewalSchedule}</span>
                            {task.lastRenewedDate && (
                              <span className="text-slate-400 font-normal mr-1">
                                (آخرین تجدید: {task.lastRenewedDate})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                      <div className="text-left md:text-right text-[11px] text-slate-500">
                        <span className="block font-bold text-slate-700 dir-ltr text-right">
                          مهلت: {task.dueDate}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {task.equipmentCode || 'عملیات عمومی بیمارستان'}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'in_progress'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status === 'completed'
                          ? 'تکمیل‌شده'
                          : task.status === 'in_progress'
                          ? 'در حال انجام'
                          : 'در انتظار اقدام'}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Sub-Items Checklist for Daily Recurring Tasks */}
                  {task.checklistItems && task.checklistItems.length > 0 && (
                    <div className="mt-1 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-2xl">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-sky-600" />
                          <span>اقدامات و مراحل چک‌لیست:</span>
                          <span className="text-slate-400 font-normal">
                            ({checkedSubItemsCount} از {totalSubItemsCount} مورد تایید شد)
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleRenewDailyChecklist(task, e)}
                          className="text-sky-700 hover:text-sky-800 bg-sky-100/80 hover:bg-sky-200 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="ریست کردن چک‌لیست برای شیفت امروز"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>تجدید برای امروز / شیفت جدید</span>
                        </button>
                      </div>

                      {/* Sub-Items Checkbox List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {task.checklistItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={(e) => handleToggleChecklistItem(task, item.id, e)}
                            className={`p-2 rounded-xl flex items-center gap-2 text-xs transition-all cursor-pointer border ${
                              item.isChecked
                                ? 'bg-sky-50/80 border-sky-200 text-sky-950 font-bold'
                                : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                                item.isChecked
                                  ? 'bg-sky-600 border-sky-600 text-white'
                                  : 'bg-white border-slate-300 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className={`text-[11px] leading-tight ${item.isChecked ? 'line-through text-sky-900/70' : ''}`}>
                              {item.title}
                            </span>
                            {item.completedAt && (
                              <span className="text-[9px] text-sky-600 font-bold mr-auto dir-ltr">
                                {item.completedAt}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Mini Progress Bar for Sub-Items */}
                      <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-300"
                          style={{ width: `${subItemsProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {task.notes && !task.checklistItems?.length && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                      توضیحات: {task.notes}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                موردی در چک‌لیست برای این فیلتر یا نقش یافت نشد.
              </p>
              <p className="text-[11px] text-slate-400">
                می‌توانید با دکمه «ساخت چک‌لیست روزانه تکرارشونده» چک‌لیست دلخواه خود را ایجاد فرمایید.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE DAILY RECURRING CHECKLIST */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 dir-rtl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">
                    ایجاد چک‌لیست روزانه تکرارشونده
                  </h3>
                  <p className="text-[10px] text-sky-600 font-bold">
                    این چک‌لیست در شروع هر روز/شیفت کاری تجدید شده و در کارتابل نمایش داده می‌شود
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Preset Templates */}
            {roleChecklistPresets.length > 0 && (
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  قالب‌های آماده پیشنهادی متناسب با نقش شما ({currentUser?.roleFa || 'کاربر'}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {roleChecklistPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRecurringTitle(preset.title);
                        setRecurringSchedule(preset.schedule);
                        setRecurringItemsList(preset.items);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-sky-100/70 text-slate-800 border border-sky-200 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer text-right flex items-center gap-1.5"
                    >
                      <ListChecks className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!recurringTitle.trim()) return;

                const selectedMembers = workgroupMembers.filter((m) =>
                  recurringAssigneeIds.includes(m.id)
                );
                const assignedNames = selectedMembers.map((m) => m.name).join('، ') || currentUser?.name || 'کاربر سیستم';
                const primaryRole = selectedMembers.map((m) => m.roleFa).filter((v, i, a) => a.indexOf(v) === i).join(' / ') || currentUser?.roleFa || 'کاربر';

                const subItems: TaskChecklistItem[] = recurringItemsList.map((item, idx) => ({
                  id: `chk-it-${Date.now()}-${idx}`,
                  title: item,
                  isChecked: false,
                }));

                const matchingEq = equipmentList.find((eq) => eq.code === recurringEquipmentCode);

                const newRecurringTask: TaskEvent = {
                  id: `task-daily-${Date.now()}`,
                  title: recurringTitle,
                  type: 'daily_checklist',
                  priority: recurringPriority,
                  assignedTo: assignedNames,
                  role: primaryRole,
                  dueDate: '1405/05/20',
                  status: 'open',
                  autoGenerated: false,
                  isDailyRecurring: true,
                  recurrence: recurringRecurrence,
                  renewalSchedule: recurringSchedule,
                  lastRenewedDate: '1405/05/20',
                  department: recurringDepartment,
                  equipmentCode: matchingEq?.code,
                  equipmentName: matchingEq?.faName,
                  notes: recurringNotes,
                  checklistItems: subItems,
                  createdByUserId: currentUser?.id,
                  createdByName: currentUser?.name,
                };

                onAddTask(newRecurringTask);
                setShowRecurringModal(false);
                setToastMsg(`چک‌لیست روزانه «${recurringTitle}» با موفقیت ایجاد و فعال گردید.`);
                setTimeout(() => setToastMsg(null), 4000);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  عنوان چک‌لیست روزانه: <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={recurringTitle}
                  onChange={(e) => setRecurringTitle(e.target.value)}
                  placeholder="مثال: چک‌لیست روزانه تحویل شیفت و تست ترالی احیا اورژانس"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    دوره تکرار و تجدید:
                  </label>
                  <select
                    value={recurringRecurrence}
                    onChange={(e) => setRecurringRecurrence(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 font-bold text-xs"
                  >
                    <option value="daily">روزانه (هر روز صبح تجدید شود)</option>
                    <option value="shift">شروع هر شیفت کاری (صبح / عصر / شب)</option>
                    <option value="weekly">هفتگی (شنبه هر هفته)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    زمان مقرر تجدید روزانه:
                  </label>
                  <input
                    value={recurringSchedule}
                    onChange={(e) => setRecurringSchedule(e.target.value)}
                    placeholder="مثال: هر روز ساعت ۰۸:۰۰ صبح"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Sub-Items List Builder */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-sky-600" />
                    <span>آیتم‌ها و اقدامات چک‌لیست (حداقل ۱ ردیف):</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {recurringItemsList.length} آیتم ثبت شده
                  </span>
                </div>

                {/* New Item Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistSubItem}
                    onChange={(e) => setNewChecklistSubItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newChecklistSubItem.trim()) {
                          setRecurringItemsList([...recurringItemsList, newChecklistSubItem.trim()]);
                          setNewChecklistSubItem('');
                        }
                      }
                    }}
                    placeholder="عنوان اقدام (مثال: تست شارژ باتری الکتروشوک) و فشردن دکمه افزودن..."
                    className="flex-1 p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-sky-500 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newChecklistSubItem.trim()) {
                        setRecurringItemsList([...recurringItemsList, newChecklistSubItem.trim()]);
                        setNewChecklistSubItem('');
                      }
                    }}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs cursor-pointer shrink-0 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                {/* List of Sub-Items with delete buttons */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                  {recurringItemsList.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium">{it}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecurringItemsList(recurringItemsList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="حذف آیتم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department & Optional Equipment Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">بخش درمانی / واحد:</label>
                  <input
                    value={recurringDepartment}
                    onChange={(e) => setRecurringDepartment(e.target.value)}
                    placeholder="مثال: اورژانس، ICU، انبار مرکزی..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">اولویت اقدام:</label>
                  <select
                    value={recurringPriority}
                    onChange={(e) => setRecurringPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs font-bold"
                  >
                    <option value="high">فوری / حیاتی</option>
                    <option value="medium">اولویت متوسط</option>
                    <option value="low">اولویت عادی</option>
                  </select>
                </div>
              </div>

              {/* Workgroup Assignees Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>مسئول انجام چک‌لیست:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => currentUser && setRecurringAssigneeIds([currentUser.id])}
                    className="text-sky-600 hover:text-sky-800 font-bold underline text-[10px] cursor-pointer"
                  >
                    انتخاب خودم ({currentUser?.name})
                  </button>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                  {workgroupMembers.map((member) => {
                    const isSelected = recurringAssigneeIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isSelected) {
                            setRecurringAssigneeIds(recurringAssigneeIds.filter((id) => id !== member.id));
                          } else {
                            setRecurringAssigneeIds([...recurringAssigneeIds, member.id]);
                          }
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-300 text-sky-950 shadow-2xs'
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors border ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-bold text-xs block leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{member.roleFa}</span>
                          </div>
                        </div>
                        {member.id === currentUser?.id && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-800 font-bold">
                            شما
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات و دستورالعمل تکمیلی (اختیاری):</label>
                <input
                  value={recurringNotes}
                  onChange={(e) => setRecurringNotes(e.target.value)}
                  placeholder="مثال: کنترل هفتگی اتصالات برقی و ثبت در لاگ‌بوک بخش"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Repeat className="w-4 h-4" />
                  <span>ثبت و تجدید روزانه در کارتابل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Detail Action Modal for Task */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                    آیتم چک‌لیست
                  </span>
                  {selectedTask.isDailyRecurring && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-emerald-600" />
                      <span>تکرارشونده روزانه</span>
                    </span>
                  )}
                  {selectedTask.autoGenerated ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>تولید هوشمند AI</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      ثبت‌شده توسط کاربر
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-800 leading-tight">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مسئول اجرا:</span>
                <span className="font-bold text-slate-800">{selectedTask.assignedTo}</span>
                <span className="text-[10px] text-slate-500 block">({selectedTask.role})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">مهلت سررسید:</span>
                <span className="font-bold text-slate-800 dir-ltr text-right">{selectedTask.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">اولویت:</span>
                <span
                  className={`font-black ${
                    selectedTask.priority === 'high' ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {selectedTask.priority === 'high' ? 'فوری / حیاتی' : 'معمولی'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">وضعیت:</span>
                <span className="font-bold text-sky-700">
                  {selectedTask.status === 'completed' ? 'تکمیل شده' : 'در انتظار اقدام'}
                </span>
              </div>
            </div>

            {/* Sub-Items inside Details Modal */}
            {selectedTask.checklistItems && selectedTask.checklistItems.length > 0 && (
              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sky-950 text-xs flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-sky-600" />
                    اقدامات چک‌لیست:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRenewDailyChecklist(selectedTask)}
                    className="text-[10px] font-bold text-sky-800 hover:text-sky-950 bg-white px-2 py-1 rounded-lg border border-sky-200 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    تجدید برای شیفت امروز
                  </button>
                </div>

                <div className="space-y-1.5">
                  {selectedTask.checklistItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(selectedTask, item.id)}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer border transition-all ${
                        item.isChecked
                          ? 'bg-white border-sky-300 text-sky-950 font-bold'
                          : 'bg-white/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            item.isChecked
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className={item.isChecked ? 'line-through text-sky-800/70' : ''}>
                          {item.title}
                        </span>
                      </div>
                      {item.completedAt && (
                        <span className="text-[10px] text-sky-600 font-bold dir-ltr">
                          {item.completedAt}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTask.equipmentName && (
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs">
                <span className="font-bold text-sky-900 block mb-1">دستگاه مرتبط:</span>
                <p className="text-sky-800 font-medium">
                  {selectedTask.equipmentName} ({selectedTask.equipmentCode})
                </p>
              </div>
            )}

            {selectedTask.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">توضیحات و دستورالعمل:</span>
                <p className="leading-relaxed">{selectedTask.notes}</p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const success = handleValidateAndToggleTask(selectedTask);
                  if (success) {
                    setSelectedTask((prev) =>
                      prev ? { ...prev, status: prev.status === 'completed' ? 'open' : 'completed' } : null
                    );
                  }
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedTask.status === 'completed'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedTask.status === 'completed'
                    ? 'تغییر وضعیت به غیرتکمیل (باز)'
                    : 'علامت‌گذاری به‌عنوان تکمیل‌شده'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    ثبت وظیفه عملیاتی جدید
                  </h3>
                  <span className="text-[11px] text-sky-600 font-bold">
                    ابلاغ به کارگروه: {currentUser?.roleFa || 'کاربر'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAssigneeError(null);

                if (selectedAssigneeIds.length === 0) {
                  setAssigneeError('لطفاً حداقل ۱ نفر از اعضای کارگروه را برای انجام وظیفه انتخاب فرمایید.');
                  return;
                }

                const form = e.target as HTMLFormElement;
                const selectedMembers = workgroupMembers.filter((m) =>
                  selectedAssigneeIds.includes(m.id)
                );
                const assignedNames = selectedMembers.map((m) => m.name).join('، ');
                const primaryRole = selectedMembers.map((m) => m.roleFa).filter((v, i, a) => a.indexOf(v) === i).join(' / ');

                const newTask: TaskEvent = {
                  id: `task-${Date.now()}`,
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  type: selectedTaskType as any,
                  priority: (form.elements.namedItem('priority') as HTMLSelectElement).value as any,
                  assignedTo: assignedNames || currentUser?.name || 'کارشناس اموال',
                  role: primaryRole || currentUser?.roleFa || 'کارشناس تجهیزات',
                  dueDate: (form.elements.namedItem('dueDate') as HTMLInputElement).value || '1405/05/30',
                  status: 'open',
                  autoGenerated: false,
                  notes: (form.elements.namedItem('notes') as HTMLInputElement).value,
                  createdByUserId: currentUser?.id,
                  createdByName: currentUser?.name,
                };
                onAddTask(newTask);
                setShowAddModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان آیتم چک‌لیست: <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  name="title"
                  placeholder={
                    isAssetManager
                      ? 'مثال: پلاک‌کوبی و الصاق بارکد QR به مانیتورهای جدید ICU'
                      : 'مثال: بررسی و اقدام در کارگروه'
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    نوع کار (مجاز برای کارگروه شما): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={selectedTaskType}
                    onChange={(e) => setSelectedTaskType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 font-bold text-xs"
                  >
                    {allowedTaskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اولویت اقدام:</label>
                  <select
                    name="priority"
                    defaultValue="high"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  >
                    <option value="high">🔴 فوری / نیازمند اقدام سریع</option>
                    <option value="medium">🟡 اولویت متوسط</option>
                    <option value="low">🟢 اولویت عادی / روتین</option>
                  </select>
                </div>
              </div>

              {/* Task Type Description Helper */}
              {allowedTaskTypes.find((t) => t.id === selectedTaskType)?.description && (
                <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-2 text-[11px] text-sky-900 leading-relaxed">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{allowedTaskTypes.find((t) => t.id === selectedTaskType)?.description}</span>
                </div>
              )}

              {/* Workgroup Assignee Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>ارجاع به اعضای کارگروه (انتخاب ۱ تا چند نفر):</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentUser) {
                          setSelectedAssigneeIds([currentUser.id]);
                          setAssigneeError(null);
                        }
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                    >
                      ارجاع به خودم
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssigneeIds(workgroupMembers.map((m) => m.id));
                        setAssigneeError(null);
                      }}
                      className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                    >
                      انتخاب همه اعضا
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 max-h-48 overflow-y-auto">
                  {workgroupMembers.map((member) => {
                    const isSelected = selectedAssigneeIds.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== member.id));
                          } else {
                            setSelectedAssigneeIds([...selectedAssigneeIds, member.id]);
                            setAssigneeError(null);
                          }
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-300 text-sky-950 shadow-xs'
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div>
                            <span className="font-bold text-xs block leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {member.roleFa} {member.personnelCode ? `(${member.personnelCode})` : ''}
                            </span>
                          </div>
                        </div>
                        {member.id === currentUser?.id && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-800 font-bold">
                            شما
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {assigneeError ? (
                  <p className="text-rose-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{assigneeError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {selectedAssigneeIds.length.toLocaleString('fa-IR')} نفر انتخاب شده‌اند
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاریخ سررسید مهلت:</label>
                  <input
                    name="dueDate"
                    defaultValue="1405/05/28"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 dir-ltr text-right text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دستورالعمل / یادداشت تکمیلی:</label>
                  <input
                    name="notes"
                    placeholder="مثال: الصاق برچسب فلزی و ثبت سریال شاسی"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت و ابلاغ به کارگروه</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCOMPLETE DRAFT WARNING MODAL */}
      {warningDraftAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-amber-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">عدم امکان تکمیل تسک</h3>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                    پیش‌نویس هنوز در سامانه ناقص است
                  </span>
                </div>
              </div>
              <button
                onClick={() => setWarningDraftAlert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              تسک «<strong>{warningDraftAlert.task.title}</strong>» مربوط به پیش‌نویس ناقص است. تا زمانی که این قلم در بخش انبار و پیش‌نویس‌ها تکمیل، پلاک‌کوبی و نهایی‌سازی نشود، امکان بستن این تسک وجود ندارد.
            </p>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900">مشخصات پیش‌نویس:</span>
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px] dir-ltr">
                  {warningDraftAlert.draft.code}
                </span>
              </div>
              <p className="text-amber-800 font-bold">{warningDraftAlert.draft.faName}</p>
              <p className="text-[11px] text-amber-700">
                محل استقرار: انبار موقت / وضعیت: ناقص
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setWarningDraftAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                متوجه شدم
              </button>
              {onNavigateToInventoryWithAction && (
                <button
                  onClick={() => {
                    const targetDraftId = warningDraftAlert.draft.id;
                    setWarningDraftAlert(null);
                    onNavigateToInventoryWithAction({
                      initialTab: 'drafts',
                      initialLayout: 'table',
                      actionGuidance: {
                        type: 'draft_tagging',
                        targetDraftId: targetDraftId,
                        message: `هدایت شدید به پیش‌نویس «${warningDraftAlert.draft.faName}» جهت تکمیل مشخصات و پلاک‌کوبی نهایی`,
                      },
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>هدایت به بخش پیش‌نویس‌ها</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
