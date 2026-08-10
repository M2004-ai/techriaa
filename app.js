/* =========================================================
   Techria — Marketing Agency
   Shared front-end logic: product data, rendering, order form,
   Google Sheet + Drive submission, WhatsApp handoff.
   ========================================================= */

const TECHRIA = {
  // WhatsApp number that receives every order (international format,
  // digits only, no "+" and no leading 0 after the country code).
  WHATSAPP_NUMBER: "201013876901",

  // Google Drive folder where uploaded files should land.
  DRIVE_FOLDER_ID: "18nGOwkuP0z3pnCW_SPReBbrPMEKUhMSk",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/18nGOwkuP0z3pnCW_SPReBbrPMEKUhMSk",

  // Apps Script "exec" URL — receives every order + files and logs
  // them to Google Sheets while copying files into the Drive folder
  // above. Leave empty to keep the site fully working (it will just
  // skip the Sheet/Drive step and go straight to WhatsApp).
  // See GOOGLE_APPS_SCRIPT_SETUP.md for the one-time setup.
  SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbzMWf5pgkROvbGobDE84dlG_W6XWsOo_9I9PSqZZEkOBTLK9y1k23kI5Fs37c5uL-7X/exec",

  // Optional: the normal shareable Sheet link, only used if you want
  // to link to it from somewhere later.
  SHEET_VIEW_URL: "https://docs.google.com/spreadsheets/d/1_doy-Fv0Chpex9dsAbZrN0zDYNB_ADKjLVHtjd0HrcI/edit?gid=0#gid=0",

  LINKTREE_URL: "https://linktr.ee/techriamarkting?utm_source=linktree_profile_share&ltsid=24f9728b-fcb3-4bae-a718-fefdc5746e92",

  // Fill these in whenever the accounts are ready — chips only render
  // when a value is present. (Synced from linktr.ee/techriamarkting)
  SOCIALS: {
    instagram: "https://www.instagram.com/techria_agency",
    tiktok: "https://www.tiktok.com/@techria.marketing.gency",
    facebook: "https://www.facebook.com/share/1C7aw8GcEF/",
    linkedin: "https://www.linkedin.com/company/techria-marketing-agency",
  },

  MAX_FILE_MB: 8,
  MAX_FILES: 6,
};

/* ================= Icon set (feather-style line icons) ================= */
const ICONS = {
  link: '<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  pulse: '<circle cx="12" cy="12" r="9"/><path d="M8 12h2l1.5 4 3-8 1.5 4h2"/>',
  paw: '<circle cx="7" cy="9" r="1.5"/><circle cx="12" cy="6.3" r="1.5"/><circle cx="17" cy="9" r="1.5"/><path d="M12 12c-3 0-5.2 2-5.2 4.5S9 21 12 21s5.2-1.8 5.2-4.5S15 12 12 12Z"/>',
  heart: '<path d="M12 20s-7-4.4-9.3-8.6C1.2 8.4 3 5 6.3 5c2 0 3.3 1.1 4 2.3.7-1.2 2-2.3 4-2.3 3.3 0 5.1 3.4 3.6 6.4C19 15.6 12 20 12 20Z"/>',
  rings: '<circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/>',
  pin: '<path d="M12 2 9 9l-6 1 4.5 4-1 6L12 17l5.5 3-1-6L21 10l-6-1Z"/>',
  flame: '<path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-1-3s2 2 2 5a5 5 0 0 1-10 0c0-4 3-5 3-9Z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11M8 9c-2 0-3.3-2-1.7-3.5S12 4.6 12 9c0-4.4 3.7-5 5.3-3.5S14 9 12 9"/>',
  hands: '<path d="M4 12v6a2 2 0 0 0 2 2h3M20 12v6a2 2 0 0 1-2 2h-3M4 12 8 6l4 4 4-4 4 6M12 10v10"/>',
  book: '<path d="M4 5.5C6 4.5 9 4 12 5v14c-3-1-6-.5-8 .5V5.5ZM20 5.5c-2-1-5-1.5-8-.5v14c3-1 6-.5 8 .5V5.5Z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h5M16 10h5M3 15h5M16 15h5"/>',
  cake: '<path d="M4 21v-7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7H4ZM4 21h16M9 11V7M12 11V7M15 11V7"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  capsule: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3 7 9 6 9-6"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="m9 11-3-8M15 11l3-8M8 3h8"/>',
  bookmark: '<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z"/>',
  document: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  monument: '<path d="M8 21V9a4 4 0 0 1 8 0v12M4 21h16M10 5l2-3 2 3"/>',
  puzzle: '<path d="M9 3h4a1.5 1.5 0 0 1 1.5 1.5c0 1-.9 1.2-.9 2.2a1.4 1.4 0 0 0 1.4 1.3c1 0 1.2-.9 2.2-.9A1.5 1.5 0 0 1 19 8.6v3.9a1.5 1.5 0 0 1-1.5 1.5c-1 0-1.2-.9-2.2-.9a1.4 1.4 0 0 0-1.4 1.3c0 1 .9 1.2.9 2.2A1.5 1.5 0 0 1 13 18H9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chat: '<path d="M4 5h16v11H8l-4 4V5Z"/>',
  brush: '<path d="M4 20c0-4 2-6 5-6M14 4c3 0 5 2 5 5 0 3-4 3-7 6-2 2-3 4-3 4s0-1.5.5-3c.6-2 1.5-3 3-4.5 2.5-2.5 1.5-7.5 1.5-7.5Z"/>',
  pen: '<path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z"/><path d="m13 6 3 3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M4 20h16"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
  printer: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c0-1.7 1.3-3 3-3s3 1.3 3 3M14 9h5M14 13h5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  research: '<circle cx="10" cy="10" r="6"/><path d="m20 20-5.5-5.5M8 10h4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  folder: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/>',
  briefcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  code: '<path d="m9 18-6-6 6-6M15 6l6 6-6 6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
};

