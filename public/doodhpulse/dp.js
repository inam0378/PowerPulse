/* DoodhPulse (offline milk shop app) by Power Pulse.
   Everything runs inside this phone's browser. All data is kept on this phone (IndexedDB).
   Nothing is sent to Power Pulse or any server. */
(function () {
"use strict";
var VERSION = "1.0.0";
var SUPPORT_WA = "923100007049"; // Power Pulse WhatsApp (0310-0007049)
var SUPPORT_TXT = "0310-0007049";
// Public half of the Power Pulse license key pair (same pair as RestoPulse). Device codes here start with MD-.
var LICENSE_PUBLIC_KEY = "MCowBQYDK2VwAyEAVho+IQcgjVHFSStEJGUa55LXYi8TYaTDCkaEZiCqc1Q=";

/* ---------------- helpers ---------------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function uid() { var a = crypto.getRandomValues(new Uint8Array(9)); return Date.now().toString(36) + Array.from(a, function (b) { return (b % 36).toString(36); }).join(""); }
function pad(n) { return (n < 10 ? "0" : "") + n; }
function dk(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function addDays(key, n) { var p = key.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return dk(d); }
function r2(n) { return Math.round((+n || 0) * 100) / 100; }
function r3(n) { return Math.round((+n || 0) * 1000) / 1000; }
function rs(n) { n = Math.round(+n || 0); return "Rs " + (n < 0 ? "-" : "") + Math.abs(n).toLocaleString("en-PK"); }
function qf(n) { n = r3(n); return String(n); }
function fmtDate(key) { if (!key) return ""; var p = key.split("-"); return p[2] + "-" + p[1] + "-" + p[0]; }
function fmtTime(ts) { var d = new Date(ts); var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ":" + pad(m) + (h < 12 ? " AM" : " PM"); }
function b64u(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function sha256hex(s) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.from(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }); }
function waNum(p) { p = String(p || "").replace(/\D/g, ""); if (!p) return ""; if (p.indexOf("0") === 0) p = "92" + p.slice(1); else if (p.indexOf("92") !== 0 && p.length === 10) p = "92" + p; return p; }
function openWA(phone, text) { var n = waNum(phone); window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(text), "_blank"); }

/* ---------------- Urdu ---------------- */
var UR = {
  "Home": "ہوم", "Customers": "گاہک", "Sale": "سیل", "Delivery": "ڈیلیوری", "Reports": "رپورٹ",
  "Today": "آج", "Today's sale": "آج کی سیل", "Cash received": "نقد وصولی", "Udhaar given": "ادھار دیا", "Payments received": "ادھار وصولی",
  "Morning": "صبح", "Evening": "شام", "Morning delivery": "صبح کی ڈیلیوری", "Evening delivery": "شام کی ڈیلیوری",
  "Total khata due": "کل ادھار باقی", "Expenses": "اخراجات", "Products & rates": "اشیاء اور ریٹ", "Settings": "سیٹنگز", "Backup": "بیک اپ",
  "Counter sale": "کاؤنٹر سیل", "Add customer": "نیا گاہک", "Search": "تلاش", "Name": "نام", "Phone": "فون", "Address": "پتہ",
  "Save": "محفوظ کریں", "Cancel": "منسوخ", "Delete": "حذف کریں", "Edit": "تبدیل کریں", "Quantity": "مقدار", "Amount": "رقم", "Rate": "ریٹ",
  "Add to bill": "بل میں شامل کریں", "Total": "ٹوٹل", "Paid now": "ابھی ادا", "Remaining (udhaar)": "باقی (ادھار)", "Walk-in customer": "عام گاہک",
  "Save sale": "سیل محفوظ کریں", "Print": "پرنٹ", "WhatsApp": "واٹس ایپ", "New sale": "نئی سیل", "Receive payment": "رقم وصول کریں",
  "Balance": "بقایا", "Mark all delivered": "سب کو ڈیلیور کریں", "Delivered": "ڈیلیور ہو گیا", "Skip": "چھٹی", "Pending": "باقی",
  "Daily items": "روزانہ کا سامان", "Shift": "وقت", "Both": "دونوں", "None": "کوئی نہیں", "Yesterday": "کل", "Last 7 days": "پچھلے 7 دن",
  "This month": "یہ مہینہ", "Last month": "پچھلا مہینہ", "Custom": "اپنی تاریخ", "From": "سے", "To": "تک", "Total sale": "کل سیل",
  "Product-wise": "اشیاء کے حساب سے", "Net cash in hand": "ہاتھ میں نقد", "Send report on WhatsApp": "رپورٹ واٹس ایپ پر بھیجیں",
  "Language": "زبان", "Shop name": "دکان کا نام", "Receipt message": "رسید پر پیغام", "Download backup": "بیک اپ ڈاؤن لوڈ کریں",
  "Restore backup": "بیک اپ واپس لائیں", "License": "لائسنس", "Device code": "ڈیوائس کوڈ", "Activate": "ایکٹیویٹ کریں",
  "License key": "لائسنس کی", "Ledger": "کھاتہ", "Send reminder": "یاد دہانی بھیجیں", "Monthly bill": "ماہانہ بل",
  "Category": "قسم", "Note": "نوٹ", "Date": "تاریخ", "Add expense": "خرچہ شامل کریں", "Milk purchase": "دودھ کی خریداری",
  "Salary": "تنخواہ", "Rent": "کرایہ", "Bills": "بل", "Other": "دیگر", "Unit": "یونٹ", "Add product": "نئی چیز",
  "Owner PIN": "مالک کا پن", "Unlock": "کھولیں", "Opening balance": "پرانا ادھار", "Special rate": "خاص ریٹ",
  "Back": "واپس", "More": "مزید", "Udhaar": "ادھار", "Cash": "نقد", "Undo": "واپس لیں", "Deliver": "ڈیلیور",
  "Keep your data safe": "اپنا ڈیٹا محفوظ رکھیں", "Backup now": "ابھی بیک اپ کریں", "No backup for 7 days or more.": "7 دن یا زیادہ سے بیک اپ نہیں ہوا۔",
  "Customers with udhaar": "ادھار والے گاہک", "Receipt": "رسید", "Close": "بند کریں", "Export to Excel (CSV)": "ایکسل (CSV) میں نکالیں"
};
var LANG = "en";
function t(s) { return LANG === "ur" && UR[s] ? UR[s] : s; }

/* ---------------- icons ---------------- */
var IC = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.6"/>',
  cart: '<path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
  truck: '<path d="M2 6h11v10H2zM13 10h4l4 4v2h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-4v4"/><circle cx="16" cy="13.5" r="1.3"/>',
  tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  save: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  book: '<path d="M4 4h11a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3z"/><path d="M4 18a3 3 0 0 1 3-3h11"/>',
  print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
  wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 1c-1-.5-1.8-1.3-2.3-2.3l1-1-1-2z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
};
function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + "</svg>"; }

/* ---------------- storage (IndexedDB on this phone) ---------------- */
var DB = null;
var META = {}, PRODUCTS = [], CUSTOMERS = [], ENTRIES = [];
function idbOpen() {
  return new Promise(function (ok, no) {
    var r = indexedDB.open("doodhpulse", 1);
    r.onupgradeneeded = function () {
      var d = r.result;
      d.createObjectStore("meta");
      d.createObjectStore("products", { keyPath: "id" });
      d.createObjectStore("customers", { keyPath: "id" });
      d.createObjectStore("entries", { keyPath: "id" });
    };
    r.onsuccess = function () { ok(r.result); };
    r.onerror = function () { no(r.error); };
    r.onblocked = function () { no(new Error("Close other DoodhPulse windows and open the app again.")); };
  });
}
function idbGetAll(store) {
  return new Promise(function (ok, no) {
    var tr = DB.transaction(store, "readonly"), s = tr.objectStore(store);
    if (store === "meta") {
      var out = {}, c = s.openCursor();
      c.onsuccess = function () { var cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else ok(out); };
      c.onerror = function () { no(c.error); };
    } else { var q = s.getAll(); q.onsuccess = function () { ok(q.result || []); }; q.onerror = function () { no(q.error); }; }
  });
}
// ops: [[store, "put"|"del", value|key, key?]]
function write(ops) {
  return new Promise(function (ok, no) {
    var stores = Array.from(new Set(ops.map(function (o) { return o[0]; }))), tr;
    try { tr = DB.transaction(stores, "readwrite", { durability: "strict" }); } catch (e) { tr = DB.transaction(stores, "readwrite"); }
    ops.forEach(function (o) {
      var s = tr.objectStore(o[0]);
      if (o[1] === "put") { if (o[0] === "meta") s.put(o[2], o[3]); else s.put(o[2]); }
      else if (o[1] === "del") s.delete(o[2]);
      else if (o[1] === "clear") s.clear();
    });
    tr.oncomplete = function () { ok(); };
    tr.onerror = tr.onabort = function () { no(new Error("Could not save on this phone" + (tr.error ? ": " + tr.error.message : "") + ". Phone storage may be full.")); };
  }).catch(function (e) { toast(e.message); throw e; });
}
function setMeta(k, v) { META[k] = v; return write([["meta", "put", v, k]]); }
function putRow(store, arr, row) { var i = arr.findIndex(function (x) { return x.id === row.id; }); if (i >= 0) arr[i] = row; else arr.push(row); return write([[store, "put", row]]); }
function delRow(store, arr, id) { var i = arr.findIndex(function (x) { return x.id === id; }); if (i >= 0) arr.splice(i, 1); return write([[store, "del", id]]); }

