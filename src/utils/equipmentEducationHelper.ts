import { EquipmentItem, EducationItem, AppUser, UserRole, UserTrainingProgress, TrainingProgressStatus } from '../types';

export type AssignmentPriorityLevel = 'user' | 'specific_equipment' | 'role_workgroup' | 'equipment_type';

export interface ScopePriorityMeta {
  level: AssignmentPriorityLevel;
  priorityScore: number;
  labelFa: string;
  badgeClass: string;
  badgeColor: string;
  sourceLabel: string;
  targetDescription: string;
  assignmentSourceFa: string;
}

export type EquipmentTrainingMaterial = EducationItem;

// Persian text normalizer for accurate matching
function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ');
}

export interface ResolvedEquipmentEducation {
  trainings: EducationItem[]; // Structured Guides, PDFs, Videos, Documents, SOPs
  checklists: EducationItem[]; // Validated Checklists
  allResolved: EducationItem[];
  scopeMetaMap: Record<string, ScopePriorityMeta>;
  hasEquipmentSpecific: boolean;
  totalCount: number;
}

/**
 * Resolves all valid educational materials and interactive checklists for a specific equipment and user.
 * 
 * STRICT ASSIGNMENT PRIORITY RULE:
 * 1. Specific User (کاربر مشخص) -> Priority Score 100
 * 2. Specific Equipment (تجهیز مشخص) -> Priority Score 90
 * 3. Role / Workgroup (نقش یا کارگروه) -> Priority Score 80
 * 4. Equipment Type (نوع تجهیز) -> Priority Score 70
 * 
 * Rules:
 * 1. Only items with status === 'published' are displayed in Smart Record (Passport).
 * 2. Deduplication: If an item matches through multiple assignment paths, it is included ONLY ONCE,
 *    and the highest priority match determines the metadata badge.
 * 3. Unrelated content is strictly filtered out.
 */
