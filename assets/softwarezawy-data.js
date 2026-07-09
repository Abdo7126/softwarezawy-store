const SZ_KEYS = {
  settings: "softwarezawy_settings_v1",
  sections: "softwarezawy_sections_v1",
  products: "softwarezawy_products_v1",
  cart: "softwarezawy_cart_v1",
  orders: "softwarezawy_orders_v1",
  invoice: "softwarezawy_invoice_v1",
  coupons: "softwarezawy_coupons_v1",
  managers: "softwarezawy_managers_v1",
  theme: "softwarezawy_theme_v1",
  lang: "softwarezawy_lang_v1",
  syncConfig: "softwarezawy_sync_config_v1"
};

const SOFTWAREZAWY_DEFAULTS = {
  settings: {
    brandName: "SoftwareZawy",
    taglineAr: "اشتراكات AI أصلية ومفعلة بسرعة",
    taglineEn: "Original AI subscriptions activated fast",
    currency: "ج.م",
    adminWhatsApp: "201000000000",
    supportWhatsApp: "201000000000",
    supportEmail: "support@softwarezawy.shop",
    domain: "https://softwarezawy.shop",
    emailjsEnabled: false,
    emailjsServiceId: "",
    emailjsTemplateId: "",
    emailjsPublicKey: "",
    metaPixelEnabled: false,
    metaPixelId: ""
  },
  sections: [
    {
      id: "writing",
      titleAr: "كتابة ومحتوى",
      titleEn: "Writing & Content",
      eyebrowAr: "أدوات إنتاج يومي",
      eyebrowEn: "Daily creation tools",
      descriptionAr: "اشتراكات ChatGPT وClaude وQuillBot للكتابة، التلخيص، البحث، وصناعة المحتوى.",
      descriptionEn: "ChatGPT, Claude, and QuillBot subscriptions for writing, summaries, research, and content.",
      icon: "✦",
      imageUrl: "",
      gradient: "linear-gradient(135deg, #06d6a0, #118ab2)",
      page: "softwarezawy-section.html?section=writing",
      order: 1,
      visible: true
    },
    {
      id: "design",
      titleAr: "تصميم وصور",
      titleEn: "Design & Images",
      eyebrowAr: "إبداع مرئي",
      eyebrowEn: "Visual creation",
      descriptionAr: "خطط Midjourney وCanva Pro وRunway لصناعة صور وفيديوهات احترافية.",
      descriptionEn: "Midjourney, Canva Pro, and Runway plans for professional images and video.",
      icon: "◈",
      imageUrl: "",
      gradient: "linear-gradient(135deg, #39ff88, #1b8cff)",
      page: "softwarezawy-section.html?section=design",
      order: 2,
      visible: true
    },
    {
      id: "productivity",
      titleAr: "إنتاجية وأعمال",
      titleEn: "Productivity & Business",
      eyebrowAr: "للشركات والفِرق",
      eyebrowEn: "For teams",
      descriptionAr: "اشتراكات Notion AI وMicrosoft Copilot وPerplexity Pro للعمل والبحث والتحليل.",
      descriptionEn: "Notion AI, Microsoft Copilot, and Perplexity Pro for work, research, and analysis.",
      icon: "⌁",
      imageUrl: "",
      gradient: "linear-gradient(135deg, #2dd4ff, #8cff9a)",
      page: "softwarezawy-section.html?section=productivity",
      order: 3,
      visible: true
    }
  ],
  products: [
    {
      id: "chatgpt-plus",
      sectionId: "writing",
      nameAr: "ChatGPT Plus",
      nameEn: "ChatGPT Plus",
      provider: "OpenAI",
      imageUrl: "",
      badgeAr: "الأكثر طلبا",
      badgeEn: "Popular",
      price: 950,
      oldPrice: 1100,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "تفعيل خلال 15-60 دقيقة",
      activationEn: "Activated within 15-60 minutes",
      descriptionAr: "اشتراك مناسب للكتابة، البرمجة، تحليل الملفات، وتوليد الأفكار اليومية.",
      descriptionEn: "A plan for writing, coding, file analysis, and daily ideation.",
      detailsAr: "التفعيل يتم على حسابك أو حساب جديد حسب المتاح. يتم إرسال بيانات التفعيل عبر واتساب بعد تأكيد الطلب.",
      detailsEn: "Activation is completed on your account or a new account depending on availability. Details are sent on WhatsApp.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 950 },
        { id: "3-months", labelAr: "3 شهور", labelEn: "3 months", price: 2700 }
      ],
      featured: true,
      active: true
    },
    {
      id: "claude-pro",
      sectionId: "writing",
      nameAr: "Claude Pro",
      nameEn: "Claude Pro",
      provider: "Anthropic",
      imageUrl: "",
      badgeAr: "للتحليل الطويل",
      badgeEn: "Long context",
      price: 990,
      oldPrice: 0,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "تفعيل في نفس اليوم",
      activationEn: "Same-day activation",
      descriptionAr: "ممتاز للملفات الطويلة، الصياغة الدقيقة، ومراجعة المحتوى.",
      descriptionEn: "Great for long files, careful writing, and content review.",
      detailsAr: "قد تختلف طريقة التسليم حسب سياسة الخدمة والمنطقة. الدعم يوضح التفاصيل قبل الدفع.",
      detailsEn: "Delivery can vary by service policy and region. Support confirms details before payment.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 990 },
        { id: "3-months", labelAr: "3 شهور", labelEn: "3 months", price: 2850 }
      ],
      featured: false,
      active: true
    },
    {
      id: "midjourney-basic",
      sectionId: "design",
      nameAr: "Midjourney Basic",
      nameEn: "Midjourney Basic",
      provider: "Midjourney",
      imageUrl: "",
      badgeAr: "تصميم",
      badgeEn: "Design",
      price: 620,
      oldPrice: 750,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "تسليم بيانات الدخول",
      activationEn: "Login details delivery",
      descriptionAr: "خطة مناسبة لتوليد صور للمنتجات، السوشيال ميديا، والهوية البصرية.",
      descriptionEn: "A plan for product visuals, social posts, and brand concepts.",
      detailsAr: "يشمل دعم بدء الاستخدام ونصائح Prompt أساسية بعد الشراء.",
      detailsEn: "Includes onboarding support and basic prompt tips after purchase.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 620 }
      ],
      featured: true,
      active: true
    },
    {
      id: "canva-pro",
      sectionId: "design",
      nameAr: "Canva Pro",
      nameEn: "Canva Pro",
      provider: "Canva",
      imageUrl: "",
      badgeAr: "قيمة عالية",
      badgeEn: "Best value",
      price: 260,
      oldPrice: 350,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "دعوة على البريد",
      activationEn: "Email invite",
      descriptionAr: "قوالب احترافية، إزالة خلفية، مكتبة عناصر، وتصميم سريع للمحتوى.",
      descriptionEn: "Templates, background remover, asset library, and fast content design.",
      detailsAr: "تحتاج بريد إلكتروني نشط لاستقبال الدعوة وتأكيد الاشتراك.",
      detailsEn: "Requires an active email address to receive and accept the invite.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 260 },
        { id: "1-year", labelAr: "سنة", labelEn: "1 year", price: 2200 }
      ],
      featured: false,
      active: true
    },
    {
      id: "perplexity-pro",
      sectionId: "productivity",
      nameAr: "Perplexity Pro",
      nameEn: "Perplexity Pro",
      provider: "Perplexity",
      imageUrl: "",
      badgeAr: "بحث ذكي",
      badgeEn: "Smart search",
      price: 870,
      oldPrice: 0,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "تفعيل سريع",
      activationEn: "Fast activation",
      descriptionAr: "بحث مدعوم بالمصادر، تلخيص سريع، ومقارنة معلومات للطلاب والشركات.",
      descriptionEn: "Source-backed search, fast summaries, and research comparison.",
      detailsAr: "الدعم يتابع معك حتى تتأكد أن الاشتراك يعمل من جهازك.",
      detailsEn: "Support follows up until the subscription works on your device.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 870 }
      ],
      featured: true,
      active: true
    },
    {
      id: "notion-ai",
      sectionId: "productivity",
      nameAr: "Notion AI",
      nameEn: "Notion AI",
      provider: "Notion",
      imageUrl: "",
      badgeAr: "للفِرق",
      badgeEn: "Teams",
      price: 520,
      oldPrice: 0,
      durationAr: "شهر واحد",
      durationEn: "1 month",
      activationAr: "حسب مساحة العمل",
      activationEn: "Workspace based",
      descriptionAr: "تنظيم المهام، تلخيص الاجتماعات، وكتابة مستندات العمل داخل Notion.",
      descriptionEn: "Task planning, meeting summaries, and workspace writing inside Notion.",
      detailsAr: "يمكن تفعيله لمساحة عمل قائمة أو مساحة جديدة حسب اختيارك.",
      detailsEn: "Can be activated for an existing or new workspace.",
      optionNameAr: "المدة",
      optionNameEn: "Duration",
      options: [
        { id: "1-month", labelAr: "شهر واحد", labelEn: "1 month", price: 520 }
      ],
      featured: false,
      active: true
    }
  ],
  coupons: [
    { code: "AI10", type: "percent", value: 10, active: true }
  ],
  managers: [
    { username: "admin", password: "admin123", role: "owner" }
  ]
};

