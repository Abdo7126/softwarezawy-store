const SZ_ADMIN_AUTH = "softwarezawy_admin_auth_v1";

function szAdminLoggedIn() {
  return localStorage.getItem(SZ_ADMIN_AUTH) === "yes";
}

function szAdminRequire() {
  if (!szAdminLoggedIn() && !location.pathname.endsWith("softwarezawy-admin.html")) {
    location.href = "softwarezawy-admin.html";
  }
}

function szAdminShell(active) {
  const root = document.querySelector("[data-admin-shell]");
  if (!root) return;
  root.innerHTML = `
    <aside class="admin-sidebar">
      <a class="brand" href="softwarezawy-admin-dashboard.html">
        <img class="brand-logo" src="assets/softwarezawy-wordmark.svg" width="220" height="52" alt="SoftwareZawy">
      </a>
      <nav>
        <a href="softwarezawy-admin-dashboard.html">الرئيسية</a>
        <a href="softwarezawy-admin-products.html">الاشتراكات</a>
        <a href="softwarezawy-admin-orders.html">الطلبات</a>
        <a href="softwarezawy-admin-renewals.html">التجديدات</a>
        <a href="softwarezawy-admin-invoice.html">الفاتورة</a>
        <a href="softwarezawy-admin-coupons.html">الكوبونات</a>
        <a href="softwarezawy-admin-visual.html">التعديل البصري</a>
        <a href="softwarezawy-admin-settings.html">الإعدادات</a>
        <a href="softwarezawy-admin-managers.html">المديرين</a>
      </nav>
    </aside>
    <main class="admin-main" data-admin-main></main>
  `;
}

function szBindLogin() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const managers = szRead(SZ_KEYS.managers, SOFTWAREZAWY_DEFAULTS.managers);
    const found = managers.find((item) => item.username === data.get("username") && item.password === data.get("password"));
    if (!found) {
      alert("بيانات الدخول غير صحيحة.");
      return;
    }
    localStorage.setItem(SZ_ADMIN_AUTH, "yes");
    location.href = "softwarezawy-admin-dashboard.html";
  });
}

function szOrderIsConfirmed(order) {
  return ["confirmed", "paid", "done"].includes(order?.status);
}

function szDashboardDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function szDashboardSalesByDay(orders, daysCount = 7) {
  const today = new Date();
  const days = Array.from({ length: daysCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (daysCount - index - 1));
    const key = szDashboardDayKey(date);
    return {
      key,
      label: date.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric" }),
      total: 0
    };
  });
  const byKey = Object.fromEntries(days.map((day) => [day.key, day]));
  orders.filter(szOrderIsConfirmed).forEach((order) => {
    const date = new Date(order.confirmedAt || order.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;
    const day = byKey[szDashboardDayKey(date)];
    if (day) day.total += Number(order.total || 0);
  });
  return days;
}

function szDashboardTopItems(orders) {
  const totals = new Map();
  orders.filter(szOrderIsConfirmed).forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = item.nameAr || item.nameEn || "خدمة";
      const current = totals.get(name) || { name, qty: 0, total: 0 };
      current.qty += Number(item.qty || 1);
      current.total += Number(item.total || (Number(item.price || 0) * Number(item.qty || 1)));
      totals.set(name, current);
    });
  });
  return Array.from(totals.values()).sort((a, b) => b.total - a.total).slice(0, 5);
}

function szDashboardSalesChart(days) {
  const max = Math.max(...days.map((day) => day.total), 1);
  return `
    <article class="dashboard-panel">
      <div class="dashboard-panel-head">
        <div><p class="eyebrow">Sales</p><h3>المبيعات آخر 7 أيام</h3></div>
        <strong>${szMoney(days.reduce((sum, day) => sum + day.total, 0))}</strong>
      </div>
      <div class="dashboard-bars">
        ${days.map((day) => `
          <div class="dashboard-bar-row">
            <span>${szEscapeHtml(day.label)}</span>
            <div class="dashboard-bar-track"><i style="inline-size:${Math.max(day.total ? 8 : 0, (day.total / max) * 100)}%"></i></div>
            <strong>${szMoney(day.total)}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function szDashboardTopItemsChart(items) {
  const max = Math.max(...items.map((item) => item.total), 1);
  return `
    <article class="dashboard-panel">
      <div class="dashboard-panel-head">
        <div><p class="eyebrow">Products</p><h3>أكثر الاشتراكات مبيعا</h3></div>
      </div>
      <div class="dashboard-top-list">
        ${items.length ? items.map((item) => `
          <div class="dashboard-top-item">
            <div>
              <strong>${szEscapeHtml(item.name)}</strong>
              <span>${Number(item.qty || 0).toLocaleString("ar-EG")} مبيعات</span>
            </div>
            <div class="dashboard-bar-track"><i style="inline-size:${Math.max(8, (item.total / max) * 100)}%"></i></div>
            <b>${szMoney(item.total)}</b>
          </div>
        `).join("") : `<div class="empty compact-empty">لا توجد مبيعات مؤكدة بعد.</div>`}
      </div>
    </article>
  `;
}

function szDashboardStatusChart(orders) {
  const colors = {
    new: "#31d7ff",
    pending: "#f8c14a",
    confirmed: "#76ff91",
    paid: "#8dd8ff",
    done: "#a4ffce",
    cancelled: "#ff6b7a"
  };
  const entries = ["new", "pending", "confirmed", "paid", "done", "cancelled"]
    .map((status) => ({ status, label: szOrderStatusLabel(status), count: orders.filter((order) => (order.status || "new") === status).length, color: colors[status] }))
    .filter((item) => item.count);
  const total = Math.max(orders.length, 1);
  let cursor = 0;
  const gradient = entries.length ? entries.map((entry) => {
    const start = cursor;
    cursor += (entry.count / total) * 100;
    return `${entry.color} ${start}% ${cursor}%`;
  }).join(", ") : "#253541 0 100%";
  return `
    <article class="dashboard-panel dashboard-status-panel">
      <div class="dashboard-panel-head">
        <div><p class="eyebrow">Status</p><h3>حالة الطلبات</h3></div>
      </div>
      <div class="dashboard-status-chart">
        <div class="dashboard-donut" style="background: conic-gradient(${gradient})">
          <div><span>${orders.length.toLocaleString("ar-EG")}</span><small>طلب</small></div>
        </div>
        <div class="dashboard-legend">
          ${entries.length ? entries.map((entry) => `
            <div><i style="background:${entry.color}"></i><span>${szEscapeHtml(entry.label)}</span><strong>${entry.count.toLocaleString("ar-EG")}</strong></div>
          `).join("") : `<p>لا توجد طلبات محفوظة حاليا.</p>`}
        </div>
      </div>
    </article>
  `;
}

function szRenderDashboard() {
  szAdminShell("dashboard");
  const main = document.querySelector("[data-admin-main]");
  const orders = szGetOrders();
  const products = szGetProducts();
  const sections = szGetSections();
  const confirmedOrders = orders.filter(szOrderIsConfirmed);
  const confirmedSales = confirmedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter((order) => !szOrderIsConfirmed(order) && order.status !== "cancelled").length;
  const averageOrder = confirmedOrders.length ? confirmedSales / confirmedOrders.length : 0;
  const discounts = confirmedOrders.reduce((sum, order) => sum + Number(order.discount || 0), 0);
  const salesDays = szDashboardSalesByDay(orders);
  const topItems = szDashboardTopItems(orders);
  main.innerHTML = `
    <div class="toolbar dashboard-toolbar">
      <div><p class="eyebrow">Dashboard</p><h1>لوحة التحكم</h1></div>
      <a class="btn ghost" href="softwarezawy-admin-orders.html">متابعة الطلبات</a>
    </div>
    <div class="admin-grid dashboard-stats">
      <article class="admin-card"><h3>المبيعات المؤكدة</h3><strong class="price">${szMoney(confirmedSales)}</strong><p>إجمالي الطلبات بعد الضغط على زر التأكيد.</p></article>
      <article class="admin-card"><h3>طلبات مؤكدة</h3><strong class="price">${confirmedOrders.length.toLocaleString("ar-EG")}</strong><p>طلبات جاهزة لتنزيل الفاتورة والمتابعة.</p></article>
      <article class="admin-card"><h3>طلبات بانتظار التأكيد</h3><strong class="price">${pendingOrders.toLocaleString("ar-EG")}</strong><p>طلبات جديدة أو قيد المتابعة لم تدخل المبيعات بعد.</p></article>
      <article class="admin-card"><h3>متوسط الطلب</h3><strong class="price">${szMoney(averageOrder)}</strong><p>متوسط قيمة الطلبات المؤكدة.</p></article>
      <article class="admin-card"><h3>إجمالي الخصومات</h3><strong class="price">${szMoney(discounts)}</strong><p>خصومات كوبونات على الطلبات المؤكدة.</p></article>
      <article class="admin-card"><h3>الاشتراكات</h3><strong class="price">${products.length.toLocaleString("ar-EG")}</strong><p>منتجات AI قابلة للتعديل.</p></article>
      <article class="admin-card"><h3>أقسام الرئيسية</h3><strong class="price">${sections.length.toLocaleString("ar-EG")}</strong><p>يمكن زيادتها من التعديل البصري.</p></article>
      <article class="admin-card"><h3>كل الطلبات</h3><strong class="price">${orders.length.toLocaleString("ar-EG")}</strong><p>إجمالي الطلبات المحفوظة في لوحة الأدمن.</p></article>
    </div>
    <div class="dashboard-charts">
      ${szDashboardSalesChart(salesDays)}
      ${szDashboardTopItemsChart(topItems)}
      ${szDashboardStatusChart(orders)}
    </div>
    <div class="notice" style="margin-top:18px">تم تفعيل مزامنة الأجهزة: أي تعديل من الأدمن يتم رفعه تلقائيا للسحابة، وباقي الأجهزة تسحب التحديثات تلقائيا عند فتح لوحة التحكم أو أثناء استخدامها.</div>
  `;
}

function szAdminImageField(name, label, value = "") {
  const safeValue = szEscapeHtml(value);
  return `
    <div class="image-field full" data-image-field="${name}">
      <label>${label}<input name="${name}" value="${safeValue}" placeholder="رابط صورة أو ارفع صورة من جهازك" data-image-url="${name}"></label>
      <div class="image-field-actions">
        <label class="btn ghost image-upload-btn">اختيار صورة<input type="file" accept="image/*" data-image-upload="${name}"></label>
        <button class="btn ghost" type="button" data-clear-image="${name}">حذف الصورة</button>
      </div>
      <div class="image-preview-box ${value ? "" : "empty-preview"}" data-image-preview="${name}">
        ${value ? `<img src="${safeValue}" alt="${label}">` : `<span>لا توجد صورة مختارة</span>`}
      </div>
    </div>
  `;
}

function szUpdateImagePreview(field, value) {
  const preview = field.querySelector("[data-image-preview]");
  if (!preview) return;
  if (value) {
    preview.classList.remove("empty-preview");
    preview.innerHTML = `<img src="${szEscapeHtml(value)}" alt="">`;
  } else {
    preview.classList.add("empty-preview");
    preview.innerHTML = `<span>لا توجد صورة مختارة</span>`;
  }
}

function szBindAdminImageFields(scope = document) {
  scope.querySelectorAll("[data-image-field]").forEach((field) => {
    if (field.dataset.imageBound === "yes") return;
    field.dataset.imageBound = "yes";
    const urlInput = field.querySelector("[data-image-url]");
    const uploadInput = field.querySelector("[data-image-upload]");
    const clearBtn = field.querySelector("[data-clear-image]");

    urlInput?.addEventListener("input", () => szUpdateImagePreview(field, urlInput.value.trim()));
    clearBtn?.addEventListener("click", () => {
      if (urlInput) urlInput.value = "";
      if (uploadInput) uploadInput.value = "";
      szUpdateImagePreview(field, "");
    });
    uploadInput?.addEventListener("change", () => {
      const file = uploadInput.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("اختار ملف صورة فقط.");
        uploadInput.value = "";
        return;
      }
      if (file.size > 1800 * 1024) {
        alert("الصورة كبيرة. اختار صورة أقل من 1.8MB عشان تتحفظ في المتصفح بدون مشاكل.");
        uploadInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (urlInput) urlInput.value = reader.result;
        szUpdateImagePreview(field, reader.result);
      });
      reader.readAsDataURL(file);
    });
  });
}