/* ---------------- defaults (rates are guesses: owner edits them) ---------------- */
var DEFAULT_PRODUCTS = [
  { name: "Doodh", ur: "دودھ", unit: "kg", rate: 220 },
  { name: "Dahi", ur: "دہی", unit: "kg", rate: 240 },
  { name: "Lassi", ur: "لسی", unit: "glass", rate: 100 },
  { name: "Makhan", ur: "مکھن", unit: "kg", rate: 1600 },
  { name: "Desi ghee", ur: "دیسی گھی", unit: "kg", rate: 3200 },
  { name: "Khoya", ur: "کھویا", unit: "kg", rate: 1400 },
  { name: "Malai", ur: "ملائی", unit: "kg", rate: 1200 }
];
function pName(p) { return p ? (LANG === "ur" && p.ur ? p.ur : p.name) : "?"; }
function prod(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }
function cust(id) { return CUSTOMERS.find(function (c) { return c.id === id; }); }
function activeProducts() { return PRODUCTS.filter(function (p) { return !p.off; }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }); }

/* ---------------- license (locked to this phone's install, signed by Power Pulse) ---------------- */
var MC = "";
var PUB32 = (function () { var d = b64u(LICENSE_PUBLIC_KEY.replace(/=+$/, "")); return d.slice(d.length - 32); })();
function verifyKey(key) {
  try {
    key = String(key || "").replace(/\s+/g, "");
    var parts = key.split("."); if (parts.length !== 2) return null;
    var payload = b64u(parts[0]), sig = b64u(parts[1]);
    if (!window.nacl || !nacl.sign.detached.verify(payload, sig, PUB32)) return null;
    var j = JSON.parse(new TextDecoder().decode(payload));
    return j.mc === MC ? j : null;
  } catch (e) { return null; }
}
function clockNow() { // stops turning the phone's date back to stretch an expiry date
  var n = Date.now(), seen = +META.clock || 0;
  if (n > seen + 60e3) { META.clock = n; write([["meta", "put", n, "clock"]]).catch(function () {}); }
  return Math.max(n, seen);
}
function licenseState() {
  var l = META.license && verifyKey(META.license.key);
  if (!l) return { status: "inactive" };
  var exp = l.exp ? Date.parse(l.exp + "T23:59:59") : null;
  return { status: exp && clockNow() > exp ? "expired" : "active", name: l.name, exp: l.exp || null, iat: l.iat };
}

/* ---------------- money maths ---------------- */
function custBalance(c) {
  var b = +c.opening || 0;
  ENTRIES.forEach(function (e) {
    if (e.cust !== c.id) return;
    if (e.t === "sale") b += (e.total - e.paid);
    else if (e.t === "pay") b -= e.amount;
  });
  return r2(b);
}
function summary(from, to) {
  var s = { sale: 0, cash: 0, credit: 0, pays: 0, exp: 0, n: 0, prods: {}, expCats: {} };
  ENTRIES.forEach(function (e) {
    if (e.date < from || e.date > to) return;
    if (e.t === "sale") {
      s.sale += e.total; s.cash += e.paid; s.credit += e.total - e.paid; s.n++;
      e.lines.forEach(function (l) { var k = l.pid; var p = s.prods[k] || (s.prods[k] = { name: l.name, unit: l.unit, qty: 0, amt: 0 }); p.qty += l.qty; p.amt += l.amt; });
    } else if (e.t === "pay") s.pays += e.amount;
    else if (e.t === "exp") { s.exp += e.amount; s.expCats[e.cat] = (s.expCats[e.cat] || 0) + e.amount; }
  });
  s.net = s.cash + s.pays - s.exp;
  return s;
}
function nextNo() { var n = (+META.seq || 0) + 1; META.seq = n; return n; }
function addEntry(e) {
  e.id = e.id || uid(); e.ts = e.ts || Date.now(); e.date = e.date || dk();
  if (e.t === "sale" && !e.no) { e.no = nextNo(); ENTRIES.push(e); return write([["entries", "put", e], ["meta", "put", META.seq, "seq"]]).then(function () { return e; }); }
  ENTRIES.push(e); return write([["entries", "put", e]]).then(function () { return e; });
}

/* ---------------- UI plumbing ---------------- */
var APP = $("#app");
var S = { view: "home", stack: [], cart: [], saleCust: "", pid: "", shift: "am", ddate: "", range: "today", from: "", to: "", q: "", custId: "", unlocked: false };
function toast(msg) { var d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
function go(view, extra) { if (S.view !== view) S.stack.push(S.view); S.view = view; Object.assign(S, extra || {}); render(); scrollTo(0, 0); }
function back() { S.view = S.stack.pop() || "home"; render(); }
function closeSheet() { var s = $(".sheet"); if (s) s.remove(); }
function sheet(title, html, onMount) {
  closeSheet();
  var d = document.createElement("div"); d.className = "sheet";
  d.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="hd"><h3>' + esc(title) + '</h3><button class="btn o sm" data-close>' + t("Close") + "</button></div>" + html + "</div>";
  d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-close]")) closeSheet(); });
  document.body.appendChild(d); if (onMount) onMount(d.querySelector(".box"));
  return d;
}
function confirmBox(msg, yes, onYes, danger) {
  sheet(msg, '<div class="btns"><button class="btn o" data-close>' + t("Cancel") + '</button><button class="btn ' + (danger ? "r" : "g") + '" id="cfYes">' + esc(yes) + "</button></div>", function (b) {
    b.querySelector("#cfYes").onclick = function () { closeSheet(); onYes(); };
  });
}
function topbar(title, opts) {
  opts = opts || {};
  return '<header class="top">' + (opts.back ? '<button class="ib back" data-act="back" aria-label="' + t("Back") + '">' + ic("back") + "</button>" : "") +
    "<h1>" + esc(title) + "</h1>" + (opts.right || "") + "</header>";
}
function bottomNav() {
  var v = S.view, b = function (id, icon, label) { return '<button data-go="' + id + '" class="' + (v === id ? "on" : "") + '">' + ic(icon) + "<span>" + t(label) + "</span></button>"; };
  return '<nav class="bnav">' + b("home", "home", "Home") + b("customers", "users", "Customers") +
    '<button data-go="sale" class="pos ' + (v === "sale" ? "on" : "") + '"><span class="c">' + ic("cart") + "</span><span>" + t("Sale") + "</span></button>" +
    b("delivery", "truck", "Delivery") + b("reports", "chart", "Reports") + "</nav>";
}

/* ---------------- gate: setup + activation + PIN ---------------- */
function renderGate() {
  var L = licenseState(), shop = META.shop || {};
  var logo = '<div class="logo"><img src="icon-192.png" alt=""><div><b>DoodhPulse</b><small>Milk shop app · by Power Pulse</small></div></div>';
  if (!shop.name) {
    APP.innerHTML = '<div class="gate"><div class="box">' + logo + '<div class="card"><h2>Welcome · خوش آمدید</h2>' +
      '<label class="f"><span>Shop name · دکان کا نام</span><input class="in" id="gName" maxlength="40" placeholder="e.g. Madina Milk Shop"></label>' +
      '<label class="f"><span>Phone (shows on receipts)</span><input class="in" id="gPhone" inputmode="tel" maxlength="20" placeholder="03xx-xxxxxxx"></label>' +
      '<label class="f"><span>Address</span><input class="in" id="gAddr" maxlength="80"></label>' +
      '<label class="f"><span>Language · زبان</span><select class="in" id="gLang"><option value="en">English</option><option value="ur">اردو</option></select></label>' +
      '<button class="btn g full" id="gGo">Continue</button></div>' + responsibility() + "</div></div>";
    $("#gGo").onclick = function () {
      var n = $("#gName").value.trim(); if (!n) { toast("Enter the shop name"); return; }
      LANG = $("#gLang").value;
      write([["meta", "put", { name: n, phone: $("#gPhone").value.trim(), addr: $("#gAddr").value.trim(), footer: "Shukriya! Phir tashreef layein." }, "shop"], ["meta", "put", LANG, "lang"]])
        .then(function () { META.shop = { name: n, phone: $("#gPhone").value.trim(), addr: $("#gAddr").value.trim(), footer: "Shukriya! Phir tashreef layein." }; META.lang = LANG; render(); });
    };
    return true;
  }
  if (L.status !== "active") {
    var expired = L.status === "expired";
    APP.innerHTML = '<div class="gate"><div class="box">' + logo + '<div class="card"><h2>' + (expired ? "License expired · لائسنس ختم" : "Activate DoodhPulse · ایکٹیویٹ کریں") + "</h2>" +
      '<p class="mut">' + (expired ? "Your license ended on " + esc(fmtDate(L.exp)) + ". Your data is safe on this phone. Send the code below to Power Pulse to renew." : "Send this device code to Power Pulse. They will send you a license key for this phone.") + "</p>" +
      '<p class="mut ur">یہ کوڈ پاور پلس کو واٹس ایپ کریں، وہ آپ کو لائسنس کی بھیجیں گے۔</p>' +
      '<div class="code" id="gCode">' + esc(MC) + "</div>" +
      '<div class="btns" style="margin:10px 0 16px"><button class="btn o sm" id="gCopy">Copy code</button><button class="btn wa sm" id="gWa">' + ic("wa") + " Send on WhatsApp</button></div>" +
      '<label class="f"><span>License key · لائسنس کی</span><textarea class="in" id="gKey" rows="4" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Paste the key here"></textarea></label>' +
      '<button class="btn g full" id="gAct">Activate · ایکٹیویٹ</button>' +
      (expired ? '<button class="btn o full" style="margin-top:8px" id="gBk">' + t("Download backup") + "</button>" : "") +
      '<p class="mut" style="margin-top:12px">Help: WhatsApp <b class="num">' + SUPPORT_TXT + "</b></p></div></div></div>";
    $("#gCopy").onclick = function () { copy(MC); };
    $("#gWa").onclick = function () { openWA(SUPPORT_WA, "DoodhPulse license request\nShop: " + shop.name + "\nPhone: " + (shop.phone || "-") + "\nDevice code: " + MC); };
    $("#gAct").onclick = function () {
      var k = $("#gKey").value.replace(/\s+/g, ""), l = verifyKey(k);
      if (!l) { toast("This key is not valid for this phone. Check you copied all of it."); return; }
      setMeta("license", { key: k, at: Date.now() }).then(function () { var s = licenseState(); toast(s.status === "active" ? "Activated. Shukriya!" : "This key has already expired."); render(); });
    };
    if (expired) $("#gBk").onclick = downloadBackup;
    return true;
  }
  if (META.pin && !S.unlocked) {
    APP.innerHTML = '<div class="gate"><div class="box">' + logo + '<div class="card"><h2>' + esc(shop.name) + "</h2>" +
      '<label class="f"><span>' + t("Owner PIN") + '</span><input class="in num" id="gPin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label>' +
      '<button class="btn g full" id="gUn">' + t("Unlock") + "</button></div></div></div>";
    var tryPin = function () { pinHash($("#gPin").value).then(function (h) { if (h === META.pin) { S.unlocked = true; render(); } else { toast("Wrong PIN"); $("#gPin").value = ""; } }); };
    $("#gUn").onclick = tryPin; $("#gPin").onkeydown = function (e) { if (e.key === "Enter") tryPin(); };
    setTimeout(function () { var p = $("#gPin"); if (p) p.focus(); }, 50);
    return true;
  }
  return false;
}
function pinHash(p) { return sha256hex("doodhpulse-pin|" + (META.install && META.install.id) + "|" + p); }
function responsibility() {
  return '<div class="card" style="background:var(--amber2);border-color:#f0d19b"><h2>' + t("Keep your data safe") + '</h2><p class="mut" style="color:#6b4407">All data is saved only on this phone. Power Pulse has no copy and cannot recover it. Download a backup at least once a week and keep it on WhatsApp, Gmail or Google Drive.</p>' +
    '<p class="ur" style="color:#6b4407;margin:0">تمام ڈیٹا صرف اسی فون میں ہے۔ ہر ہفتے بیک اپ ضرور بنائیں۔ ڈیٹا کی ذمہ داری دکاندار کی ہے۔</p></div>';
}
function copy(s) { (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { toast("Copied"); }, function () { toast(s); }); }