/* ================= Categories ================= */
const CATEGORIES = [
  { id: "occasions", ar: "المناسبات والذكريات", en: "OCCASIONS" },
  { id: "legacy", ar: "الصدقة الجارية", en: "LEGACY" },
  { id: "kids", ar: "عالم الأطفال", en: "KIDS" },
  { id: "marketing", ar: "التسويق والسوشيال ميديا", en: "MARKETING" },
  { id: "office", ar: "الأعمال المكتبية والتقنية", en: "OFFICE & TECH" },
];

// Categories with many items read better as an organized, scannable
// list (icon + title + line) instead of a long wall of identical cards.
const DENSE_CATEGORIES = ["marketing", "office"];

/* ================= Featured products (from the content plan) ================= */
const FEATURED = [
  { id: "onelink", name: "صفحة اللينك الواحد", en: "LINK-IN-BIO PAGE", desc: "كل لينكاتك ومنيوهاتك في صفحة واحدة أنيقة، جاهزة في أقل من يوم.", icon: "link" },
  { id: "elder-bracelet", name: "أسورة معلومات كبار السن", en: "MEDICAL ID BRACELET", desc: "معلومات طبية وطوارئ أساسية على معصم من تحب، لراحة بال دايمة.", icon: "pulse" },
  { id: "pet-tag", name: "سلسلة معلومات الحيوان الأليف", en: "PET ID TAG", desc: "عنوان ورقم تليفون على طوق أليفك، عشان يرجعلك بسرعة لو اتاه.", icon: "paw" },
  { id: "photo-necklace", name: "سلسلة الصورة والذكرى", en: "PHOTO QR NECKLACE", desc: "سلسلة بصورتكم وكود QR يفتح موقع فيه كل صوركم وفيديوهاتكم سوا.", icon: "heart" },
  { id: "wedding-site", name: "موقع دعوة الفرح التفاعلي", en: "WEDDING MICRO-SITE", desc: "دعوة على شكل موقع كامل، وQR على الكارت يوصل ضيوفكم لحكايتكم.", icon: "rings" },
  { id: "groom-pin", name: "دبوس العريس ومروحة العروسة", en: "WEARABLE VOICE QR", desc: "رسالة صوتية أو مكتوبة بينكم، بتتفتح بكود QR في لحظة الفرح.", icon: "pin" },
  { id: "qr-candle", name: "شمعة الذكرى", en: "MEMORY CANDLE QR", desc: "شمعة عادية في الشكل، جواها كود يوصلك لأغنية أو رسالة صوتية.", icon: "flame" },
  { id: "qr-sweets", name: "تغليف حلويات المناسبات", en: "EVENT SWEETS QR", desc: "علبة حلوى بكود QR يوصل لصورة أو رسالة شكر من المناسبة.", icon: "gift" },
  { id: "memorial-prayer", name: "أوراق أدعية لمتوفى", en: "MEMORIAL PRAYER QR", desc: "ورقة أدعية بكود QR يوصل لصور وكلمات تذكارية عن الفقيد.", icon: "hands" },
  { id: "book-summary", name: "موقع تلخيص القصص والكتب", en: "STORY SUMMARY SITE", desc: "موقع بسيط يلخصلك أهم أحداث وشخصيات كتابك أو قصتك المفضلة.", icon: "book" },
];