function szProductOptionsForAdmin(product = {}) {
  if (Array.isArray(product.options) && product.options.length) return product.options;
  return [{
    id: "default",
    labelAr: product.durationAr || "شهر واحد",
    labelEn: product.durationEn || "1 month",
    price: Number(product.price || 0)
  }];
}

function szOptionRow(option = {}) {
  return `
    <div class="option-editor-row" data-option-row>
      <label>اسم الخيار عربي<input data-option-label-ar value="${szEscapeHtml(option.labelAr || "")}" placeholder="شهر واحد"></label>
      <label>اسم الخيار إنجليزي<input data-option-label-en value="${szEscapeHtml(option.labelEn || "")}" placeholder="1 month"></label>
      <label>السعر<input data-option-price type="number" min="0" value="${Number(option.price || 0)}"></label>
      <button class="btn ghost" type="button" data-remove-product-option>حذف</button>
    </div>
  `;
}

function szReadProductOptions(form) {
  const options = Array.from(form.querySelectorAll("[data-option-row]"))
    .map((row, index) => {
      const labelAr = row.querySelector("[data-option-label-ar]")?.value.trim() || "";
      const labelEn = row.querySelector("[data-option-label-en]")?.value.trim() || "";
      const price = Number(row.querySelector("[data-option-price]")?.value || 0);
      const label = labelEn || labelAr || `option-${index + 1}`;
      return {
        id: szSlug(`${label}-${index + 1}`),
        labelAr: labelAr || labelEn || `خيار ${index + 1}`,
        labelEn: labelEn || labelAr || `Option ${index + 1}`,
        price: Number.isNaN(price) ? 0 : price
      };
    })
    .filter((option) => option.labelAr || option.labelEn || option.price);
  return options.length ? options : [{ id: "default", labelAr: "الخيار الأساسي", labelEn: "Default", price: 0 }];
}

