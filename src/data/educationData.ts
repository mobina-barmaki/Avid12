import { EducationItem } from '../types';

export const INITIAL_EDUCATION_ITEMS: EducationItem[] = [
  // Root level folders
  {
    id: 'f-biomedical',
    name: '۱. راهنماهای فنی و اپراتوری تجهیزات پزشکی',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۰۱',
    updatedAt: '۱۴۰۴/۰۲/۱۵',
    author: 'مهندس حسینی',
    authorRole: 'سرپرست مهندسی پزشکی',
    department: 'مهندسی پزشکی',
    description: 'کاتالوگ‌ها، دستورالعمل‌های کاربری استاندارد (User Manual) و سرویس دستگاه‌های اتاق عمل، ICU، CCU و تصویربرداری',
    tags: ['تجهیزات', 'منوال', 'کاربری', 'مهندسی'],
    itemCount: 8,
    isSystem: true,
  },
  {
    id: 'f-checklists',
    name: '۲. چک‌لیست‌های عملیاتی و آزمون‌های تحویل شیفت',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۰۳',
    updatedAt: '۱۴۰۴/۰۲/۲۲',
    author: 'دکتر صابری و مهندس حسینی',
    authorRole: 'کمیته مشترک بالینی و تجهیزات',
    department: 'ایمنی بیمار و مهندسی پزشکی',
    description: 'چک‌لیست‌های هوشمند و تعاملی تست روزانه، آزمون‌های SST/EST، تحویل شیفت پرستاری و آماده‌بکارهای بخش‌های ویژه',
    tags: ['چک‌لیست', 'عملیاتی', 'تست روزانه', 'تحویل شیفت'],
    itemCount: 6,
    isSystem: true,
  },
  {
    id: 'f-safety',
    name: '۳. ایمنی، کالیبراسیون و اعتباربخشی بیمارستانی',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۰۵',
    updatedAt: '۱۴۰۴/۰۲/۲۰',
    author: 'دکتر صابری',
    authorRole: 'دبیر کمیته ایمنی و اعتباربخشی',
    department: 'بهداشت و ایمنی',
    description: 'استانداردهای ایمنی بیمار، دستورالعمل‌های کدهای اضطراری (کد ۹۹، کد ۱۰۰)، چک‌لیست‌های کالیبراسیون و سنجه‌های اعتباربخشی',
    tags: ['ایمنی', 'کالیبراسیون', 'اعتباربخشی', 'کد ۹۹'],
    itemCount: 4,
    isSystem: true,
  },
  {
    id: 'f-videos',
    name: '۴. ویدیوها و کارگاه‌های آموزشی بالینی',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۱۰',
    updatedAt: '۱۴۰۴/۰۲/۱۸',
    author: 'سوپروایزر آموزشی',
    authorRole: 'مدیریت آموزش پرستاری',
    department: 'آموزش بالینی',
    description: 'فیلم‌های عملی نحوه کار با ونتیلاتورها، پمپ‌های تزریق، دستگاه الکتروشوک و احیای قلبی-ریوی پیشرفته',
    tags: ['ویدیو', 'کارگاه', 'پرستاری', 'احیا'],
    itemCount: 5,
    isSystem: true,
  },
  {
    id: 'f-infection',
    name: '۵. کنترل عفونت، استریلیزاسیون و CSSD',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۱۵',
    updatedAt: '۱۴۰۴/۰۲/۱۲',
    author: 'کارشناس کنترل عفونت',
    authorRole: 'کمیته کنترل عفونت',
    department: 'کنترل عفونت',
    description: 'پروتکل‌های استریلیزاسیون با اتوکلاو، بهداشت دست، مدیریت پسماندهای عفونی و پیشگیری از عفونت‌های بیمارستانی',
    tags: ['عفونت', 'CSSD', 'اتوکلاو', 'بهداشت'],
    itemCount: 3,
    isSystem: true,
  },
  {
    id: 'f-inventory',
    name: '۶. دستورالعمل‌های انبارداری و ثبت اموال',
    type: 'folder',
    parentId: null,
    createdAt: '۱۴۰۳/۱۱/۲۰',
    updatedAt: '۱۴۰۴/۰۲/۰۵',
    author: 'مدیر اموال و انبار',
    authorRole: 'مدیریت تدارکات',
    department: 'انبار و اموال',
    description: 'راهنمای ثبت برچسب بارکد، ثبت پیش‌نویس تجهیزات، تحویل و تحول اموال و فرآیند اسقاط اقلام مستهلک',
    tags: ['اموال', 'انبارداری', 'بارکد', 'پیش‌نویس'],
    itemCount: 3,
    isSystem: true,
  },

  // Subfolders inside Biomedical Folder (f-biomedical)
  {
    id: 'f-vent-sub',
    name: 'دستگاه‌های ونتیلاتور و تنفس مصنوعی',
    type: 'folder',
    parentId: 'f-biomedical',
    createdAt: '۱۴۰۳/۱۲/۰۱',
    updatedAt: '۱۴۰۴/۰۲/۱۴',
    author: 'مهندس حسینی',
    authorRole: 'مهندسی پزشکی',
    department: 'مهندسی پزشکی',
    description: 'دفترچه‌های راهنمای کاربری و خطاهای رایج ونتیلاتورهای Puritan Bennett، Drager و Hamilton',
    tags: ['ونتیلاتور', 'ICU', 'تنفس'],
    itemCount: 4,
  },
  {
    id: 'f-defib-sub',
    name: 'دستگاه‌های الکتروشوک و پایش قلبی',
    type: 'folder',
    parentId: 'f-biomedical',
    createdAt: '۱۴۰۳/۱۲/۰۲',
    updatedAt: '۱۴۰۴/۰۲/۱۰',
    author: 'مهندس حسینی',
    authorRole: 'مهندسی پزشکی',
    department: 'مهندسی پزشکی',
    description: 'راهنماهای اپراتوری شوک‌های Zoll، Philips و مانیتورینگ Saadat',
    tags: ['الکتروشوک', 'Zoll', 'مانیتور'],
    itemCount: 3,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTERACTIVE STRUCTURED CHECKLISTS (چک‌لیست‌های تعاملی ساختاریافته)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Checklist 1: ASSET-SPECIFIC (EQ-1042 / Puritan Bennett 840)
  {
    id: 'chk-pb840-daily-sst',
    name: 'چک‌لیست آزمون SST و بررسی عملیاتی ونتیلاتور PB840',
    type: 'checklist',
    parentId: 'f-checklists',
    size: 'تعاملی',
    createdAt: '۱۴۰۳/۱۲/۰۵',
    updatedAt: '۱۴۰۴/۰۲/۱۴',
    author: 'مهندس علیرضا حسینی',
    authorRole: 'کارشناس ارشد مهندسی پزشکی',
    department: 'ICU و اورژانس',
    description: 'چک‌لیست آزمون خودکار SST، تست نشتی، کنترل فشار گازهای ورودی و پارامترهای ایمنی ونتیلاتور ICU',
    tags: ['ونتیلاتور', 'PB840', 'SST', 'ICU', 'EQ-1042'],
    duration: '۸ دقیقه',
    starred: true,
    status: 'published',
    scopeLevel: 'equipment',
    targetEquipmentId: 'eq-1',
    targetEquipmentCode: 'EQ-1042',
    targetEquipmentName: 'دستگاه ونتیلاتور مراقبت‌های ویژه (ICU Ventilator) - Puritan Bennett 840',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetSubcategoryName: 'مراقبت‌های ویژه و بیهوشی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '1.2',
    assignments: {
      targetTypes: ['ونتیلاتور'],
      targetEquipmentIds: ['eq-1', 'eq-vent-1', 'eq-vent-2'],
      targetEquipmentCodes: ['EQ-1042', 'AV-00140'],
      targetEquipmentNames: ['دستگاه ونتیلاتور مراقبت‌های ویژه PB840', 'ونتیلاتور پیشرفته مراقبت ویژه Dräger V600'],
      targetRoles: ['nurse_operator', 'biomedical_engineer', 'dept_head'],
      targetWorkgroups: ['wg-icu', 'wg-surgery'],
      targetUserIds: ['usr-7', 'usr-2'],
      targetUserNames: ['نسرین کریمی', 'مهندس امین رضایی'],
    },
    userProgressRecords: {
      'usr-7': {
        userId: 'usr-7',
        userName: 'نسرین کریمی',
        userRole: 'اپراتور ICU',
        status: 'completed',
        startedAt: '۱۴۰۴/۰۲/۱۵',
        completedAt: '۱۴۰۴/۰۲/۲۰',
        score: 100,
        notes: 'آزمون با موفقیت پاس شد.',
      },
      'usr-2': {
        userId: 'usr-2',
        userName: 'مهندس امین رضایی',
        userRole: 'مهندس تجهیزات پزشکی',
        status: 'in_progress',
        startedAt: '۱۴۰۴/۰۲/۲۲',
      },
    },
    checklistData: {
      objective: 'اطمینان کامل از عدم نشتی مدار تنفسی، کالیبراسیون دقیق فلوسنسور و آماده‌بکاری کامل دستگاه قبل از اتصال به بیمار.',
      estimatedMinutes: 8,
      safetyPrecautions: 'هرگز تست SST را در حین اتصال ونتیلاتور به بیمار انجام ندهید. در صورت عدم عبور (FAIL) تست نشتی مدار، بلافاصله لوله‌ها و مرطوب‌کننده را بررسی یا تعویض نمایید.',
      items: [
        {
          id: 'pb-s1',
          order: 1,
          title: 'بررسی اتصال به منبع تغذیه برق اضطراری (UPS) و چراغ پاور',
          description: 'کابل باید سالم و بدون پارگی به پریز قرمز رنگ UPS متصل باشد.',
          responseType: 'pass_fail',
          required: true,
          safetyNote: 'استفاده از پریزهای غیر اضطراری برای تجهیزات پشتیبان حیات ممنوع است.',
        },
        {
          id: 'pb-s2',
          order: 2,
          title: 'فشار خط ورودی گاز اکسیژن (O2 Supply Pressure)',
          description: 'فشار گیج ورودی اکسیژن متصل به کنسول دیواری یا سیلندر را ثبت کنید.',
          responseType: 'numeric',
          unit: 'Bar',
          minVal: 3.5,
          maxVal: 6.0,
          required: true,
          helpText: 'فشار نرمال باید بین ۴ تا ۵ بار باشد.',
        },
        {
          id: 'pb-s3',
          order: 3,
          title: 'فشار خط ورودی هوای فشرده (Air Supply Pressure)',
          description: 'فشار گیج ورودی هوای فشرده متصل به سیستم مرکزی را ثبت کنید.',
          responseType: 'numeric',
          unit: 'Bar',
          minVal: 3.5,
          maxVal: 6.0,
          required: true,
          helpText: 'فشار نرمال بین ۴ تا ۵.۵ بار است.',
        },
        {
          id: 'pb-s4',
          order: 4,
          title: 'انجام تست خودکار SST (Short Self Test) از صفحه منوی دستگاه',
          description: 'پورت Y-Piece را مسدود کرده و اجازه دهید دستگاه مراحل سنسور، فشار و والو دمی را طی کند.',
          responseType: 'done_not_done',
          required: true,
        },
        {
          id: 'pb-s5',
          order: 5,
          title: 'نتیجه آزمون نشتی مدار تنفسی (Circuit Leak Test)',
          description: 'آیا پیام PASS روی نمایشگر دستگاه ثبت شد؟',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'pb-s6',
          order: 6,
          title: 'کنترل سطح آب مقطر استریل در محفظه هیومیدیفایر (مرطوب‌کننده)',
          description: 'سطح آب باید بین خطوط Min و Max قرار داشته باشد.',
          responseType: 'yes_no',
          required: true,
        },
        {
          id: 'pb-s7',
          order: 7,
          title: 'وضعیت شارژ باتری پشتیبان داخلی دستگاه',
          description: 'درصد تقریبی نمایش داده شده روی آیکون باتری نمایشگر',
          responseType: 'single_choice',
          options: ['۱۰۰٪ شارژ کامل', 'بین ۵۰ تا ۹۰٪', 'زیر ۵۰٪ (نیازمند شارژ فوری)', 'باتری معیوب'],
          required: true,
        },
        {
          id: 'pb-s8',
          order: 8,
          title: 'تست عملکرد آلارم صوتی و نوری High Pressure',
          description: 'هنگام انسداد مصنوعی خروجی، آلارم قرمز و بوق ممتد باید ظرف ۲ ثانیه فعال شود.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'pb-s9',
          order: 9,
          title: 'توضیحات یا مشاهدات فنی اپراتور تحویل‌گیرنده',
          description: 'در صورت وجود لرزش، صدای غیرعادی یا نشتی جزئی یادداشت فرمایید.',
          responseType: 'text',
          required: false,
        },
      ],
    },
  },

  // Checklist 2: TYPE-LEVEL (ونتیلاتور / Ventilator)
  {
    id: 'chk-ventilator-type-care',
    name: 'چک‌لیست شیفت و مراقبت دوره‌ای کلیه دستگاه‌های ونتیلاتور',
    type: 'checklist',
    parentId: 'f-checklists',
    size: 'تعاملی',
    createdAt: '۱۴۰۳/۱۲/۰۷',
    updatedAt: '۱۴۰۴/۰۲/۱۰',
    author: 'سوپروایزر بالینی بخش‌های ویژه',
    authorRole: 'آموزش پرستاری',
    department: 'ICU / CCU / NICU',
    description: 'چک‌لیست تحویل شیفت و کنترل استانداردهای بهداشتی و ایمنی مدار تنفسی ونتیلاتورها',
    tags: ['ونتیلاتور', 'تحویل شیفت', 'پرستاری', 'مراقبت'],
    duration: '۵ دقیقه',
    starred: true,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetSubcategoryName: 'مراقبت‌های ویژه و بیهوشی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '2.0',
    assignments: {
      targetTypes: ['ونتیلاتور', 'تنفسی'],
      targetRoles: ['nurse_operator', 'biomedical_engineer', 'dept_head'],
      targetWorkgroups: ['wg-icu', 'wg-emergency'],
      targetUserIds: ['usr-7'],
      targetUserNames: ['نسرین کریمی'],
    },
    userProgressRecords: {
      'usr-7': {
        userId: 'usr-7',
        userName: 'نسرین کریمی',
        userRole: 'اپراتور ICU',
        status: 'in_progress',
        startedAt: '۱۴۰۴/۰۲/۱۸',
      },
    },
    checklistData: {
      objective: 'پایش مستمر وضعیت سنسورها، فیلترهای باکتریال و میعانات مدار تنفسی در هر شیفت درمانی.',
      estimatedMinutes: 5,
      items: [
        {
          id: 'vt-s1',
          order: 1,
          title: 'تخلیه تله‌های آب (Water Traps) مدار دمی و بازدمی',
          description: 'تجمع آب در مدار باعث ایجاد مقاومت اضافی و خطای تریگر می‌شود.',
          responseType: 'done_not_done',
          required: true,
        },
        {
          id: 'vt-s2',
          order: 2,
          title: 'بررسی تاریخ تعویض فیلتر هپا (HEPA) و باکتریال بازدمی',
          description: 'فیلتر باید عاری از ترشحات و تغییر رنگ بوده و تاریخ انقضای شیفت نگذشته باشد.',
          responseType: 'yes_no',
          required: true,
          helpText: 'فیلتر باکتریال حداکثر هر ۴۸ ساعت تعویض می‌گردد.',
        },
        {
          id: 'vt-s3',
          order: 3,
          title: 'بررسی تنظیم حدود آلارم‌های حیاتی بر اساس دستور پزشک (Peak Pressure, Low Minute Vol)',
          description: 'آلارم‌ها نباید در حالت Mute یا خاموش دائمی باشند.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'vt-s4',
          order: 4,
          title: 'دمای خروجی سیستم مرطوب‌کننده (Humidifier Temperature)',
          description: 'دمای گاز تحویلی به راه هوایی بیمار را ثبت کنید.',
          responseType: 'numeric',
          unit: '°C',
          minVal: 35.0,
          maxVal: 39.0,
          required: true,
        },
        {
          id: 'vt-s5',
          order: 5,
          title: 'تست عملکرد کلید 100% O2 Suction',
          description: 'فعالسازی اکسیژن ۱۰۰٪ به مدت ۲ دقیقه جهت ساکشن ترشحات بیمار.',
          responseType: 'pass_fail',
          required: true,
        },
      ],
    },
  },

  // Checklist 3: ASSET-SPECIFIC (EQ-1043 / Zoll R Series Defibrillator)
  {
    id: 'chk-zoll-daily-test',
    name: 'چک‌لیست آزمون روزانه ۳۰ ژول و آمادگی ترالی احیا (Zoll R Series)',
    type: 'checklist',
    parentId: 'f-checklists',
    size: 'تعاملی',
    createdAt: '۱۴۰۳/۱۲/۰۳',
    updatedAt: '۱۴۰۴/۰۲/۱۱',
    author: 'مهندسی پزشکی و کمیته CPR',
    authorRole: 'کارشناس تجهیزات اورژانس',
    department: 'اورژانس و CCU',
    description: 'تست روزانه ۳۰ ژول، کنترل پدال‌های بزرگسال و اطفال، سلامت پیس‌میکر و کاغذ پرینتر الکتروشوک',
    tags: ['الکتروشوک', 'Zoll', 'تست ۳۰ ژول', 'کد ۹۹', 'EQ-1043'],
    duration: '۶ دقیقه',
    starred: true,
    status: 'published',
    scopeLevel: 'equipment',
    targetEquipmentId: 'eq-2',
    targetEquipmentCode: 'EQ-1043',
    targetEquipmentName: 'دستگاه الکتروشوک بای‌فازیک (Biphasic Defibrillator) - Zoll R Series',
    targetTypeId: 'الکتروشوک',
    targetTypeName: 'الکتروشوک',
    targetSubcategoryName: 'مراقبت‌های ویژه و بیهوشی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '1.4',
    assignments: {
      targetTypes: ['الکتروشوک', 'دستگاه های قلب و عروق'],
      targetEquipmentIds: ['eq-2', 'eq-defib-1'],
      targetEquipmentCodes: ['EQ-1043'],
      targetEquipmentNames: ['دستگاه الکتروشوک بای‌فازیک Zoll R Series'],
      targetRoles: ['nurse_operator', 'biomedical_engineer', 'dept_head'],
      targetWorkgroups: ['wg-emergency', 'wg-icu'],
      targetUserIds: ['usr-7', 'usr-19'],
      targetUserNames: ['نسرین کریمی', 'مهندس رضا صابری'],
    },
    userProgressRecords: {
      'usr-7': {
        userId: 'usr-7',
        userName: 'نسرین کریمی',
        userRole: 'اپراتور ICU',
        status: 'completed',
        startedAt: '۱۴۰۴/۰۲/۱۰',
        completedAt: '۱۴۰۴/۰۲/۱۲',
        score: 100,
      },
    },
    checklistData: {
      objective: 'تضمین آمادگی ۱۰۰٪ دستگاه الکتروشوک جهت شوک‌تراپی و احیای قلبی در موقعیت‌های کد ۹۹ بیمارستان.',
      estimatedMinutes: 6,
      safetyPrecautions: 'پدال‌ها باید درون محفظه نگهدارنده داخلی قرار داشته باشند. در هنگام فشردن کلیدهای تخلیه، به سطوح فلزی پدال‌ها دست نزنید.',
      items: [
        {
          id: 'z-s1',
          order: 1,
          title: 'بررسی علامت چک‌مارک سبز رنگ آمادگی (Ready Indicator) در گوشه نمایشگر',
          description: 'علامت سبز به منزله گذر موفق تست خودکار شیفت شب است.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'z-s2',
          order: 2,
          title: 'انجام آزمون شارژ و دشارژ ۳۰ ژول در محفظه داخلی پدال‌ها',
          description: 'انرژی را روی ۳۰ ژول تنظیم، دکمه Charge را فشرده و با دو کلید روی پدال‌ها دشارژ کنید.',
          responseType: 'done_not_done',
          required: true,
        },
        {
          id: 'z-s3',
          order: 3,
          title: 'زمان رسیدن به حداکثر شارژ ۲۰۰ ژول (Charge Time)',
          description: 'زمان رسیدن به شارژ کامل را با کرونومتر دستگاه اندازه بگیرید.',
          responseType: 'numeric',
          unit: 'ثانیه',
          minVal: 1.0,
          maxVal: 7.0,
          required: true,
          helpText: 'زمان شارژ نباید بیش از ۷ ثانیه به طول بینجامد.',
        },
        {
          id: 'z-s4',
          order: 4,
          title: 'بررسی چاپ خودکار نوار تأیید آزمون از پرینتر حرارتی',
          description: 'روی برگه چاپ شده عبارت «TEST OK - 30J» و تاریخ و ساعت صحیح درج شده باشد.',
          responseType: 'yes_no',
          required: true,
        },
        {
          id: 'z-s5',
          order: 5,
          title: 'کنترل تاریخ انقضای پدهای چسبی یکبار مصرف بزرگسال و اطفال در ترالی احیا',
          description: 'پدهای الکترود چسبی منقضی شده به دلیل خشک شدن ژل عملکرد نخواهند داشت.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'z-s6',
          order: 6,
          title: 'تست عملکرد کابل و لیدهای ۳ گانه پایش نوار قلب (ECG Leads)',
          description: 'اتصال لیدها به پورت و مشاهده سیگنال نویز صفر بدون قطعی سیم.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'z-s7',
          order: 7,
          title: 'بررسی وجود تیوب ژل هادی مخصوص الکتروشوک در کنار دستگاه',
          description: 'وجود ژل الکترود با تاریخ مصرف معتبر الزامی است.',
          responseType: 'yes_no',
          required: true,
        },
      ],
    },
  },

  // Checklist 4: TYPE-LEVEL (پمپ انفوزیون سرنگ / Syringe Infusion Pump)
  {
    id: 'chk-infusion-pump-type',
    name: 'چک‌لیست تست بالینی و سنسورهای انسداد پمپ‌های انفوزیون سرنگ',
    type: 'checklist',
    parentId: 'f-checklists',
    size: 'تعاملی',
    createdAt: '۱۴۰۳/۱۲/۱۰',
    updatedAt: '۱۴۰۴/۰۲/۰۸',
    author: 'مهندسی پزشکی و سوپروایزر دارویی',
    authorRole: 'مهندسی پزشکی',
    department: 'بخش‌های بستری و ویژه',
    description: 'تست مکانیزم بازوی فشاری، تشخیص اتوماتیک سایز سرنگ و آلارم Occlusion قبل از تزریق داروهای حساس',
    tags: ['پمپ سرنگ', 'انفوزیون', 'دارو', 'انسداد'],
    duration: '۵ دقیقه',
    starred: false,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'پمپ سرنگ',
    targetTypeName: 'پمپ سرنگ',
    targetSubcategoryName: 'دستگاه ها و لوازم عمومی پزشکی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '1.1',
    checklistData: {
      objective: 'تضمین دقت دوزاژ دارویی و عملکرد بی‌نقص آلارم‌های قطع تزریق در پمپ‌های سرنگ.',
      estimatedMinutes: 5,
      items: [
        {
          id: 'ip-s1',
          order: 1,
          title: 'کنترل فیزیکی کلمپ و بازوی متحرک نگهدارنده پیستون سرنگ',
          description: 'بازو باید روان و بدون لقی حرکت کند.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'ip-s2',
          order: 2,
          title: 'تست تشخیص خودکار سایز سرنگ (10cc, 20cc, 50cc)',
          description: 'دستگاه باید بلافاصله پس از جاگذاری سرنگ سایز دقیق را روی صفحه نمایش دهد.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'ip-s3',
          order: 3,
          title: 'آزمون سنسور آلارم انسداد مسیر تزریق (Occlusion Alarm)',
          description: 'هنگام کلمپ کردن مسیر خروجی، آلارم انسداد باید ظرف چند ثانیه فعال شود.',
          responseType: 'done_not_done',
          required: true,
        },
        {
          id: 'ip-s4',
          order: 4,
          title: 'آزمون هشدار نزدیک شدن به اتمام حجم سرنگ (Near End Alarm)',
          description: 'هشدار باید در ۱ الی ۲ میلی‌لیتر پایانی فعال گردد.',
          responseType: 'pass_fail',
          required: true,
        },
        {
          id: 'ip-s5',
          order: 5,
          title: 'وضعیت شارژ باتری برای جابجایی بیمار',
          description: 'توان باتری جهت انتقال بین بخش‌ها',
          responseType: 'single_choice',
          options: ['کامل (بیش از ۴ ساعت کارکرد)', 'متوسط (۲ تا ۴ ساعت)', 'کم (نیازمند اتصال به برق)'],
          required: true,
        },
      ],
    },
  },

  // Checklist 5: DRAFT Checklist (for demonstrating Draft status in LMS - should NOT show in Smart Record until published)
  {
    id: 'chk-draft-dialysis',
    name: 'چک‌لیست آزمون فیلترهای دیالیز قبل از رنسینگ [پیش‌نویس]',
    type: 'checklist',
    parentId: 'f-checklists',
    size: 'تعاملی',
    createdAt: '۱۴۰۴/۰۱/۱۵',
    updatedAt: '۱۴۰۴/۰۲/۱۵',
    author: 'مهندس اکبری',
    authorRole: 'کارشناس همودیالیز',
    department: 'بخش دیالیز',
    description: 'پیش‌نویس چک‌لیست آزمون نشتی هوا و فیلترگذاری دستگاه‌های دیالیز فرزنیوس (در حال تدوین)',
    tags: ['دیالیز', 'پیش‌نویس', 'آزمون'],
    duration: '۱۰ دقیقه',
    starred: false,
    status: 'draft',
    scopeLevel: 'type',
    targetTypeId: 'همودیالیز',
    targetTypeName: 'همودیالیز',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '0.1-draft',
    checklistData: {
      objective: 'بررسی ایمنی خطوط خون و مایع دیالیز قبل از آغاز فرایند تصفیه خون.',
      estimatedMinutes: 10,
      items: [
        {
          id: 'd-s1',
          order: 1,
          title: 'بررسی تست پرایمینگ و رنسینگ خطوط دیالیزاتور',
          responseType: 'done_not_done',
          required: true,
        },
        {
          id: 'd-s2',
          order: 2,
          title: 'فشار سنسور وریدی (Venous Pressure Sensor Test)',
          responseType: 'numeric',
          unit: 'mmHg',
          minVal: 50,
          maxVal: 200,
          required: true,
        },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STRUCTURED INTERACTIVE EDUCATIONAL COURSES / GUIDES (آموزش‌های ساختاریافته)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Guide 1: ASSET-SPECIFIC (EQ-1042 / Puritan Bennett 840)
  {
    id: 'guide-pb840-interactive',
    name: 'دوره جامع اپراتوری و تنظیم مدهای تنفسی ونتیلاتور PB840',
    type: 'structured_guide',
    parentId: 'f-vent-sub',
    size: 'دوره تعاملی',
    createdAt: '۱۴۰۳/۱۲/۰۵',
    updatedAt: '۱۴۰۴/۰۲/۱۴',
    author: 'دکتر کریمی و مهندس حسینی',
    authorRole: 'متخصص بیهوشی و مراقبت ویژه',
    department: 'آموزش بالینی و مهندسی پزشکی',
    description: 'آموزش ساختاریافته گام‌به‌گام شامل تنظیمات مدهای تهویه، تفسیر گراف‌ها و رفع آلارم‌های بحرانی PB840',
    tags: ['ونتیلاتور', 'PB840', 'آموزش', 'ICU', 'EQ-1042'],
    duration: '۱۵ دقیقه مطالعه',
    starred: true,
    status: 'published',
    scopeLevel: 'equipment',
    targetEquipmentId: 'eq-1',
    targetEquipmentCode: 'EQ-1042',
    targetEquipmentName: 'دستگاه ونتیلاتور مراقبت‌های ویژه (ICU Ventilator) - Puritan Bennett 840',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetSubcategoryName: 'مراقبت‌های ویژه و بیهوشی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '2.1',
    guideData: {
      objectives: [
        'تسلط بر راه‌اندازی و اجرای صحیح تست SST بدون نیاز به حضور مهندس پزشکی',
        'شناخت تفاوت مدهای تهویه کنترلی (A/C)، حمایتی (PSV) و تلفیقی (SIMV)',
        'یادگیری پروتکل مدیریت آلارم‌های حاد High Pressure و Low Minute Volume',
      ],
      prerequisites: [
        'آشنایی با مبانی فیزیولوژی تنفس و پارامترهای گاز خون شریانی (ABG)',
        'گذراندن دوره عمومی ایمنی بیمار در بخش مراقبت‌های ویژه',
      ],
      readingDuration: '۱۵ دقیقه',
      keyTopics: ['تست SST', 'مدهای تهویه', 'گراف‌های فشار-زمان', 'مدیریت آلارم‌ها', 'استریلیزاسیون مدار'],
      sections: [
        {
          id: 'sec-1',
          order: 1,
          title: '۱. آماده‌سازی فیزیکی، گازها و اتصالات مدار',
          content: `قبل از روشن کردن دستگاه Puritan Bennett 840، الزامات زیر باید به دقت رعایت شوند:
- دستگاه باید با کابل اورجینال به پریز برق اضطراری قرمز رنگ متصل گردد.
- شیلنگ‌های گاز اکسیژن (سبز/سفید) و هوای فشرده (مشکی/زرد) با فیتینگ استاندارد به کنسول متصل شوند.
- فیلتر ورودی الهام (Inspiratory Filter) و فیلتر بازدمی همراه با کالکتور رطوبت در جای خود قفل شوند.
- مدار دمی و بازدمی همراه با محفظه مرطوب‌کننده هیومیدیفایر (Fisher & Paykel MR850) مونتاژ گردد.`,
          keyTakeaways: ['اتصال به UPS الزامی است.', 'حداقل فشار خط گاز ورودی ۳.۵ بار می‌باشد.'],
          safetyWarning: 'استفاده از شیلنگ گاز فاقد بست ایمنی می‌تواند منجر به افت ناگهانی فشار گاز و خفگی بیمار شود.',
        },
        {
          id: 'sec-2',
          order: 2,
          title: '۲. انجام آزمون خودکار SST و کالیبراسیون',
          content: `آزمون SST (Short Self Test) وضعیت نشتی مدار، مقاومت و کمپلیانس لوله‌ها و کالیبراسیون فلوسنسور را می‌سنجد:
۱. در هنگام روشن کردن کلید پاور، دکمه TEST را روی پنل لمس کنید.
۲. گزینه SST را انتخاب کرده و مطابق پیام‌های نمایشگر، ابتدا قطعه Y-Piece را مسدود نمایید.
۳. در مرحله بعدی پیام Unblock نمایش داده می‌شود؛ پورت را آزاد کنید.
۴. در پایان در صورت نمایش پیغام SST PASSED، کلید ACCEPT را فشار دهید تا وارد صفحه تنظیم بیمار شوید.`,
          keyTakeaways: ['انجام SST قبل از اتصال به بیمار جدید اجباری است.', 'در صورت اخطار Alert، دستگاه اجازه کاربری نمی‌دهد.'],
        },
        {
          id: 'sec-3',
          order: 3,
          title: '۳. تنظیم مدهای کاری و پارامترهای تهویه',
          content: `مدهای پرکاربرد در این ونتیلاتور عبارتند از:
- مد A/C (Assist/Control): مناسب برای بیماران اینتوبه بدون تلاش تنفسی خودبه‌خودی.
- مد SIMV + PSV: مناسب برای فاز جداسازی (Weaning) و هماهنگی تنفس بیمار با دستگاه.
- مد BiLevel / APRV: برای بیماران با سندروم ARDS حاد و نیاز به باز نگه داشتن آلوئول‌های ریوی.

پارامترهای پایه‌ای:
- حجم جاری (Tidal Volume): ۶ الی ۸ میلی‌لیتر به ازای هر کیلوگرم وزن ایده‌آل بدن (IBW)
- نرخ تنفس (Respiratory Rate): ۱۲ تا ۱۶ بار در دقیقه
- فشار مثبت انتهای بازدم (PEEP): ۵ الی ۱۰ سانتی‌متر آب بر اساس شرایط ریوی`,
          keyTakeaways: ['محاسبه حجم جاری بر اساس وزن ایده‌آل بیمار صورت می‌گیرد نه وزن واقعی.'],
        },
        {
          id: 'sec-4',
          order: 4,
          title: '۴. جدول اقدامات فوری هنگام بروز آلارم‌های قرمز',
          content: `۱. آلارم High Circuit Pressure:
- علت: انسداد لوله تراشه، ترشحات، گاز گرفتن لوله، سرفه‌های شدید یا پنوموتوراکس.
- اقدام: ساکشن فوری لوله تراشه، بررسی سمع ریه و چک کردن زاویه گردن بیمار.

۲. آلارم Low Exhaled Tidal Volume:
- علت: نشتی در مدار، بدون باد شدن کاف لوله تراشه یا جدا شدن اتصالات هیومیدیفایر.
- اقدام: بررسی فشار کاف با فشارسنج (۲۰ تا ۳۰ سانتی‌متر آب) و محکم کردن اتصالات مدار.`,
          safetyWarning: 'در صورت عدم رفع سریع آلارم و افت اشباع اکسیژن، بلافاصله بیمار را از ونتیلاتور جدا کرده و با آمبوبگ متصل به اکسیژن ۱۰۰٪ تنفس دستی دهید.',
        },
      ],
    },
  },

  // Guide 2: TYPE-LEVEL (الکتروشوک / Defibrillator)
  {
    id: 'guide-defib-emergency-protocol',
    name: 'راهنمای ساختاریافته پروتکل احیای قلبی با الکتروشوک بای‌فازیک',
    type: 'structured_guide',
    parentId: 'f-defib-sub',
    size: 'راهنمای جامع',
    createdAt: '۱۴۰۳/۱۲/۰۴',
    updatedAt: '۱۴۰۴/۰۲/۱۰',
    author: 'کمیته CPR بیمارستان',
    authorRole: 'آموزش احیای قلبی-ریوی',
    department: 'اورژانس و ICU',
    description: 'پروتکل گام به گام شوک‌تراپی غیرسنکرون (Defibrillation) و کاردیوورژن سنکرون (Synchronized Cardioversion)',
    tags: ['الکتروشوک', 'احیا', 'CPR', 'دفیبریلاسیون', 'کد ۹۹'],
    duration: '۱۰ دقیقه مطالعه',
    starred: true,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'الکتروشوک',
    targetTypeName: 'الکتروشوک',
    targetSubcategoryName: 'مراقبت‌های ویژه و بیهوشی',
    targetCategoryName: 'تجهیزات پزشکی',
    version: '1.8',
    guideData: {
      objectives: [
        'تشخیص آریتمی‌های قابل شوک (VF و Pulseless VT) از آریتمی‌های غیرقابل شوک (Asystole و PEA)',
        'اجرای صحیح ایمنی در زمان تخلیه انرژی و فریاد زدن Clear',
        'نحوه استفاده از حالت سنکرونایز در تاکی‌کاردی‌های بطنی با نبض',
      ],
      readingDuration: '۱۰ دقیقه',
      keyTopics: ['ریتم‌های شوک‌پذیر', 'ایمنی شوک', 'کاردیوورژن سنکرون', 'پیس‌میکر پوستی'],
      sections: [
        {
          id: 'sec-d1',
          order: 1,
          title: '۱. شناسایی ریتم‌های قلبی نیازمند شوک فوری',
          content: `دستگاه الکتروشوک در دو حالت اصلی مورد استفاده قرار می‌گیرد:
۱. دفیبریلاسیون فوری (Unsynchronized):
- فیبریلاسیون بطنی (VF)
- تاکی‌کاردی بطنی بدون نبض (Pulseless VT)
میزان انرژی شروع در دستگاه‌های بای‌فازیک: ۱۲۰ تا ۲۰۰ ژول بر اساس توصیه سازنده.

۲. کاردیوورژن سنکرون (Synchronized Cardioversion):
- تاکی‌کاردی فوق بطنی (SVT) ناپایدار
- فلوتر و فیبریلاسیون دهلیزی (AF) سریع ناپایدار
- VT با نبض ناپایدار
در این حالت دکمه SYNC باید فعال شود تا شوک دقیقاً روی موج R تخلیه شود.`,
          keyTakeaways: ['در Asystole هرگز شوک اعمال نمی‌شود؛ فقط CPR و اپی‌نفرین.'],
        },
        {
          id: 'sec-d2',
          order: 2,
          title: '۲. مراحل پنجگانه اعمال شوک ایمن',
          content: `۱. روشن کردن دستگاه و تنظیم انرژی (مثلاً ۱۵۰ ژول)
۲. آغشته کردن کامل سطح پدال‌ها به ژل هادی مخصوص
۳. قرار دادن پدال Apex روی آپکس قلب و پدال Sternum زیر ترقوه راست
۴. فشردن دکمه Charge روی پدال تا شنیدن بوق ممتد
۵. فریاد بلند: «من کنارم، شما کنارید، همه کنار» (Clear) و سپس فشردن همزمان دو دکمه تخلیه شوک`,
          safetyWarning: 'هیچ فردی نباید با تخت، بدن بیمار یا پایه‌های متصل به بیمار تماس داشته باشد.',
        },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PDF MANUALS & STANDARD OPERATING PROCEDURES (اسناد و فایل‌ها)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'doc-pb840-manual',
    name: 'راهنمای جامع کاربری ونتیلاتور Puritan Bennett 840.pdf',
    type: 'pdf',
    parentId: 'f-vent-sub',
    size: '8.4 MB',
    sizeBytes: 8808038,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۵',
    updatedAt: '۱۴۰۴/۰۲/۱۴',
    author: 'شرکت مدترونیک / واحد تجهیزات',
    authorRole: 'مهندسی پزشکی',
    department: 'ICU و اورژانس',
    description: 'دستورالعمل گام به گام تست‌های اولیه (SST / EST)، تنظیم مدهای تهویه تنفسی (SIMV, A/C, PSV) و رفع آلارم‌های شایع',
    tags: ['ونتیلاتور', 'PB840', 'دفترچه', 'ICU', 'EQ-1042'],
    duration: '۳۶ صفحه',
    viewCount: 284,
    downloadCount: 92,
    starred: true,
    status: 'published',
    scopeLevel: 'equipment',
    targetEquipmentId: 'eq-1',
    targetEquipmentCode: 'EQ-1042',
    targetEquipmentName: 'دستگاه ونتیلاتور مراقبت‌های ویژه (ICU Ventilator) - Puritan Bennett 840',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# راهنمای جامع کاربری ونتیلاتور Puritan Bennett 840

## ۱. آماده‌سازی و راه‌اندازی دستگاه
- اتصال کابل برق به پریز برق اضطراری (UPS) بیمارستان
- اتصال شلنگ‌های اکسیژن و هوای فشرده (فشار ۴ الی ۵ بار)
- بررسی قرارگیری فیلترهای باکتریال ورودی و خروجی
- نصب صحیح ست تنفسی بیمار (Patient Circuit) و مرطوب‌کننده (Humidifier)

## ۲. انجام تست خودکار قبل از استفاده (SST - Short Self Test)
۱. کلید پاور پشت دستگاه را روشن نمایید.
۲. گزینه SST را از منوی پایین صفحه لمسی انتخاب کنید.
۳. لوله تنفسی را در مراحل مشخص شده مسدود و سپس باز کنید.
۴. در صورت دریافت پیام PASS، دستگاه آماده استفاده بر روی بیمار است.

## ۳. تنظیم مدهای تنفسی اصلی
- مد A/C (Assist/Control): مناسب برای بیماران بدون تنفس خودبخودی
- مد SIMV: مناسب برای فرآیند جداسازی بیمار (Weaning)
- مد BiLevel / APRV: برای بیماران با سندروم ARDS حاد

## ۴. جدول آلارم‌ها و اقدامات فوری
- آلارم High Pressure: انسداد لوله تراشه، ترشحات ریوی، گاز گرفتن لوله توسط بیمار
- آلارم Low Exhaled Tidal Volume: وجود نشتی در مدار، جدا شدن اتصالات، کاف بدون باد`,
  },
  {
    id: 'doc-drager-quick',
    name: 'کارت چک‌لیست سریع ونتیلاتور Drager Evita.pdf',
    type: 'pdf',
    parentId: 'f-vent-sub',
    size: '2.1 MB',
    sizeBytes: 2202009,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۱۰',
    updatedAt: '۱۴۰۴/۰۱/۲۰',
    author: 'مهندس اکبری',
    authorRole: 'کارشناس تجهیزات ICU',
    department: 'ICU 1',
    description: 'کارت جیبی ۲ صفحه‌ای جهت تنظیم پارامترهای تنفسی و بررسی سنسور جریان (Flow Sensor)',
    tags: ['Drager', 'چک‌لیست', 'سریع', 'ونتیلاتور'],
    duration: '۲ صفحه',
    viewCount: 195,
    downloadCount: 74,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# کارت چک‌لیست سریع ونتیلاتور Drager Evita

- بررسی کالیبراسیون سنسور O2 و Flow Sensor قبل از تحویل شیفت
- تنظیم حجم جاری (Tidal Volume) بر اساس ۶ الی ۸ میلی‌لیتر بر کیلوگرم وزن ایده‌آل بدن
- حداقل و حداکثر فشار مجاز راه هوایی (Pmax: 35 cmH2O)
- بررسی سلامت باتری پشتیبان داخلی (حداقل ۴۵ دقیقه کارکرد)`,
  },
  {
    id: 'vid-vent-troubleshoot',
    name: 'ویدیو آموزشی رفع خطاهای بحرانی ونتیلاتور.mp4',
    type: 'video',
    parentId: 'f-vent-sub',
    size: '42.6 MB',
    sizeBytes: 44669337,
    extension: '.mp4',
    createdAt: '۱۴۰۳/۱۲/۱۵',
    updatedAt: '۱۴۰۴/۰۲/۰۲',
    author: 'دکتر کریمی',
    authorRole: 'متخصص بیهوشی و مراقبت‌های ویژه',
    department: 'آموزش بالینی',
    description: 'آموزش ویدیویی ۲۰ دقیقه‌ای نحوه اقدام پرسنل پرستاری در هنگام بروز آلارم‌های مدار تنفسی و قطعی گازهای طبی',
    tags: ['ویدیو', 'آلارم', 'بحران', 'آموزش', 'ونتیلاتور'],
    duration: '۲۱:۴۵',
    viewCount: 412,
    downloadCount: 130,
    starred: true,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'ونتیلاتور',
    targetTypeName: 'ونتیلاتور',
    targetCategoryName: 'تجهیزات پزشکی',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    content: 'سرفصل‌های ویدیو:\n۱. مقدمه و معرفی ساختار مدار تنفسی\n۲. سناریوی افت ناگهانی فشار اکسیژن مرکزی\n۳. نحوه اتصال آمبوبگ دستی و حفظ اکسیژناسیون بیمار\n۴. عیب‌یابی نشتی کاف و اتصالات مرطوب‌کننده',
  },
  {
    id: 'doc-zoll-manual',
    name: 'دستورالعمل کاربری و تست روزانه الکتروشوک Zoll R Series.pdf',
    type: 'pdf',
    parentId: 'f-defib-sub',
    size: '5.2 MB',
    sizeBytes: 5452595,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۳',
    updatedAt: '۱۴۰۴/۰۲/۱۱',
    author: 'واحد مهندسی پزشکی',
    authorRole: 'کارشناس تجهیزات اورژانس',
    department: 'اورژانس و CCU',
    description: 'تست ۳۰ ژول روزانه، تعویض کاغذ پرینتر، تست پدال‌های بزرگسال/کودک و پیس‌میکر خارجی (Pacing)',
    tags: ['الکتروشوک', 'Zoll', 'تست روزانه', 'احیا', 'EQ-1043'],
    duration: '۱۸ صفحه',
    viewCount: 320,
    downloadCount: 110,
    starred: true,
    status: 'published',
    scopeLevel: 'equipment',
    targetEquipmentId: 'eq-2',
    targetEquipmentCode: 'EQ-1043',
    targetEquipmentName: 'دستگاه الکتروشوک بای‌فازیک (Biphasic Defibrillator) - Zoll R Series',
    targetTypeId: 'الکتروشوک',
    targetTypeName: 'الکتروشوک',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# پروتکل آزمون روزانه و بهره‌برداری دستگاه الکتروشوک Zoll R Series

## ۱. آزمون خودکار روزانه ۳۰ ژول (Defib Self-Test)
- اطمینان حاصل کنید پدال‌ها درون محفظه نگهدارنده قرار دارند.
- کلید انتخاب انرژی را روی حالت Defib چرخانده و انرژی را روی ۳۰ ژول تنظیم کنید.
- دکمه Charge روی پدال را فشار دهید تا بوق ممتد آمادگی شنیده شود.
- دکمه‌های تخلیه شوک (Shock) را روی هر دو پدال همزمان بفشارید.
- تاییدیه «TEST OK» به همراه برگه تست خودکار چاپ می‌شود.

## ۲. استفاده در حالت سنکرونایز (Synchronized Cardioversion)
- برای آریتمی‌های VT با نبض و AF سریع
- دکمه SYNC را فعال کنید و از نمایش علامت سفید روی موج R اطمینان حاصل فرمایید.`,
  },
  {
    id: 'doc-saadat-mon',
    name: 'راهنمای مانیتور علائم حیاتی سعادت سری البرز و آریا.pdf',
    type: 'pdf',
    parentId: 'f-defib-sub',
    size: '3.8 MB',
    sizeBytes: 3984588,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۴',
    updatedAt: '۱۴۰۴/۰۱/۱۵',
    author: 'شرکت پویندگان راه سعادت',
    authorRole: 'پشتیبانی فنی',
    department: 'کلیه بخش‌ها',
    description: 'کالیبراسیون کاف فشار خون NIBP، اتصال لیدهای ECG، سنسور پالس اکسیمتری Masimo و تنظیم حدود آلارم‌ها',
    tags: ['مانیتورینگ', 'سعادت', 'NIBP', 'SPO2'],
    duration: '۲۲ صفحه',
    viewCount: 240,
    downloadCount: 88,
    status: 'published',
    scopeLevel: 'type',
    targetTypeId: 'مانیتورینگ علائم حیاتی',
    targetTypeName: 'مانیتورینگ علائم حیاتی',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# راهنمای کاربری مانیتورهای علائم حیاتی سعادت

- نحوه اتصال کابل ۵ لید و ۳ لید نوار قلب
- شرایط صحیح بستن کاف NIBP روی بازوی بیمار و متناسب بودن سایز کاف
- محافظت از پروب SPO2 در برابر ضربه و تمیزکاری با الکل ۷۰ درصد`,
  },

  // Folder 3: Inside "۳. ایمنی، کالیبراسیون و اعتباربخشی بیمارستانی" (f-safety)
  {
    id: 'doc-calib-guide',
    name: 'شیوه‌نامه جامع کالیبراسیون و آزمون‌های دوره‌ای تجهیزات پزشکی.pdf',
    type: 'pdf',
    parentId: 'f-safety',
    size: '6.1 MB',
    sizeBytes: 6396313,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۱/۲۰',
    updatedAt: '۱۴۰۴/۰۲/۱۸',
    author: 'کمیته کالیبراسیون بیمارستان',
    authorRole: 'مدیریت تجهیزات',
    department: 'مهندسی پزشکی',
    description: 'تقویم زمانبندی آزمون‌های کالیبراسیون، تلرانس خطای مجاز دستگاه‌ها و نحوه صدور برچسب سبز/قرمز کالیبراسیون',
    tags: ['کالیبراسیون', 'استاندارد', 'آزمون', 'اعتباربخشی'],
    duration: '۲۶ صفحه',
    viewCount: 310,
    downloadCount: 145,
    starred: true,
    status: 'published',
    scopeLevel: 'category',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# آیین‌نامه اجرایی کالیبراسیون تجهیزات پزشکی

- کلیه تجهیزات رده بحرانی (ونتیلاتور، شوک، ماشین بیهوشی، انکوباتور) نیازمند کالیبراسیون حداقل سالانه هستند.
- ثبت شماره گواهینامه معتبر اداره کل تجهیزات پزشکی و شرکت مجاز آزمونگر الزامی است.
- در صورت شکست آزمون (FAIL)، فوراً برچسب قرمز «غیرمجاز جهت استفاده» نصب گردد.`,
  },
  {
    id: 'doc-code99-sop',
    name: 'دستورالعمل اجرایی و شرح وظایف تیم کد ۹۹ (احیای قلبی ریوی).pdf',
    type: 'pdf',
    parentId: 'f-safety',
    size: '1.8 MB',
    sizeBytes: 1887436,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۱/۲۵',
    updatedAt: '۱۴۰۴/۰۱/۳۰',
    author: 'دکتر صابری',
    authorRole: 'رئیس کمیته CPR',
    department: 'کمیته احیا',
    description: 'زمانبندی حضور اعضای تیم کد ۹۹ (حداکثر ۳ دقیقه)، شارژ ترالی احیا، مدیریت داروها و ثبت فرم احیا در سامانه آوید',
    tags: ['کد ۹۹', 'احیا', 'CPR', 'اورژانس'],
    duration: '۸ صفحه',
    viewCount: 450,
    downloadCount: 180,
    starred: true,
    status: 'published',
    scopeLevel: 'category',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# پروتکل فعال‌سازی کد ۹۹ در بیمارستان

۱. اعلام فوری کد ۹۹ به شماره داخلی اضطراری مرکز تلفن با ذکر دقیق بخش و شماره اتاق
۲. شروع ماساژ قلبی با کیفیت بالا (۱۰۰ الی ۱۲۰ بار در دقیقه) تا رسیدن تیم
۳. آماده‌سازی دستگاه الکتروشوک و ترالی احیا توسط پرستار مسئول اتاق`,
  },
  {
    id: 'doc-elec-safety',
    name: 'استاندارد ایمنی الکتریکی تجهیزات پزشکی (IEC 60601-1).pdf',
    type: 'pdf',
    parentId: 'f-safety',
    size: '4.9 MB',
    sizeBytes: 5138022,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۱',
    updatedAt: '۱۴۰۴/۰۲/۰۵',
    author: 'مهندس حسینی',
    authorRole: 'مهندسی پزشکی',
    department: 'مهندسی پزشکی',
    description: 'روش اندازه‌گیری جریان‌های نشتی بیمار، نشتی بدنه و تست ارت (Earth Continuity Test)',
    tags: ['ایمنی الکتریکی', 'IEC 60601', 'نشتی', 'ارت'],
    duration: '۱۵ صفحه',
    viewCount: 180,
    downloadCount: 65,
    status: 'published',
    scopeLevel: 'category',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# آزمون ایمنی الکتریکی تجهیزات پزشکی

- مقاومت ارت حفاظتی (Ground Resistance) باید کمتر از ۰.۲ اهم باشد.
- حداکثر جریان نشتی بدنه دستگاه نباید از ۱۰۰ میکروآمپر در شرایط نرمال فراتر رود.`,
  },

  // Folder 4: Inside "۴. کنترل عفونت، استریلیزاسیون و CSSD" (f-infection)
  {
    id: 'doc-autoclave-sop',
    name: 'دستورالعمل استریلیزاسیون با اتوکلاو بخار و پلاسما در اتاق عمل.pdf',
    type: 'pdf',
    parentId: 'f-infection',
    size: '3.2 MB',
    sizeBytes: 3355443,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۱/۱۸',
    updatedAt: '۱۴۰۴/۰۲/۰۱',
    author: 'سوپروایزر کنترل عفونت',
    authorRole: 'کنترل عفونت',
    department: 'اتاق عمل و CSSD',
    description: 'نحوه بارگذاری چمبر اتوکلاو، تست‌های بیولوژیک و شیمیایی (Bowie-Dick) و پارامترهای دما/فشار سیکل‌های ۱۳۴ و ۱۲۱ درجه',
    tags: ['اتوکلاو', 'CSSD', 'استریل', 'کنترل عفونت'],
    duration: '۱۲ صفحه',
    viewCount: 220,
    downloadCount: 78,
    status: 'published',
    scopeLevel: 'subcategory',
    targetSubcategoryName: 'استریلیزاسیون و کنترل عفونت',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# پروتکل آزمون‌های کنترل کیفی اتوکلاو بخار

۱. تست بووی دیک (Bowie-Dick Test) هر روز صبح قبل از اولین سیکل کاری
۲. استفاده از اندیکاتورهای شیمیایی کلاس ۶ داخل هر بسته ابزار
۳. ثبت تست بیولوژیک با باسیلوس استئاروترموفیلوس حداقل به صورت هفتگی`,
  },
  {
    id: 'doc-hand-hygiene',
    name: 'پوستر و پروتکل ۵ لحظه طلایی بهداشت دست سازمان بهداشت جهانی (WHO).pdf',
    type: 'pdf',
    parentId: 'f-infection',
    size: '1.2 MB',
    sizeBytes: 1258291,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۱/۲۰',
    updatedAt: '۱۴۰۴/۰۱/۱۵',
    author: 'کمیته کنترل عفونت',
    authorRole: 'کنترل عفونت',
    department: 'کلیه بخش‌ها',
    description: 'تکنیک صحیح شستشوی دست با آب و صابون (۴۰-۶۰ ثانیه) و هندراب با محلول الکلی (۲۰-۳۰ ثانیه)',
    tags: ['بهداشت دست', 'WHO', 'کنترل عفونت', 'پوستر'],
    duration: '۴ صفحه',
    viewCount: 510,
    downloadCount: 210,
    starred: true,
    status: 'published',
    scopeLevel: 'category',
    targetCategoryName: 'تجهیزات پزشکی',
    content: `# پنج موقعیت کلیدی بهداشت دست در بالین بیمار

۱. قبل از لمس بیمار
۲. قبل از انجام پروسیجر پاک یا آسپتیک
۳. بعد از مواجهه با ترشحات و مایعات بدن
۴. بعد از لمس بیمار
۵. بعد از لمس محیط اطراف بیمار`,
  },

  // Folder 5: Inside "۵. دستورالعمل‌های انبارداری و ثبت اموال" (f-inventory)
  {
    id: 'doc-asset-tagging',
    name: 'شیوه‌نامه شماره‌گذاری، تگ بارکد و پلاک‌کوبی اموال بیمارستانی.pdf',
    type: 'pdf',
    parentId: 'f-inventory',
    size: '3.4 MB',
    sizeBytes: 3565158,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۱',
    updatedAt: '۱۴۰۴/۰۲/۱۰',
    author: 'مدیریت اموال و انبار',
    authorRole: 'مدیر اموال',
    department: 'انبار و اموال',
    description: 'روش استاندارد الصاق پلاک فلزی و لیبل بارکد ۲ بعدی، نحوه خواندن کد دارایی در نرم‌افزار آوید و تطبیق فیزیکی سالانه',
    tags: ['بارکد', 'پلاک اموال', 'انبار', 'انبارداری'],
    duration: '۱۴ صفحه',
    viewCount: 260,
    downloadCount: 95,
    status: 'published',
    scopeLevel: 'unassigned',
    content: `# راهنمای شماره‌گذاری و کنترل فیزیکی اموال بیمارستان

- ساختار کدینگ ۱۲ رقمی دارایی‌های سرمایه‌ای (کد دپارتمان + کد گروه + کد ردیف)
- نحوه نصب پلاک در قسمت بالایی و غیر متحرک دستگاه جهت دسترسی آسان اسکنر
- فرآیند ثبت صورتجلسه جابجایی دستگاه بین بخش‌ها در سامانه آوید`,
  },
  {
    id: 'doc-draft-inventory-sop',
    name: 'راهنمای ثبت پیش‌نویس کالاهای ورودی و تکمیل فیلدهای اجباری.pdf',
    type: 'pdf',
    parentId: 'f-inventory',
    size: '2.8 MB',
    sizeBytes: 2936012,
    extension: '.pdf',
    createdAt: '۱۴۰۳/۱۲/۰۴',
    updatedAt: '۱۴۰۴/۰۲/۰۳',
    author: 'انباردار مرکزی',
    authorRole: 'انبارداری',
    department: 'انبار مرکزی',
    description: 'آموزش ثبت اولیه کالاها توسط انباردار و تایید فنی توسط مهندس تجهیزات و مدیر مالی',
    tags: ['پیش‌نویس', 'ورود کالا', 'تاییدیه', 'فیلدها'],
    duration: '۱۰ صفحه',
    viewCount: 180,
    downloadCount: 50,
    status: 'published',
    scopeLevel: 'unassigned',
    content: `# چرخه حیات پیش‌نویس اموال در سیستم آوید

۱. ثبت اولیه توسط انباردار با مشخصات فاکتور و شماره سریال
۲. ارسال اعلان هشدار به مهندس پزشکی جهت تعیین پریود کالیبراسیون و سرویس
۳. تایید نهایی توسط مدیر اموال و خروج از وضعیت پیش‌نویس`,
  },
];