const SZ_CLOUD_KEY_MAP = {
  settings: SZ_KEYS.settings,
  sections: SZ_KEYS.sections,
  products: SZ_KEYS.products,
  coupons: SZ_KEYS.coupons,
  orders: SZ_KEYS.orders,
  invoice: SZ_KEYS.invoice
};

const SZ_CLOUD_PUBLIC_KEYS = ["settings", "sections", "products", "coupons"];
const SZ_CLOUD_ADMIN_KEYS = ["settings", "sections", "products", "coupons", "orders", "invoice"];

function szRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function szWrite(key, value, options = {}) {
  localStorage.setItem(key, JSON.stringify(value));
  if (options.sync !== false) szQueueCloudWrite(key, value);
}

function szCloudRemoteKey(localKey) {
  return Object.keys(SZ_CLOUD_KEY_MAP).find((key) => SZ_CLOUD_KEY_MAP[key] === localKey) || "";
}

function szCloudLocalKey(remoteKey) {
  return SZ_CLOUD_KEY_MAP[remoteKey] || "";
}

function szGetSyncConfig() {
  const globalConfig = window.SOFTWAREZAWY_CLOUD_SYNC || {};
  const localConfig = szRead(SZ_KEYS.syncConfig, {});
  return {
    enabled: Boolean(localConfig.enabled ?? globalConfig.enabled),
    endpoint: String(localConfig.endpoint || globalConfig.endpoint || "").trim(),
    token: String(localConfig.token || (szIsAdminPage() ? globalConfig.adminToken : "") || "").trim(),
    timeoutMs: Number(localConfig.timeoutMs || globalConfig.timeoutMs || 4500),
    autoPull: localConfig.autoPull ?? globalConfig.autoPull ?? true,
    pullIntervalMs: Number(localConfig.pullIntervalMs || globalConfig.pullIntervalMs || 60000),
    useJsonp: localConfig.useJsonp ?? globalConfig.useJsonp ?? true,
    noCorsPost: localConfig.noCorsPost ?? globalConfig.noCorsPost ?? true
  };
}