function szRenderProductsAdmin() {
  szAdminShell("products");
  const main = document.querySelector("[data-admin-main]");
  const sections = szGetSections();
  main.innerHTML = `
    <div class="toolbar">
      <div><p class="eyebrow">Products</p><h1>الاشتراكات</h1></div>
      <div class="row-actions">
        <button class="btn ghost" type="button" data-export-products>تصدير البيانات Excel</button>
        <button class="btn primary" data-new-product>اشتراك جديد</button>
      </div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>الاسم</th><th>القسم</th><th>الصورة</th><th>أول سعر</th><th>التخصيص</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody data-products-table></tbody></table></div>
    <form class="form-panel" data-product-form style="margin-top:18px;display:none"></form>
  `;
  const renderTable = () => {
    const products = szGetProducts();
    document.querySelector("[data-products-table]").innerHTML = products.map((product) => {
      const section = sections.find((item) => item.id === product.sectionId);
      const options = szProductOptionsForAdmin(product);
      return `
        <tr>
          <td>${szEscapeHtml(product.nameAr || product.nameEn || product.id)}</td>
          <td>${szEscapeHtml(section?.titleAr || product.sectionId)}</td>
          <td>${product.imageUrl ? `<img class="table-thumb" src="${szEscapeHtml(product.imageUrl)}" alt="">` : "-"}</td>
          <td>${szMoney(options[0]?.price || product.price)}</td>
          <td>${szEscapeHtml(product.optionNameAr || "التخصيص")} · ${options.length}</td>
          <td>${product.active ? "ظاهر" : "مخفي"}</td>
          <td>
            <div class="row-actions">
              <button class="btn ghost" type="button" data-edit-product="${szEscapeHtml(product.id)}">تعديل</button>
              <button class="btn danger" type="button" data-delete-product="${szEscapeHtml(product.id)}">حذف</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  };
  document.querySelector("[data-export-products]").addEventListener("click", szExportProductsSheet);
  const openForm = (product = {}) => {
    const form = document.querySelector("[data-product-form]");
    const options = szProductOptionsForAdmin(product);
    form.style.display = "grid";
    form.className = "form-panel form-grid";
    form.innerHTML = `
      <input type="hidden" name="id" value="${szEscapeHtml(product.id || "")}">
      <div class="form-section full"><h3>بيانات المنتج</h3></div>
      <label>الاسم عربي<input name="nameAr" value="${szEscapeHtml(product.nameAr || "")}" required></label>
      <label>الاسم إنجليزي<input name="nameEn" value="${szEscapeHtml(product.nameEn || "")}" required></label>
      <label>مزود الخدمة<input name="provider" value="${szEscapeHtml(product.provider || "")}" required></label>
      <label>القسم<select name="sectionId">${sections.map((section) => `<option value="${section.id}" ${product.sectionId === section.id ? "selected" : ""}>${section.titleAr}</option>`).join("")}</select></label>
      <label>السعر قبل الخصم<input name="oldPrice" type="number" value="${Number(product.oldPrice || 0)}"></label>
      <label>الشارة عربي<input name="badgeAr" value="${szEscapeHtml(product.badgeAr || "")}"></label>
      <label>الشارة إنجليزي<input name="badgeEn" value="${szEscapeHtml(product.badgeEn || "")}"></label>
      <label>التفعيل عربي<input name="activationAr" value="${szEscapeHtml(product.activationAr || "")}"></label>
      <label>التفعيل إنجليزي<input name="activationEn" value="${szEscapeHtml(product.activationEn || "")}"></label>
      ${szAdminImageField("imageUrl", "صورة المنتج", product.imageUrl || "")}
      <label class="full">وصف عربي<textarea name="descriptionAr">${szEscapeHtml(product.descriptionAr || "")}</textarea></label>
      <label class="full">وصف إنجليزي<textarea name="descriptionEn">${szEscapeHtml(product.descriptionEn || "")}</textarea></label>
      <label class="full">تفاصيل عربي<textarea name="detailsAr">${szEscapeHtml(product.detailsAr || "")}</textarea></label>
      <label class="full">تفاصيل إنجليزي<textarea name="detailsEn">${szEscapeHtml(product.detailsEn || "")}</textarea></label>

      <div class="form-section full"><h3>تخصيصات المنتج</h3></div>
      <label>اسم التخصيص عربي<input name="optionNameAr" value="${szEscapeHtml(product.optionNameAr || "المدة")}" placeholder="مثلا: المدة"></label>
      <label>اسم التخصيص إنجليزي<input name="optionNameEn" value="${szEscapeHtml(product.optionNameEn || "Duration")}" placeholder="Duration"></label>
      <div class="option-editor full" data-product-options-editor>
        ${options.map(szOptionRow).join("")}
      </div>
      <button class="btn ghost full" type="button" data-add-product-option>إضافة خيار تخصيص</button>

      <div class="form-section full"><h3>الظهور</h3></div>
      <label><input name="featured" type="checkbox" ${product.featured ? "checked" : ""}> مميز في الرئيسية</label>
      <label><input name="active" type="checkbox" ${product.active !== false ? "checked" : ""}> ظاهر للعملاء</label>
      <button class="btn primary full" type="submit">حفظ الاشتراك</button>
    `;
    szBindAdminImageFields(form);
  };
  document.querySelector("[data-new-product]").addEventListener("click", () => openForm({ id: "" }));
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-edit-product]");
    if (btn) openForm(szGetProducts().find((item) => item.id === btn.dataset.editProduct));
    const deleteProductBtn = event.target.closest("[data-delete-product]");
    if (deleteProductBtn) {
      const productId = deleteProductBtn.dataset.deleteProduct;
      const product = szGetProducts().find((item) => item.id === productId);
      const productName = product?.nameAr || product?.nameEn || productId;
      if (!confirm(`حذف الاشتراك "${productName}"؟`)) return;
      szWrite(SZ_KEYS.products, szGetProducts().filter((item) => item.id !== productId));
      szSaveCart(szCart().filter((item) => item.productId !== productId));
      const form = document.querySelector("[data-product-form]");
      if (form?.querySelector(`[name="id"]`)?.value === productId) form.style.display = "none";
      renderTable();
    }
    const addOptionBtn = event.target.closest("[data-add-product-option]");
    if (addOptionBtn && document.querySelector("[data-product-form]")?.contains(addOptionBtn)) {
      document.querySelector("[data-product-options-editor]")?.insertAdjacentHTML("beforeend", szOptionRow({ labelAr: "شهر واحد", labelEn: "1 month", price: 0 }));
    }
    const removeOptionBtn = event.target.closest("[data-remove-product-option]");
    if (removeOptionBtn && document.querySelector("[data-product-form]")?.contains(removeOptionBtn)) {
      const rows = document.querySelectorAll("[data-option-row]");
      if (rows.length <= 1) {
        alert("لازم تسيب خيار واحد على الأقل.");
        return;
      }
      removeOptionBtn.closest("[data-option-row]")?.remove();
    }
  });
  document.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-product-form]")) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const products = szGetProducts();
    const id = data.id || szSlug(data.nameEn || data.nameAr);
    const options = szReadProductOptions(event.target);
    const firstOption = options[0] || { labelAr: "الخيار الأساسي", labelEn: "Default", price: 0 };
    const next = {
      ...products.find((item) => item.id === id),
      ...data,
      id,
      price: Number(firstOption.price || 0),
      oldPrice: Number(data.oldPrice || 0),
      durationAr: firstOption.labelAr,
      durationEn: firstOption.labelEn,
      options,
      featured: event.target.featured.checked,
      active: event.target.active.checked
    };
    const index = products.findIndex((item) => item.id === id);
    if (index >= 0) products[index] = next;
    else products.push(next);
    szWrite(SZ_KEYS.products, products);
    renderTable();
    event.target.style.display = "none";
  });
  renderTable();
}

function szEscapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function szPlainText(value) {
  const el = document.createElement("textarea");
  el.innerHTML = String(value ?? "");
  return el.value;
}

function szDownloadExcelSheet(fileName, columns, rows) {
  const table = `
    <table>
      <thead><tr>${columns.map((column) => `<th>${szEscapeHtml(column)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${szEscapeHtml(cell ?? "")}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${table}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = `${szSafeFileName(fileName)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function szExportProductsSheet() {
  const sections = szGetSections();
  const rows = szGetProducts().map((product) => {
    const section = sections.find((item) => item.id === product.sectionId);
    const options = szProductOptionsForAdmin(product).map((option) => `${option.labelAr || option.labelEn}: ${option.price}`).join(" | ");
    return [
      product.id,
      product.nameAr || product.nameEn || "",
      product.provider || "",
      section?.titleAr || product.sectionId || "",
      product.price || "",
      product.oldPrice || "",
      options,
      product.active !== false ? "ظاهر" : "مخفي"
    ];
  });
  szDownloadExcelSheet("softwarezawy-products", ["ID", "الاشتراك", "المزود", "القسم", "السعر", "قبل الخصم", "الخيارات", "الحالة"], rows);
}

function szExportOrdersSheet(orders = szGetOrders()) {
  const rows = orders.map((order) => [
    order.id,
    szFormatOrderDate(order.createdAt),
    order.customer?.name || "",
    order.customer?.phone || "",
    order.customer?.email || "",
    (order.items || []).map((item) => `${item.nameAr || item.nameEn || "خدمة"} - ${item.optionLabel || ""} × ${item.qty || 1}`).join(" | "),
    order.subtotal || "",
    order.discount || 0,
    order.total || "",
    order.coupon || "",
    szOrderStatusLabel(order.status),
    order.customer?.notes || ""
  ]);
  szDownloadExcelSheet("softwarezawy-orders", ["رقم الطلب", "التاريخ", "العميل", "الهاتف", "البريد", "الاشتراكات", "قبل الخصم", "الخصم", "الإجمالي", "الكوبون", "الحالة", "ملاحظات"], rows);
}

function szBooleanSettingValue(value) {
  return value === true || value === "true";
}

function szExtractMetaPixelId(value) {
  const text = String(value ?? "").trim();
  if (/^\d{6,}$/.test(text)) return text;
  return text.match(/\b\d{6,}\b/)?.[0] || "";
}

function szRenderSettingField(key, value) {
  const safeKey = szEscapeHtml(key);
  const safeValue = szEscapeHtml(value);
  if (key === "emailjsEnabled" || key === "metaPixelEnabled") {
    const enabled = szBooleanSettingValue(value);
    return `
      <label>${safeKey}
        <select name="${safeKey}">
          <option value="true" ${enabled ? "selected" : ""}>true</option>
          <option value="false" ${enabled ? "" : "selected"}>false</option>
        </select>
      </label>
    `;
  }
  if (key === "metaPixelId") {
    return `
      <label class="full">${safeKey}
        <input name="${safeKey}" value="${safeValue}" inputmode="numeric" placeholder="مثال: 1755088885498975">
        <small>اكتب رقم Meta Pixel فقط، وليس كود البيكسل الكامل.</small>
      </label>
    `;
  }
  return `<label>${safeKey}<input name="${safeKey}" value="${safeValue}"></label>`;
}

function szReadSettingsForm(form) {
  const data = Object.fromEntries(new FormData(form));
  data.emailjsEnabled = data.emailjsEnabled === "true";
  data.metaPixelEnabled = data.metaPixelEnabled === "true";
  data.metaPixelId = szExtractMetaPixelId(data.metaPixelId);
  return { ...szGetSettings(), ...data };
}

function szOrderStatusLabel(status) {
  const labels = {
    new: "جديد",
    pending: "قيد المتابعة",
    confirmed: "تم التأكيد",
    paid: "مدفوع",
    done: "مكتمل",
    cancelled: "ملغي"
  };
  return labels[status] || status || "جديد";
}

function szFormatOrderDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

function szInvoiceFromOrder(order) {
  const base = szDefaultInvoice();
  const itemsText = (order.items || []).map((item) => {
    const name = item.nameAr || item.nameEn || "خدمة";
    const description = [item.provider, item.optionName, item.optionLabel].filter(Boolean).join(" - ");
    return `${name} | ${description || "اشتراك SoftwareZawy"} | ${item.qty || 1} | ${item.price || item.total || 0}`;
  }).join("\n");
  return {
    ...base,
    title: "فاتورة طلب",
    invoiceNo: String(order.id || Date.now()),
    date: new Date(order.confirmedAt || order.createdAt || Date.now()).toISOString().slice(0, 10),
    customerName: order.customer?.name || base.customerName,
    customerPhone: order.customer?.phone || "",
    customerEmail: order.customer?.email || "",
    customerAddress: order.customer?.notes || "",
    paymentMethod: order.payment?.method || order.paymentMethod || base.paymentMethod,
    paymentReference: order.payment?.reference || order.paymentReference || "",
    statusLabel: szOrderStatusLabel(order.status || "confirmed"),
    stampText: "تم التأكيد",
    itemsText: itemsText || base.itemsText,
    discount: Number(order.discount || 0),
    tax: 0,
    notes: `فاتورة مرتبطة بالطلب ${order.id}. شكرا لاختيارك SoftwareZawy. يتم تفعيل الاشتراك حسب الاتفاق وسياسة الخدمة.`
  };
}

function szSafeFileName(value) {
  return String(value || "invoice")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 90) || "invoice";
}

function szInvoiceDocumentHtml(invoiceData, documentTitle) {
  const title = szSafeFileName(documentTitle || invoiceData.invoiceNo || "invoice");
  const baseHref = new URL(".", location.href).href;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="${szEscapeHtml(baseHref)}">
  <title>${szEscapeHtml(title)}</title>
  <link rel="stylesheet" href="assets/softwarezawy-site.css?v=20260703-3">
  <style>
    html, body { margin:0; }
    body.invoice-download-page { background:#eef5f7; padding:18px; }
    .invoice-download-shell { width:min(100%, 210mm); margin:0 auto; }
    .invoice-download-actions { display:flex; justify-content:flex-end; gap:10px; margin-bottom:12px; }
    .invoice-download-actions button { border:0; border-radius:8px; padding:10px 14px; background:#10202b; color:#fff; font:700 14px system-ui; cursor:pointer; }
    .invoice-download-shell .invoice-paper { margin:auto; }
    @page { size:A4; margin:0; }
    @media print {
      body.invoice-download-page { padding:0 !important; background:#fff !important; }
      .invoice-download-actions { display:none !important; }
      .invoice-download-shell { width:210mm !important; margin:0 !important; }
    }
  </style>
</head>
<body class="invoice-download-page">
  <main class="invoice-download-shell">
    <div class="invoice-download-actions"><button type="button" onclick="window.print()">طباعة / حفظ PDF</button></div>
    ${szInvoicePreview(invoiceData)}
  </main>
</body>
</html>`;
}

function szDownloadOrderInvoice(order) {
  const invoice = szInvoiceFromOrder(order);
  szWrite(SZ_KEYS.invoice, invoice);
  const fileName = `${szSafeFileName(order.id || invoice.invoiceNo)}.html`;
  const blob = new Blob([szInvoiceDocumentHtml(invoice, order.id || invoice.invoiceNo)], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function szCollectOrderPayment(order) {
  const currentMethod = order.payment?.method || order.paymentMethod || "فودافون كاش";
  const method = prompt(`طريقة الدفع للطلب ${order.id}:`, currentMethod);
  if (method === null) return null;
  const cleanMethod = method.trim();
  if (!cleanMethod) {
    alert("اكتب طريقة الدفع قبل تأكيد الطلب.");
    return null;
  }
  const currentReference = order.payment?.reference || order.paymentReference || "";
  const reference = prompt("اكتب كود الدفع أو رقم الهاتف الذي تم الدفع منه:", currentReference);
  if (reference === null) return null;
  return {
    method: cleanMethod,
    reference: reference.trim()
  };
}

function szConfirmOrder(orderId, payment = {}) {
  const orders = szGetOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) return false;
  orders[index] = {
    ...orders[index],
    status: "confirmed",
    updatedAt: new Date().toISOString(),
    confirmedAt: orders[index].confirmedAt || new Date().toISOString(),
    payment: {
      method: payment.method || orders[index].payment?.method || orders[index].paymentMethod || "",
      reference: payment.reference || orders[index].payment?.reference || orders[index].paymentReference || ""
    }
  };
  szWrite(SZ_KEYS.orders, orders);
  return true;
}

function szFindMessageValue(lines, labels) {
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(?:${labelPattern})\\s*[:：-]\\s*(.+)`, "i");
  const found = lines.map((line) => line.match(regex)?.[1]?.trim()).find(Boolean);
  return found || "";
}

function szParseMoney(value) {
  const match = String(value || "").replace(/[,\u066C]/g, "").match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
}

function szParseOrderItemsFromMessage(lines) {
  const itemLines = lines.filter((line) => /^[-•*]\s*/.test(line) || /×|x|\bاشتراك\b|\bSubscription\b/i.test(line));
  const parsed = itemLines.map((line) => {
    const clean = line.replace(/^[-•*]\s*/, "").trim();
    const qtyMatch = clean.match(/[×x]\s*(\d+)/i);
    const price = szParseMoney(clean.split(":").pop());
    const namePart = clean.split(/[(:|-]/)[0].trim() || clean;
    return {
      productId: "",
      nameAr: namePart,
      nameEn: namePart,
      provider: clean.match(/\(([^)]+)\)/)?.[1] || "",
      optionName: "المدة",
      optionLabel: clean.match(/(?:المدة|Duration)\s*[:：]\s*([^×x:]+)/i)?.[1]?.trim() || "",
      qty: qtyMatch ? Number(qtyMatch[1]) : 1,
      price: price || 0,
      total: price || 0
    };
  }).filter((item) => item.nameAr);
  return parsed.length ? parsed : [{ productId: "", nameAr: "طلب يدوي", nameEn: "Manual order", provider: "SoftwareZawy", optionName: "المدة", optionLabel: "", qty: 1, price: 0, total: 0 }];
}

function szCreateOrderFromMessage(message) {
  const lines = String(message || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const items = szParseOrderItemsFromMessage(lines);
  const total = szParseMoney(szFindMessageValue(lines, ["الإجمالي", "Total", "Final total"])) || items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const discount = szParseMoney(szFindMessageValue(lines, ["الخصم", "Discount"]));
  const id = lines.join(" ").match(/\bSZ-\d+\b/i)?.[0] || `SZ-${Date.now()}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: {
      name: szFindMessageValue(lines, ["الاسم", "Name"]) || "عميل واتساب",
      phone: szFindMessageValue(lines, ["الهاتف", "Phone", "موبايل", "رقم الهاتف"]),
      email: szFindMessageValue(lines, ["البريد", "Email"]),
      notes: szFindMessageValue(lines, ["ملاحظات", "Notes"]) || message
    },
    items,
    coupon: (szFindMessageValue(lines, ["الكوبون", "Coupon"]).match(/[A-Z0-9_-]+/i)?.[0] || "").toUpperCase(),
    subtotal: Math.max(total + discount, items.reduce((sum, item) => sum + Number(item.total || 0), 0)),
    discount,
    total,
    status: "new",
    source: "manual-message"
  };
}

function szOpenManualOrderForm(order = null) {
  const form = document.querySelector("[data-manual-order-form]");
  if (!form) return;
  form.style.display = "grid";
  form.innerHTML = `
    <div class="form-section full"><h3>إضافة طلب من رسالة</h3></div>
    <label class="full">رسالة الطلب<textarea name="message" placeholder="الصق رسالة واتساب هنا...">${szEscapeHtml(order?.customer?.notes || "")}</textarea></label>
    <div class="notice full">الصيغة المدعومة هي نفس رسالة الطلب من السلة: الاسم، الهاتف، البريد، الاشتراكات، الخصم، والإجمالي. لو البيانات ناقصة، هيتم حفظ الطلب كطلب يدوي ويمكنك الرجوع للرسالة داخل الملاحظات.</div>
    <div class="toolbar full">
      <button class="btn primary" type="submit">إنشاء الطلب</button>
      <button class="btn ghost" type="button" data-cancel-manual-order>إلغاء</button>
    </div>
  `;
}

function szRenderOrdersAdmin() {
  szAdminShell("orders");
  const main = document.querySelector("[data-admin-main]");
  const render = () => {
    const orders = szGetOrders();
    const rows = orders.map((order) => {
      const confirmed = szOrderIsConfirmed(order);
      const items = (order.items || []).map((item) => {
        const name = item.nameAr || item.nameEn || "خدمة";
        return `${szEscapeHtml(name)} × ${szEscapeHtml(item.qty || 1)}`;
      }).join("<br>");
      return `
        <tr>
          <td><strong>${szEscapeHtml(order.id)}</strong><small>${szFormatOrderDate(order.createdAt)}</small></td>
          <td>${szEscapeHtml(order.customer?.name || "-")}</td>
          <td>${szEscapeHtml(order.customer?.phone || "-")}</td>
          <td>${szEscapeHtml(order.customer?.email || "-")}</td>
          <td class="order-items">${items || "-"}</td>
          <td>${szMoney(order.total)}</td>
          <td><span class="status-pill">${szEscapeHtml(szOrderStatusLabel(order.status))}</span></td>
          <td>
            <div class="row-actions">
              ${confirmed ? `
                <button class="btn primary" type="button" data-download-order-invoice="${szEscapeHtml(order.id)}">تحميل الفاتورة</button>
                <button class="btn ghost" type="button" data-invoice-order="${szEscapeHtml(order.id)}">فتح</button>
              ` : `<button class="btn primary" type="button" data-confirm-order="${szEscapeHtml(order.id)}">تأكيد</button>`}
              <button class="btn danger" type="button" data-delete-order="${szEscapeHtml(order.id)}">حذف</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
    main.innerHTML = `
      <div class="toolbar">
        <div><p class="eyebrow">Orders</p><h1>الطلبات</h1></div>
        <div class="row-actions">
          <button class="btn primary" type="button" data-open-manual-order>إضافة طلب</button>
          <button class="btn ghost" type="button" data-export-orders ${orders.length ? "" : "disabled"}>تصدير الطلبات Excel</button>
          <button class="btn danger" type="button" data-clear-orders ${orders.length ? "" : "disabled"}>حذف كل الطلبات</button>
        </div>
      </div>
      <form class="form-panel form-grid" data-manual-order-form style="margin-top:18px;display:none"></form>
      ${orders.length ? `
        <div class="table-wrap">
          <table class="orders-table">
            <thead><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>البريد</th><th>الاشتراكات</th><th>الإجمالي</th><th>الحالة</th><th>إجراء</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      ` : `<div class="empty">لا توجد طلبات محفوظة حاليا.</div>`}
    `;
  };
  main.addEventListener("click", (event) => {
    const openManualBtn = event.target.closest("[data-open-manual-order]");
    if (openManualBtn) szOpenManualOrderForm();
    const exportBtn = event.target.closest("[data-export-orders]");
    if (exportBtn && !exportBtn.disabled) szExportOrdersSheet();
    const cancelManualBtn = event.target.closest("[data-cancel-manual-order]");
    if (cancelManualBtn) document.querySelector("[data-manual-order-form]").style.display = "none";
    const clearBtn = event.target.closest("[data-clear-orders]");
    if (clearBtn && !clearBtn.disabled && confirm("حذف كل الطلبات المحفوظة؟")) {
      szWrite(SZ_KEYS.orders, []);
      render();
    }
    const confirmBtn = event.target.closest("[data-confirm-order]");
    if (confirmBtn) {
      const orderId = confirmBtn.dataset.confirmOrder;
      const order = szGetOrders().find((item) => item.id === orderId);
      if (!order) return;
      const payment = szCollectOrderPayment(order);
      if (!payment) return;
      if (!confirm(`تأكيد الطلب ${orderId} بطريقة دفع ${payment.method}؟ بعد التأكيد سيظهر زر تحميل الفاتورة.`)) return;
      if (szConfirmOrder(orderId, payment)) render();
    }
    const downloadBtn = event.target.closest("[data-download-order-invoice]");
    if (downloadBtn) {
      const order = szGetOrders().find((item) => item.id === downloadBtn.dataset.downloadOrderInvoice);
      if (order) szDownloadOrderInvoice(order);
    }
    const invoiceBtn = event.target.closest("[data-invoice-order]");
    if (invoiceBtn) {
      const order = szGetOrders().find((item) => item.id === invoiceBtn.dataset.invoiceOrder);
      if (!order) return;
      szWrite(SZ_KEYS.invoice, szInvoiceFromOrder(order));
      location.href = "softwarezawy-admin-invoice.html";
    }
    const deleteBtn = event.target.closest("[data-delete-order]");
    if (deleteBtn) {
      const orderId = deleteBtn.dataset.deleteOrder;
      if (!confirm(`حذف الطلب ${orderId}؟`)) return;
      szWrite(SZ_KEYS.orders, szGetOrders().filter((order) => order.id !== orderId));
      render();
    }
  });
  main.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-manual-order-form]");
    if (!form) return;
    event.preventDefault();
    const message = new FormData(form).get("message");
    if (!String(message || "").trim()) {
      alert("الصق رسالة الطلب الأول.");
      return;
    }
    const order = szCreateOrderFromMessage(message);
    const orders = szGetOrders().filter((item) => item.id !== order.id);
    orders.unshift(order);
    szWrite(SZ_KEYS.orders, orders);
    szCreateCloudOrder(order).catch((error) => console.warn("SoftwareZawy cloud order sync failed:", error));
    render();
  });
  render();
}

function szDefaultInvoice() {
  const settings = szGetSettings();
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: "فاتورة",
    subtitle: "SoftwareZawy Programming & Tech Solutions",
    businessName: settings.brandName || "SoftwareZawy",
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    date: today,
    customerName: "اسم العميل",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    paymentMethod: "فودافون كاش / إنستاباي / تحويل بنكي",
    paymentReference: "",
    statusLabel: "مطلوب السداد",
    accentColor: "#31d7ff",
    secondaryColor: "#76ff91",
    paperColor: "#ffffff",
    softColor: "#f7fbfd",
    textColor: "#10202b",
    mutedColor: "#5b6d78",
    borderColor: "#dbe8ef",
    logoUrl: "assets/softwarezawy-mark.svg",
    logoSize: 190,
    radius: 10,
    headerStyle: "split",
    watermarkText: "SoftwareZawy",
    watermarkOpacity: 0.06,
    stampText: "تمت المراجعة",
    signatureName: "SoftwareZawy",
    signatureRole: "Programming & Tech Solutions",
    notes: "شكرا لاختيارك SoftwareZawy. يتم تفعيل الاشتراك حسب الاتفاق وسياسة الخدمة.",
    footer: `${settings.supportEmail} - ${settings.domain}`,
    itemsText: "ChatGPT Plus | اشتراك AI لمدة شهر | 1 | 950\nCanva Pro | اشتراك تصميم لمدة شهر | 1 | 260",
    discount: 0,
    tax: 0
  };
}

function szGetInvoice() {
  return { ...szDefaultInvoice(), ...(szRead(SZ_KEYS.invoice, {}) || {}) };
}

function szSafeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color) ? color : fallback;
}

function szSafeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function szInvoiceHeaderClass(value) {
  return ["split", "centered", "compact"].includes(value) ? value : "split";
}

function szNormalizeInvoice(invoice) {
  const merged = { ...szDefaultInvoice(), ...(invoice || {}) };
  return {
    ...merged,
    accentColor: szSafeColor(merged.accentColor, "#31d7ff"),
    secondaryColor: szSafeColor(merged.secondaryColor, "#76ff91"),
    paperColor: szSafeColor(merged.paperColor, "#ffffff"),
    softColor: szSafeColor(merged.softColor, "#f7fbfd"),
    textColor: szSafeColor(merged.textColor, "#10202b"),
    mutedColor: szSafeColor(merged.mutedColor, "#5b6d78"),
    borderColor: szSafeColor(merged.borderColor, "#dbe8ef"),
    logoSize: szSafeNumber(merged.logoSize, 190, 90, 280),
    radius: szSafeNumber(merged.radius, 10, 0, 28),
    watermarkOpacity: szSafeNumber(merged.watermarkOpacity, 0.06, 0, 0.2),
    discount: Number(merged.discount || 0),
    tax: Number(merged.tax || 0),
    headerStyle: szInvoiceHeaderClass(merged.headerStyle)
  };
}

function szParseInvoiceItems(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const qty = Math.max(0, Number(parts[2] || 1));
      const price = Math.max(0, Number(parts[3] || 0));
      return {
        name: parts[0] || "خدمة",
        description: parts[1] || "",
        qty,
        price,
        total: qty * price
      };
    });
}