/* ---------------- views ---------------- */
var VIEWS = {};

VIEWS.home = function () {
  var today = dk(), s = summary(today, today);
  var milk = PRODUCTS.find(function (p) { return /doodh|milk/i.test(p.name); }), dahi = PRODUCTS.find(function (p) { return /dahi|yog/i.test(p.name); });
  var mq = milk && s.prods[milk.id] ? s.prods[milk.id].qty : 0, yq = dahi && s.prods[dahi.id] ? s.prods[dahi.id].qty : 0;
  var am = deliveryStatus(today, "am"), pm = deliveryStatus(today, "pm");
  var due = 0; CUSTOMERS.forEach(function (c) { var b = custBalance(c); if (b > 0) due += b; });
  var lastBk = +META.lastBackup || 0, needBk = (ENTRIES.length + CUSTOMERS.length) > 0 && Date.now() - lastBk > 7 * 864e5;
  var tile = function (go, color, icon, label) { return '<button data-go="' + go + '"><span class="i" style="background:' + color + '">' + ic(icon) + "</span>" + t(label) + "</button>"; };
  var dl = function (label, st) { var pc = st.total ? Math.round(st.done / st.total * 100) : 0; return '<button class="tile" data-go="delivery" data-shift="' + st.shift + '" style="text-align:start"><span class="lbl">' + t(label) + '</span><b class="num">' + st.done + "/" + st.total + '</b><div class="bar"><i style="width:' + pc + '%"></i></div></button>'; };
  return topbar((META.shop || {}).name || "DoodhPulse", { right: '<button class="ib" data-go="settings" aria-label="' + t("Settings") + '">' + ic("gear") + "</button>" }) + "<main>" +
    (needBk ? '<div class="warnbox"><span>' + t("No backup for 7 days or more.") + '</span><button class="btn sm" data-act="backup">' + t("Backup now") + "</button></div>" : "") +
    '<button class="card hero" data-go="reports" style="display:block;width:100%;text-align:start"><div class="lbl">' + t("Today's sale") + " · " + fmtDate(today) + '</div><div class="big num">' + rs(s.sale) + '</div>' +
    '<div class="g3" style="margin-top:10px"><div class="stat"><small>' + esc(milk ? pName(milk) : "Doodh") + '</small><b class="num">' + qf(mq) + " " + esc(milk ? milk.unit : "") + '</b></div><div class="stat"><small>' + esc(dahi ? pName(dahi) : "Dahi") + '</small><b class="num">' + qf(yq) + " " + esc(dahi ? dahi.unit : "") + '</b></div><div class="stat"><small>' + t("Cash received") + '</small><b class="num">' + rs(s.cash + s.pays) + "</b></div></div></button>" +
    '<div class="g2" style="margin-bottom:12px">' + dl("Morning delivery", am) + dl("Evening delivery", pm) + "</div>" +
    '<div class="g2" style="margin-bottom:12px"><div class="tile"><span class="lbl">' + t("Udhaar given") + '</span><b class="num due">' + rs(s.credit) + '</b></div><div class="tile"><span class="lbl">' + t("Payments received") + '</span><b class="num adv">' + rs(s.pays) + "</b></div></div>" +
    '<button class="tile" data-go="customers" style="width:100%;text-align:start;margin-bottom:12px"><span class="lbl">' + t("Total khata due") + '</span><b class="num due">' + rs(due) + "</b></button>" +
    '<div class="menu">' + tile("sale", "#14894a", "cart", "Counter sale") + tile("delivery", "#2d6cdf", "truck", "Delivery") + tile("customers", "#7a4fd6", "book", "Customers") +
    tile("expenses", "#c63a3a", "wallet", "Expenses") + tile("products", "#b7700b", "tag", "Products & rates") + tile("reports", "#0f6b78", "chart", "Reports") +
    tile("settings", "#4b5668", "gear", "Settings") + '<button data-act="backup"><span class="i" style="background:#0f2f57">' + ic("save") + "</span>" + t("Backup") + "</button></div></main>" + bottomNav();
};