/* ================= Full catalog (by category) ================= */
const PRODUCTS = [
  // ---- Occasions ----
  { id: "memory-video", cat: "occasions", name: "QR الذكريات والفيديو", en: "MEMORY VIDEO QR", desc: "باركود يوصل مباشرة لفيديو الخطوبة أو الفرح، مع صفحة ذكريات وصور.", icon: "film" },
  { id: "guest-messages", cat: "occasions", name: "رسائل من المعازيم", en: "GUEST MESSAGES", desc: "باركود يفتح للضيوف صفحة يكتبوا فيها تهنئة تفضل محفوظة للعروسين.", icon: "chat" },
  { id: "voice-notes", cat: "occasions", name: "تسجيل صوتي من الحضور", en: "VOICE NOTES", desc: "مساحة يسجل فيها المعازيم رسالة صوتية أقرب للحظة الحقيقية.", icon: "mic" },
  { id: "custom-reel", cat: "occasions", name: "ريلز بأغنية خاصة", en: "CUSTOM REEL", desc: "فيديو ريلز قصير مصمم بأغنية مرتبطة بالعروسين، جاهز للمشاركة.", icon: "film" },
  { id: "birthday-signatures", cat: "occasions", name: "تواقيع تورتة عيد الميلاد", en: "BIRTHDAY SIGNATURES", desc: "باركود على التورتة يوديك لصفحة فيها تهاني كل المعازيم.", icon: "cake" },
  { id: "countdown-site", cat: "occasions", name: "عداد تنازلي لمناسبة قادمة", en: "COUNTDOWN SITE", desc: "موقع بيعد تنازليًا لتاريخ محدد، وبيظهر فيه هدية أو مفاجأة باليوم.", icon: "timer" },
  { id: "time-capsule", cat: "occasions", name: "رسائل للمستقبل", en: "TIME CAPSULE", desc: "كبسولة زمن رقمية: اكتب رسالة اليوم توصل لصاحبها في تاريخ تحدده.", icon: "capsule" },
  { id: "keepsake-medal", cat: "occasions", name: "ميداليات تذكارية", en: "KEEPSAKE MEDAL", desc: "ميدالية بباركود تحمل ذكرى أو مناسبة، هدية دايمة بمحتوى رقمي.", icon: "medal" },
  { id: "bookmark-qr", cat: "occasions", name: "فواصل كتب بباركود", en: "BOOKMARK QR", desc: "فاصل كتاب أنيق مطبوع عليه باركود يوصل لقصة أو إهداء خاص.", icon: "bookmark" },
  { id: "story-page", cat: "occasions", name: "صفحات القصص الخاصة", en: "STORY PAGE", desc: "توثيق قصة شخص أو حدث في صفحة مصممة، توصلها لمن تحب بباركود.", icon: "document" },

  // ---- Legacy ----
  { id: "life-story", cat: "legacy", name: "قصة حياة موثقة", en: "LIFE STORY", desc: "توثيق سيرة أو محطات مهمة من حياة شخص عزيز في صفحة واحدة.", icon: "document" },
  { id: "onsite-qr", cat: "legacy", name: "باركود على شاهد أو نصب تذكاري", en: "ON-SITE QR", desc: "باركود يوضع في مكان تذكاري ويوصل لصفحة الذكرى مباشرة.", icon: "monument" },

  // ---- Kids ----
  { id: "collectible-game", cat: "kids", name: "ألعاب التجميع التفاعلية", en: "COLLECTIBLE GAME QR", desc: "سلسلة باركودات يجمعها الطفل ليكمل تحدي أو لعبة صغيرة آمنة.", icon: "puzzle" },
  { id: "kids-book", cat: "kids", name: "تأليف وتصميم كتب الأطفال", en: "CHILDREN'S BOOK DESIGN", desc: "قصص مصورة مصممة خصيصًا للطفل، من الفكرة للإخراج النهائي.", icon: "book" },

  // ---- Marketing ----
  { id: "social-plan", cat: "marketing", name: "خطة سوشيال ميديا شاملة", en: "SOCIAL MEDIA PLAN", desc: "تقويم محتوى مدروس يغطي كل منصاتك على مدار الشهر.", icon: "calendar" },
  { id: "moderation", cat: "marketing", name: "إدارة الحسابات (Moderation)", en: "ACCOUNT MODERATION", desc: "متابعة التعليقات والرسائل والتفاعل اليومي مع المتابعين.", icon: "chat" },
  { id: "graphic-design", cat: "marketing", name: "تصميم جرافيك للسوشيال ميديا", en: "SOCIAL GRAPHIC DESIGN", desc: "منشورات، ستوريز، وإعلانات بهوية بصرية موحدة.", icon: "brush" },
  { id: "ad-copywriting", cat: "marketing", name: "كتابة المحتوى الإعلاني", en: "AD COPYWRITING", desc: "نصوص جذابة تناسب لغة كل منصة وجمهورها.", icon: "pen" },
  { id: "reels-editing", cat: "marketing", name: "مونتاج الريلز والفيديوهات القصيرة", en: "REELS EDITING", desc: "محتوى فيديو مصمم للانتشار على إنستجرام وتيك توك.", icon: "film" },
  { id: "brand-identity", cat: "marketing", name: "تصميم الهوية البصرية", en: "BRAND IDENTITY", desc: "شعار، بطاقة عمل، وأساسيات الهوية البصرية للعلامة.", icon: "brush" },
  { id: "analytics-reports", cat: "marketing", name: "تقارير تحليل الأداء", en: "ANALYTICS REPORTS", desc: "قراءة الأرقام والتفاعل وتحويلها لتوصيات عملية.", icon: "chart" },
  { id: "figma-design", cat: "marketing", name: "تصميم واجهات بفيجما", en: "FIGMA UI DESIGN", desc: "تصميم شاشات ومنتجات رقمية بدقة وجاهزة للتطوير مباشرة.", icon: "layout" },
  { id: "print-design", cat: "marketing", name: "تصميم المطبوعات", en: "PRINT DESIGN", desc: "بروشورات، بانرات، كتالوجات، وكل ما يحتاج طباعة احترافية.", icon: "printer" },

  // ---- Office & Tech ----
  { id: "cv", cat: "office", name: "سيرة ذاتية (CV) احترافية", en: "PROFESSIONAL CV", desc: "تصميم متوافق مع أنظمة الفرز الآلي (ATS) وجاهز للتقديم فورًا.", icon: "idcard" },
  { id: "cover-letter", cat: "office", name: "خطاب تقديم (Cover Letter)", en: "COVER LETTER", desc: "خطاب مخصص لكل وظيفة يبرز نقاط قوتك.", icon: "mail" },
  { id: "word-files", cat: "office", name: "ملفات Word", en: "WORD DOCUMENTS", desc: "تقارير، عقود، خطابات رسمية، وقوالب جاهزة الاستخدام.", icon: "document" },
  { id: "excel-files", cat: "office", name: "ملفات Excel", en: "EXCEL SPREADSHEETS", desc: "جداول بيانات، معادلات، تقارير مالية، ولوحات تحكم Dashboard.", icon: "grid" },
  { id: "ppt", cat: "office", name: "عروض PowerPoint", en: "POWERPOINT DECKS", desc: "عروض تقديمية احترافية للاجتماعات والمشاريع والدراسة.", icon: "layout" },
  { id: "outlook", cat: "office", name: "تنظيم البريد عبر Outlook", en: "OUTLOOK INBOX", desc: "ترتيب الرسائل والمواعيد وإدارة صندوق الوارد.", icon: "mail" },
  { id: "access-db", cat: "office", name: "قواعد بيانات Access", en: "ACCESS DATABASE", desc: "بناء قواعد بيانات بسيطة لتنظيم معلوماتك وربطها ببعض.", icon: "database" },
  { id: "google-suite", cat: "office", name: "Google Sheets وDocs وSlides", en: "GOOGLE WORKSPACE", desc: "العمل الكامل على أدوات جوجل التعاونية بديلاً أو مكملاً لمايكروسوفت.", icon: "globe" },
  { id: "research-docs", cat: "office", name: "الأبحاث العلمية والتوثيق الأكاديمي", en: "ACADEMIC RESEARCH", desc: "إعداد وتنسيق الأبحاث مع توثيق المراجع بالشكل الأكاديمي الصحيح.", icon: "research" },
  { id: "web-design", cat: "office", name: "تصميم وبرمجة المواقع الإلكترونية", en: "WEB DESIGN & DEV", desc: "مواقع تعريفية أو تفاعلية بحسب احتياج المشروع.", icon: "code" },
  { id: "data-entry", cat: "office", name: "إدخال البيانات وتنظيم الملفات", en: "DATA ENTRY", desc: "ترتيب وتنسيق الملفات والبيانات بدقة وسرعة.", icon: "folder" },
  { id: "business-plans", cat: "office", name: "خطط العمل والعروض الاستثمارية", en: "BUSINESS PLANS", desc: "إعداد Business Plans وProposals بصياغة احترافية.", icon: "briefcase" },
  { id: "coding-workshop", cat: "office", name: "ورش تدريب البرمجة", en: "CODING WORKSHOPS", desc: "ورش عملية لتعلم أساسيات البرمجة وبناء أول مشروع خطوة بخطوة.", icon: "code" },
  { id: "design-workshop", cat: "office", name: "ورش تدريب الجرافيك ديزاين", en: "DESIGN WORKSHOPS", desc: "ورش تطبيقية في مبادئ التصميم وأدواته من الصفر حتى الاحتراف.", icon: "brush" },
];