function szInvoicePreview(invoiceData) {
  const invoice = szNormalizeInvoice(invoiceData);
  const items = szParseInvoiceItems(invoice.itemsText);
  const densityClass = items.length > 16
    ? "invoice-items-overflow"
    : items.length > 10
      ? "invoice-items-dense"
      : items.length > 5
        ? "invoice-items-many"
        : "invoice-items-regular";
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = invoice.discount;
  const tax = invoice.tax;
  const total = subtotal - discount + tax;
  const style = [
    `--invoice-accent:${invoice.accentColor}`,
    `--invoice-secondary:${invoice.secondaryColor}`,
    `--invoice-paper:${invoice.paperColor}`,
    `--invoice-soft:${invoice.softColor}`,
    `--invoice-text:${invoice.textColor}`,
    `--invoice-muted:${invoice.mutedColor}`,
    `--invoice-border:${invoice.borderColor}`,
    `--invoice-radius:${invoice.radius}px`,
    `--invoice-logo-size:${invoice.logoSize}px`,
    `--invoice-watermark-opacity:${invoice.watermarkOpacity}`
  ].join(";");
  const itemRows = items.length ? items.map((item) => `
    <tr>
      <td>${szEscapeHtml(item.name)}</td>
      <td>${szEscapeHtml(item.description)}</td>
      <td>${szEscapeHtml(item.qty)}</td>
      <td>${szMoney(item.price)}</td>
      <td>${szMoney(item.total)}</td>
    </tr>
  `).join("") : `<tr><td colspan="5">لا توجد بنود في الفاتورة.</td></tr>`;
  return `
    <article class="invoice-paper invoice-${invoice.headerStyle} ${densityClass}" style="${style}">
      ${invoice.watermarkText ? `<span class="invoice-watermark">${szEscapeHtml(invoice.watermarkText)}</span>` : ""}
      <header class="invoice-header">
        <div class="invoice-brand">
          <img src="${szEscapeHtml(invoice.logoUrl || "assets/softwarezawy-mark.svg")}" alt="SoftwareZawy">
          <div>
            <strong>${szEscapeHtml(invoice.businessName)}</strong>
            <span>${szEscapeHtml(invoice.subtitle)}</span>
          </div>
        </div>
        <div class="invoice-title-block">
          <span class="invoice-status">${szEscapeHtml(invoice.statusLabel)}</span>
          <h2>${szEscapeHtml(invoice.title)}</h2>
          <p>${szEscapeHtml(invoice.invoiceNo)}</p>
        </div>
      </header>
      <section class="invoice-meta">
        <div><span>رقم الفاتورة</span><strong>${szEscapeHtml(invoice.invoiceNo)}</strong></div>
        <div><span>التاريخ</span><strong>${szEscapeHtml(invoice.date)}</strong></div>
        <div><span>الحالة</span><strong>${szEscapeHtml(invoice.statusLabel)}</strong></div>
      </section>
      <section class="invoice-parties">
        <div>
          <span>صادرة من</span>
          <strong>${szEscapeHtml(invoice.businessName)}</strong>
          <p>${szEscapeHtml(invoice.subtitle)}</p>
          <small>${szEscapeHtml(invoice.footer)}</small>
        </div>
        <div>
          <span>صادرة إلى</span>
          <strong>${szEscapeHtml(invoice.customerName)}</strong>
          <p>${szEscapeHtml(invoice.customerPhone || "-")} ${invoice.customerEmail ? `- ${szEscapeHtml(invoice.customerEmail)}` : ""}</p>
          ${invoice.customerAddress ? `<small>${szEscapeHtml(invoice.customerAddress)}</small>` : ""}
        </div>
      </section>
      <div class="table-wrap invoice-table"><table><thead><tr><th>الخدمة</th><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>
        ${itemRows}
      </tbody></table></div>
      <section class="invoice-bottom">
        <div class="invoice-payment">
          <span>طريقة الدفع</span>
          <strong>${szEscapeHtml(invoice.paymentMethod)}</strong>
          ${invoice.paymentReference ? `<small class="invoice-payment-reference">كود/رقم الدفع: ${szEscapeHtml(invoice.paymentReference)}</small>` : ""}
          <p>${szEscapeHtml(invoice.notes)}</p>
        </div>
        <section class="invoice-total">
          <div><span>الإجمالي الفرعي</span><strong>${szMoney(subtotal)}</strong></div>
          <div><span>الخصم</span><strong>${szMoney(discount)}</strong></div>
          <div><span>ضريبة/رسوم</span><strong>${szMoney(tax)}</strong></div>
          <div class="grand"><span>الإجمالي النهائي</span><strong>${szMoney(total)}</strong></div>
        </section>
      </section>
      <footer class="invoice-footer">
        <span>${szEscapeHtml(invoice.footer)}</span>
        <strong>${szEscapeHtml(invoice.stampText)}</strong>
        <small>${szEscapeHtml(invoice.signatureName)} - ${szEscapeHtml(invoice.signatureRole)}</small>
      </footer>
    </article>
  `;
}

