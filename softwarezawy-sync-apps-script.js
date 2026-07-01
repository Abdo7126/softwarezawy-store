const SZ_SYNC_TOKEN = "CHANGE_THIS_TOKEN";
const SZ_STORE_KEY = "softwarezawy_store_v1";
const SZ_PUBLIC_KEYS = ["settings", "sections", "products", "coupons"];
const SZ_ADMIN_KEYS = ["settings", "sections", "products", "coupons", "orders", "invoice"];

function doGet(event) {
  const params = event.parameter || {};
  const scope = params.scope === "admin" ? "admin" : "public";
  const data = szReadStore();

  if (scope === "admin" && params.token !== SZ_SYNC_TOKEN) {
    return szJson({ ok: false, error: "Invalid sync token." }, params.callback);
  }

  return szJson({
    ok: true,
    data: szPick(data, scope === "admin" ? SZ_ADMIN_KEYS : SZ_PUBLIC_KEYS),
    updatedAt: data.updatedAt || ""
  }, params.callback);
}

function doPost(event) {
  const body = JSON.parse((event.postData && event.postData.contents) || "{}");
  const data = szReadStore();

  if (body.action === "createOrder") {
    const order = body.order;
    if (!order || !order.id) return szJson({ ok: false, error: "Missing order." });
    const orders = Array.isArray(data.orders) ? data.orders : [];
    data.orders = [order].concat(orders.filter((item) => item.id !== order.id)).slice(0, 500);
    data.updatedAt = new Date().toISOString();
    szWriteStore(data);
    return szJson({ ok: true });
  }

  if (body.token !== SZ_SYNC_TOKEN) {
    return szJson({ ok: false, error: "Invalid sync token." });
  }

  if (body.action === "write" && SZ_ADMIN_KEYS.indexOf(body.key) >= 0) {
    data[body.key] = body.value;
    data.updatedAt = new Date().toISOString();
    szWriteStore(data);
    return szJson({ ok: true });
  }

  if (body.action === "writeSnapshot") {
    const next = body.data || {};
    SZ_ADMIN_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(next, key)) data[key] = next[key];
    });
    data.updatedAt = new Date().toISOString();
    szWriteStore(data);
    return szJson({ ok: true });
  }

  return szJson({ ok: false, error: "Unknown sync action." });
}

function szReadStore() {
  const raw = PropertiesService.getScriptProperties().getProperty(SZ_STORE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function szWriteStore(data) {
  PropertiesService.getScriptProperties().setProperty(SZ_STORE_KEY, JSON.stringify(data));
}

function szPick(data, keys) {
  const output = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) output[key] = data[key];
  });
  return output;
}

function szJson(payload, callback) {
  if (callback && /^[A-Za-z_$][\w.$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