function szSaveSyncConfig(config) {
  szWrite(SZ_KEYS.syncConfig, {
    enabled: config.enabled === true || config.enabled === "true",
    endpoint: String(config.endpoint || "").trim(),
    token: String(config.token || "").trim(),
    timeoutMs: Number(config.timeoutMs || 4500),
    autoPull: config.autoPull !== false && config.autoPull !== "false",
    pullIntervalMs: Number(config.pullIntervalMs || 60000),
    useJsonp: config.useJsonp !== false && config.useJsonp !== "false",
    noCorsPost: config.noCorsPost !== false && config.noCorsPost !== "false"
  }, { sync: false });
}

function szIsAdminPage() {
  return location.pathname.includes("softwarezawy-admin");
}

function szCloudAvailable(config = szGetSyncConfig()) {
  return Boolean(config.enabled && config.endpoint);
}

function szCloudSnapshot(keys = SZ_CLOUD_ADMIN_KEYS) {
  return keys.reduce((snapshot, remoteKey) => {
    const localKey = szCloudLocalKey(remoteKey);
    if (localKey) snapshot[remoteKey] = szRead(localKey, SOFTWAREZAWY_DEFAULTS[remoteKey] ?? (remoteKey === "orders" ? [] : {}));
    return snapshot;
  }, {});
}