function szRenderInvoiceAdmin() {
  szAdminShell("invoice");
  const main = document.querySelector("[data-admin-main]");
  const invoice = szNormalizeInvoice(szGetInvoice());
  const selected = (value) => invoice.headerStyle === value ? "selected" : "";
  main.innerHTML = `
    <div class="toolbar">
      <div><p class="eyebrow">Invoice</p><h1>إنشاء فاتورة</h1></div>
      <div class="toolbar invoice-actions"><button class="btn ghost" type="button" data-reset-invoice>تيمبلت جديد</button><button class="btn primary" type="button" data-print-invoice>طباعة</button></div>
    </div>
    <div class="admin-layout invoice-admin-layout">
      <form class="form-panel form-grid invoice-form" data-invoice-form>
        <div class="form-section full"><h3>بيانات الفاتورة</h3></div>
        <label>عنوان الفاتورة<input name="title" value="${szEscapeHtml(invoice.title)}"></label>
        <label>اسم النشاط<input name="businessName" value="${szEscapeHtml(invoice.businessName)}"></label>
        <label>العنوان الفرعي<input name="subtitle" value="${szEscapeHtml(invoice.subtitle)}"></label>
        <label>رقم الفاتورة<input name="invoiceNo" value="${szEscapeHtml(invoice.invoiceNo)}"></label>
        <label>التاريخ<input name="date" type="date" value="${szEscapeHtml(invoice.date)}"></label>
        <label>حالة الفاتورة<input name="statusLabel" value="${szEscapeHtml(invoice.statusLabel)}"></label>

        <div class="form-section full"><h3>بيانات العميل</h3></div>
        <label>اسم العميل<input name="customerName" value="${szEscapeHtml(invoice.customerName)}"></label>
        <label>هاتف العميل<input name="customerPhone" value="${szEscapeHtml(invoice.customerPhone)}"></label>
        <label>بريد العميل<input name="customerEmail" value="${szEscapeHtml(invoice.customerEmail)}"></label>
        <label>طريقة الدفع<input name="paymentMethod" value="${szEscapeHtml(invoice.paymentMethod)}"></label>
        <label>كود/رقم الدفع<input name="paymentReference" value="${szEscapeHtml(invoice.paymentReference || "")}"></label>
        <label class="full">عنوان/ملاحظات العميل<textarea name="customerAddress">${szEscapeHtml(invoice.customerAddress)}</textarea></label>

        <div class="form-section full"><h3>البنود والحساب</h3></div>
        <label>خصم<input name="discount" type="number" value="${invoice.discount}"></label>
        <label>ضريبة/رسوم<input name="tax" type="number" value="${invoice.tax}"></label>
        <label class="full">بنود الفاتورة<textarea name="itemsText" placeholder="الخدمة | الوصف | الكمية | السعر">${szEscapeHtml(invoice.itemsText)}</textarea></label>
        <label class="full">ملاحظات الفاتورة<textarea name="notes">${szEscapeHtml(invoice.notes)}</textarea></label>

        <div class="form-section full"><h3>الشكل</h3></div>
        <label>رابط اللوجو<input name="logoUrl" value="${szEscapeHtml(invoice.logoUrl)}"></label>
        <label>شكل الرأس<select name="headerStyle"><option value="split" ${selected("split")}>متوازن</option><option value="centered" ${selected("centered")}>متوسط</option><option value="compact" ${selected("compact")}>مختصر</option></select></label>
        <label>لون أساسي<input name="accentColor" type="color" value="${invoice.accentColor}"></label>
        <label>لون ثانوي<input name="secondaryColor" type="color" value="${invoice.secondaryColor}"></label>
        <label>لون الورقة<input name="paperColor" type="color" value="${invoice.paperColor}"></label>
        <label>لون الخلفيات<input name="softColor" type="color" value="${invoice.softColor}"></label>
        <label>لون النص<input name="textColor" type="color" value="${invoice.textColor}"></label>
        <label>لون النص الهادئ<input name="mutedColor" type="color" value="${invoice.mutedColor}"></label>
        <label>مقاس اللوجو<input name="logoSize" type="range" min="90" max="280" value="${invoice.logoSize}"></label>
        <label>استدارة الزوايا<input name="radius" type="range" min="0" max="28" value="${invoice.radius}"></label>
        <label>علامة مائية<input name="watermarkText" value="${szEscapeHtml(invoice.watermarkText)}"></label>
        <label>وضوح العلامة<input name="watermarkOpacity" type="range" min="0" max="0.2" step="0.01" value="${invoice.watermarkOpacity}"></label>
        <label>الختم<input name="stampText" value="${szEscapeHtml(invoice.stampText)}"></label>
        <label>اسم التوقيع<input name="signatureName" value="${szEscapeHtml(invoice.signatureName)}"></label>
        <label>صفة التوقيع<input name="signatureRole" value="${szEscapeHtml(invoice.signatureRole)}"></label>
        <label class="full">الفوتر<input name="footer" value="${szEscapeHtml(invoice.footer)}"></label>
        <button class="btn primary full" type="submit">حفظ الفاتورة</button>
      </form>
      <div class="invoice-preview" data-invoice-preview>${szInvoicePreview(invoice)}</div>
    </div>
  `;
  const form = document.querySelector("[data-invoice-form]");
  const preview = document.querySelector("[data-invoice-preview]");
  const current = () => szNormalizeInvoice(Object.fromEntries(new FormData(form)));
  const refresh = () => {
    const data = current();
    preview.innerHTML = szInvoicePreview(data);
  };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = current();
    szWrite(SZ_KEYS.invoice, data);
    refresh();
    alert("تم حفظ الفاتورة.");
  });
  document.querySelector("[data-reset-invoice]").addEventListener("click", () => {
    if (!confirm("بدء فاتورة جديدة؟")) return;
    szWrite(SZ_KEYS.invoice, szDefaultInvoice());
    szRenderInvoiceAdmin();
  });
  document.querySelector("[data-print-invoice]").addEventListener("click", () => window.print());
}