/* ----- counter sale ----- */
VIEWS.sale = function () {
  var ps = activeProducts(); if (!S.pid && ps[0]) S.pid = ps[0].id;
  var p = prod(S.pid), c = S.saleCust ? cust(S.saleCust) : null, rate = p ? rateFor(p, c) : 0;
  var total = r2(S.cart.reduce(function (a, l) { return a + l.amt; }, 0));
  var opts = '<option value="">' + t("Walk-in customer") + "</option>" + CUSTOMERS.filter(function (x) { return !x.hidden; }).sort(byName).map(function (x) { return '<option value="' + x.id + '"' + (x.id === S.saleCust ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("");
  return topbar(t("Counter sale"), { back: true }) + "<main>" +
    '<label class="f"><span>' + t("Customers") + '</span><select class="in" id="sCust">' + opts + "</select></label>" +
    '<div class="prods">' + ps.map(function (x) { return '<button data-pid="' + x.id + '" class="' + (x.id === S.pid ? "on" : "") + '"><b>' + esc(pName(x)) + '</b><small class="num">' + rs(rateFor(x, c)) + "/" + esc(x.unit) + "</small></button>"; }).join("") + "</div>" +
    (p ? '<div class="card"><h2>' + esc(pName(p)) + ' <span class="pill num">' + rs(rate) + "/" + esc(p.unit) + "</span></h2>" +
      '<div class="chips" id="qChips">' + [0.25, 0.5, 1, 1.5, 2, 5].map(function (q) { return '<button data-q="' + q + '">' + (q === 0.25 ? "¼" : q === 0.5 ? "½" : q === 1.5 ? "1½" : q) + "</button>"; }).join("") + "</div>" +
      '<div class="chips" id="aChips">' + [50, 100, 200, 500].map(function (a) { return '<button data-a="' + a + '">Rs ' + a + "</button>"; }).join("") + "</div>" +
      '<div class="entry"><label class="f"><span>' + t("Quantity") + " (" + esc(p.unit) + ')</span><input class="in num" id="sQty" inputmode="decimal" autocomplete="off"></label>' +
      '<label class="f"><span>' + t("Amount") + ' (Rs)</span><input class="in num" id="sAmt" inputmode="decimal" autocomplete="off"></label></div>' +
      '<button class="btn full" id="sAdd">' + ic("plus") + " " + t("Add to bill") + "</button></div>" : '<div class="empty">Add products first.</div>') +
    (S.cart.length ? '<div class="card"><h2>' + t("Receipt") + "</h2>" + S.cart.map(function (l, i) { return '<div class="line"><div class="grow" style="flex:1;min-width:0"><b>' + esc(l.name) + '</b><div class="mut num">' + qf(l.qty) + " " + esc(l.unit) + " × " + rs(l.rate) + '</div></div><b class="num">' + rs(l.amt) + '</b><button class="x" data-rm="' + i + '" aria-label="' + t("Delete") + '">×</button></div>'; }).join("") +
      '<div class="total"><span>' + t("Total") + '</span><b class="num">' + rs(total) + "</b></div>" +
      '<div class="entry"><label class="f"><span>' + t("Paid now") + ' (Rs)</span><input class="in num" id="sPaid" inputmode="decimal" value="' + (S.saleCust ? "" : total) + '" placeholder="0"></label>' +
      '<div class="f"><span class="mut" style="display:block;font-weight:600;margin-bottom:4px">' + t("Remaining (udhaar)") + '</span><b class="num due" id="sRem" style="font-size:20px">' + rs(S.saleCust ? total : 0) + "</b></div></div>" +
      '<button class="btn g full" id="sSave">' + ic("check") + " " + t("Save sale") + "</button></div>" : "") +
    "</main>" + bottomNav();
};
function rateFor(p, c) { return c && c.rates && +c.rates[p.id] > 0 ? +c.rates[p.id] : +p.rate; }
function byName(a, b) { return a.name.localeCompare(b.name); }
function bindSale() {
  var p = prod(S.pid), c = S.saleCust ? cust(S.saleCust) : null, rate = p ? rateFor(p, c) : 0;
  var q = $("#sQty"), a = $("#sAmt"), lastEdited = "q";
  $("#sCust").onchange = function (e) { S.saleCust = e.target.value; S.cart.forEach(function (l) { var pp = prod(l.pid); if (pp && !l.byAmt) { l.rate = rateFor(pp, cust(S.saleCust)); l.amt = r2(l.qty * l.rate); } }); render(); };
  document.querySelectorAll("[data-pid]").forEach(function (b) { b.onclick = function () { S.pid = b.dataset.pid; render(); }; });
  if (q) {
    q.oninput = function () { lastEdited = "q"; a.value = q.value ? r2(+q.value * rate) : ""; };
    a.oninput = function () { lastEdited = "a"; q.value = a.value && rate ? r3(+a.value / rate) : ""; };
    document.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { q.value = b.dataset.q; q.oninput(); }; });
    document.querySelectorAll("[data-a]").forEach(function (b) { b.onclick = function () { a.value = b.dataset.a; a.oninput(); }; });
    $("#sAdd").onclick = function () {
      var qty = r3(+q.value), amt = lastEdited === "a" ? r2(+a.value) : r2(qty * rate);
      if (!(qty > 0) || !(amt > 0)) { toast("Enter quantity or amount"); return; }
      S.cart.push({ pid: p.id, name: p.name, unit: p.unit, qty: qty, rate: rate, amt: amt, byAmt: lastEdited === "a" });
      render();
    };
  }
  document.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { S.cart.splice(+b.dataset.rm, 1); render(); }; });
  var paid = $("#sPaid");
  if (paid) {
    var total = r2(S.cart.reduce(function (x, l) { return x + l.amt; }, 0));
    paid.oninput = function () { $("#sRem").textContent = rs(Math.max(0, total - (+paid.value || 0))); };
    $("#sSave").onclick = function () {
      var pv = r2(+paid.value || 0);
      if (pv > total) pv = total; // change is given back in cash; the extra is not kept
      if (!S.saleCust && pv < total) { toast("Choose a customer to give udhaar"); return; }
      this.disabled = true;
      addEntry({ t: "sale", src: "counter", cust: S.saleCust || null, lines: S.cart.map(function (l) { return { pid: l.pid, name: l.name, unit: l.unit, qty: l.qty, rate: l.rate, amt: l.amt }; }), total: total, paid: pv })
        .then(function (e) { S.cart = []; render(); showReceipt(e); }, function () { $("#sSave").disabled = false; });
    };
  }
}
function receiptText(e) {
  var shop = META.shop || {}, c = e.cust ? cust(e.cust) : null, L = [];
  L.push(shop.name); if (shop.phone) L.push(shop.phone);
  L.push("Bill #" + e.no + " · " + fmtDate(e.date) + " " + fmtTime(e.ts));
  if (c) L.push("Customer: " + c.name);
  L.push("----------------");
  e.lines.forEach(function (l) { L.push(l.name + " " + qf(l.qty) + " " + l.unit + " x " + l.rate + " = " + rs(l.amt)); });
  L.push("----------------"); L.push("TOTAL: " + rs(e.total)); L.push("Paid: " + rs(e.paid));
  if (e.total - e.paid > 0) L.push("Udhaar: " + rs(e.total - e.paid));
  if (c) L.push("Khata balance: " + rs(custBalance(c)));
  if (shop.footer) L.push(shop.footer);
  return L.join("\n");
}
function printReceipt(e) {
  var shop = META.shop || {}, c = e.cust ? cust(e.cust) : null;
  var r = function (a, b) { return '<div class="r"><span>' + a + "</span><span>" + b + "</span></div>"; };
  $("#printArea").innerHTML = '<div class="c b">' + esc(shop.name) + "</div>" + (shop.addr ? '<div class="c">' + esc(shop.addr) + "</div>" : "") + (shop.phone ? '<div class="c">' + esc(shop.phone) + "</div>" : "") + "<hr>" +
    r("Bill #" + e.no, fmtDate(e.date) + " " + fmtTime(e.ts)) + (c ? r("Customer", esc(c.name)) : "") + "<hr>" +
    e.lines.map(function (l) { return "<div>" + esc(l.name) + "</div>" + r(qf(l.qty) + " " + esc(l.unit) + " x " + l.rate, rs(l.amt)); }).join("") + "<hr>" +
    '<div class="r b"><span>TOTAL</span><span>' + rs(e.total) + "</span></div>" + r("Paid", rs(e.paid)) + (e.total - e.paid > 0 ? r("Udhaar", rs(e.total - e.paid)) : "") +
    (c ? r("Khata balance", rs(custBalance(c))) : "") + "<hr>" + (shop.footer ? '<div class="c">' + esc(shop.footer) + "</div>" : "") + '<div class="c">DoodhPulse</div>';
  setTimeout(function () { window.print(); }, 50);
}
function showReceipt(e) {
  var c = e.cust ? cust(e.cust) : null;
  sheet(t("Receipt") + " #" + e.no, '<pre style="white-space:pre-wrap;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;font:13px/1.45 ui-monospace,Consolas,monospace">' + esc(receiptText(e)) + "</pre>" +
    '<div class="btns"><button class="btn o" id="rPrint">' + ic("print") + " " + t("Print") + "</button>" + '<button class="btn wa" id="rWa">' + ic("wa") + " " + t("WhatsApp") + "</button></div>" +
    '<button class="btn g full" style="margin-top:8px" data-close>' + t("New sale") + "</button>" +
    (e.src === "counter" ? '<button class="btn o full" style="margin-top:8px;color:var(--red)" id="rDel">' + t("Delete") + " bill</button>" : ""), function (b) {
    b.querySelector("#rPrint").onclick = function () { printReceipt(e); };
    b.querySelector("#rWa").onclick = function () { openWA(c ? c.phone : "", receiptText(e)); };
    var d = b.querySelector("#rDel"); if (d) d.onclick = function () { confirmBox("Delete bill #" + e.no + "?", t("Delete"), function () { delRow("entries", ENTRIES, e.id).then(function () { toast("Bill deleted"); render(); }); }, true); };
  });
}