function szOrderTime(order = {}) {
  const date = new Date(order.updatedAt || order.confirmedAt || order.createdAt || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function szMergeOrders(localOrders = [], remoteOrders = []) {
  const byId = new Map();
  [...remoteOrders, ...localOrders].forEach((order) => {
    if (!order || !order.id) return;
    const current = byId.get(order.id);
    if (!current || szOrderTime(order) >= szOrderTime(current)) byId.set(order.id, order);
  });
  return Array.from(byId.values()).sort((a, b) => szOrderTime(b) - szOrderTime(a));
}

function szApplyCloudSnapshot(data = {}) {
  let changed = false;
  Object.entries(data).forEach(([remoteKey, value]) => {
    const localKey = szCloudLocalKey(remoteKey);
    if (!localKey) return;
    const normalized = remoteKey === "settings"
      ? { ...SOFTWAREZAWY_DEFAULTS.settings, ...(value || {}) }
      : remoteKey === "orders"
        ? szMergeOrders(szRead(SZ_KEYS.orders, []), Array.isArray(value) ? value : [])
        : value;
    const next = JSON.stringify(normalized);
    if (localStorage.getItem(localKey) !== next) {
      localStorage.setItem(localKey, next);
      changed = true;
    }
  });
  if (changed) document.dispatchEvent(new CustomEvent("softwarezawy:sync-updated", { detail: data }));
  return changed;
}

async function szCloudFetchJson(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, cache: "no-store", signal: controller.signal });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok || data.ok === false) throw new Error(data.error || `Sync request failed: ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function szCloudUrl(params = {}) {
  const config = szGetSyncConfig();
  const url = new URL(config.endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });
  return url.toString();
}

async function szCloudPost(body) {
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config)) return { skipped: true };
  if (config.noCorsPost) {
    await fetch(config.endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
    return { ok: true, opaque: true };
  }
  return szCloudFetchJson(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  }, config.timeoutMs);
}

function szCloudGetJsonp(params = {}) {
  const config = szGetSyncConfig();
  return new Promise((resolve, reject) => {
    const callbackName = `__szSyncCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Sync request timed out."));
    }, config.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      script.remove();
      delete window[callbackName];
    };
    window[callbackName] = (payload) => {
      cleanup();
      if (payload?.ok === false) reject(new Error(payload.error || "Sync request failed."));
      else resolve(payload || {});
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Sync request failed."));
    };
    script.src = szCloudUrl({ ...params, callback: callbackName });
    document.head.appendChild(script);
  });
}