export function getResolvedEducationForEquipment(
  equipment: EquipmentItem,
  allEducationItems: EducationItem[] = [],
  currentUser?: AppUser
): ResolvedEquipmentEducation {
  if (!equipment || !Array.isArray(allEducationItems)) {
    return {
      trainings: [],
      checklists: [],
      allResolved: [],
      scopeMetaMap: {},
      hasEquipmentSpecific: false,
      totalCount: 0,
    };
  }

  const eqId = normalizeText(equipment.id);
  const eqCode = normalizeText(equipment.code);
  const eqFaName = normalizeText(equipment.faName);
  const eqType = normalizeText(equipment.type);
  const eqSubcat = normalizeText(equipment.subcategory);
  const eqCat = normalizeText(equipment.category);
  const eqDepartment = normalizeText(equipment.department);

  const userId = currentUser ? normalizeText(currentUser.id) : '';
  const userRole = currentUser?.role;
  const userDept = currentUser ? normalizeText(currentUser.department) : '';

  const matchedItemsMap = new Map<string, { item: EducationItem; meta: ScopePriorityMeta }>();

  for (const item of allEducationItems) {
    // 1. Skip folders
    if (item.type === 'folder') continue;

    // 2. Strict Status Check: Only 'published' items appear in Smart Record (Passport)
    const status = item.status || 'published';
    if (status !== 'published') {
      continue;
    }

    const assignments = item.assignments;
    const candidates: ScopePriorityMeta[] = [];

    // --- LEVEL 1 (HIGHEST): Specific User (کاربر مشخص) ---
    if (currentUser && assignments?.targetUserIds && assignments.targetUserIds.length > 0) {
      const isUserAssigned = assignments.targetUserIds.some((uId) => {
        const norm = normalizeText(uId);
        return norm === userId || norm === normalizeText(currentUser.username) || norm === normalizeText(currentUser.email);
      });

      if (isUserAssigned) {
        candidates.push({
          level: 'user',
          priorityScore: 100,
          labelFa: 'اختصاص مستقیم به کاربر شما',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black',
          badgeColor: 'emerald',
          sourceLabel: 'اختصاص مستقیم به کاربر',
          targetDescription: `مختص ${currentUser.name}`,
          assignmentSourceFa: 'کاربر مشخص (مستقیم)',
        });
      }
    }

    // --- LEVEL 2: Specific Equipment (تجهیز مشخص) ---
    const isDirectEquipmentAssigned =
      // Check in assignments object
      (assignments?.targetEquipmentIds &&
        assignments.targetEquipmentIds.some((target) => {
          const norm = normalizeText(target);
          return norm === eqId || norm === eqCode;
        })) ||
      (assignments?.targetEquipmentCodes &&
        assignments.targetEquipmentCodes.some((target) => {
          const norm = normalizeText(target);
          return norm === eqCode || eqCode.includes(norm);
        })) ||
      // Legacy / direct fields
      item.scopeLevel === 'equipment' ||
      (item.targetEquipmentId && (normalizeText(item.targetEquipmentId) === eqId || normalizeText(item.targetEquipmentId) === eqCode)) ||
      (item.linkedAssetId && (normalizeText(item.linkedAssetId) === eqId || normalizeText(item.linkedAssetId) === eqCode)) ||
      (item.targetEquipmentCode && (normalizeText(item.targetEquipmentCode) === eqCode || eqCode.includes(normalizeText(item.targetEquipmentCode))));

    if (isDirectEquipmentAssigned) {
      candidates.push({
        level: 'specific_equipment',
        priorityScore: 90,
        labelFa: 'اختصاصی همین تجهیز (شناسه و پلاک)',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-300 font-black',
        badgeColor: 'teal',
        sourceLabel: 'مخصوص همین تجهیز',
        targetDescription: `دستگاه: ${equipment.faName} (${equipment.code})`,
        assignmentSourceFa: 'تجهیز مشخص',
      });
    }

    // --- LEVEL 3: Role or Workgroup (نقش یا کارگروه) ---
    if (currentUser) {
      const isRoleAssigned = assignments?.targetRoles && userRole && assignments.targetRoles.includes(userRole);
      const isWorkgroupAssigned =
        assignments?.targetWorkgroups &&
        assignments.targetWorkgroups.some((wg) => {
          const norm = normalizeText(wg);
          return (
            norm === userDept ||
            userDept.includes(norm) ||
            norm.includes('icu') && userDept.includes('icu') ||
            norm.includes('surgery') && userDept.includes('جراحی') ||
            norm.includes('biomed') && (userRole === 'biomedical_engineer' || userRole === 'biomedical_technician')
          );
        });

      if (isRoleAssigned || isWorkgroupAssigned) {
        candidates.push({
          level: 'role_workgroup',
          priorityScore: 80,
          labelFa: isRoleAssigned ? `مختص نقش کاربری (${currentUser.roleFa || userRole})` : 'مختص کارگروه تخصصی شما',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold',
          badgeColor: 'indigo',
          sourceLabel: isRoleAssigned ? 'نقش کاربری' : 'کارگروه تخصصی',
          targetDescription: isRoleAssigned ? `نقش: ${currentUser.roleFa || userRole}` : `کارگروه: ${currentUser.department}`,
          assignmentSourceFa: 'نقش یا کارگروه',
        });
      }
    }

    // --- LEVEL 4: Equipment Type (نوع تجهیز) ---
    const isTypeAssigned =
      (assignments?.targetTypes &&
        assignments.targetTypes.some((t) => {
          const norm = normalizeText(t);
          return norm === eqType || eqType.includes(norm) || norm.includes(eqType);
        })) ||
      item.scopeLevel === 'type' ||
      (item.targetTypeId && (normalizeText(item.targetTypeId) === eqType || eqType.includes(normalizeText(item.targetTypeId)))) ||
      (item.targetTypeName && (normalizeText(item.targetTypeName) === eqType || eqType.includes(normalizeText(item.targetTypeName)))) ||
      (item.tags && item.tags.some((t) => normalizeText(t) === eqType));

    if (isTypeAssigned) {
      candidates.push({
        level: 'equipment_type',
        priorityScore: 70,
        labelFa: `سطح نوع تجهیز (${equipment.type})`,
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 font-bold',
        badgeColor: 'sky',
        sourceLabel: 'سطح نوع تجهیز',
        targetDescription: `نوع (Type): ${equipment.type}`,
        assignmentSourceFa: 'نوع تجهیز',
      });
    }

    // Fallback: Subcategory / Category match if explicitly targeted
    if (candidates.length === 0) {
      if (item.scopeLevel === 'subcategory' && item.targetSubcategoryId && normalizeText(item.targetSubcategoryId) === eqSubcat) {
        candidates.push({
          level: 'equipment_type',
          priorityScore: 50,
          labelFa: `سطح زیردسته ساختار (${equipment.subcategory})`,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
          badgeColor: 'slate',
          sourceLabel: 'سطح زیردسته ساختار',
          targetDescription: `زیردسته: ${equipment.subcategory}`,
          assignmentSourceFa: 'زیردسته ساختار',
        });
      } else if (item.scopeLevel === 'category' && item.targetCategoryId && normalizeText(item.targetCategoryId) === eqCat) {
        candidates.push({
          level: 'equipment_type',
          priorityScore: 30,
          labelFa: `سطح دسته کل (${equipment.category})`,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
          badgeColor: 'slate',
          sourceLabel: 'سطح دسته کل',
          targetDescription: `دسته کل: ${equipment.category}`,
          assignmentSourceFa: 'دسته کل اموال',
        });
      }
    }

    // If matches were found, sort by highest priority score and pick the top one (Deduplication enforcement)
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.priorityScore - a.priorityScore);
      const bestMatchMeta = candidates[0];

      // Insert or update in matchedItemsMap
      if (!matchedItemsMap.has(item.id) || matchedItemsMap.get(item.id)!.meta.priorityScore < bestMatchMeta.priorityScore) {
        matchedItemsMap.set(item.id, { item, meta: bestMatchMeta });
      }
    }
  }

  // Convert map to sorted array (highest priority score first)
  const matchedList = Array.from(matchedItemsMap.values()).sort((a, b) => {
    if (b.meta.priorityScore !== a.meta.priorityScore) {
      return b.meta.priorityScore - a.meta.priorityScore;
    }
    return a.item.name.localeCompare(b.item.name, 'fa');
  });

  const allResolved = matchedList.map((m) => m.item);
  const scopeMetaMap: Record<string, ScopePriorityMeta> = {};
  matchedList.forEach((m) => {
    scopeMetaMap[m.item.id] = m.meta;
  });

  const checklists = allResolved.filter((i) => i.type === 'checklist' || Boolean(i.checklistData));
  const trainings = allResolved.filter((i) => i.type !== 'checklist' && !i.checklistData);
  const hasEquipmentSpecific = matchedList.some((m) => m.meta.level === 'specific_equipment' || m.meta.level === 'user');

  return {
    trainings,
    checklists,
    allResolved,
    scopeMetaMap,
    hasEquipmentSpecific,
    totalCount: allResolved.length,
  };
}