/* ----- customers ----- */
VIEWS.customers = function () {
  var q = S.q.toLowerCase(), rows = CUSTOMERS.filter(function (c) { return (!c.hidden || custBalance(c) !== 0) && (!q || (c.name + " " + (c.phone || "") + " " + (c.addr || "")).toLowerCase().indexOf(q) >= 0); }).sort(byName);
  return topbar(t("Customers"), { back: true, right: '<button class="ib" data-act="addCust" aria-label="' + t("Add customer") + '">' + ic("plus") + "</button>" }) + "<main>" +
    '<input class="in" id="cq" placeholder="' + t("Search") + '…" value="' + esc(S.q) + '" style="margin-bottom:12px">' +
    (rows.length ? '<div class="list">' + rows.map(function (c) { var b = custBalance(c); return '<button class="row btnrow" data-cust="' + c.id + '"><div class="grow"><div class="t">' + esc(c.name) + '</div><div class="s">' + esc([c.addr, c.phone].filter(Boolean).join(" · ")) + " " + shiftPill(c) + '</div></div><div class="amt num ' + (b > 0 ? "due" : b < 0 ? "adv" : "") + '">' + rs(b) + "</div></button>"; }).join("") + "</div>"
      : '<div class="empty">No customers yet.<br><br><button class="btn g" data-act="addCust">' + ic("plus") + " " + t("Add customer") + "</button></div>") +
    "</main>" + bottomNav();
};
function shiftPill(c) { var s = c.shift || "none"; return s === "none" ? "" : '<span class="pill">' + (s === "am" ? t("Morning") : s === "pm" ? t("Evening") : t("Morning") + "+" + t("Evening")) + "</span>"; }
function custForm(c) {
  c = c || { id: "", name: "", phone: "", addr: "", shift: "am", am: {}, pm: {}, rates: {}, opening: 0 };
  var ps = activeProducts();
  sheet(c.id ? t("Edit") + " · " + c.name : t("Add customer"),
    '<label class="f"><span>' + t("Name") + '</span><input class="in" id="fN" maxlength="40" value="' + esc(c.name) + '"></label>' +
    '<div class="entry"><label class="f"><span>' + t("Phone") + '</span><input class="in num" id="fP" inputmode="tel" maxlength="20" value="' + esc(c.phone) + '"></label>' +
    '<label class="f"><span>' + t("Shift") + '</span><select class="in" id="fS">' + [["am", "Morning"], ["pm", "Evening"], ["both", "Both"], ["none", "None"]].map(function (o) { return '<option value="' + o[0] + '"' + (c.shift === o[0] ? " selected" : "") + ">" + t(o[1]) + "</option>"; }).join("") + "</select></label></div>" +
    '<label class="f"><span>' + t("Address") + '</span><input class="in" id="fA" maxlength="80" value="' + esc(c.addr) + '"></label>' +
    '<div class="card"><h2>' + t("Daily items") + '</h2><table class="t"><tr><th></th><th>' + t("Morning") + "</th><th>" + t("Evening") + "</th><th>" + t("Special rate") + "</th></tr>" +
    ps.map(function (p) { var v = function (o) { return o && o[p.id] ? o[p.id] : ""; }; return "<tr><td>" + esc(pName(p)) + ' <small class="mut">' + esc(p.unit) + '</small></td><td><input class="in num" data-am="' + p.id + '" inputmode="decimal" value="' + v(c.am) + '" style="min-height:40px;padding:6px 8px"></td><td><input class="in num" data-pm="' + p.id + '" inputmode="decimal" value="' + v(c.pm) + '" style="min-height:40px;padding:6px 8px"></td><td><input class="in num" data-rt="' + p.id + '" inputmode="decimal" placeholder="' + p.rate + '" value="' + v(c.rates) + '" style="min-height:40px;padding:6px 8px"></td></tr>'; }).join("") +
    "</table></div>" +
    (c.id ? "" : '<label class="f"><span>' + t("Opening balance") + ' (Rs)</span><input class="in num" id="fO" inputmode="decimal" placeholder="0"></label>') +
    '<button class="btn g full" id="fSave">' + t("Save") + "</button>" +
    (c.id ? '<button class="btn o full" style="margin-top:8px;color:var(--red)" id="fDel">' + t("Delete") + "</button>" : ""),
    function (b) {
      b.querySelector("#fSave").onclick = function () {
        var n = b.querySelector("#fN").value.trim(); if (!n) { toast("Enter the name"); return; }
        var pick = function (attr) { var o = {}; b.querySelectorAll("[data-" + attr + "]").forEach(function (i) { var v = r3(+i.value); if (v > 0) o[i.getAttribute("data-" + attr)] = v; }); return o; };
        var row = Object.assign({}, c, { id: c.id || uid(), name: n, phone: b.querySelector("#fP").value.trim(), addr: b.querySelector("#fA").value.trim(), shift: b.querySelector("#fS").value, am: pick("am"), pm: pick("pm"), rates: pick("rt") });
        if (!c.id) { row.opening = r2(+(b.querySelector("#fO").value) || 0); row.created = Date.now(); }
        putRow("customers", CUSTOMERS, row).then(function () { closeSheet(); toast("Saved"); render(); });
      };
      var d = b.querySelector("#fDel");
      if (d) d.onclick = function () {
        var has = ENTRIES.some(function (e) { return e.cust === c.id; });
        if (has) { toast("This customer has khata entries. Clear the balance first; old entries stay in reports."); }
        confirmBox("Delete " + c.name + "?", t("Delete"), function () {
          (has ? putRow("customers", CUSTOMERS, Object.assign({}, c, { shift: "none", hidden: true })) : delRow("customers", CUSTOMERS, c.id)).then(function () { S.view = "customers"; S.stack = ["home"]; render(); });
        }, true);
      };
    });
}
VIEWS.customer = function () {
  var c = cust(S.custId); if (!c) { S.view = "customers"; return VIEWS.customers(); }
  var b = custBalance(c), rows = ENTRIES.filter(function (e) { return e.cust === c.id; }).sort(function (x, y) { return x.date === y.date ? x.ts - y.ts : x.date < y.date ? -1 : 1; });
  var run = +c.opening || 0, lines = [];
  if (run) lines.push({ d: "", txt: t("Opening balance"), amt: run, bal: run });
  rows.forEach(function (e) {
    if (e.t === "sale") { run += e.total - e.paid; lines.push({ e: e, d: e.date, txt: e.lines.map(function (l) { return l.name + " " + qf(l.qty) + " " + l.unit; }).join(", ") + (e.paid ? " · paid " + rs(e.paid) : ""), amt: e.total - e.paid, bal: run }); }
    else if (e.t === "pay") { run -= e.amount; lines.push({ e: e, d: e.date, txt: t("Payments received") + (e.note ? " · " + e.note : ""), amt: -e.amount, bal: run }); }
  });
  lines.reverse();
  var daily = function (o) { return Object.keys(o || {}).map(function (id) { var p = prod(id); return p ? pName(p) + " " + qf(o[id]) + " " + p.unit : ""; }).filter(Boolean).join(", "); };
  return topbar(c.name, { back: true, right: '<button class="ib" data-act="editCust">' + t("Edit") + "</button>" }) + "<main>" +
    '<div class="card hero"><div class="lbl">' + t("Balance") + '</div><div class="big num">' + rs(b) + '</div><div class="lbl">' + esc([c.phone, c.addr].filter(Boolean).join(" · ")) + "</div>" +
    (c.am && Object.keys(c.am).length ? '<div class="lbl" style="margin-top:6px">' + t("Morning") + ": " + esc(daily(c.am)) + "</div>" : "") +
    (c.pm && Object.keys(c.pm).length ? '<div class="lbl">' + t("Evening") + ": " + esc(daily(c.pm)) + "</div>" : "") + "</div>" +
    '<div class="btns" style="margin-bottom:12px"><button class="btn g" data-act="pay">' + ic("wallet") + " " + t("Receive payment") + '</button><button class="btn" data-act="custSale">' + ic("cart") + " " + t("Sale") + "</button></div>" +
    '<div class="btns" style="margin-bottom:12px"><button class="btn wa" data-act="remind">' + ic("wa") + " " + t("Send reminder") + '</button><button class="btn o" data-act="bill">' + ic("book") + " " + t("Monthly bill") + "</button></div>" +
    '<h2 style="font-size:15px;margin:6px 2px 8px">' + t("Ledger") + "</h2>" +
    (lines.length ? '<div class="list">' + lines.slice(0, 200).map(function (l) { return '<div class="row"' + (l.e ? ' data-entry="' + l.e.id + '" role="button" tabindex="0"' : "") + '><div class="grow"><div class="t" style="font-weight:600;white-space:normal">' + esc(l.txt) + '</div><div class="s num">' + fmtDate(l.d) + (l.e && l.e.shift ? " · " + t(l.e.shift === "am" ? "Morning" : "Evening") : "") + '</div></div><div style="text-align:end"><div class="amt num ' + (l.amt > 0 ? "due" : "adv") + '">' + (l.amt > 0 ? "+" : "") + rs(l.amt) + '</div><div class="s num">' + rs(l.bal) + "</div></div></div>"; }).join("") + "</div>" : '<div class="empty">No entries yet.</div>') +
    "</main>" + bottomNav();
};
function payForm(c) {
  sheet(t("Receive payment") + " · " + c.name, '<p class="mut">' + t("Balance") + ': <b class="num due">' + rs(custBalance(c)) + "</b></p>" +
    '<label class="f"><span>' + t("Amount") + ' (Rs)</span><input class="in num" id="pA" inputmode="decimal"></label>' +
    '<label class="f"><span>' + t("Note") + '</span><input class="in" id="pN" maxlength="60" placeholder="Cash / JazzCash / Easypaisa"></label>' +
    '<label class="f"><span>' + t("Date") + '</span><input class="in" id="pD" type="date" value="' + dk() + '"></label>' +
    '<button class="btn g full" id="pS">' + t("Save") + "</button>", function (b) {
    setTimeout(function () { b.querySelector("#pA").focus(); }, 50);
    b.querySelector("#pS").onclick = function () {
      var a = r2(+b.querySelector("#pA").value); if (!(a > 0)) { toast("Enter the amount"); return; }
      addEntry({ t: "pay", cust: c.id, amount: a, note: b.querySelector("#pN").value.trim(), date: b.querySelector("#pD").value || dk() }).then(function () {
        closeSheet(); render();
        var bal = custBalance(c);
        confirmBox("Saved. Send a WhatsApp receipt to " + c.name + "?", t("WhatsApp"), function () { openWA(c.phone, (META.shop || {}).name + "\nPayment received: " + rs(a) + " on " + fmtDate(dk()) + "\nRemaining balance: " + rs(bal) + "\nShukriya!"); });
      });
    };
  });
}
function monthlyBill(c) {
  var now = new Date(), from = dk(new Date(now.getFullYear(), now.getMonth(), 1)), to = dk(now);
  var lines = {}, total = 0, paid = 0;
  ENTRIES.forEach(function (e) {
    if (e.cust !== c.id || e.date < from || e.date > to) return;
    if (e.t === "sale") { total += e.total; paid += e.paid; e.lines.forEach(function (l) { var k = l.name + "|" + l.unit + "|" + l.rate; var x = lines[k] || (lines[k] = { name: l.name, unit: l.unit, rate: l.rate, qty: 0, amt: 0 }); x.qty += l.qty; x.amt += l.amt; }); }
    if (e.t === "pay") paid += e.amount;
  });
  var shop = META.shop || {}, L = [shop.name, "Bill for " + c.name, fmtDate(from) + " to " + fmtDate(to), "----------------"];
  Object.keys(lines).forEach(function (k) { var x = lines[k]; L.push(x.name + ": " + qf(x.qty) + " " + x.unit + " x " + x.rate + " = " + rs(x.amt)); });
  L.push("----------------", "This month: " + rs(total), "Paid this month: " + rs(paid), "Total balance due: " + rs(custBalance(c)));
  var txt = L.join("\n");
  sheet(t("Monthly bill"), '<pre style="white-space:pre-wrap;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;font:13px/1.45 ui-monospace,Consolas,monospace">' + esc(txt) + '</pre><div class="btns"><button class="btn wa" id="mbW">' + ic("wa") + " " + t("WhatsApp") + '</button><button class="btn o" id="mbC">Copy</button></div>', function (b) {
    b.querySelector("#mbW").onclick = function () { openWA(c.phone, txt); };
    b.querySelector("#mbC").onclick = function () { copy(txt); };
  });
}