function szSlug(value) {
  return String(value || "section")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "") || `section-${Date.now()}`;
}

function szRenderVisualAdmin() {
  szAdminShell("visual");
  const main = document.querySelector("[data-admin-main]");
  main.innerHTML = `
    <div class="toolbar"><div><p class="eyebrow">Visual</p><h1>التعديل البصري للرئيسية</h1></div><button class="btn primary" data-add-section>إضافة قسم</button></div>
    <div class="notice">يمكنك زيادة عدد أقسام الصفحة الرئيسية هنا. كل قسم جديد يظهر تلقائيا في الرئيسية والقائمة الجانبية، ويستخدم صفحة القسم الديناميكية بنفس الرابط.</div>
    <div class="stack" data-sections-editor style="margin-top:18px"></div>
  `;
  const render = () => {
    const sections = szGetSections();
    document.querySelector("[data-sections-editor]").innerHTML = sections.map((section, index) => `
      <form class="form-panel form-grid" data-section-form="${section.id}">
        <input type="hidden" name="oldId" value="${section.id}">
        <label>معرف القسم<input name="id" value="${section.id}" required></label>
        <label>الترتيب<input name="order" type="number" value="${section.order || index + 1}"></label>
        <label>العنوان عربي<input name="titleAr" value="${section.titleAr || ""}" required></label>
        <label>العنوان إنجليزي<input name="titleEn" value="${section.titleEn || ""}" required></label>
        <label>النص الصغير عربي<input name="eyebrowAr" value="${section.eyebrowAr || ""}"></label>
        <label>النص الصغير إنجليزي<input name="eyebrowEn" value="${section.eyebrowEn || ""}"></label>
        <label>الأيقونة<input name="icon" value="${section.icon || "AI"}"></label>
        <label>الخلفية Gradient<input name="gradient" value="${section.gradient || "linear-gradient(135deg, #31d7ff, #76ff91)"}"></label>
        ${szAdminImageField("imageUrl", "صورة خلفية القسم", section.imageUrl || "")}
        <div class="admin-section-preview full">
          <div class="admin-preview-card" style="background:${section.imageUrl ? `linear-gradient(180deg, rgba(6,16,24,.18), rgba(6,16,24,.78)), url('${szEscapeHtml(section.imageUrl)}') center/cover` : szEscapeHtml(section.gradient || "linear-gradient(135deg, #31d7ff, #76ff91)")};">
            <span class="section-icon">${section.icon || "AI"}</span>
            <span class="eyebrow">${section.eyebrowAr || ""}</span>
            <h3>${section.titleAr || ""}</h3>
          </div>
        </div>
        <label class="full">وصف عربي<textarea name="descriptionAr">${section.descriptionAr || ""}</textarea></label>
        <label class="full">وصف إنجليزي<textarea name="descriptionEn">${section.descriptionEn || ""}</textarea></label>
        <label><input name="visible" type="checkbox" ${section.visible !== false ? "checked" : ""}> ظاهر في الرئيسية</label>
        <div class="toolbar full">
          <button class="btn primary" type="submit">حفظ القسم</button>
          <button class="btn ghost" type="button" data-delete-section="${section.id}">حذف</button>
        </div>
      </form>
    `).join("");
    szBindAdminImageFields(document.querySelector("[data-sections-editor]"));
  };
  document.querySelector("[data-add-section]").addEventListener("click", () => {
    const sections = szGetSections();
    const id = `ai-section-${Date.now()}`;
    sections.push({
      id,
      titleAr: "قسم AI جديد",
      titleEn: "New AI Section",
      eyebrowAr: "قسم قابل للتعديل",
      eyebrowEn: "Editable section",
      descriptionAr: "اكتب وصف القسم من هنا واربط الاشتراكات به من صفحة الاشتراكات.",
      descriptionEn: "Write this section description here and assign products from products page.",
      icon: "AI",
      imageUrl: "",
      gradient: "linear-gradient(135deg, #31d7ff, #76ff91)",
      page: `softwarezawy-section.html?section=${id}`,
      order: sections.length + 1,
      visible: true
    });
    szWrite(SZ_KEYS.sections, sections);
    render();
  });
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-section-form]");
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const sections = szGetSections();
    const oldId = data.oldId;
    const id = szSlug(data.id);
    const next = {
      id,
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      eyebrowAr: data.eyebrowAr,
      eyebrowEn: data.eyebrowEn,
      descriptionAr: data.descriptionAr,
      descriptionEn: data.descriptionEn,
      icon: data.icon,
      imageUrl: data.imageUrl,
      gradient: data.gradient,
      page: `softwarezawy-section.html?section=${id}`,
      order: Number(data.order || 0),
      visible: form.visible.checked
    };
    const index = sections.findIndex((item) => item.id === oldId);
    sections[index] = next;
    const products = szGetProducts().map((product) => product.sectionId === oldId ? { ...product, sectionId: id } : product);
    szWrite(SZ_KEYS.products, products);
    szWrite(SZ_KEYS.sections, sections);
    render();
  });
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-delete-section]");
    if (!btn) return;
    if (!confirm("حذف القسم؟ الاشتراكات المرتبطة به ستحتاج اختيار قسم جديد.")) return;
    szWrite(SZ_KEYS.sections, szGetSections().filter((item) => item.id !== btn.dataset.deleteSection));
    render();
  });
  render();
}