async function szPullCloudSync(options = {}) {
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config)) return { skipped: true };
  try {
    const adminScope = options.admin === true || (szIsAdminPage() && Boolean(config.token));
    const params = {
      action: "read",
      scope: adminScope ? "admin" : "public",
      token: adminScope ? config.token : ""
    };
    const result = config.useJsonp
      ? await szCloudGetJsonp(params)
      : await szCloudFetchJson(szCloudUrl(params), {}, config.timeoutMs);
    szApplyCloudSnapshot(result.data || {});
    return { ok: true, updatedAt: result.updatedAt || "" };
  } catch (error) {
    console.warn("SoftwareZawy cloud sync pull failed:", error);
    return { ok: false, error: error.message };
  }
}

function szQueueCloudWrite(localKey, value) {
  const remoteKey = szCloudRemoteKey(localKey);
  if (!remoteKey) return;
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config) || !config.token) return;
  window.szCloudWriteQueue = (window.szCloudWriteQueue || Promise.resolve())
    .then(() => szCloudPost({ action: "write", token: config.token, key: remoteKey, value }))
    .catch((error) => console.warn("SoftwareZawy cloud sync write failed:", error));
}

async function szPushCloudSnapshot() {
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config) || !config.token) throw new Error("بيانات المزامنة غير مكتملة.");
  return szCloudPost({ action: "writeSnapshot", token: config.token, data: szCloudSnapshot() });
}

async function szCreateCloudOrder(order) {
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config)) return { skipped: true };
  return szCloudPost({ action: "createOrder", order });
}

function szWaitForSync() {
  return window.szSyncReady || Promise.resolve({ skipped: true });
}

function szOnReady(callback) {
  const run = () => szWaitForSync().finally(callback);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
}

function szStartAutoSync() {
  const config = szGetSyncConfig();
  if (!szCloudAvailable(config) || !config.autoPull || window.szAutoSyncTimer) return;
  const interval = Math.max(15000, Number(config.pullIntervalMs || 60000));
  window.szAutoSyncTimer = setInterval(() => {
    if (document.hidden) return;
    szPullCloudSync({ silent: true });
  }, interval);
}

function szGetSettings() {
  return szRead(SZ_KEYS.settings, SOFTWAREZAWY_DEFAULTS.settings);
}