/* ----- delivery ----- */
function shiftItems(c, shift) { return (shift === "am" ? c.am : c.pm) || {}; }
function onRoute(c, shift) { return !c.hidden && (c.shift === shift || c.shift === "both") && Object.keys(shiftItems(c, shift)).some(function (id) { return prod(id); }); }
function deliveryEntry(c, date, shift) { return ENTRIES.find(function (e) { return e.cust === c.id && e.date === date && e.shift === shift && (e.t === "skip" || (e.t === "sale" && e.src === "delivery")); }); }
function deliveryStatus(date, shift) { var list = CUSTOMERS.filter(function (c) { return onRoute(c, shift); }); var done = list.filter(function (c) { return deliveryEntry(c, date, shift); }).length; return { total: list.length, done: done, shift: shift }; }
function deliveryLines(c, shift, override) {
  var items = override || shiftItems(c, shift);
  return Object.keys(items).map(function (id) { var p = prod(id); if (!p) return null; var q = r3(items[id]), rate = rateFor(p, c); return { pid: p.id, name: p.name, unit: p.unit, qty: q, rate: rate, amt: r2(q * rate) }; }).filter(function (l) { return l && l.qty > 0; });
}
function deliver(c, date, shift, override) {
  var lines = deliveryLines(c, shift, override); if (!lines.length) return Promise.resolve();
  var total = r2(lines.reduce(function (a, l) { return a + l.amt; }, 0));
  return addEntry({ t: "sale", src: "delivery", cust: c.id, shift: shift, date: date, lines: lines, total: total, paid: 0 });
}
VIEWS.delivery = function () {
  var date = S.ddate || dk(), shift = S.shift;
  var list = CUSTOMERS.filter(function (c) { return onRoute(c, shift); }).sort(function (a, b) { return (a.route || 0) - (b.route || 0) || byName(a, b); });
  var st = deliveryStatus(date, shift), qtyTot = {};
  list.forEach(function (c) { deliveryLines(c, shift).forEach(function (l) { qtyTot[l.name + " " + l.unit] = (qtyTot[l.name + " " + l.unit] || 0) + l.qty; }); });
  return topbar(t("Delivery"), { back: true }) + "<main>" +
    '<div class="seg"><button data-shift="am" class="' + (shift === "am" ? "on" : "") + '">' + ic("sun") + t("Morning") + '</button><button data-shift="pm" class="' + (shift === "pm" ? "on" : "") + '">' + ic("moon") + t("Evening") + "</button></div>" +
    '<input class="in" type="date" id="dDate" value="' + date + '" style="margin-bottom:12px">' +
    '<div class="card hero"><div class="g2"><div><div class="lbl">' + (shift === "am" ? t("Morning delivery") : t("Evening delivery")) + '</div><div class="big num">' + st.done + "/" + st.total + '</div></div><div><div class="lbl">' + t("Total") + "</div>" +
    Object.keys(qtyTot).map(function (k) { return '<div class="num" style="font-weight:700">' + esc(k.split(" ")[0]) + " " + qf(qtyTot[k]) + " " + esc(k.split(" ").slice(1).join(" ")) + "</div>"; }).join("") + "</div></div></div>" +
    (list.length ? '<div class="list">' + list.map(function (c, i) {
      var e = deliveryEntry(c, date, shift), lines = e && e.t === "sale" ? e.lines : deliveryLines(c, shift), amt = lines.reduce(function (a, l) { return a + l.amt; }, 0);
      var state = !e ? "" : e.t === "skip" ? "skip" : "on";
      return '<div class="row"><span class="mut num" style="width:18px">' + (i + 1) + '</span><button class="grow" style="min-height:48px" data-dedit="' + c.id + '" style="border:0;background:none;text-align:start;padding:0;min-width:0"><div class="t">' + esc(c.name) + '</div><div class="s">' + esc(c.addr || "") + '</div><div class="s num">' + esc(lines.map(function (l) { return l.name + " " + qf(l.qty) + " " + l.unit; }).join(", ")) + ' · <span class="pill ' + (state === "on" ? "g" : state === "skip" ? "" : "a") + '">' + rs(amt) + "</span></div></button>" +
        '<button class="check ' + state + '" data-dtog="' + c.id + '" aria-label="' + t("Deliver") + '">' + (state === "skip" ? t("Skip") : ic("check")) + "</button></div>";
    }).join("") + "</div>" + (st.done < st.total ? '<button class="btn g full" data-act="deliverAll">' + ic("check") + " " + t("Mark all delivered") + " (" + (st.total - st.done) + ")</button>" : "")
      : '<div class="empty">No customers on this round. Add daily items to a customer (Customers → Edit) to put them here.</div>') +
    "</main>" + bottomNav();
};
function deliveryEdit(c) {
  var date = S.ddate || dk(), shift = S.shift, e = deliveryEntry(c, date, shift);
  var cur = {}; (e && e.t === "sale" ? e.lines : deliveryLines(c, shift)).forEach(function (l) { cur[l.pid] = l.qty; });
  var ps = activeProducts();
  sheet(c.name + " · " + fmtDate(date), '<p class="mut">Change today\'s quantity only. The daily amount stays the same.</p><table class="t">' +
    ps.map(function (p) { return "<tr><td>" + esc(pName(p)) + ' <small class="mut">' + rs(rateFor(p, c)) + "/" + esc(p.unit) + '</small></td><td style="width:40%"><input class="in num" data-dq="' + p.id + '" inputmode="decimal" value="' + (cur[p.id] || "") + '" style="min-height:40px"></td></tr>'; }).join("") + "</table>" +
    '<div class="btns" style="margin-top:12px"><button class="btn o" id="deSkip">' + t("Skip") + '</button><button class="btn g" id="deOk">' + ic("check") + " " + t("Deliver") + "</button></div>", function (b) {
    var clear = function () { return e ? delRow("entries", ENTRIES, e.id) : Promise.resolve(); };
    b.querySelector("#deOk").onclick = function () {
      var o = {}; b.querySelectorAll("[data-dq]").forEach(function (i) { var v = r3(+i.value); if (v > 0) o[i.dataset.dq] = v; });
      if (!Object.keys(o).length) { toast("Enter a quantity, or tap Skip"); return; }
      clear().then(function () { return deliver(c, date, shift, o); }).then(function () { closeSheet(); render(); });
    };
    b.querySelector("#deSkip").onclick = function () { clear().then(function () { return addEntry({ t: "skip", cust: c.id, shift: shift, date: date }); }).then(function () { closeSheet(); render(); }); };
  });
}

/* ----- expenses ----- */
var EXP_CATS = ["Milk purchase", "Salary", "Rent", "Bills", "Other"];
VIEWS.expenses = function () {
  var from = dk(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), rows = ENTRIES.filter(function (e) { return e.t === "exp" && e.date >= from; }).sort(function (a, b) { return b.ts - a.ts; });
  var tot = rows.reduce(function (a, e) { return a + e.amount; }, 0);
  return topbar(t("Expenses"), { back: true, right: '<button class="ib" data-act="addExp" aria-label="' + t("Add expense") + '">' + ic("plus") + "</button>" }) + "<main>" +
    '<div class="card hero"><div class="lbl">' + t("This month") + '</div><div class="big num">' + rs(tot) + "</div></div>" +
    '<button class="btn g full" data-act="addExp" style="margin-bottom:12px">' + ic("plus") + " " + t("Add expense") + "</button>" +
    (rows.length ? '<div class="list">' + rows.map(function (e) { return '<div class="row" data-exp="' + e.id + '" role="button" tabindex="0"><div class="grow"><div class="t">' + t(e.cat) + '</div><div class="s">' + fmtDate(e.date) + (e.note ? " · " + esc(e.note) : "") + '</div></div><div class="amt num due">' + rs(e.amount) + "</div></div>"; }).join("") + "</div>" : '<div class="empty">No expenses this month.</div>') +
    "</main>" + bottomNav();
};
function expForm(e) {
  e = e || {};
  sheet(t("Add expense"), '<label class="f"><span>' + t("Category") + '</span><select class="in" id="xC">' + EXP_CATS.map(function (c) { return '<option value="' + c + '"' + (e.cat === c ? " selected" : "") + ">" + t(c) + "</option>"; }).join("") + "</select></label>" +
    '<label class="f"><span>' + t("Amount") + ' (Rs)</span><input class="in num" id="xA" inputmode="decimal" value="' + (e.amount || "") + '"></label>' +
    '<label class="f"><span>' + t("Note") + '</span><input class="in" id="xN" maxlength="60" value="' + esc(e.note || "") + '" placeholder="e.g. 40 kg from Gawala Aslam"></label>' +
    '<label class="f"><span>' + t("Date") + '</span><input class="in" id="xD" type="date" value="' + (e.date || dk()) + '"></label>' +
    '<button class="btn g full" id="xS">' + t("Save") + "</button>" + (e.id ? '<button class="btn o full" style="margin-top:8px;color:var(--red)" id="xDel">' + t("Delete") + "</button>" : ""), function (b) {
    b.querySelector("#xS").onclick = function () {
      var a = r2(+b.querySelector("#xA").value); if (!(a > 0)) { toast("Enter the amount"); return; }
      var row = Object.assign({}, e, { t: "exp", cat: b.querySelector("#xC").value, amount: a, note: b.querySelector("#xN").value.trim(), date: b.querySelector("#xD").value || dk() });
      (e.id ? putRow("entries", ENTRIES, row) : addEntry(row)).then(function () { closeSheet(); render(); });
    };
    var d = b.querySelector("#xDel"); if (d) d.onclick = function () { delRow("entries", ENTRIES, e.id).then(function () { closeSheet(); render(); }); };
  });
}

/* ----- products ----- */
VIEWS.products = function () {
  return topbar(t("Products & rates"), { back: true, right: '<button class="ib" data-act="addProd" aria-label="' + t("Add product") + '">' + ic("plus") + "</button>" }) + "<main>" +
    '<p class="mut">Tap a product to change its rate. New rates apply to new sales only; old bills keep their rate.</p>' +
    '<div class="list">' + PRODUCTS.slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }).map(function (p) { return '<button class="row btnrow" data-prod="' + p.id + '"><div class="grow"><div class="t">' + esc(p.name) + (p.ur ? " · " + esc(p.ur) : "") + '</div><div class="s">' + (p.off ? '<span class="pill r">Hidden</span>' : "") + '</div></div><div class="amt num">' + rs(p.rate) + " / " + esc(p.unit) + "</div></button>"; }).join("") + "</div></main>" + bottomNav();
};
function prodForm(p) {
  p = p || { name: "", ur: "", unit: "kg", rate: "" };
  sheet(p.id ? p.name : t("Add product"), '<label class="f"><span>' + t("Name") + ' (English)</span><input class="in" id="pN" maxlength="24" value="' + esc(p.name) + '"></label>' +
    '<label class="f"><span>' + t("Name") + ' (اردو)</span><input class="in ur" id="pU" maxlength="24" value="' + esc(p.ur || "") + '"></label>' +
    '<div class="entry"><label class="f"><span>' + t("Rate") + ' (Rs)</span><input class="in num" id="pR" inputmode="decimal" value="' + esc(p.rate) + '"></label>' +
    '<label class="f"><span>' + t("Unit") + '</span><select class="in" id="pUn">' + ["kg", "litre", "glass", "piece", "pack"].map(function (u) { return '<option' + (p.unit === u ? " selected" : "") + ">" + u + "</option>"; }).join("") + "</select></label></div>" +
    (p.id ? '<label class="f" style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="pOff"' + (p.off ? " checked" : "") + ' style="width:22px;height:22px"> Hide from sale screen</label>' : "") +
    '<button class="btn g full" id="pS">' + t("Save") + "</button>", function (b) {
    b.querySelector("#pS").onclick = function () {
      var n = b.querySelector("#pN").value.trim(), r = r2(+b.querySelector("#pR").value);
      if (!n || !(r > 0)) { toast("Enter name and rate"); return; }
      var row = Object.assign({}, p, { id: p.id || uid(), name: n, ur: b.querySelector("#pU").value.trim(), rate: r, unit: b.querySelector("#pUn").value, sort: p.id ? p.sort : PRODUCTS.length + 1 });
      var off = b.querySelector("#pOff"); if (off) row.off = off.checked;
      putRow("products", PRODUCTS, row).then(function () { closeSheet(); render(); });
    };
  });
}