function szRenderSettingsAdmin() {
  szAdminShell("settings");
  const main = document.querySelector("[data-admin-main]");
  const settings = { ...SOFTWAREZAWY_DEFAULTS.settings, ...szGetSettings() };
  const sync = szGetSyncConfig();
  main.innerHTML = `
    <p class="eyebrow">Settings</p><h1>الإعدادات العامة</h1>
    <div class="notice" style="margin-bottom:18px">لإعلانات فيسبوك: فعّل metaPixelEnabled واكتب رقم Meta Pixel في metaPixelId. الدومين الأساسي مضبوط على softwarezawy.shop.</div>
    <form class="form-panel form-grid" data-settings-form>
      ${Object.entries(settings).map(([key, value]) => szRenderSettingField(key, value)).join("")}
      <button class="btn primary full" type="submit">حفظ الإعدادات</button>
      <button class="btn ghost full" type="button" data-test-emailjs>اختبار EmailJS</button>
      <button class="btn ghost full" type="button" data-test-pixel>اختبار Meta Pixel</button>
    </form>
    <form class="form-panel form-grid" data-sync-form style="margin-top:18px">
      <div class="form-section full"><h3>مزامنة الأجهزة</h3></div>
      <div class="notice full">المزامنة مفعلة: أي تعديل على المنتجات أو الأقسام أو الطلبات أو الكوبونات يتم رفعه تلقائيا، وباقي الأجهزة تسحب التحديثات بشكل دوري. استخدم زر "رفع بيانات هذا الجهاز" مرة واحدة لو عايز تعتمد نسخة هذا الجهاز كنقطة بداية.</div>
      <label>syncEnabled
        <select name="enabled">
          <option value="true" ${sync.enabled ? "selected" : ""}>true</option>
          <option value="false" ${sync.enabled ? "" : "selected"}>false</option>
        </select>
      </label>
      <label>timeoutMs<input name="timeoutMs" type="number" min="1500" value="${Number(sync.timeoutMs || 4500)}"></label>
      <label>autoPull
        <select name="autoPull">
          <option value="true" ${sync.autoPull ? "selected" : ""}>true</option>
          <option value="false" ${sync.autoPull ? "" : "selected"}>false</option>
        </select>
      </label>
      <label>pullIntervalMs<input name="pullIntervalMs" type="number" min="15000" value="${Number(sync.pullIntervalMs || 15000)}"></label>
      <label class="full">syncEndpoint<input name="endpoint" value="${szEscapeHtml(sync.endpoint || "")}" placeholder="https://script.google.com/macros/s/.../exec"></label>
      <label class="full">adminSyncToken<input name="token" type="password" value="${szEscapeHtml(sync.token || "")}" placeholder="نفس التوكن الموجود في ملف Apps Script"></label>
      <button class="btn primary full" type="submit">حفظ إعدادات المزامنة</button>
      <button class="btn ghost full" type="button" data-sync-pull>سحب البيانات من السحابة</button>
      <button class="btn ghost full" type="button" data-sync-push>رفع بيانات هذا الجهاز</button>
    </form>
  `;
  document.querySelector("[data-settings-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    szWrite(SZ_KEYS.settings, szReadSettingsForm(event.target));
    alert("تم حفظ الإعدادات.");
    szRenderSettingsAdmin();
  });
  document.querySelector("[data-test-emailjs]").addEventListener("click", () => {
    alert("ضع مفاتيح EmailJS ثم اربط مكتبة EmailJS في الموقع عند الرفع الفعلي.");
  });
  document.querySelector("[data-test-pixel]").addEventListener("click", () => {
    const latest = szGetSettings();
    if (!szBooleanSettingValue(latest.metaPixelEnabled) || !latest.metaPixelId) {
      alert("فعّل metaPixelEnabled واكتب metaPixelId ثم احفظ الإعدادات أولا.");
      return;
    }
    alert(`تم تجهيز Meta Pixel رقم ${latest.metaPixelId}. افتح الموقع بعد الحفظ، ثم افحصه من Meta Events Manager أو Pixel Helper.`);
  });
  document.querySelector("[data-sync-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    szSaveSyncConfig(data);
    alert("تم حفظ إعدادات المزامنة على هذا الجهاز.");
    szRenderSettingsAdmin();
  });
  document.querySelector("[data-sync-pull]").addEventListener("click", async () => {
    const result = await szPullCloudSync({ admin: true });
    if (!result.ok && !result.skipped) {
      alert(`فشل سحب البيانات: ${result.error || "تحقق من الرابط والتوكن."}`);
      return;
    }
    alert("تم سحب البيانات المشتركة على هذا الجهاز.");
    szRenderSettingsAdmin();
  });
  document.querySelector("[data-sync-push]").addEventListener("click", async () => {
    if (!confirm("رفع بيانات هذا الجهاز سيجعل المنتجات والإعدادات والطلبات الحالية هي النسخة المشتركة لباقي الأجهزة. هل تريد المتابعة؟")) return;
    try {
      await szPushCloudSnapshot();
      alert("تم رفع بيانات هذا الجهاز للسحابة. افتح الموقع من جهاز آخر وستظهر نفس البيانات بعد التحديث.");
    } catch (error) {
      alert(`فشل رفع البيانات: ${error.message || "تحقق من الرابط والتوكن."}`);
    }
  });
}

function szNormalizeCouponCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function szCouponTypeLabel(type) {
  return type === "fixed" ? "خصم مبلغ ثابت" : "خصم نسبة مئوية";
}

function szCouponValueLabel(coupon) {
  const value = Number(coupon.value || 0);
  return coupon.type === "fixed" ? szMoney(value) : `${value.toLocaleString("ar-EG")}%`;
}

function szCouponScopeLabel(coupon) {
  const section = szGetSections().find((item) => item.id === coupon.sectionId);
  const product = szGetProducts().find((item) => item.id === coupon.productId);
  if (product) return `اشتراك: ${product.nameAr || product.nameEn}`;
  if (section) return `قسم: ${section.titleAr || section.titleEn}`;
  return "كل الاشتراكات";
}

function szCouponExpiryLabel(coupon) {
  if (!coupon.expiresAt) return "بدون انتهاء";
  const date = new Date(coupon.expiresAt);
  if (Number.isNaN(date.getTime())) return "بدون انتهاء";
  const expired = date.getTime() <= Date.now();
  return `${expired ? "منتهي" : "ينتهي"} ${date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}`;
}

function szDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function szRenderCouponsAdmin() {
  szAdminShell("coupons");
  const main = document.querySelector("[data-admin-main]");
  main.innerHTML = `
    <div class="toolbar">
      <div><p class="eyebrow">Coupons</p><h1>الكوبونات</h1></div>
      <button class="btn primary" type="button" data-new-coupon>كوبون جديد</button>
    </div>
    <div class="notice" style="margin-bottom:18px">الكوبونات هنا تتطبق مباشرة في صفحة السلة. اختار نسبة مئوية مثل AI10 أو مبلغ ثابت حسب العرض المطلوب.</div>
    <div class="coupon-summary" data-coupon-summary></div>
    <div class="table-wrap" style="margin-top:18px">
      <table class="coupons-table">
        <thead><tr><th>الكود</th><th>نوع الخصم</th><th>القيمة</th><th>النطاق</th><th>الوقت</th><th>الحالة</th><th>إجراء</th></tr></thead>
        <tbody data-coupons-table></tbody>
      </table>
    </div>
    <form class="form-panel form-grid" data-coupon-form style="margin-top:18px;display:none"></form>
  `;

  const renderTable = () => {
    const coupons = szGetCoupons();
    const activeCount = coupons.filter((coupon) => coupon.active).length;
    document.querySelector("[data-coupon-summary]").innerHTML = `
      <article class="admin-card"><h3>كل الكوبونات</h3><strong class="price">${coupons.length.toLocaleString("ar-EG")}</strong><p>كوبونات محفوظة وقابلة للتعديل.</p></article>
      <article class="admin-card"><h3>الكوبونات الفعالة</h3><strong class="price">${activeCount.toLocaleString("ar-EG")}</strong><p>تظهر للعملاء عند إدخال الكود في السلة.</p></article>
    `;
    document.querySelector("[data-coupons-table]").innerHTML = coupons.length ? coupons.map((coupon) => `
      <tr>
        <td><strong>${szEscapeHtml(coupon.code)}</strong></td>
        <td>${szEscapeHtml(szCouponTypeLabel(coupon.type))}</td>
        <td>${szEscapeHtml(szCouponValueLabel(coupon))}</td>
        <td>${szEscapeHtml(szCouponScopeLabel(coupon))}</td>
        <td>${szEscapeHtml(szCouponExpiryLabel(coupon))}</td>
        <td><span class="status-pill">${coupon.active ? "فعال" : "متوقف"}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn ghost" type="button" data-edit-coupon="${szEscapeHtml(coupon.code)}">تعديل</button>
            <button class="btn ghost" type="button" data-toggle-coupon="${szEscapeHtml(coupon.code)}">${coupon.active ? "تعطيل" : "تفعيل"}</button>
            <button class="btn danger" type="button" data-delete-coupon="${szEscapeHtml(coupon.code)}">حذف</button>
          </div>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="7">لا توجد كوبونات بعد. اضغط "كوبون جديد" لإضافة أول كوبون.</td></tr>`;
  };

  const openForm = (coupon = {}) => {
    const form = document.querySelector("[data-coupon-form]");
    const sections = szGetSections();
    const products = szGetProducts();
    form.style.display = "grid";
    form.innerHTML = `
      <input type="hidden" name="oldCode" value="${szEscapeHtml(coupon.code || "")}">
      <div class="form-section full"><h3>${coupon.code ? "تعديل كوبون" : "كوبون جديد"}</h3></div>
      <label>كود الكوبون<input name="code" value="${szEscapeHtml(coupon.code || "")}" placeholder="AI10" required></label>
      <label>نوع الخصم
        <select name="type">
          <option value="percent" ${coupon.type === "fixed" ? "" : "selected"}>نسبة مئوية</option>
          <option value="fixed" ${coupon.type === "fixed" ? "selected" : ""}>مبلغ ثابت</option>
        </select>
      </label>
      <label>القيمة<input name="value" type="number" min="0" step="0.01" value="${Number(coupon.value || 0)}" required></label>
      <label>ينتهي في<input name="expiresAt" type="datetime-local" value="${szEscapeHtml(szDateTimeLocalValue(coupon.expiresAt))}"></label>
      <label>قسم محدد
        <select name="sectionId">
          <option value="">كل الأقسام</option>
          ${sections.map((section) => `<option value="${szEscapeHtml(section.id)}" ${coupon.sectionId === section.id ? "selected" : ""}>${szEscapeHtml(section.titleAr || section.titleEn || section.id)}</option>`).join("")}
        </select>
      </label>
      <label>اشتراك محدد
        <select name="productId">
          <option value="">كل الاشتراكات</option>
          ${products.map((product) => `<option value="${szEscapeHtml(product.id)}" ${coupon.productId === product.id ? "selected" : ""}>${szEscapeHtml(product.nameAr || product.nameEn || product.id)}</option>`).join("")}
        </select>
      </label>
      <label><input name="active" type="checkbox" ${coupon.active !== false ? "checked" : ""}> كوبون فعال</label>
      <div class="toolbar full">
        <button class="btn primary" type="submit">حفظ الكوبون</button>
        <button class="btn ghost" type="button" data-cancel-coupon-form>إلغاء</button>
      </div>
    `;
  };

  main.addEventListener("click", (event) => {
    const newBtn = event.target.closest("[data-new-coupon]");
    if (newBtn) openForm({ code: "", type: "percent", value: 10, active: true });

    const editBtn = event.target.closest("[data-edit-coupon]");
    if (editBtn) {
      const coupon = szGetCoupons().find((item) => item.code === editBtn.dataset.editCoupon);
      if (coupon) openForm(coupon);
    }

    const toggleBtn = event.target.closest("[data-toggle-coupon]");
    if (toggleBtn) {
      const coupons = szGetCoupons().map((coupon) => coupon.code === toggleBtn.dataset.toggleCoupon ? { ...coupon, active: !coupon.active } : coupon);
      szWrite(SZ_KEYS.coupons, coupons);
      renderTable();
    }

    const deleteBtn = event.target.closest("[data-delete-coupon]");
    if (deleteBtn) {
      const code = deleteBtn.dataset.deleteCoupon;
      if (!confirm(`حذف الكوبون ${code}؟`)) return;
      szWrite(SZ_KEYS.coupons, szGetCoupons().filter((coupon) => coupon.code !== code));
      renderTable();
    }

    const cancelBtn = event.target.closest("[data-cancel-coupon-form]");
    if (cancelBtn) document.querySelector("[data-coupon-form]").style.display = "none";
  });

  main.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-coupon-form]");
    if (!form) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const code = szNormalizeCouponCode(data.code);
    const oldCode = szNormalizeCouponCode(data.oldCode);
    const value = Number(data.value || 0);
    if (!code) {
      alert("اكتب كود الكوبون.");
      return;
    }
    if (Number.isNaN(value) || value <= 0) {
      alert("قيمة الخصم لازم تكون أكبر من صفر.");
      return;
    }
    if (data.type === "percent" && value > 100) {
      alert("النسبة المئوية لا يمكن أن تكون أكبر من 100%.");
      return;
    }
    const coupons = szGetCoupons().filter((coupon) => coupon.code !== oldCode);
    if (coupons.some((coupon) => coupon.code === code)) {
      alert("كود الكوبون موجود بالفعل.");
      return;
    }
    coupons.push({
      code,
      type: data.type === "fixed" ? "fixed" : "percent",
      value,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : "",
      sectionId: data.sectionId || "",
      productId: data.productId || "",
      active: form.active.checked
    });
    szWrite(SZ_KEYS.coupons, coupons);
    form.style.display = "none";
    renderTable();
  });

  renderTable();
}