function szGetSections() {
  return szRead(SZ_KEYS.sections, SOFTWAREZAWY_DEFAULTS.sections)
    .slice()
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function szGetProducts() {
  return szRead(SZ_KEYS.products, SOFTWAREZAWY_DEFAULTS.products);
}

function szGetCoupons() {
  return szRead(SZ_KEYS.coupons, SOFTWAREZAWY_DEFAULTS.coupons);
}

function szGetOrders() {
  return szRead(SZ_KEYS.orders, []);
}

function szCurrentLang() {
  return localStorage.getItem(SZ_KEYS.lang) || "ar";
}

function szIsArabic() {
  return szCurrentLang() === "ar";
}

function szText(item, field) {
  const suffix = szIsArabic() ? "Ar" : "En";
  return item[`${field}${suffix}`] || item[field] || "";
}

function szMoney(amount) {
  const settings = szGetSettings();
  return `${Number(amount || 0).toLocaleString(szIsArabic() ? "ar-EG" : "en-US")} ${settings.currency}`;
}

function szSetLanguage(lang) {
  localStorage.setItem(SZ_KEYS.lang, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

function szSetTheme(theme) {
  localStorage.setItem(SZ_KEYS.theme, theme);
  document.documentElement.dataset.theme = theme;
}

function szEnsureSiteIcon() {
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.sizes = "any";
    icon.href = "favicon.ico?v=3";
    document.head.appendChild(icon);
  }
}

function szApplyStaticTranslations(scope = document) {
  const suffix = szIsArabic() ? "Ar" : "En";
  const translatedValue = (el, key) => el.dataset[`${key}${suffix}`] || el.dataset[`${key}Ar`] || "";

  scope.querySelectorAll("[data-i18n-ar][data-i18n-en]").forEach((el) => {
    el.textContent = translatedValue(el, "i18n");
  });
  scope.querySelectorAll("[data-i18n-placeholder-ar][data-i18n-placeholder-en]").forEach((el) => {
    el.placeholder = translatedValue(el, "i18nPlaceholder");
  });
  scope.querySelectorAll("[data-i18n-aria-label-ar][data-i18n-aria-label-en]").forEach((el) => {
    el.setAttribute("aria-label", translatedValue(el, "i18nAriaLabel"));
  });
  scope.querySelectorAll("[data-i18n-title-ar][data-i18n-title-en]").forEach((el) => {
    el.title = translatedValue(el, "i18nTitle");
  });
}

function szInitChrome() {
  szSetLanguage(szCurrentLang());
  szSetTheme(localStorage.getItem(SZ_KEYS.theme) || "dark");
  szEnsureSiteIcon();
  szApplyStaticTranslations();
}

function szCart() {
  return szRead(SZ_KEYS.cart, []);
}

function szSaveCart(cart) {
  szWrite(SZ_KEYS.cart, cart);
  szUpdateCartCount();
}

function szProductOptions(product) {
  if (Array.isArray(product.options) && product.options.length) return product.options;
  return [{ id: "default", labelAr: product.durationAr || "الخيار الأساسي", labelEn: product.durationEn || "Default", price: Number(product.price || 0) }];
}

function szOptionLabel(option) {
  return szIsArabic() ? (option.labelAr || option.labelEn || option.id) : (option.labelEn || option.labelAr || option.id);
}

function szOptionName(product) {
  return szIsArabic() ? (product.optionNameAr || product.optionNameEn || "التخصيص") : (product.optionNameEn || product.optionNameAr || "Option");
}

function szProductImage(product) {
  return product.imageUrl || product.image || "assets/softwarezawy-logo.png";
}

function szAddToCart(productId, qty = 1, optionId = "") {
  const products = szGetProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const options = szProductOptions(product);
  const option = options.find((item) => item.id === optionId) || options[0];
  const cart = szCart();
  const existing = cart.find((item) => item.productId === productId && item.optionId === option.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty, optionId: option.id });
  }
  szSaveCart(cart);
}

function szUpdateCartCount() {
  const count = szCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
  });
}

function szWhatsAppLink(message) {
  const settings = szGetSettings();
  return `https://wa.me/${settings.adminWhatsApp}?text=${encodeURIComponent(message)}`;
}

function szEnsureDefaults() {
  if (!localStorage.getItem(SZ_KEYS.settings)) {
    szWrite(SZ_KEYS.settings, SOFTWAREZAWY_DEFAULTS.settings, { sync: false });
  } else {
    const settings = szRead(SZ_KEYS.settings, {});
    const mergedSettings = { ...SOFTWAREZAWY_DEFAULTS.settings, ...settings };
    if (mergedSettings.domain === "https://softwarezawy.com") mergedSettings.domain = "https://softwarezawy.shop";
    if (mergedSettings.supportEmail === "support@softwarezawy.com") mergedSettings.supportEmail = "support@softwarezawy.shop";
    szWrite(SZ_KEYS.settings, mergedSettings, { sync: false });
  }
  if (!localStorage.getItem(SZ_KEYS.sections)) szWrite(SZ_KEYS.sections, SOFTWAREZAWY_DEFAULTS.sections, { sync: false });
  if (!localStorage.getItem(SZ_KEYS.products)) szWrite(SZ_KEYS.products, SOFTWAREZAWY_DEFAULTS.products, { sync: false });
  if (!localStorage.getItem(SZ_KEYS.coupons)) szWrite(SZ_KEYS.coupons, SOFTWAREZAWY_DEFAULTS.coupons, { sync: false });
  if (!localStorage.getItem(SZ_KEYS.managers)) szWrite(SZ_KEYS.managers, SOFTWAREZAWY_DEFAULTS.managers, { sync: false });
}

szEnsureDefaults();
window.szSyncReady = szPullCloudSync();
szStartAutoSync();
szInitChrome();