const ALL_ITEMS = [...FEATURED.map(p => ({ ...p, cat: "featured" })), ...PRODUCTS];

/* ================= Helpers ================= */
function iconSvg(key) {
  return `<svg viewBox="0 0 24 24">${ICONS[key] || ICONS.document}</svg>`;
}

function productCard(p, { featured = false } = {}) {
  return `
    <div class="card reveal" data-product-id="${p.id}">
      <span class="scan-line"></span>
      ${featured ? '<span class="card-badge">جديد</span>' : ""}
      <div class="card-icon">${iconSvg(p.icon)}</div>
      <div class="card-title">${p.name}</div>
      <div class="card-en">${p.en}</div>
      <div class="card-desc">${p.desc}</div>
      <a class="card-order-btn" href="order.html?product=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}">
        اطلب الآن
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19-7-7 7-7M5 12h14"/></svg>
      </a>
    </div>`;
}

function serviceListItem(p) {
  return `
    <a class="service-item reveal" href="order.html?product=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}">
      <span class="service-icon">${iconSvg(p.icon)}</span>
      <span class="service-text">
        <span class="service-title">${p.name}</span>
        <span class="service-desc">${p.desc}</span>
      </span>
      <span class="service-arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19-7-7 7-7M5 12h14"/></svg>
      </span>
    </a>`;
}