function szDurationFromLabel(label = "") {
  const text = String(label || "");
  const amount = Number(text.match(/\d+/)?.[0] || 1);
  if (/سنة|سنوي|year/i.test(text)) return { amount, unit: "year" };
  if (/يوم|day/i.test(text)) return { amount, unit: "day" };
  return { amount, unit: "month" };
}

function szAddDuration(date, duration) {
  const next = new Date(date);
  if (duration.unit === "year") next.setFullYear(next.getFullYear() + duration.amount);
  else if (duration.unit === "day") next.setDate(next.getDate() + duration.amount);
  else next.setMonth(next.getMonth() + duration.amount);
  return next;
}

function szRenewalRows(orders = szGetOrders()) {
  return orders.flatMap((order) => {
    const start = new Date(order.confirmedAt || order.createdAt || Date.now());
    if (Number.isNaN(start.getTime())) return [];
    return (order.items || []).map((item) => {
      const durationLabel = item.optionLabel || item.durationAr || item.durationEn || "شهر واحد";
      const end = szAddDuration(start, szDurationFromLabel(durationLabel));
      const diffDays = Math.ceil((end.getTime() - Date.now()) / 86400000);
      return {
        order,
        item,
        customer: order.customer || {},
        start,
        end,
        diffDays,
        durationLabel
      };
    });
  }).sort((a, b) => a.end - b.end);
}

function szRenewalState(row) {
  if (row.diffDays < 0) return "انتهى";
  if (row.diffDays <= 7) return "قريب";
  return "نشط";
}

function szExportRenewalsSheet(rows = szRenewalRows()) {
  szDownloadExcelSheet("softwarezawy-renewals", ["العميل", "الهاتف", "البريد", "الاشتراك", "المدة", "بداية الاشتراك", "نهاية الاشتراك", "المتبقي", "رقم الطلب"], rows.map((row) => [
    row.customer.name || "",
    row.customer.phone || "",
    row.customer.email || "",
    row.item.nameAr || row.item.nameEn || "",
    row.durationLabel,
    row.start.toLocaleDateString("ar-EG"),
    row.end.toLocaleDateString("ar-EG"),
    row.diffDays < 0 ? `متأخر ${Math.abs(row.diffDays)} يوم` : `${row.diffDays} يوم`,
    row.order.id
  ]));
}

function szRenderRenewalsAdmin() {
  szAdminShell("renewals");
  const main = document.querySelector("[data-admin-main]");
  const rows = szRenewalRows();
  const soonCount = rows.filter((row) => row.diffDays >= 0 && row.diffDays <= 7).length;
  const expiredCount = rows.filter((row) => row.diffDays < 0).length;
  main.innerHTML = `
    <div class="toolbar">
      <div><p class="eyebrow">Renewals</p><h1>التجديدات</h1></div>
      <button class="btn ghost" type="button" data-export-renewals ${rows.length ? "" : "disabled"}>تصدير التجديدات Excel</button>
    </div>
    <div class="admin-grid renewal-summary">
      <article class="admin-card"><h3>كل الاشتراكات</h3><strong class="price">${rows.length.toLocaleString("ar-EG")}</strong><p>اشتراكات محسوبة من الطلبات.</p></article>
      <article class="admin-card"><h3>تجديد قريب</h3><strong class="price">${soonCount.toLocaleString("ar-EG")}</strong><p>ينتهي خلال 7 أيام.</p></article>
      <article class="admin-card"><h3>منتهي</h3><strong class="price">${expiredCount.toLocaleString("ar-EG")}</strong><p>يحتاج تواصل سريع.</p></article>
    </div>
    ${rows.length ? `
      <div class="table-wrap" style="margin-top:18px">
        <table>
          <thead><tr><th>العميل</th><th>الهاتف</th><th>الاشتراك</th><th>المدة</th><th>بدأ يوم</th><th>ينتهي يوم</th><th>المتبقي</th><th>الحالة</th><th>الطلب</th></tr></thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${szEscapeHtml(row.customer.name || "-")}</td>
                <td>${szEscapeHtml(row.customer.phone || "-")}</td>
                <td>${szEscapeHtml(row.item.nameAr || row.item.nameEn || "-")}</td>
                <td>${szEscapeHtml(row.durationLabel)}</td>
                <td>${szEscapeHtml(row.start.toLocaleDateString("ar-EG"))}</td>
                <td>${szEscapeHtml(row.end.toLocaleDateString("ar-EG"))}</td>
                <td>${row.diffDays < 0 ? `متأخر ${Math.abs(row.diffDays).toLocaleString("ar-EG")} يوم` : `${row.diffDays.toLocaleString("ar-EG")} يوم`}</td>
                <td><span class="status-pill">${szEscapeHtml(szRenewalState(row))}</span></td>
                <td>${szEscapeHtml(row.order.id)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : `<div class="empty">لا توجد طلبات بها اشتراكات لحساب التجديدات.</div>`}
  `;
  main.querySelector("[data-export-renewals]")?.addEventListener("click", () => szExportRenewalsSheet(rows));
}

function szRenderManagersAdmin() {
  szAdminShell("managers");
  const main = document.querySelector("[data-admin-main]");
  const managers = szRead(SZ_KEYS.managers, SOFTWAREZAWY_DEFAULTS.managers);
  main.innerHTML = `<p class="eyebrow">Managers</p><h1>المديرين</h1><div class="table-wrap"><table><thead><tr><th>المستخدم</th><th>الصلاحية</th></tr></thead><tbody>${managers.map((m) => `<tr><td>${m.username}</td><td>${m.role}</td></tr>`).join("")}</tbody></table></div><div class="notice" style="margin-top:18px">الدخول المحلي للتجربة فقط، وليس نظام صلاحيات حقيقي لموقع إنتاجي.</div>`;
}

function szRefreshVisibleAdminPage() {
  const path = location.pathname;
  const activeForm = document.activeElement?.closest?.("form");
  if (activeForm && !confirm("وصل تحديث جديد من جهاز آخر. تحديث الصفحة قد يلغي البيانات غير المحفوظة في النموذج الحالي. تحديث الآن؟")) return;
  if (path.endsWith("softwarezawy-admin-dashboard.html")) return szRenderDashboard();
  if (path.endsWith("softwarezawy-admin-products.html")) return szRenderProductsAdmin();
  if (path.endsWith("softwarezawy-admin-orders.html")) return szRenderOrdersAdmin();
  if (path.endsWith("softwarezawy-admin-renewals.html")) return szRenderRenewalsAdmin();
  if (path.endsWith("softwarezawy-admin-invoice.html")) return szRenderInvoiceAdmin();
  if (path.endsWith("softwarezawy-admin-coupons.html")) return szRenderCouponsAdmin();
  if (path.endsWith("softwarezawy-admin-visual.html")) return szRenderVisualAdmin();
  if (path.endsWith("softwarezawy-admin-settings.html")) return szRenderSettingsAdmin();
  if (path.endsWith("softwarezawy-admin-managers.html")) return szRenderManagersAdmin();
}

document.addEventListener("softwarezawy:sync-updated", () => {
  if (szAdminLoggedIn()) szRefreshVisibleAdminPage();
});

szOnReady(() => {
  szAdminRequire();
  szBindLogin();
});
