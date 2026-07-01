function szT(ar, en) {
  return szIsArabic() ? ar : en;
}

function szMountHeader() {
  const settings = szGetSettings();
  const header = document.querySelector("[data-header]");
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="${settings.brandName}">
        <img class="brand-logo" src="assets/softwarezawy-wordmark.svg" width="220" height="52" alt="${settings.brandName}">
      </a>
      <div class="nav-actions">
        <button class="icon-btn" type="button" data-menu aria-label="${szT("القائمة", "Menu")}">☰</button>
        <button class="icon-btn" type="button" data-lang aria-label="${szT("تغيير اللغة", "Change language")}">${szIsArabic() ? "EN" : "AR"}</button>
        <button class="icon-btn" type="button" data-theme-toggle aria-label="${szT("تغيير الوضع", "Change theme")}">◐</button>
        <a class="icon-btn" href="softwarezawy-cart.html" aria-label="${szT("السلة", "Cart")}">🛒<span class="badge-count" data-cart-count>0</span></a>
      </div>
    </div>
  `;
  szUpdateCartCount();
}

function szMountDrawer() {
  const drawer = document.querySelector("[data-drawer]");
  if (!drawer) return;
  const settings = szGetSettings();
  const sections = szGetSections().filter((section) => section.visible);
  drawer.innerHTML = `
    <div class="drawer-backdrop" data-close-drawer></div>
    <aside class="drawer-panel">
      <div class="toolbar">
        <strong>${settings.brandName}</strong>
        <button class="icon-btn" type="button" data-close-drawer aria-label="${szT("إغلاق", "Close")}">×</button>
      </div>
      <nav class="drawer-nav">
        <a href="index.html">${szT("الرئيسية", "Home")}</a>
        ${sections.map((section) => `<a href="${section.page}">${szText(section, "title")}</a>`).join("")}
        <a href="softwarezawy-store.html">${szT("كل الاشتراكات", "All subscriptions")}</a>
        <a href="softwarezawy-cart.html">${szT("السلة والدفع", "Cart & checkout")}</a>
        <a href="softwarezawy-info.html">${szT("الدعم والمعلومات", "Support & info")}</a>
        <a href="${szWhatsAppLink(szT("أحتاج مساعدة في اختيار اشتراك AI", "I need help choosing an AI subscription"))}" target="_blank" rel="noopener">${szT("واتساب الدعم", "WhatsApp support")}</a>
        <a href="mailto:${settings.supportEmail}">${settings.supportEmail}</a>
      </nav>
    </aside>
  `;
}

function szBindGlobalActions() {
  document.addEventListener("click", (event) => {
    const menuBtn = event.target.closest("[data-menu]");
    const closeBtn = event.target.closest("[data-close-drawer]");
    const langBtn = event.target.closest("[data-lang]");
    const themeBtn = event.target.closest("[data-theme-toggle]");
    if (menuBtn) document.querySelector("[data-drawer]")?.classList.add("open");
    if (closeBtn) document.querySelector("[data-drawer]")?.classList.remove("open");
    if (langBtn) {
      szSetLanguage(szIsArabic() ? "en" : "ar");
      location.reload();
    }
    if (themeBtn) {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      szSetTheme(next);
    }
  });
}

function szBindMotionTracking() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--page-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--page-y", `${event.clientY}px`);
    const target = event.target.closest(".section-card, .product-card, .feature, .admin-card, .stat");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y / rect.height) - .5) * -9;
    const ry = ((x / rect.width) - .5) * 9;
    target.style.setProperty("--mx", `${x}px`);
    target.style.setProperty("--my", `${y}px`);
    target.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    target.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  });
  document.addEventListener("pointerleave", (event) => {
    const target = event.target.closest?.(".section-card, .product-card, .feature, .admin-card, .stat");
    if (!target) return;
    target.style.removeProperty("--rx");
    target.style.removeProperty("--ry");
  }, true);
}

function szInitMetaPixel() {
  const settings = szGetSettings();
  const rawId = String(settings.metaPixelId || "").trim();
  const id = /^\d{6,}$/.test(rawId) ? rawId : rawId.match(/\b\d{6,}\b/)?.[0] || "";
  const enabled = settings.metaPixelEnabled === true || settings.metaPixelEnabled === "true";
  if (!enabled || !id || window.fbq) return;
  const script = document.createElement("script");
  script.text = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

function szTrackMeta(eventName, payload = {}) {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, payload);
  }
}

function szProductCard(product) {
  const firstOption = szProductOptions(product)[0];
  return `
    <article class="product-card">
      <button class="product-image" type="button" data-details="${product.id}" aria-label="${szText(product, "name")}">
        <img src="${szProductImage(product)}" alt="${szText(product, "name")}">
      </button>
      <div class="product-top">
        <span class="product-badge">${szText(product, "badge") || product.provider}</span>
        <span>${product.provider}</span>
      </div>
      <div>
        <h3>${szText(product, "name")}</h3>
        <p>${szText(product, "description")}</p>
      </div>
      <div>
        <strong class="price">${szMoney(firstOption.price)}</strong>
        ${product.oldPrice ? `<span class="old-price">${szMoney(product.oldPrice)}</span>` : ""}
      </div>
      <p>${szOptionName(product)}: ${szOptionLabel(firstOption)} · ${szText(product, "activation")}</p>
      <div class="toolbar">
        <button class="btn primary" type="button" data-add-cart="${product.id}">${szT("أضف للسلة", "Add to cart")}</button>
        <button class="btn ghost" type="button" data-details="${product.id}">${szT("التفاصيل", "Details")}</button>
      </div>
    </article>
  `;
}

function szMountProductModal() {
  if (document.querySelector("[data-product-modal]")) return;
  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.dataset.productModal = "";
  modal.innerHTML = `
    <div class="modal-backdrop" data-close-product></div>
    <section class="modal-panel product-modal-panel" role="dialog" aria-modal="true">
      <button class="icon-btn modal-close" type="button" data-close-product aria-label="Close">×</button>
      <div data-product-modal-body></div>
    </section>
  `;
  document.body.appendChild(modal);
}

function szOpenProductModal(productId) {
  const product = szGetProducts().find((item) => item.id === productId);
  if (!product) return;
  szMountProductModal();
  const modal = document.querySelector("[data-product-modal]");
  const body = document.querySelector("[data-product-modal-body]");
  const options = szProductOptions(product);
  const selected = options[0];
  body.innerHTML = `
    <article class="product-detail-page">
      <div class="product-detail-layout">
        <div class="detail-media detail-media-feature">
          <img src="${szProductImage(product)}" alt="${szText(product, "name")}">
        </div>
        <div class="detail-content">
          <div class="product-detail-kicker">
            <span class="product-badge">${szText(product, "badge") || product.provider}</span>
            <span>${product.provider}</span>
          </div>
          <h2>${szText(product, "name")}</h2>
          <p class="lead">${szText(product, "description")}</p>
          <div class="detail-facts">
            <div><span>${szT("التفعيل", "Activation")}</span><strong>${szText(product, "activation") || szT("حسب المتاح", "Based on availability")}</strong></div>
            <div><span>${szT("التخصيص", "Option")}</span><strong>${szOptionName(product)}</strong></div>
            <div><span>${szT("أول سعر", "Starting price")}</span><strong>${szMoney(selected.price)}</strong></div>
          </div>
          <div class="detail-summary">
            <h3>${szT("تفاصيل الاشتراك", "Subscription details")}</h3>
            <p>${szText(product, "details") || szText(product, "description")}</p>
          </div>
          <div class="option-box">
            <strong>${szOptionName(product)}</strong>
            <div class="option-grid">
              ${options.map((option, index) => `
                <label class="option-pill ${index === 0 ? "selected" : ""}">
                  <input type="radio" name="product-option" value="${option.id}" ${index === 0 ? "checked" : ""}>
                  <span>${szOptionLabel(option)}</span>
                  <b>${szMoney(option.price)}</b>
                </label>
              `).join("")}
            </div>
          </div>
          <div class="detail-buy-row">
            <div>
              <span class="detail-price-label">${szT("السعر الحالي", "Current price")}</span>
              <strong class="price" data-detail-price>${szMoney(selected.price)}</strong>
            </div>
            <button class="btn primary" type="button" data-modal-add="${product.id}">${szT("أضف للسلة", "Add to cart")}</button>
          </div>
        </div>
      </div>
    </article>
  `;
  modal.classList.add("open");
  body.querySelectorAll('input[name="product-option"]').forEach((input) => {
    input.addEventListener("change", () => {
      const option = options.find((item) => item.id === input.value) || options[0];
      body.querySelector("[data-detail-price]").textContent = szMoney(option.price);
      body.querySelectorAll(".option-pill").forEach((pill) => pill.classList.remove("selected"));
      input.closest(".option-pill").classList.add("selected");
    });
  });
}

function szRenderProducts(target, products) {
  const el = document.querySelector(target);
  if (!el) return;
  const activeProducts = products.filter((product) => product.active !== false);
  el.innerHTML = activeProducts.length
    ? activeProducts.map(szProductCard).join("")
    : `<div class="empty">${szT("لا توجد اشتراكات متاحة حاليا.", "No subscriptions are available right now.")}</div>`;
}

function szBindProductActions() {
  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-cart]");
    const detailsBtn = event.target.closest("[data-details]");
    if (addBtn) {
      szAddToCart(addBtn.dataset.addCart);
      const product = szGetProducts().find((item) => item.id === addBtn.dataset.addCart);
      if (product) {
        const firstOption = szProductOptions(product)[0];
        szTrackMeta("AddToCart", {
          content_ids: [product.id],
          content_name: product.nameEn || product.nameAr,
          content_type: "product",
          value: Number(firstOption?.price || product.price || 0),
          currency: "EGP"
        });
      }
      addBtn.textContent = szT("تمت الإضافة", "Added");
      setTimeout(() => (addBtn.textContent = szT("أضف للسلة", "Add to cart")), 1200);
    }
    if (detailsBtn) {
      szOpenProductModal(detailsBtn.dataset.details);
    }
    const closeProduct = event.target.closest("[data-close-product]");
    if (closeProduct) {
      document.querySelector("[data-product-modal]")?.classList.remove("open");
    }
    const modalAdd = event.target.closest("[data-modal-add]");
    if (modalAdd) {
      const selected = document.querySelector('input[name="product-option"]:checked');
      szAddToCart(modalAdd.dataset.modalAdd, 1, selected?.value || "");
      document.querySelector("[data-product-modal]")?.classList.remove("open");
    }
  });
}

function szRenderHome() {
  const settings = szGetSettings();
  const hero = document.querySelector("[data-home-hero]");
  if (hero) {
    hero.innerHTML = `
      <div>
        <p class="eyebrow">${szT(settings.taglineAr, settings.taglineEn)}</p>
        <h1>${szT("اشتراكات AI موثوقة لمذاكرتك وشغلك ومحتواك", "Trusted AI subscriptions for study, work, and content")}</h1>
        <p class="lead">${szT("اختار الأداة المناسبة، ابعت طلبك، وفريق SoftwareZawy يتابع معك التفعيل خطوة بخطوة عبر واتساب.", "Choose the right tool, send your order, and SoftwareZawy support follows activation with you on WhatsApp.")}</p>
        <div class="hero-actions">
          <a class="btn primary" href="softwarezawy-store.html">${szT("تصفح الاشتراكات", "Browse subscriptions")}</a>
          <a class="btn ghost" href="${szWhatsAppLink(szT("أريد ترشيح أفضل اشتراك AI لاحتياجي", "Recommend the best AI subscription for my needs"))}" target="_blank" rel="noopener">${szT("اسأل الدعم", "Ask support")}</a>
        </div>
        <div class="stats">
          <div class="stat"><strong>15-60</strong><span>${szT("دقيقة للتفعيل السريع", "minutes for fast activation")}</span></div>
          <div class="stat"><strong>24/7</strong><span>${szT("طلبات عبر واتساب", "WhatsApp orders")}</span></div>
          <div class="stat"><strong>AI</strong><span>${szT("خطط للأفراد والفِرق", "plans for people and teams")}</span></div>
        </div>
      </div>
    `;
  }
  const sectionsEl = document.querySelector("[data-home-sections]");
  if (sectionsEl) {
    const sections = szGetSections().filter((section) => section.visible);
    sectionsEl.innerHTML = sections.map((section) => `
      <a class="section-card" href="${section.page}" style="background:${section.imageUrl ? `linear-gradient(180deg, rgba(6,16,24,.18), rgba(6,16,24,.78)), url('${section.imageUrl}') center/cover` : section.gradient}">
        <span class="section-icon">${section.icon || "AI"}</span>
        <span class="eyebrow">${szText(section, "eyebrow")}</span>
        <span>
          <h3>${szText(section, "title")}</h3>
          <p>${szText(section, "description")}</p>
        </span>
      </a>
    `).join("");
  }
  szRenderProducts("[data-featured-products]", szGetProducts().filter((product) => product.featured));
}

function szRenderSectionPage() {
  const params = new URLSearchParams(location.search);
  const sectionId = params.get("section") || "writing";
  const sections = szGetSections();
  const section = sections.find((item) => item.id === sectionId) || sections[0];
  const products = szGetProducts().filter((product) => product.sectionId === section.id);
  const head = document.querySelector("[data-section-head]");
  if (head) {
    document.title = `${szText(section, "title")} | SoftwareZawy`;
    head.innerHTML = `
      <p class="eyebrow">${szText(section, "eyebrow")}</p>
      <h1>${szText(section, "title")}</h1>
      <p class="lead">${szText(section, "description")}</p>
    `;
  }
  szRenderProducts("[data-section-products]", products);
}

function szRenderStorePage() {
  const products = szGetProducts();
  const search = document.querySelector("[data-search]");
  const sectionFilter = document.querySelector("[data-section-filter]");
  if (sectionFilter) {
    sectionFilter.innerHTML = `<option value="">${szT("كل الأقسام", "All sections")}</option>` + szGetSections()
      .map((section) => `<option value="${section.id}">${szText(section, "title")}</option>`)
      .join("");
  }
  const render = () => {
    const term = (search?.value || "").toLowerCase();
    const sectionId = sectionFilter?.value || "";
    const filtered = products.filter((product) => {
      const haystack = `${product.nameAr} ${product.nameEn} ${product.provider} ${product.descriptionAr} ${product.descriptionEn}`.toLowerCase();
      return (!sectionId || product.sectionId === sectionId) && (!term || haystack.includes(term));
    });
    szRenderProducts("[data-store-products]", filtered);
  };
  search?.addEventListener("input", render);
  sectionFilter?.addEventListener("change", render);
  render();
}

function szRefreshVisibleStorePage() {
  szMountHeader();
  szMountDrawer();
  if (document.querySelector("[data-home-hero]")) szRenderHome();
  if (document.querySelector("[data-section-head]")) szRenderSectionPage();
  if (document.querySelector("[data-store-products]")) szRenderStorePage();
  szUpdateCartCount();
}

document.addEventListener("softwarezawy:sync-updated", () => {
  if (document.querySelector("[data-header]")) szRefreshVisibleStorePage();
});

szOnReady(() => {
  szInitMetaPixel();
  szMountHeader();
  szMountDrawer();
  szBindGlobalActions();
  szBindMotionTracking();
  szBindProductActions();
  szUpdateCartCount();
});