/* ----- reports ----- */
function rangeDates() {
  var n = new Date(), today = dk(n), y = n.getFullYear(), m = n.getMonth();
  switch (S.range) {
    case "yest": var yd = addDays(today, -1); return [yd, yd];
    case "7": return [addDays(today, -6), today];
    case "month": return [dk(new Date(y, m, 1)), today];
    case "last": return [dk(new Date(y, m - 1, 1)), dk(new Date(y, m, 0))];
    case "custom": return [S.from || today, S.to || today];
    default: return [today, today];
  }
}
VIEWS.reports = function () {
  var r = rangeDates(), s = summary(r[0], r[1]);
  var ch = function (id, label) { return '<button data-range="' + id + '" class="' + (S.range === id ? "on" : "") + '">' + t(label) + "</button>"; };
  var debtors = CUSTOMERS.map(function (c) { return { c: c, b: custBalance(c) }; }).filter(function (x) { return x.b > 0; }).sort(function (a, b) { return b.b - a.b; });
  var row = function (a, b, cls) { return "<tr><td>" + a + '</td><td class="e num ' + (cls || "") + '">' + b + "</td></tr>"; };
  return topbar(t("Reports"), { back: true }) + "<main>" +
    '<div class="chips">' + ch("today", "Today") + ch("yest", "Yesterday") + ch("7", "Last 7 days") + ch("month", "This month") + ch("last", "Last month") + ch("custom", "Custom") + "</div>" +
    (S.range === "custom" ? '<div class="entry"><label class="f"><span>' + t("From") + '</span><input class="in" type="date" id="rF" value="' + r[0] + '"></label><label class="f"><span>' + t("To") + '</span><input class="in" type="date" id="rT" value="' + r[1] + '"></label></div>' : "") +
    '<div class="card" style="background:#0f6b4a;color:#fff;border:0"><div style="color:#bfe6d2;font-size:12.5px">' + t("Total sale") + " · " + fmtDate(r[0]) + (r[0] !== r[1] ? " – " + fmtDate(r[1]) : "") + '</div><div class="num" style="font-size:28px;font-weight:800">' + rs(s.sale) + '</div><div style="color:#bfe6d2;font-size:12.5px">' + s.n + " bills</div></div>" +
    '<div class="card"><table class="t">' + row(t("Cash received"), rs(s.cash)) + row(t("Udhaar given"), rs(s.credit), "due") + row(t("Payments received"), rs(s.pays), "adv") + row(t("Expenses"), rs(s.exp), "due") +
    '<tr><td><b>' + t("Net cash in hand") + '</b></td><td class="e num"><b>' + rs(s.net) + "</b></td></tr></table></div>" +
    '<div class="card"><h2>' + t("Product-wise") + '</h2><table class="t">' + (Object.keys(s.prods).length ? Object.keys(s.prods).map(function (k) { var p = s.prods[k]; return "<tr><td>" + esc(p.name) + ' <span class="mut num">' + qf(p.qty) + " " + esc(p.unit) + '</span></td><td class="e num">' + rs(p.amt) + "</td></tr>"; }).join("") : '<tr><td class="mut">No sales</td></tr>') + "</table></div>" +
    (Object.keys(s.expCats).length ? '<div class="card"><h2>' + t("Expenses") + '</h2><table class="t">' + Object.keys(s.expCats).map(function (k) { return row(t(k), rs(s.expCats[k])); }).join("") + "</table></div>" : "") +
    '<div class="card"><h2>' + t("Customers with udhaar") + " (" + debtors.length + ')</h2><table class="t">' + debtors.slice(0, 15).map(function (x) { return row(esc(x.c.name), rs(x.b), "due"); }).join("") + "</table></div>" +
    '<div class="btns"><button class="btn wa" data-act="sendReport">' + ic("wa") + " " + t("Send report on WhatsApp") + '</button><button class="btn o" data-act="csv">' + t("Export to Excel (CSV)") + "</button></div></main>" + bottomNav();
};
function reportText() {
  var r = rangeDates(), s = summary(r[0], r[1]), L = [(META.shop || {}).name + " · Report", fmtDate(r[0]) + (r[0] !== r[1] ? " to " + fmtDate(r[1]) : ""), "", "Total sale: " + rs(s.sale) + " (" + s.n + " bills)", "Cash received: " + rs(s.cash), "Udhaar given: " + rs(s.credit), "Payments received: " + rs(s.pays), "Expenses: " + rs(s.exp), "Net cash: " + rs(s.net), ""];
  Object.keys(s.prods).forEach(function (k) { var p = s.prods[k]; L.push(p.name + ": " + qf(p.qty) + " " + p.unit + " = " + rs(p.amt)); });
  return L.join("\n");
}
function csvExport() {
  var r = rangeDates(), q = function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  var out = [["Date", "Time", "Type", "Bill no", "Customer", "Shift", "Items", "Total", "Paid", "Udhaar", "Payment", "Expense", "Category", "Note"]];
  ENTRIES.filter(function (e) { return e.date >= r[0] && e.date <= r[1] && e.t !== "skip"; }).sort(function (a, b) { return a.date === b.date ? a.ts - b.ts : a.date < b.date ? -1 : 1; }).forEach(function (e) {
    var c = e.cust ? cust(e.cust) : null;
    out.push([e.date, fmtTime(e.ts), e.t === "sale" ? (e.src === "delivery" ? "Delivery" : "Counter sale") : e.t === "pay" ? "Payment received" : "Expense", e.no || "", c ? c.name : "", e.shift || "",
      e.lines ? e.lines.map(function (l) { return l.name + " " + qf(l.qty) + " " + l.unit + " @" + l.rate; }).join("; ") : "", e.total || "", e.t === "sale" ? e.paid : "", e.t === "sale" ? r2(e.total - e.paid) : "", e.t === "pay" ? e.amount : "", e.t === "exp" ? e.amount : "", e.cat || "", e.note || ""]);
  });
  saveFile("doodhpulse-" + r[0] + "-to-" + r[1] + ".csv", "﻿" + out.map(function (row) { return row.map(q).join(","); }).join("\r\n"), "text/csv");
}

