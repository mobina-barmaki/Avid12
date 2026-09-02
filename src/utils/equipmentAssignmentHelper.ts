import { AppUser, EquipmentItem, EquipmentAssignmentRecord } from '../types';

/**
 * Checks whether the user has permission to perform «تخصیص تجهیز به کاربر».
 * 
 * CRITICAL RULE:
 * This permission is SEPARATE and INDEPENDENT.
 * It is NOT automatically inherited from:
 * - register_inventory (ثبت موجودی)
 * - view_all (مشاهده همه)
 * - edit_inventory (ویرایش شناسنامه)
 * - role definitions without explicit assignment permission
 */
export const hasEquipmentAssignmentPermission = (user?: AppUser | null): boolean => {
  if (!user) return false;

  // 1. Check individual user override explicitly (highest precedence)
  if (user.individualOverrides && user.individualOverrides['assign_equipment'] !== undefined) {
    return Boolean(user.individualOverrides['assign_equipment']);
  }

  // 2. Check if user's direct permissions array contains 'assign_equipment'
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes('assign_equipment');
  }

  return false;
};

/**
 * Filters the equipment list to ONLY items assigned to the specified user.
 */
export const getAssignedEquipmentForUser = (
  equipmentList: EquipmentItem[],
  user?: AppUser | null
): EquipmentItem[] => {
  if (!user) return [];

  const userId = user.id;
  const userName = user.name;

  return equipmentList.filter((item) => {
    if (item.itemKind === 'consumable' || item.isDraft) return false;

    const isDirectlyAssignedId = Boolean(item.assignedOperatorId && item.assignedOperatorId === userId);
    const isDirectlyAssignedName = Boolean(item.assignedOperator && item.assignedOperator === userName);
    const isAuthorized = Array.isArray(item.authorizedOperators) && item.authorizedOperators.includes(userName);

    return isDirectlyAssignedId || isDirectlyAssignedName || isAuthorized;
  });
};

/**
 * Generates a formatted live Persian date string
 */
const getLivePersianDateString = (): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return '۱۴۰۳/۰۵/۲۲';
  }
};

export interface AssignEquipmentPayload {
  userId: string;
  userName: string;
  userRoleFa: string;
  userPersonnelCode?: string;
  department: string;
  assignedDate?: string;
  endDate?: string;
  status: 'active' | 'temporary' | 'ended' | 'transferred';
  notes?: string;
  authorizedOperators?: string[];
}

/**
 * Enforces permission and applies equipment assignment with audit history
 */
export const assignEquipmentToUser = (
  equipment: EquipmentItem,
  payload: AssignEquipmentPayload,
  assigningUser?: AppUser | null
): { success: boolean; updatedEquipment?: EquipmentItem; errorMessage?: string } => {
  if (!hasEquipmentAssignmentPermission(assigningUser)) {
    return {
      success: false,
      errorMessage: 'شما مجوز «تخصیص تجهیز به کاربر» را ندارید. این دسترسی باید توسط مدیر ارشد بیمارستان فعال گردد.',
    };
  }

  const currentDate = payload.assignedDate || getLivePersianDateString();
  const assignerName = assigningUser?.name || 'مدیر سیستم';
  const assignerRole = assigningUser?.roleFa || 'مسئول دسترسی‌ها';

  // If there was an active assignment previously, archive it
  const existingHistory: EquipmentAssignmentRecord[] = [...(equipment.assignmentHistory || [])];
  
  if (equipment.assignedOperator && equipment.assignedOperator !== payload.userName) {
    // Mark previous active record as transferred/ended if exists
    const lastActiveIdx = existingHistory.findIndex((h) => h.status === 'active');
    if (lastActiveIdx >= 0) {
      existingHistory[lastActiveIdx] = {
        ...existingHistory[lastActiveIdx],
        status: 'transferred',
        endDate: currentDate,
        notes: existingHistory[lastActiveIdx].notes 
          ? `${existingHistory[lastActiveIdx].notes} (انتقال به ${payload.userName})`
          : `انتقال به ${payload.userName} توسط ${assignerName}`,
      };
    }
  }

  const newAssignmentRecord: EquipmentAssignmentRecord = {
    id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: payload.userId,
    userName: payload.userName,
    userRoleFa: payload.userRoleFa,
    userPersonnelCode: payload.userPersonnelCode,
    department: payload.department,
    assignedDate: currentDate,
    endDate: payload.endDate,
    status: payload.status,
    assignedBy: assignerName,
    assignedByRole: assignerRole,
    notes: payload.notes,
  };

  const updatedEquipment: EquipmentItem = {
    ...equipment,
    assignedOperator: payload.userName,
    assignedOperatorId: payload.userId,
    assignmentDate: currentDate,
    assignmentEndDate: payload.endDate,
    assignmentStatus: payload.status,
    assignmentNotes: payload.notes,
    authorizedOperators: payload.authorizedOperators || equipment.authorizedOperators || [payload.userName],
    assignmentHistory: [newAssignmentRecord, ...existingHistory],
  };

  return {
    success: true,
    updatedEquipment,
  };
};

/**
 * Enforces permission and releases/unassigns equipment back to hospital unassigned pool
 */
export const unassignEquipmentFromUser = (
  equipment: EquipmentItem,
  unassignReason: string = 'لغو تخصیص و عودت به موجودی عمومی',
  assigningUser?: AppUser | null
): { success: boolean; updatedEquipment?: EquipmentItem; errorMessage?: string } => {
  if (!hasEquipmentAssignmentPermission(assigningUser)) {
    return {
      success: false,
      errorMessage: 'شما مجوز «تخصیص تجهیز به کاربر» را ندارید. این دسترسی باید توسط مدیر ارشد بیمارستان فعال گردد.',
    };
  }

  const currentDate = getLivePersianDateString();
  const assignerName = assigningUser?.name || 'مدیر سیستم';

  const existingHistory: EquipmentAssignmentRecord[] = [...(equipment.assignmentHistory || [])];
  
  // Mark previous active record as ended
  const lastActiveIdx = existingHistory.findIndex((h) => h.status === 'active' || h.status === 'temporary');
  if (lastActiveIdx >= 0) {
    existingHistory[lastActiveIdx] = {
      ...existingHistory[lastActiveIdx],
      status: 'ended',
      endDate: currentDate,
      notes: existingHistory[lastActiveIdx].notes 
        ? `${existingHistory[lastActiveIdx].notes} | علت لغو: ${unassignReason}`
        : `لغو تخصیص توسط ${assignerName} | علت: ${unassignReason}`,
    };
  } else if (equipment.assignedOperator) {
    existingHistory.unshift({
      id: `asg-end-${Date.now()}`,
      userId: equipment.assignedOperatorId || 'usr-prev',
      userName: equipment.assignedOperator,
      userRoleFa: 'اپراتور پیشین',
      department: equipment.department,
      assignedDate: equipment.assignmentDate || currentDate,
      endDate: currentDate,
      status: 'ended',
      assignedBy: assignerName,
      assignedByRole: assigningUser?.roleFa || 'مسئول دسترسی‌ها',
      notes: `لغو تخصیص: ${unassignReason}`,
    });
  }

  const updatedEquipment: EquipmentItem = {
    ...equipment,
    assignedOperator: undefined,
    assignedOperatorId: undefined,
    assignmentDate: undefined,
    assignmentEndDate: undefined,
    assignmentStatus: 'ended',
    assignmentNotes: `لغو تخصیص در تاریخ ${currentDate} به علت: ${unassignReason}`,
    assignmentHistory: existingHistory,
  };

  return {
    success: true,
    updatedEquipment,
  };
};