function renderFeatured() {
  const el = document.getElementById("featuredGrid");
  if (!el) return;
  el.innerHTML = FEATURED.map(p => productCard(p, { featured: true })).join("");
}

function renderCategory(catId) {
  const el = document.getElementById("catalogGrid");
  if (!el) return;
  const items = PRODUCTS.filter(p => p.cat === catId);
  if (DENSE_CATEGORIES.includes(catId)) {
    el.className = "service-list";
    el.innerHTML = items.map(p => serviceListItem(p)).join("");
  } else {
    el.className = "grid grid-3";
    el.innerHTML = items.map(p => productCard(p)).join("");
  }
  initReveal();
}

function initCategoryTabs() {
  const bar = document.getElementById("catBar");
  if (!bar) return;
  bar.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="cat-pill${i === 0 ? " active" : ""}" data-cat="${c.id}">${c.ar}</button>`
  ).join("");
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-pill");
    if (!btn) return;
    bar.querySelectorAll(".cat-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderCategory(btn.dataset.cat);
  });
  renderCategory(CATEGORIES[0].id);
}

/* ================= Scroll reveal ================= */
function initReveal() {
  const els = document.querySelectorAll(".reveal:not(.in-view)");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ================= Stat pendant count-up ================= */
function initStatCounters() {
  const counters = document.querySelectorAll(".count[data-count]");
  if (!counters.length) return;

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = target;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCount);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => io.observe(el));
}

/* ================= Gift photo tilt (subtle parallax on pointer move) ================= */
function initGiftTilt() {
  const stage = document.getElementById("giftStage");
  const tilt = document.getElementById("giftTilt");
  if (!stage || !tilt) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (matchMedia("(hover: none)").matches) return; // skip on touch devices

  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  stage.addEventListener("mouseleave", () => {
    tilt.style.transform = "";
  });
}

/* ================= Mobile nav ================= */
function initMobileNav() {
  const btn = document.querySelector(".hamburger");
  const nav = document.querySelector(".main-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
}

/* ================= Footer year ================= */
function initYear() {
  document.querySelectorAll(".year-now").forEach(el => (el.textContent = new Date().getFullYear()));
}

/* ================= Social row ================= */
function initSocialRow() {
  const rows = document.querySelectorAll(".social-row[data-render]");
  rows.forEach(row => {
    const chips = [];
    if (TECHRIA.LINKTREE_URL) chips.push(socialChip("linktree", TECHRIA.LINKTREE_URL, "كل الروابط"));
    if (TECHRIA.SOCIALS.instagram) chips.push(socialChip("instagram", TECHRIA.SOCIALS.instagram, "Instagram"));
    if (TECHRIA.SOCIALS.tiktok) chips.push(socialChip("tiktok", TECHRIA.SOCIALS.tiktok, "TikTok"));
    if (TECHRIA.SOCIALS.facebook) chips.push(socialChip("facebook", TECHRIA.SOCIALS.facebook, "Facebook"));
    if (TECHRIA.SOCIALS.linkedin) chips.push(socialChip("linkedin", TECHRIA.SOCIALS.linkedin, "LinkedIn"));
    chips.push(socialChip("whatsapp", `https://wa.me/${TECHRIA.WHATSAPP_NUMBER}`, "واتساب"));
    row.innerHTML = chips.join("");
  });
}
function socialChip(type, url, label) {
  const icons = {
    linktree: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 3c.5 3 2.5 4.5 5 4.7"/>',
    facebook: '<path d="M13 21v-8h3l.5-4H13V6.5A1.5 1.5 0 0 1 14.5 5H17V2h-3a4 4 0 0 0-4 4v3H7v4h3v8h3Z"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8.5" r="1.4" fill="currentColor" stroke="none"/><path d="M8 11.5v6M12 17.5v-3.6a2.2 2.2 0 0 1 4.4 0v3.6M12 11.5v6"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.4c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4.2.5.6 1.6.6 1.7.1.2 0 .3 0 .5-.1.2-.2.3-.3.4-.2.2-.3.3-.1.6.2.4 1 1.5 2.1 2.1.3.2.5.1.6 0 .2-.2.4-.4.6-.6.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.3.2.4.3 0 .2 0 .8-.3 1.2-.3.4-1.2.9-2 .9-.7 0-2-.3-3.4-1.6-1.6-1.5-2.6-3.2-2.7-3.4-.1-.2-.9-1.3-.9-2.5 0-1.2.6-1.7.8-2Z"/>',
  };
  return `<a class="social-chip" data-type="${type}" href="${url}" target="_blank" rel="noopener" aria-label="${label}" title="${label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${icons[type] || icons.linktree}</svg></a>`;
}

/* ================= Init on load ================= */
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initMobileNav();
  initSocialRow();
  renderFeatured();
  initCategoryTabs();
  initReveal();
  initStatCounters();
  initGiftTilt();

  const waFloat = document.getElementById("waFloat");
  if (waFloat) waFloat.href = `https://wa.me/${TECHRIA.WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحبًا Techria، أرغب في الاستفسار عن خدماتكم")}`;
});