/* ----- settings + backup ----- */
VIEWS.settings = function () {
  var shop = META.shop || {}, L = licenseState();
  return topbar(t("Settings"), { back: true }) + "<main>" +
    '<div class="card"><h2>' + t("Shop name") + '</h2><label class="f"><span>' + t("Shop name") + '</span><input class="in" id="stN" maxlength="40" value="' + esc(shop.name) + '"></label>' +
    '<label class="f"><span>' + t("Phone") + '</span><input class="in num" id="stP" maxlength="20" value="' + esc(shop.phone) + '"></label>' +
    '<label class="f"><span>' + t("Address") + '</span><input class="in" id="stA" maxlength="80" value="' + esc(shop.addr) + '"></label>' +
    '<label class="f"><span>' + t("Receipt message") + '</span><input class="in" id="stF" maxlength="60" value="' + esc(shop.footer) + '"></label>' +
    '<label class="f"><span>' + t("Language") + '</span><select class="in" id="stL"><option value="en">English</option><option value="ur"' + (LANG === "ur" ? " selected" : "") + ">اردو</option></select></label>" +
    '<button class="btn g full" id="stSave">' + t("Save") + "</button></div>" +
    '<div class="card"><h2>' + t("Owner PIN") + '</h2><p class="mut">' + (META.pin ? "PIN is on. The app asks for it when it opens." : "Optional. Stops staff or children from opening the app.") + '</p><div class="btns"><button class="btn o" id="stPin">' + (META.pin ? "Change PIN" : "Set PIN") + "</button>" + (META.pin ? '<button class="btn o" id="stPinOff">Remove PIN</button>' : "") + "</div></div>" +
    '<div class="card"><h2>' + t("Backup") + '</h2><p class="mut">Last backup: <b>' + (META.lastBackup ? fmtDate(dk(new Date(+META.lastBackup))) : "never") + "</b>. " + ENTRIES.length + " entries, " + CUSTOMERS.length + " customers. <span id=\"stStore\"></span></p>" +
    '<div class="btns"><button class="btn" data-act="backup">' + ic("save") + " " + t("Download backup") + '</button><button class="btn o" id="stRestore">' + t("Restore backup") + '</button></div><input type="file" id="stFile" accept=".json,application/json" hidden></div>' +
    responsibility() +
    '<div class="card"><h2>' + t("License") + '</h2><table class="t"><tr><td>Status</td><td class="e"><span class="pill g">Active</span></td></tr><tr><td>Licensed to</td><td class="e">' + esc(L.name) + "</td></tr><tr><td>Valid until</td><td class=\"e num\">" + (L.exp ? fmtDate(L.exp) : "Lifetime") + '</td></tr><tr><td>' + t("Device code") + '</td><td class="e num">' + esc(MC) + '</td></tr><tr><td>Version</td><td class="e num">' + VERSION + "</td></tr></table>" +
    '<p class="mut">Help: WhatsApp <b class="num">' + SUPPORT_TXT + "</b> · Power Pulse, Lahore</p></div></main>" + bottomNav();
};
function bindSettings() {
  $("#stSave").onclick = function () {
    var shop = Object.assign({}, META.shop, { name: $("#stN").value.trim() || META.shop.name, phone: $("#stP").value.trim(), addr: $("#stA").value.trim(), footer: $("#stF").value.trim() });
    LANG = $("#stL").value;
    write([["meta", "put", shop, "shop"], ["meta", "put", LANG, "lang"]]).then(function () { META.shop = shop; META.lang = LANG; applyLang(); toast("Saved"); render(); });
  };
  $("#stPin").onclick = function () {
    sheet(t("Owner PIN"), '<label class="f"><span>New PIN (4 to 8 digits)</span><input class="in num" id="np" type="password" inputmode="numeric" maxlength="8"></label><label class="f"><span>Again</span><input class="in num" id="np2" type="password" inputmode="numeric" maxlength="8"></label><button class="btn g full" id="npS">' + t("Save") + '</button><p class="mut">If you forget the PIN, Power Pulse cannot open the app for you. Keep it written somewhere safe.</p>', function (b) {
      b.querySelector("#npS").onclick = function () {
        var a = b.querySelector("#np").value, c = b.querySelector("#np2").value;
        if (!/^\d{4,8}$/.test(a)) { toast("Use 4 to 8 digits"); return; } if (a !== c) { toast("PINs do not match"); return; }
        pinHash(a).then(function (h) { return setMeta("pin", h); }).then(function () { S.unlocked = true; closeSheet(); toast("PIN set"); render(); });
      };
    });
  };
  var off = $("#stPinOff"); if (off) off.onclick = function () { confirmBox("Remove the PIN?", "Remove", function () { delete META.pin; write([["meta", "del", "pin"]]).then(render); }); };
  $("#stRestore").onclick = function () { $("#stFile").click(); };
  $("#stFile").onchange = function (e) { var f = e.target.files[0]; if (f) restoreBackup(f); };
  if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (s) { var el = $("#stStore"); if (el) el.textContent = "Using " + (s.usage / 1048576).toFixed(1) + " MB."; });
}
function saveFile(name, text, type) {
  var blob = new Blob([text], { type: type });
  var file; try { file = new File([blob], name, { type: type }); } catch (e) {}
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], title: name }).catch(function (e) { if (e && e.name !== "AbortError") dl(); });
  }
  dl(); return Promise.resolve();
  function dl() { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
}
function downloadBackup() {
  var meta = {}; Object.keys(META).forEach(function (k) { if (["install", "license", "clock", "pin"].indexOf(k) < 0) meta[k] = META[k]; });
  var data = { app: "doodhpulse", v: 1, at: new Date().toISOString(), shop: (META.shop || {}).name, meta: meta, products: PRODUCTS, customers: CUSTOMERS, entries: ENTRIES };
  var name = "doodhpulse-backup-" + dk() + ".json";
  saveFile(name, JSON.stringify(data), "application/json").then(function () { return setMeta("lastBackup", Date.now()); }).then(function () { toast("Backup ready. Keep it on WhatsApp, Gmail or Drive."); if (S.view === "home" || S.view === "settings") render(); });
}
function restoreBackup(f) {
  var rd = new FileReader();
  rd.onload = function () {
    var d; try { d = JSON.parse(rd.result); } catch (e) { toast("This is not a DoodhPulse backup file"); return; }
    if (!d || d.app !== "doodhpulse" || !Array.isArray(d.entries)) { toast("This is not a DoodhPulse backup file"); return; }
    confirmBox("Replace ALL data on this phone with the backup from " + (d.at || "").slice(0, 10) + " (" + d.entries.length + " entries)?", "Restore", function () {
      var ops = [["products", "clear"], ["customers", "clear"], ["entries", "clear"]];
      d.products.forEach(function (x) { ops.push(["products", "put", x]); });
      d.customers.forEach(function (x) { ops.push(["customers", "put", x]); });
      d.entries.forEach(function (x) { ops.push(["entries", "put", x]); });
      Object.keys(d.meta || {}).forEach(function (k) { if (["install", "license", "clock", "pin"].indexOf(k) < 0) ops.push(["meta", "put", d.meta[k], k]); });
      write(ops).then(function () { location.reload(); });
    }, true);
  };
  rd.readAsText(f);
}

/* ---------------- render + events ---------------- */
function applyLang() { document.documentElement.lang = LANG; document.documentElement.dir = LANG === "ur" ? "rtl" : "ltr"; }
function render() {
  closeSheet();
  if (renderGate()) return;
  var v = VIEWS[S.view] ? S.view : "home";
  APP.innerHTML = VIEWS[v]();
  if (v === "sale") bindSale();
  if (v === "settings") bindSettings();
  if (v === "customers") { var cq = $("#cq"); cq.oninput = function () { S.q = cq.value; var pos = cq.selectionStart; render(); var n = $("#cq"); n.focus(); n.setSelectionRange(pos, pos); }; }
  if (v === "delivery") $("#dDate").onchange = function (e) { S.ddate = e.target.value; render(); };
  if (v === "reports" && S.range === "custom") { $("#rF").onchange = function (e) { S.from = e.target.value; render(); }; $("#rT").onchange = function (e) { S.to = e.target.value; render(); }; }
}
APP.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-go],[data-act],[data-cust],[data-shift],[data-dtog],[data-dedit],[data-range],[data-prod],[data-exp],[data-entry]");
  if (!el) return;
  var d = el.dataset;
  if (d.go) { if (d.go === "sale" && S.view !== "sale") S.saleCust = S.saleCust || ""; go(d.go, d.shift ? { shift: d.shift } : null); return; }
  if (d.shift && !d.go) { S.shift = d.shift; render(); return; }
  if (d.cust) { go("customer", { custId: d.cust }); return; }
  if (d.range) { S.range = d.range; render(); return; }
  if (d.prod) { prodForm(prod(d.prod)); return; }
  if (d.exp) { expForm(ENTRIES.find(function (e) { return e.id === d.exp; })); return; }
  if (d.entry) { var en = ENTRIES.find(function (e) { return e.id === d.entry; }); if (en && en.t === "sale") showReceipt(en); else if (en && en.t === "pay") confirmBox("Delete this payment of " + rs(en.amount) + "?", t("Delete"), function () { delRow("entries", ENTRIES, en.id).then(render); }, true); return; }
  if (d.dedit) { deliveryEdit(cust(d.dedit)); return; }
  if (d.dtog) {
    var c = cust(d.dtog), date = S.ddate || dk(), e = deliveryEntry(c, date, S.shift);
    if (e) confirmBox(t("Undo") + ": " + c.name + "?", t("Undo"), function () { delRow("entries", ENTRIES, e.id).then(render); });
    else deliver(c, date, S.shift).then(render);
    return;
  }
  switch (d.act) {
    case "back": back(); break;
    case "backup": downloadBackup(); break;
    case "addCust": custForm(); break;
    case "editCust": custForm(cust(S.custId)); break;
    case "pay": payForm(cust(S.custId)); break;
    case "custSale": S.saleCust = S.custId; S.cart = []; go("sale"); break;
    case "remind": var cc = cust(S.custId); openWA(cc.phone, "Assalam o Alaikum " + cc.name + ",\n" + (META.shop || {}).name + " ka baqaya: " + rs(custBalance(cc)) + "\nMeharbani farma kar ada kar dein. Shukriya!"); break;
    case "bill": monthlyBill(cust(S.custId)); break;
    case "addExp": expForm(); break;
    case "addProd": prodForm(); break;
    case "sendReport": openWA("", reportText()); break;
    case "csv": csvExport(); break;
    case "deliverAll":
      var date2 = S.ddate || dk(), todo = CUSTOMERS.filter(function (x) { return onRoute(x, S.shift) && !deliveryEntry(x, date2, S.shift); });
      confirmBox(t("Mark all delivered") + " (" + todo.length + ")?", t("Deliver"), function () { todo.reduce(function (p, x) { return p.then(function () { return deliver(x, date2, S.shift); }); }, Promise.resolve()).then(render); });
      break;
  }
});
APP.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.matches("[role=button]")) e.target.click(); });
addEventListener("popstate", function () { if ($(".sheet")) { closeSheet(); history.pushState(null, ""); return; } if (S.view !== "home") { back(); history.pushState(null, ""); } });

/* ---------------- start ---------------- */
APP.innerHTML = '<div class="empty" style="padding-top:40vh">DoodhPulse…</div>';
idbOpen().then(function (d) { DB = d; return Promise.all(["meta", "products", "customers", "entries"].map(idbGetAll)); }).then(function (r) {
  META = r[0]; PRODUCTS = r[1]; CUSTOMERS = r[2]; ENTRIES = r[3];
  var ops = [];
  if (!META.install) { META.install = { id: uid() + uid(), at: Date.now() }; ops.push(["meta", "put", META.install, "install"]); }
  if (!PRODUCTS.length) DEFAULT_PRODUCTS.forEach(function (p, i) { var row = Object.assign({ id: uid(), sort: i + 1 }, p); PRODUCTS.push(row); ops.push(["products", "put", row]); });
  LANG = META.lang || "en"; applyLang();
  return (ops.length ? write(ops) : Promise.resolve()).then(function () { return sha256hex("doodhpulse|" + META.install.id); });
}).then(function (h) {
  h = h.toUpperCase(); MC = "MD-" + h.slice(0, 4) + "-" + h.slice(4, 8) + "-" + h.slice(8, 12);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  history.pushState(null, "");
  render();
}).catch(function (e) {
  APP.innerHTML = '<div class="gate"><div class="box"><div class="card"><h2>DoodhPulse could not open its storage</h2><p class="mut">' + esc(e && e.message) + '</p><p class="mut">Use Google Chrome (not Incognito) and make sure the phone has free space.</p></div></div></div>';
});
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