export function getEducationMaterialsForEquipment(
  equipment: EquipmentItem,
  allEducationItems: EducationItem[] = [],
  currentUser?: AppUser
): EducationItem[] {
  const resolved = getResolvedEducationForEquipment(equipment, allEducationItems, currentUser);
  return resolved.allResolved;
}

/**
 * Returns the training progress status for a user on a given education item.
 */
export function getUserTrainingProgress(
  item: EducationItem,
  user?: AppUser
): UserTrainingProgress {
  if (!user || !item.userProgressRecords || !item.userProgressRecords[user.id]) {
    return {
      userId: user?.id || 'guest',
      userName: user?.name || 'کاربر',
      userRole: user?.roleFa || user?.role || 'اپراتور',
      status: 'not_started',
    };
  }
  return item.userProgressRecords[user.id];
}

/**
 * Updates training progress for an education item and returns the updated item.
 */
export function setUserTrainingProgress(
  item: EducationItem,
  user: AppUser,
  newStatus: TrainingProgressStatus,
  notes?: string
): EducationItem {
  const existingRecord = item.userProgressRecords?.[user.id];
  const nowStr = new Date().toLocaleDateString('fa-IR');

  const updatedProgress: UserTrainingProgress = {
    userId: user.id,
    userName: user.name,
    userRole: user.roleFa || user.role,
    status: newStatus,
    startedAt: existingRecord?.startedAt || (newStatus !== 'not_started' ? nowStr : undefined),
    completedAt: newStatus === 'completed' ? nowStr : undefined,
    lastAccessedAt: nowStr,
    notes: notes || existingRecord?.notes,
  };

  return {
    ...item,
    userProgressRecords: {
      ...(item.userProgressRecords || {}),
      [user.id]: updatedProgress,
    },
  };
}
