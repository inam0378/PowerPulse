/* RestoPulse Tablet (Offline) — the whole "server" runs inside this browser.
   All data stays on this tablet/phone (IndexedDB). Nothing is sent to Power Pulse or any server. */
(function () {
"use strict";
var VERSION = "Tablet 1.0.0";
var CONTACT = "Contact the RestoPulse team:\nWhatsApp: 0310-0007049";
// Public half of the Power Pulse license key (same key pair as the PC version).
var LICENSE_PUBLIC_KEY = "MCowBQYDK2VwAyEAVho+IQcgjVHFSStEJGUa55LXYi8TYaTDCkaEZiCqc1Q=";

/* ---------- bill maths (same file as the PC version) ---------- */
var CALC = (function () { var module = { exports: {} };
/* RestoPulse bill maths. The database (create_order) uses the same rules and is the final word;
   this copy shows the cashier a live preview while the cart is being built. */
function legacyFree(lines, s) {
  if (!s.pizzaDrink) return [];
  const m = { S: "350ml", M: "500ml", L: "1 Litre" };
  const out = {};
  lines.forEach(l => { if (l.cat === "Pizza" && m[l.size]) { const k = "Free Drink " + m[l.size]; out[k] = (out[k] || 0) + l.qty; } });
  return Object.entries(out).map(([name, qty]) => ({ name, qty }));
}
const freebies = legacyFree;
function pad2(n) { return String(n).padStart(2, "0"); }
function offerLive(o, now) {
  if (!o || o.on === false) return false;
  const d = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  const hm = pad2(now.getHours()) + ":" + pad2(now.getMinutes());
  if (o.start && d < o.start) return false;
  if (o.end && d > o.end) return false;
  if (Array.isArray(o.days) && o.days.length && !o.days.map(Number).includes(now.getDay())) return false;
  if (o.from && o.to) {
    if (o.from <= o.to) { if (!(hm >= o.from && hm < o.to)) return false; }
    else if (!(hm >= o.from || hm < o.to)) return false;
  }
  return true;
}
function evalOffers(lines, s, items, now) {
  now = now || new Date();
  const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const applied = [], free = []; let total = 0;
  (s.offers || []).forEach(o => {
    if (!offerLive(o, now) || sub < (Number(o.minBill) || 0)) return;
    const scope = o.scope || "bill", v = Math.max(0, Number(o.value) || 0);
    let elig = 0, units = 0, amt = 0;
    lines.forEach(l => {
      const hit = scope === "bill" || (scope === "cats" && (o.cats || []).includes(l.cat)) || (scope === "items" && (o.items || []).includes(l.id));
      if (hit && l.price > 0) {
        elig += l.price * l.qty; units += l.qty;
        if (o.type === "flat" && scope !== "bill") amt += Math.min(v, l.price) * l.qty;
      }
    });
    if (elig <= 0) return;
    if (o.type === "pct") amt = elig * Math.min(v, 100) / 100;
    else if (o.type === "flat" && scope === "bill") amt = Math.min(v, elig);
    else if (o.type === "free") {
      amt = 0;
      const it = (items || []).find(i => o.free && i.id === o.free.id);
      if (it) {
        let q = Math.max(1, Number(o.free.qty) || 1); if (scope !== "bill") q *= units;
        free.push({ id: it.id, size: o.free.size || null, name: it.name + (o.free.size ? " (" + o.free.size + ")" : ""), qty: q, offer: o.name });
      }
    }
    if (amt > 0) { applied.push({ name: o.name || "Offer", amt: Math.round(amt) }); total += amt; }
  });
  return { discount: Math.round(Math.min(total, sub)), applied, free };
}
function calcOrder(o, s, ctx) {
  const lines = o.lines || [];
  const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const off = s.offer || {};
  let legacy = 0;
  if (off.on) lines.forEach(l => { if ((off.cats || []).includes(l.cat) && l.price > 0) legacy += Math.min(Number(off.amt) || 0, l.price) * l.qty; });
  const ev = ctx && ctx.items ? evalOffers(lines, s, ctx.items, ctx.now) : { discount: 0, applied: [], free: [] };
  const offd = Math.min(ev.discount, sub - legacy);
  let disc = o.discType === "pct" ? (sub - legacy - offd) * (Number(o.disc) || 0) / 100 : (Number(o.disc) || 0);
  disc = Math.min(Math.max(disc, 0), sub - legacy - offd);
  const rate = o.pay && o.pay !== "cash" ? Number(s.cardTax) || 0 : Number(s.cashTax) || 0;
  const base = sub - legacy - offd - disc;
  const tax = s.taxOnTop ? base * rate / 100 : base - base / (1 + rate / 100);
  const fee = o.type === "Delivery" ? Number(s.deliveryFee) || 0 : 0;
  const total = (s.taxOnTop ? base + tax : base) + fee;
  return Object.assign(o, { sub, offerAmt: legacy, offersAmt: Math.round(offd), offers: ev.applied, discAmt: Math.round(disc), taxRate: rate, tax: Math.round(tax), fee,
    total: Math.round(total), free: legacyFree(lines, s).concat(ev.free.map(f => ({ name: f.name, qty: f.qty }))), freeItems: ev.free });
}
const DEFAULT_SETTINGS = {
  name: "Demo Restaurant", tagline: "RestoPulse demo",
  address: "Main Boulevard, Lahore",
  phone: "0300-0000000", ntn: "",
  cashTax: 16, cardTax: 5, taxOnTop: false, deliveryFee: 50,
  offer: { on: false, amt: 50, cats: [] },
  pizzaDrink: false, width: "w80", lowStock: 10, tables: 12,
  footer: "Thank you! Please visit again.",
  perms: { manager: { profit: false }, cashier: { profit: false } }, offers: []
};
if (typeof module !== "undefined") module.exports = { calcOrder, freebies, evalOffers, offerLive, DEFAULT_SETTINGS };

return module.exports; })();
var calcOrder = CALC.calcOrder;

/* ---------- report helpers + PDF writer (same code as the PC version) ---------- */
var REPJS = (function () {
/* RestoPulse Offline — Sales Reporting
   - `sales` table (one row per invoice), kept in step with orders (new order → Completed, void → Refunded)
   - report queries for Daily / Monthly / Yearly / Custom with automatic breakdown (invoices / by day / by month)
   - A4 PDF writer with no dependencies (works with no internet) */


const PAY = { cash: "Cash", card: "Card", wallet: "Mobile Wallet", bank: "Bank Transfer" };
const pad = (n, w = 2) => String(n).padStart(w, "0");
const localStamp = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s) => DATE_RE.test(String(s || "")) && ymd(new Date(s + "T12:00:00")) === s;

function init(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS sales(
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    items_summary TEXT NOT NULL DEFAULT '',
    subtotal INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    tax INTEGER NOT NULL DEFAULT 0,
    net_total INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash','Card','Mobile Wallet','Bank Transfer')),
    status TEXT NOT NULL CHECK(status IN ('Completed','Refunded')));
  CREATE INDEX IF NOT EXISTS sales_created ON sales(created_at);`);
  const cols = db.prepare("SELECT name FROM pragma_table_info('sales')").all().map((c) => c.name);
  if (!cols.includes("table_number")) db.exec("ALTER TABLE sales ADD COLUMN table_number TEXT");
  if (!cols.includes("waiter_name")) db.exec("ALTER TABLE sales ADD COLUMN waiter_name TEXT");
}

function saleRow(o) {
  const items = (o.lines || []).map((l) => `${l.qty}x ${l.name}`).join(", ");
  return {
    id: o.id, inv: "INV-" + pad(o.no, 6), at: localStamp(o.ts), items: items.length > 400 ? items.slice(0, 397) + "..." : items,
    sub: Math.round(o.sub || 0), disc: Math.round((o.offerAmt || 0) + (o.offersAmt || 0) + (o.discAmt || 0)), tax: Math.round(o.tax || 0),
    net: Math.round(o.total || 0), pay: PAY[o.pay] || "Cash", st: o.status === "void" ? "Refunded" : "Completed",
    table: o.type === "Dine-in" && o.table ? String(o.table) : null, waiter: o.type === "Dine-in" && o.waiter ? String(o.waiter) : null,
  };
}
function upsert(db, o) {
  const r = saleRow(o);
  db.prepare(`INSERT INTO sales(id,invoice_number,created_at,items_summary,subtotal,discount,tax,net_total,payment_method,status,table_number,waiter_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET status=excluded.status, items_summary=excluded.items_summary, net_total=excluded.net_total, table_number=excluded.table_number, waiter_name=excluded.waiter_name`)
    .run(r.id, r.inv, r.at, r.items, r.sub, r.disc, r.tax, r.net, r.pay, r.st, r.table, r.waiter);
}
// fills in sales rows for orders that have none (first start after the update, or after a restore)
function backfill(db) {
  const rows = db.prepare("SELECT o.data FROM orders o LEFT JOIN sales s ON s.id=o.id WHERE s.id IS NULL").all();
  for (const r of rows) { try { upsert(db, JSON.parse(r.data)); } catch {} }
  return rows.length;
}
function rebuild(db) { db.exec("DELETE FROM sales"); return backfill(db); }

/* ---------- sample data (only for a separate demo database, never the restaurant's real one) ---------- */
function seedSample(db, fromYear) {
  if (db.prepare("SELECT COUNT(*) c FROM sales").get().c) return 0;
  let seed = 20261120; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const menu = [["Zinger Burger", 550], ["Chicken Shawarma", 350], ["Beef Burger", 650], ["Chicken Tikka Pizza (M)", 999], ["Fajita Pizza (L)", 1499], ["Club Sandwich", 480],
    ["Loaded Fries", 450], ["Fries", 250], ["Broast (Quarter)", 520], ["Chicken Wings (6pc)", 600], ["Cola 500ml", 120], ["Mineral Water", 100], ["Mint Margarita", 280], ["Zinger Deal", 750]];
  const ins = db.prepare("INSERT INTO sales(id,invoice_number,created_at,items_summary,subtotal,discount,tax,net_total,payment_method,status,table_number,waiter_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)");
  const WAIT = ["Imran", "Bilal", "Danish", "Kamran"];
  const end = new Date(); end.setHours(0, 0, 0, 0); const nowSec = (Date.now() - end.getTime()) / 1000;
  let n = 0;
  db.exec("BEGIN");
  for (let d = new Date(fromYear, 0, 1); d <= end; d.setDate(d.getDate() + 1)) {
    const wk = d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0, ramadanQuiet = d.getMonth() === 2 && d.getDate() < 25;
    const growth = 1 + (d.getFullYear() - fromYear) * 0.25;
    const count = Math.round((wk ? 34 : 22) * growth * (ramadanQuiet ? 0.6 : 1) * (0.75 + rnd() * 0.5));
    const times = Array.from({ length: count }, () => { const peak = rnd() < 0.55; const h = peak ? (rnd() < 0.5 ? 13 + Math.floor(rnd() * 2) : 20 + Math.floor(rnd() * 3)) : 11 + Math.floor(rnd() * 13); return Math.min(h, 23) * 3600 + Math.floor(rnd() * 3600); }).sort((a, b) => a - b);
    for (const t of times) {
      if (ymd(d) === ymd(end) && t > nowSec) break; // no sales "later today"
      n++;
      const lines = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => [pick(menu), 1 + (rnd() < 0.25 ? 1 : 0)]);
      const sub = lines.reduce((a, [[, p], q]) => a + p * q, 0);
      const r = rnd(), pay = r < 0.58 ? "Cash" : r < 0.8 ? "Card" : r < 0.95 ? "Mobile Wallet" : "Bank Transfer";
      const disc = rnd() < 0.12 ? Math.round(sub * (rnd() < 0.5 ? 0.1 : 0.05)) : 0;
      const base = sub - disc, rate = pay === "Cash" ? 16 : 5, tax = Math.round(base - base / (1 + rate / 100));
      const at = `${ymd(d)} ${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
      const dine = rnd() < 0.45;
      ins.run("sample-" + n, "INV-S" + pad(n, 6), at, lines.map(([[nm], q]) => `${q}x ${nm}`).join(", "), sub, disc, tax, base, pay, rnd() < 0.025 ? "Refunded" : "Completed",
        dine ? "T" + (1 + Math.floor(rnd() * 12)) : null, dine ? WAIT[Math.floor(rnd() * (d.getFullYear() > fromYear ? 4 : 3))] : null);
    }
  }
  db.exec("COMMIT");
  return n;
}

/* ---------- report ---------- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function range(q) {
  const mode = String(q.mode || "daily"), today = ymd(new Date());
  let start, end, label, where, params;
  if (mode === "daily") {
    const d = q.date == null || q.date === "" ? today : String(q.date);
    if (!validDate(d)) throw new Error("Choose a valid date.");
    start = end = d; where = "date(created_at) = :selected_date"; params = { selected_date: d };
    label = new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } else if (mode === "monthly") {
    const ym = q.month == null || q.month === "" ? today.slice(0, 7) : String(q.month);
    if (!/^\d{4}-\d{2}$/.test(ym) || +ym.slice(5) < 1 || +ym.slice(5) > 12) throw new Error("Choose a valid month.");
    const y = +ym.slice(0, 4), m = +ym.slice(5);
    start = `${ym}-01`; end = ymd(new Date(y, m, 0)); where = "strftime('%Y-%m', created_at) = :year_month"; params = { year_month: ym };
    label = `${MONTHS[m - 1]} ${y}`;
  } else if (mode === "yearly") {
    const y = q.year == null || q.year === "" ? today.slice(0, 4) : String(q.year);
    if (!/^\d{4}$/.test(y) || +y < 2000 || +y > 2100) throw new Error("Choose a valid year.");
    start = `${y}-01-01`; end = `${y}-12-31`; where = "strftime('%Y', created_at) = :year"; params = { year: y };
    label = `Year ${y}`;
  } else if (mode === "custom") {
    if (!validDate(q.start) || !validDate(q.end)) throw new Error("Choose a start date and an end date.");
    if (q.end < q.start) throw new Error("The end date is before the start date.");
    start = q.start; end = q.end; where = "date(created_at) BETWEEN :start_date AND :end_date"; params = { start_date: start, end_date: end };
    const f = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    label = start === end ? f(start) : `${f(start)} – ${f(end)}`;
  } else throw new Error("Unknown report type.");
  const days = Math.round((Date.parse(end + "T12:00:00") - Date.parse(start + "T12:00:00")) / 864e5) + 1;
  if (days > 3660) throw new Error("Choose a range of 10 years or less.");
  return { mode, start, end, days, label, where, params };
}

function report(db, q, business) {
  const R = range(q), W = R.where, P = R.params;
  const k = db.prepare(`SELECT
      COALESCE(SUM(CASE WHEN status='Completed' THEN 1 END),0) orders,
      COALESCE(SUM(CASE WHEN status='Completed' THEN subtotal END),0) gross,
      COALESCE(SUM(CASE WHEN status='Completed' THEN discount END),0) discount,
      COALESCE(SUM(CASE WHEN status='Completed' THEN tax END),0) tax,
      COALESCE(SUM(CASE WHEN status='Completed' THEN net_total END),0) net,
      COALESCE(SUM(CASE WHEN status='Refunded' THEN 1 END),0) refunds,
      COALESCE(SUM(CASE WHEN status='Refunded' THEN net_total END),0) refunded
    FROM sales WHERE ${W}`).get(P);
  const kpi = Object.fromEntries(Object.entries(k).map(([a, b]) => [a, Number(b) || 0]));
  const payments = db.prepare(`SELECT payment_method method, COUNT(*) orders, COALESCE(SUM(net_total),0) amount FROM sales WHERE ${W} AND status='Completed' GROUP BY payment_method ORDER BY amount DESC`).all(P)
    .map((r) => ({ method: r.method, orders: Number(r.orders), amount: Number(r.amount) }));
  let breakdown;
  if (R.days === 1) {
    breakdown = { kind: "invoices", rows: db.prepare(`SELECT invoice_number, created_at, items_summary, payment_method, status, subtotal, discount, tax, net_total, table_number, waiter_name FROM sales WHERE ${W} ORDER BY created_at, invoice_number`).all(P)
      .map((r) => ({ invoice: r.invoice_number, time: r.created_at.slice(11, 16), table: r.table_number || "", waiter: r.waiter_name || "", items: r.items_summary, method: r.payment_method, status: r.status, subtotal: Number(r.subtotal), discount: Number(r.discount), tax: Number(r.tax), net: Number(r.net_total) })) };
  } else if (R.days <= 31) {
    const got = new Map(db.prepare(`SELECT date(created_at) day,
        COALESCE(SUM(CASE WHEN status='Completed' THEN 1 END),0) orders,
        COALESCE(SUM(CASE WHEN status='Completed' THEN subtotal END),0) gross,
        COALESCE(SUM(CASE WHEN status='Refunded' THEN net_total END),0) refunds,
        COALESCE(SUM(CASE WHEN status='Completed' THEN net_total END),0) net
      FROM sales WHERE ${W} GROUP BY date(created_at)`).all(P).map((r) => [r.day, r]));
    const rows = [];
    for (let d = new Date(R.start + "T12:00:00"); ymd(d) <= R.end; d.setDate(d.getDate() + 1)) {
      const r = got.get(ymd(d)) || {};
      rows.push({ day: ymd(d), orders: Number(r.orders || 0), gross: Number(r.gross || 0), refunds: Number(r.refunds || 0), net: Number(r.net || 0) });
    }
    breakdown = { kind: "days", rows };
  } else {
    const got = new Map(db.prepare(`SELECT strftime('%Y-%m', created_at) month,
        COALESCE(SUM(CASE WHEN status='Completed' THEN 1 END),0) orders,
        COALESCE(SUM(CASE WHEN status='Completed' THEN tax END),0) tax,
        COALESCE(SUM(CASE WHEN status='Completed' THEN discount END),0) discount,
        COALESCE(SUM(CASE WHEN status='Completed' THEN net_total END),0) net
      FROM sales WHERE ${W} GROUP BY strftime('%Y-%m', created_at)`).all(P).map((r) => [r.month, r]));
    const rows = [];
    for (let d = new Date(R.start.slice(0, 7) + "-01T12:00:00"); ymd(d).slice(0, 7) <= R.end.slice(0, 7); d.setMonth(d.getMonth() + 1)) {
      const m = ymd(d).slice(0, 7), r = got.get(m) || {};
      rows.push({ month: m, orders: Number(r.orders || 0), tax: Number(r.tax || 0), discount: Number(r.discount || 0), net: Number(r.net || 0) });
    }
    breakdown = { kind: "months", rows };
  }
  const tsort = (a, b) => { const x = +String(a).replace(/\D+/g, ""), y = +String(b).replace(/\D+/g, ""); return x && y && x !== y ? x - y : String(a).localeCompare(String(b)); };
  const waiters = db.prepare(`SELECT waiter_name waiter, COUNT(*) orders, COALESCE(SUM(net_total),0) sales, GROUP_CONCAT(DISTINCT table_number) tables
      FROM sales WHERE ${W} AND status='Completed' AND waiter_name IS NOT NULL AND waiter_name<>'' GROUP BY waiter_name ORDER BY sales DESC`).all(P)
    .map((r) => ({ waiter: r.waiter, orders: Number(r.orders), sales: Number(r.sales), tables: String(r.tables || "").split(",").filter(Boolean).sort(tsort) }));
  const file = `Sales_Report_${R.start === R.end ? R.start : R.start + "_to_" + R.end}.pdf`;
  return { mode: R.mode, start: R.start, end: R.end, days: R.days, label: R.label, generated: localStamp(Date.now()), business, kpi, payments, waiters, breakdown, file };
}

/* ---------- PDF (A4, Helvetica, no libraries) ---------- */
const HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const HB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const WIN = { "–": 0x96, "—": 0x97, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "…": 0x85, "·": 0xb7, "×": 0xd7, "é": 0xe9, "è": 0xe8, "ä": 0xe4, "ö": 0xf6, "ü": 0xfc, "ñ": 0xf1, "ç": 0xe7, "©": 0xa9 };
const toWin = (s) => [...String(s == null ? "" : s)].map((c) => { const k = c.charCodeAt(0); return k >= 32 && k < 127 ? k : WIN[c] || 63; });
function textWidth(s, size, bold) { const t = bold ? HB : HW; return toWin(s).reduce((a, k) => a + (k >= 32 && k < 127 ? t[k - 32] : 556), 0) * size / 1000; }
function fit(s, w, size, bold) { s = String(s == null ? "" : s); if (textWidth(s, size, bold) <= w) return s; while (s.length > 1 && textWidth(s + "…", size, bold) > w) s = s.slice(0, -1); return s.trimEnd() + "…"; }
const esc = (codes) => codes.map((k) => (k === 40 || k === 41 || k === 92 ? "\\" + String.fromCharCode(k) : String.fromCharCode(k))).join("");
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((x) => x.toFixed(3)).join(" "); };

class Doc {
  constructor() { this.W = 595.28; this.H = 841.89; this.M = 40; this.pages = []; this.add(); }
  add() { this.ops = []; this.pages.push(this.ops); this.y = this.H - this.M; return this; }
  rect(x, y, w, h, fill, stroke) { this.ops.push(`${fill ? rgb(fill) + " rg " : ""}${stroke ? rgb(stroke) + " RG 0.6 w " : ""}${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? "B" : fill ? "f" : "S"}`); }
  line(x1, y1, x2, y2, color, wd) { this.ops.push(`${rgb(color)} RG ${wd || 0.6} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`); }
  text(s, x, y, size, opt) { opt = opt || {}; const b = !!opt.bold; let tx = x; const w = textWidth(s, size, b);
    if (opt.align === "right") tx = x - w; else if (opt.align === "center") tx = x - w / 2;
    this.ops.push(`BT /${b ? "F2" : "F1"} ${size} Tf ${rgb(opt.color || "#17150f")} rg ${tx.toFixed(2)} ${y.toFixed(2)} Td (${esc(toWin(s))}) Tj ET`); return w; }
  space(h) { return this.y - h >= this.M + 18; }
  ensure(h) { if (!this.space(h)) { this.add(); return true; } return false; }
  build(footer) {
    const objs = [], n = this.pages.length, enc = (s) => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
    objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    const kids = [];
    this.pages.forEach((ops, i) => {
      const f = footer(i + 1, n), pg = 5 + i * 2, ct = pg + 1;
      const body = ops.concat(f).join("\n");
      objs[ct] = `<< /Length ${enc(body).length} >>\nstream\n${body}\nendstream`;
      objs[pg] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${ct} 0 R >>`;
      kids.push(`${pg} 0 R`);
    });
    objs[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${n} >>`;
    const parts = [enc("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")], offs = [];
    let pos = parts[0].length;
    for (let i = 1; i < objs.length; i++) { const b = enc(`${i} 0 obj\n${objs[i]}\nendobj\n`); offs[i] = pos; parts.push(b); pos += b.length; }
    let x = `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objs.length; i++) x += String(offs[i]).padStart(10, "0") + " 00000 n \n";
    x += `trailer\n<< /Size ${objs.length} /Root 1 0 R /Info << /Producer (RestoPulse Offline) /Title (Sales Report) >> >>\nstartxref\n${pos}\n%%EOF\n`;
    parts.push(enc(x));
    const all = new Uint8Array(parts.reduce((t, p) => t + p.length, 0)); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; } return all;
  }
}
const money = (n) => "PKR " + Math.round(n || 0).toLocaleString("en-US");
const num = (n) => Math.round(n || 0).toLocaleString("en-US");
const BADGE = { daily: "DAILY", monthly: "MONTHLY", yearly: "YEARLY", custom: "CUSTOM RANGE" };
const dayLabel = (s) => new Date(s + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
const monthLabel = (s) => `${MONTHS[+s.slice(5) - 1].slice(0, 3)} ${s.slice(0, 4)}`;

function columns(rep) {
  const k = rep.breakdown.kind, rows = rep.breakdown.rows, sum = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0);
  if (k === "invoices") return { title: "Invoices", cols: [
      { h: "Invoice", w: 64, v: (r) => r.invoice }, { h: "Time", w: 36, v: (r) => r.time }, { h: "Table #", w: 42, v: (r) => r.table || "-" }, { h: "Waiter", w: 56, v: (r) => r.waiter || "-" },
      { h: "Items", w: 93, v: (r) => r.items }, { h: "Payment", w: 66, v: (r) => r.method }, { h: "Status", w: 56, v: (r) => r.status }, { h: "Discount", w: 48, a: "r", v: (r) => num(r.discount) }, { h: "Net total", w: 54, a: "r", v: (r) => num(r.net) }],
    total: ["Total", "", "", "", `${rows.filter((r) => r.status === "Completed").length} completed`, "", rows.some((r) => r.status === "Refunded") ? `${rows.filter((r) => r.status === "Refunded").length} refunded` : "", num(rows.filter((r) => r.status === "Completed").reduce((a, r) => a + r.discount, 0)), num(rows.filter((r) => r.status === "Completed").reduce((a, r) => a + r.net, 0))] };
  if (k === "days") return { title: "Daily breakdown", cols: [
      { h: "Date", w: 135, v: (r) => dayLabel(r.day) }, { h: "Orders", w: 70, a: "r", v: (r) => num(r.orders) }, { h: "Gross sales", w: 105, a: "r", v: (r) => num(r.gross) },
      { h: "Refunds", w: 95, a: "r", v: (r) => num(r.refunds) }, { h: "Net revenue", w: 110, a: "r", v: (r) => num(r.net) }],
    total: ["Total", num(sum("orders")), num(sum("gross")), num(sum("refunds")), num(sum("net"))] };
  return { title: "Monthly breakdown", cols: [
      { h: "Month", w: 120, v: (r) => monthLabel(r.month) }, { h: "Orders", w: 80, a: "r", v: (r) => num(r.orders) }, { h: "Tax", w: 100, a: "r", v: (r) => num(r.tax) },
      { h: "Discounts", w: 100, a: "r", v: (r) => num(r.discount) }, { h: "Net revenue", w: 115, a: "r", v: (r) => num(r.net) }],
    total: ["Total", num(sum("orders")), num(sum("tax")), num(sum("discount")), num(sum("net"))] };
}

function table(doc, title, cols, rows, total, keepTogether) {
  const RH = 17, HH = 20, x0 = doc.M, wAll = cols.reduce((a, c) => a + c.w, 0), sc = (doc.W - 2 * doc.M) / wAll;
  cols = cols.map((c) => ({ ...c, w: c.w * sc }));
  const need = 26 + HH + RH * (rows.length + (total ? 1 : 0)) + 6;
  if (keepTogether && !doc.space(need) && need < doc.H - 2 * doc.M - 18) doc.add();
  const head = (cont) => {
    doc.ensure(26 + HH + RH * 2);
    doc.text(title + (cont ? " (continued)" : ""), x0, doc.y - 14, 12, { bold: true }); doc.y -= 24;
    doc.rect(x0, doc.y - HH, doc.W - 2 * doc.M, HH, "#17150f");
    let x = x0; for (const c of cols) { doc.text(c.h, c.a === "r" ? x + c.w - 6 : x + 6, doc.y - 13.5, 8.5, { bold: true, color: "#ffffff", align: c.a === "r" ? "right" : "left" }); x += c.w; }
    doc.y -= HH;
  };
  head(false);
  rows.forEach((r, i) => {
    const last = i === rows.length - 1;
    if (!doc.space(RH * (last && total ? 2 : 1))) { doc.add(); head(true); }
    if (i % 2) doc.rect(x0, doc.y - RH, doc.W - 2 * doc.M, RH, "#f6f3ea");
    let x = x0;
    for (const c of cols) { const v = fit(c.v(r), c.w - 12, 8.5); doc.text(v, c.a === "r" ? x + c.w - 6 : x + 6, doc.y - 12, 8.5, { align: c.a === "r" ? "right" : "left", color: r.status === "Refunded" ? "#b3261e" : "#17150f" }); x += c.w; }
    doc.y -= RH;
  });
  if (!rows.length) { doc.text("No sales in this period", doc.W / 2, doc.y - 14, 9, { align: "center", color: "#6a6555" }); doc.y -= RH + 4; }
  if (total) {
    if (!doc.space(RH + 4)) { doc.add(); head(true); }
    doc.line(x0, doc.y, doc.W - doc.M, doc.y, "#17150f", 1.2);
    doc.rect(x0, doc.y - RH - 2, doc.W - 2 * doc.M, RH + 2, "#fff4cc");
    let x = x0;
    cols.forEach((c, i) => { const v = fit(total[i], c.w - 12, 9, true); doc.text(v, c.a === "r" ? x + c.w - 6 : x + 6, doc.y - 13, 9, { bold: true, align: c.a === "r" ? "right" : "left" }); x += c.w; });
    doc.y -= RH + 2;
  }
  doc.y -= 16;
}

function pdf(rep) {
  const d = new Doc(), M = d.M, IW = d.W - 2 * M, b = rep.business || {};
  // header
  d.rect(0, d.H - 6, d.W, 6, "#ffc800");
  d.text(fit(b.name || "Restaurant", IW - 140, 18, true), M, d.y - 16, 18, { bold: true });
  const bw = textWidth(BADGE[rep.mode], 8.5, true) + 16;
  d.rect(d.W - M - bw, d.y - 19, bw, 17, "#17150f"); d.text(BADGE[rep.mode], d.W - M - bw / 2, d.y - 13.5, 8.5, { bold: true, color: "#ffc800", align: "center" });
  d.y -= 24;
  if (b.address || b.phone) { d.text(fit([b.address, b.phone].filter(Boolean).join("  ·  "), IW, 9), M, d.y - 10, 9, { color: "#6a6555" }); d.y -= 14; }
  d.y -= 6; d.line(M, d.y, d.W - M, d.y, "#e6e1d2", 0.8); d.y -= 20;
  d.text("Sales Report", M, d.y, 15, { bold: true });
  d.text(rep.label, M, d.y - 17, 10.5); d.text(`${rep.start}  to  ${rep.end}  ·  ${rep.days} day${rep.days == 1 ? "" : "s"}`, M, d.y - 31, 8.5, { color: "#6a6555" });
  d.text("Generated", d.W - M, d.y, 8.5, { align: "right", color: "#6a6555" }); d.text(rep.generated, d.W - M, d.y - 13, 9.5, { align: "right", bold: true });
  d.y -= 52;
  // KPI cards (kept on one row, never split)
  const k = rep.kpi, cards = [["Gross sales", money(k.gross), "before discounts"], ["Discounts & tax", money(k.discount), "tax " + money(k.tax)], ["Net revenue", money(k.net), "completed orders"], ["Total orders", num(k.orders), k.refunds ? `${k.refunds} refunded · ${money(k.refunded)}` : "no refunds"]];
  const gap = 10, cw = (IW - gap * 3) / 4, ch = 62;
  d.ensure(ch + 10);
  cards.forEach(([l, v, s], i) => {
    const x = M + i * (cw + gap), top = d.y;
    d.rect(x, top - ch, cw, ch, i === 2 ? "#fff4cc" : "#faf8f2", i === 2 ? "#e0b400" : "#e6e1d2");
    d.text(l.toUpperCase(), x + 9, top - 15, 7.5, { bold: true, color: "#6a6555" });
    d.text(fit(v, cw - 18, 13.5, true), x + 9, top - 34, 13.5, { bold: true });
    d.text(fit(s, cw - 18, 7.5), x + 9, top - 50, 7.5, { color: k.refunds && i === 3 ? "#b3261e" : "#6a6555" });
  });
  d.y -= ch + 22;
  // breakdown
  const t = columns(rep);
  table(d, t.title, t.cols, rep.breakdown.rows, t.total, rep.breakdown.rows.length <= 8);
  if (rep.waiters && rep.waiters.length) {
    const ws = rep.waiters.reduce((a, w) => a + w.sales, 0), wo = rep.waiters.reduce((a, w) => a + w.orders, 0);
    table(d, "Sales by waiter (Dine-In)", [{ h: "Waiter", w: 120, v: (r) => r.waiter }, { h: "Orders", w: 65, a: "r", v: (r) => num(r.orders) }, { h: "Total sales", w: 105, a: "r", v: (r) => num(r.sales) }, { h: "Tables served", w: 225, v: (r) => r.tables.join(", ") }],
      rep.waiters, ["Total", num(wo), num(ws), ""], rep.waiters.length <= 12);
  }
  if (rep.payments.length || rep.breakdown.kind === "invoices") {
    const tot = rep.payments.reduce((a, p) => a + p.amount, 0), cnt = rep.payments.reduce((a, p) => a + p.orders, 0);
    table(d, "Payment methods", [{ h: "Method", w: 200, v: (r) => r.method }, { h: "Orders", w: 100, a: "r", v: (r) => num(r.orders) }, { h: "Share", w: 90, a: "r", v: (r) => (tot ? Math.round((r.amount / tot) * 1000) / 10 : 0) + "%" }, { h: "Amount", w: 125, a: "r", v: (r) => num(r.amount) }],
      rep.payments, ["Total", num(cnt), tot ? "100%" : "0%", num(tot)], true);
  }
  return d.build((p, n) => [
    `${rgb("#e6e1d2")} RG 0.6 w ${M} 30 m ${(d.W - M).toFixed(2)} 30 l S`,
    `BT /F1 7.5 Tf ${rgb("#6a6555")} rg ${M} 18 Td (${esc(toWin(`${b.name || ""} · Sales Report · ${rep.start}${rep.start === rep.end ? "" : " to " + rep.end}`))}) Tj ET`,
    `BT /F1 7.5 Tf ${rgb("#6a6555")} rg ${(d.W - M - textWidth(`RestoPulse · Page ${p} of ${n}`, 7.5)).toFixed(2)} 18 Td (${esc(toWin(`RestoPulse · Page ${p} of ${n}`))}) Tj ET`]);
}



return { range: range, pdf: pdf, saleRow: saleRow, localStamp: localStamp, PAY: PAY };
})();

var DEFAULT_SETTINGS = { name: "My Restaurant", tagline: "", address: "", phone: "", ntn: "", cashTax: 16, cardTax: 5, taxOnTop: false, deliveryFee: 0,
  offer: { on: false, amt: 0, cats: [] }, pizzaDrink: false, width: "w80", lowStock: 10, tables: 12, footer: "Thank you! Please visit again.",
  perms: { manager: { profit: false }, cashier: { profit: false } }, offers: [] };

/* ---------- small helpers ---------- */
var now = function () { return Date.now(); };
function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  var h = Array.from(b, function (x) { return x.toString(16).padStart(2, "0"); }).join("");
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
}
var clone = function (x) { return x == null ? x : JSON.parse(JSON.stringify(x)); };
function AppError(m, code) { var e = new Error(m); e.code = code || 400; e.app = true; return e; }
function fail(m, c) { throw AppError(m, c); }
var hexOf = function (buf) { return Array.from(new Uint8Array(buf), function (x) { return x.toString(16).padStart(2, "0"); }).join(""); };
var randHex = function (n) { return hexOf(crypto.getRandomValues(new Uint8Array(n))); };
var te = new TextEncoder();
function b64u(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

/* ---------- storage (IndexedDB on this device) ---------- */
var IDB = null;
var M = {}, USERS = [], ITEMS = [], WAITERS = [], SESS = {}, AUDIT = [], ORDERS = [], BYNO = new Map(), BYKEY = new Map(), SALES = new Map();
var dirty = new Set(), dirtyOrders = new Map();
function idbOpen() {
  return new Promise(function (ok, no) {
    var r = indexedDB.open("restopulse-tablet", 1);
    r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv"); if (!d.objectStoreNames.contains("orders")) d.createObjectStore("orders", { keyPath: "id" }); };
    r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; r.onblocked = function () { no(new Error("Close other RestoPulse tabs and open the app again.")); };
  });
}
function idbAll(store) {
  return new Promise(function (ok, no) {
    var t = IDB.transaction(store, "readonly"), s = t.objectStore(store), out = {};
    if (store === "orders") { var q = s.getAll(); q.onsuccess = function () { ok(q.result); }; q.onerror = function () { no(q.error); }; return; }
    var c = s.openCursor(); c.onsuccess = function () { var cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else ok(out); }; c.onerror = function () { no(c.error); };
  });
}
var save = function (k) { dirty.add(k); };
var saveOrder = function (o) { dirtyOrders.set(o.id, o); };
var KV = { meta: function () { return M; }, users: function () { return USERS; }, items: function () { return ITEMS; }, waiters: function () { return WAITERS; }, sessions: function () { return SESS; }, audit: function () { return AUDIT; } };
var flushing = Promise.resolve();
function flush(clearOrders) {
  if (!dirty.size && !dirtyOrders.size && !clearOrders) return flushing;
  var keys = Array.from(dirty), ords = Array.from(dirtyOrders.values()); dirty.clear(); dirtyOrders.clear();
  var snap = keys.map(function (k) { return [k, clone(KV[k]())]; });
  flushing = flushing.then(function () {
    return new Promise(function (ok, no) {
      var t; try { t = IDB.transaction(["kv", "orders"], "readwrite", { durability: "strict" }); } catch (e) { t = IDB.transaction(["kv", "orders"], "readwrite"); }
      var kv = t.objectStore("kv"), os = t.objectStore("orders");
      if (clearOrders) os.clear();
      snap.forEach(function (p) { kv.put(p[1], p[0]); });
      ords.forEach(function (o) { os.put(o); });
      t.oncomplete = function () { ok(); };
      t.onerror = t.onabort = function () { no(new Error("Could not save on this device" + (t.error ? ": " + t.error.message : "") + ". The device storage may be full.")); };
    });
  });
  return flushing;
}
// all-or-nothing: if anything fails half way, put every in-memory table back as it was
function tx(fn) {
  var snap = clone({ M: M, USERS: USERS, ITEMS: ITEMS, WAITERS: WAITERS, SESS: SESS }), d0 = new Set(dirty), o0 = new Map(dirtyOrders), n0 = ORDERS.length;
  try { return fn(); } catch (e) {
    M = snap.M; USERS = snap.USERS; ITEMS = snap.ITEMS; WAITERS = snap.WAITERS; SESS = snap.SESS; dirty = d0; dirtyOrders = o0;
    while (ORDERS.length > n0) { var o = ORDERS.pop(); BYNO.delete(o.no); BYKEY.delete(o.ikey); SALES.delete(o.id); }
    throw e;
  }
}
var getMeta = function (k, d) { return M[k] === undefined ? d : clone(M[k]); };
var setMeta = function (k, v) { M[k] = clone(v); save("meta"); };
function audit(u, a, d) { AUDIT.push([now(), u || "", a, d || {}]); if (AUDIT.length > 3000) AUDIT.splice(0, AUDIT.length - 3000); save("audit"); }
function addOrder(row) { ORDERS.push(row); BYNO.set(row.no, row); BYKEY.set(row.ikey, row); saveOrder(row); }
var upsertSale = function (o) { try { SALES.set(o.id, REPJS.saleRow(o)); } catch (e) {} };

/* ---------- passwords (PBKDF2-SHA256, built into the browser) ---------- */
function pbkdf2(pw, salt) {
  return crypto.subtle.importKey("raw", te.encode(String(pw)), "PBKDF2", false, ["deriveBits"]).then(function (k) {
    return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: te.encode(salt), iterations: 120000 }, k, 256);
  }).then(hexOf);
}
function hashPw(pw) { var salt = randHex(16); return pbkdf2(pw, salt).then(function (h) { return { salt: salt, hash: h, algo: "pbkdf2" }; }); }
function checkPw(u, pw) {
  if (!u || u.algo !== "pbkdf2" || !u.hash) return Promise.resolve(false);
  return pbkdf2(pw, u.salt).then(function (h) { var a = h, b = u.hash, r = a.length ^ b.length; for (var i = 0; i < a.length && i < b.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; });
}
function randPw() { var a = "abcdefghjkmnpqrstuvwxyz23456789", s = ""; crypto.getRandomValues(new Uint8Array(10)).forEach(function (b) { s += a[b % a.length]; }); return s.slice(0, 5) + "-" + s.slice(5); }
var unameOk = function (u) { return /^[a-z0-9._-]{3,30}$/.test(u); };
var sha256hex = function (s) { return crypto.subtle.digest("SHA-256", te.encode(s)).then(hexOf); };

/* ---------- license (locked to this installation, signed by Power Pulse) ---------- */
var MC = "";
var PUB32 = (function () { var d = b64u(LICENSE_PUBLIC_KEY.replace(/=+$/, "")); return d.slice(d.length - 32); })();
var keyCache = new Map();
function verifyKey(key) {
  key = String(key || "").trim();
  if (keyCache.has(key)) return keyCache.get(key);
  var l = null;
  try {
    var parts = key.split("."), payload = b64u(parts[0]), sig = b64u(parts[1]);
    if (window.nacl && nacl.sign.detached.verify(payload, sig, PUB32)) { var j = JSON.parse(new TextDecoder().decode(payload)); if (j.mc === MC) l = j; }
  } catch (e) {}
  keyCache.set(key, l); return l;
}
var clockSeen = 0;
function clockNow() {
  var t = now(); if (!clockSeen) clockSeen = +getMeta("clock", 0) || 0;
  if (t > clockSeen + 60e3) { clockSeen = t; setMeta("clock", t); }
  return Math.max(t, clockSeen);
}
function licenseState() {
  var lic = getMeta("license", null), l = lic && verifyKey(lic.key);
  if (!l) return { status: "inactive", machine: MC, devices: 1, tablet: true };
  var exp = l.exp ? Date.parse(l.exp + "T23:59:59") : null;
  return { status: exp && clockNow() > exp ? "expired" : "active", name: l.name, devices: 1, exp: exp, machine: MC, tablet: true };
}
function subJson() {
  var L = licenseState();
  return { status: L.status === "active" ? "active" : "expired", plan: { id: "offline", name: L.status === "inactive" ? "Not activated" : "Tablet license · this device", maxDevices: 1 }, expires: L.exp || null, license: L };
}

/* ---------- context ---------- */
var LV = { owner: 3, manager: 2, cashier: 1, kitchen: 0.5 };
var userById = function (id) { return USERS.find(function (u) { return u.id === id; }); };
function ctx(sess, need, needActive) {
  if (!sess) fail("Please log in.", 401);
  var u = userById(sess.user_id);
  if (!u || !u.active) fail("Your account is disabled. Please contact the owner.", 403);
  if ((LV[u.role] || 0) < (LV[need || "cashier"] || 1)) fail("You do not have permission for this.", 403);
  if (needActive !== false && subJson().status !== "active") fail("PLAN_REQUIRED: RestoPulse is not activated on this device.", 402);
  return u;
}
var settings = function () { return getMeta("settings", DEFAULT_SETTINGS); };
var allWaiters = function () { return WAITERS.slice().sort(function (a, b) { return (a.sort - b.sort) || a.name.localeCompare(b.name); }).map(function (w) { return { id: w.id, name: w.name, active: !!w.active }; }); };
var reportBiz = function () { var st = settings(); return { name: st.name, address: st.address, phone: st.phone }; };
var canProfit = function (u) { return u.role === "owner" || !!((settings().perms || {})[u.role] || {}).profit; };
var sortedItems = function () { return ITEMS.slice().sort(function (a, b) { return a.sort - b.sort; }); };
var allItems = function () { return sortedItems().map(function (r) { return clone(r.data); }); };
var itemRow = function (id) { return ITEMS.find(function (r) { return r.id === String(id); }); };
var getItem = function (id) { var r = itemRow(id); return r ? clone(r.data) : null; };
function putItem(it, sort) { var r = itemRow(it.id); if (r) r.data = clone(it); else ITEMS.push({ id: it.id, sort: sort, data: clone(it) }); save("items"); }
function setItemData(it) { var r = itemRow(it.id); if (r) { r.data = clone(it); save("items"); } }
var publicItem = function (it, prof) { var o = Object.assign({}, it); if (!prof) { delete o.cost; delete o.sizeCosts; } return o; };
var orderData = function (r) { return clone(r.data); };

/* ---------- money maths ---------- */
function unitCost(id, size, items, depth) {
  var it = items.find(function (i) { return i.id === id; }); if (!it || (depth || 0) > 3) return 0;
  var sc = it.sizeCosts || {};
  if (size && sc[size] != null && sc[size] !== "") return +sc[size];
  if (it.cost != null && it.cost !== "") return +it.cost;
  if (it.components && it.components.length) return it.components.reduce(function (a, c) { return a + unitCost(c.id, c.size, items, (depth || 0) + 1) * (c.qty || 1); }, 0);
  return 0;
}
function takeStock(items, id, q) {
  var it = items.find(function (i) { return i.id === id; }); if (!it) return;
  if (it.components && it.components.length) { it.components.forEach(function (c) { takeStock(items, c.id, (c.qty || 1) * q); }); return; }
  if (it.track) { if (q > 0 && it.stock < q) fail(it.name + ": only " + it.stock + " left in stock."); it.stock -= q; it._dirty = 1; }
}

/* ---------- RPC handlers (same names and answers as the PC version) ---------- */
var R = {};
R.branding = function () { return { setup: true, name: "RestoPulse", platform: true, offline: true, tablet: true }; };
R.me = function (s) {
  if (!s) fail("Please log in.", 401);
  var u = userById(s.user_id); if (!u) fail("Please log in.", 401);
  return { member: true, admin: false, active: !!u.active, businessStatus: "active", business: getMeta("business"),
    me: { id: u.id, name: u.name, role: u.role, mustChange: !!u.must_change }, sub: subJson(), contact: CONTACT, offline: true, tablet: true };
};
R.get_state = function (s) {
  var u = ctx(s, "kitchen", true), prof = canProfit(u), since = now() - (u.role === "kitchen" ? 1 : 62) * 864e5;
  return { business: getMeta("business"), me: { id: u.id, name: u.name, role: u.role, profit: prof }, settings: settings(), seq: getMeta("seq", 0), sub: subJson(),
    items: allItems().map(function (i) { return publicItem(i, prof); }), waiters: allWaiters(),
    orders: ORDERS.filter(function (r) { return r.ts > since; }).sort(function (a, b) { return a.ts - b.ts; }).map(function (r) { var o = orderData(r); if (prof) o.cost = r.cost; return o; }) };
};
R.create_order = function (s, a) {
  var u = ctx(s, "cashier", true), p = (a && a.p) || {};
  var key = String(p.key || "").slice(0, 64); if (!key) fail("Order key missing.");
  var dup = BYKEY.get(key); if (dup) return orderData(dup);
  if (!Array.isArray(p.lines) || !p.lines.length || p.lines.length > 100) fail("The cart is empty.");
  return tx(function () {
    var items = allItems(), merged = new Map();
    p.lines.forEach(function (l) {
      var it = items.find(function (i) { return i.id === l.id; }); if (!it) fail("Item not found in the menu. Please refresh the page.");
      var qty = parseInt(l.qty, 10); if (!(qty >= 1 && qty <= 999)) fail("Invalid quantity.");
      var price = it.price, nm = it.name, sz = null;
      if (it.sizes && it.sizes.length) { var z = it.sizes.find(function (z) { return z.l === l.size; }); if (!z) fail(it.name + ": choose a size."); price = z.p; sz = z.l; nm = it.name + " (" + sz + ")"; }
      var adds = [];
      if (Array.isArray(l.addons)) l.addons.slice().sort().forEach(function (lab) { var ad = (it.addons || []).find(function (x) { return x.l === lab; }); if (!ad) fail(it.name + ': add-on "' + lab + '" not found.'); if (adds.indexOf(lab) < 0) { adds.push(lab); price += ad.p; } });
      if (adds.length) nm += " + " + adds.join(", ");
      var mods = [];
      if (Array.isArray(l.mods)) l.mods.forEach(function (md) {
        var g = (it.ingr || []).find(function (x) { return x.n === String((md && md.n) || ""); }), m = md && md.m;
        if (!g || ["no", "less", "extra"].indexOf(m) < 0 || mods.some(function (x) { return x.n === g.n; })) return;
        var x = { n: g.n, m: m }; if (m === "extra" && g.x > 0) { x.x = g.x; price += g.x; } mods.push(x);
      });
      mods.sort(function (a, b) { return a.n.localeCompare(b.n); });
      var note = String(l.note || "").replace(/\s+/g, " ").trim().slice(0, 120);
      var k = it.id + "|" + (sz || "") + "|" + adds.join(",") + "|" + mods.map(function (x) { return x.m + ":" + x.n; }).join(",") + "|" + note;
      if (merged.has(k)) merged.get(k).qty += qty; else { var ln = { id: it.id, size: sz, addons: adds, name: nm, price: price, qty: qty, cat: it.cat }; if (mods.length) ln.mods = mods; if (note) ln.note = note; merged.set(k, ln); }
    });
    var lines = Array.from(merged.values());
    lines.forEach(function (l) { var it = items.find(function (i) { return i.id === l.id; }); if (it.components && it.components.length) l.parts = it.components.map(function (c) { var x = items.find(function (i) { return i.id === c.id; }); return { name: (x ? x.name : "?") + (c.size ? " (" + c.size + ")" : ""), qty: c.qty || 1 }; }); });
    var S = settings(), no = getMeta("seq", 0) + 1;
    var type = ["Dine-in", "Takeaway", "Delivery"].indexOf(p.type) >= 0 ? p.type : "Takeaway", pay = ["card", "wallet", "bank"].indexOf(p.pay) >= 0 ? p.pay : "cash";
    var cust = (p.cust && (p.cust.phone || p.cust.name)) ? { name: String(p.cust.name || "").slice(0, 60), phone: String(p.cust.phone || "").slice(0, 20) } : null;
    var table = null, waiter = null;
    if (type === "Dine-in") {
      table = String(p.table || "").replace(/\s+/g, " ").trim().slice(0, 12);
      if (!table) fail("Choose a table number for this Dine-In order.");
      waiter = WAITERS.find(function (w) { return w.id === String(p.waiterId || "") && w.active; });
      if (!waiter) fail("Choose the waiter for this Dine-In order.");
      cust = null;
    }
    var ord = calcOrder({ id: uuid(), no: no, ts: now(), type: type, lines: lines, disc: Number(p.disc) || 0, discType: p.discType === "pct" ? "pct" : "pkr", pay: pay, status: "paid", by: u.name, cust: cust }, S, { items: items, now: new Date() });
    if (waiter) { ord.table = table; ord.waiterId = waiter.id; ord.waiter = waiter.name; }
    lines.forEach(function (l) { takeStock(items, l.id, l.qty); });
    (ord.freeItems || []).forEach(function (f) { takeStock(items, f.id, f.qty); });
    var cost = lines.reduce(function (a, l) { return a + unitCost(l.id, l.size, items) * l.qty; }, 0) + (ord.freeItems || []).reduce(function (a, f) { return a + unitCost(f.id, f.size, items) * f.qty; }, 0);
    if (pay === "cash") { var cash = Math.round(p.cash != null && p.cash !== "" ? Number(p.cash) : ord.total); if (!(cash >= ord.total)) fail("Cash is less than the total."); ord.cash = cash; ord.change = cash - ord.total; }
    else ord.ref = String(p.ref || "").slice(0, 30);
    items.filter(function (i) { return i._dirty; }).forEach(function (i) { delete i._dirty; setItemData(i); });
    setMeta("seq", no);
    addOrder({ id: ord.id, no: no, ikey: key, ts: ord.ts, status: "paid", cost: Math.round(cost), data: clone(ord), table_number: table, waiter_id: waiter ? waiter.id : null });
    upsertSale(Object.assign({}, ord, { no: no, status: "paid" }));
    audit(u.name, "order.create", { no: no, total: ord.total });
    return canProfit(u) ? Object.assign({}, ord, { cost: Math.round(cost) }) : ord;
  });
};
R.kitchen_done = function (s, a) {
  var u = ctx(s, "kitchen", true), r = BYNO.get(+a.p_no); if (!r) fail("Order not found.");
  var o = r.data; if (a.p_undo) { delete o.kdone; delete o.kby; } else { o.kdone = now(); o.kby = u.name; }
  saveOrder(r); return null;
};
R.save_waiter = function (s, a) {
  var u = ctx(s, "manager", true), name = String(a.p_name || "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!name) fail("Enter the waiter's name.");
  var same = WAITERS.find(function (w) { return w.name.toLowerCase() === name.toLowerCase(); });
  if (same && same.id !== a.p_id) fail("A waiter with this name already exists.");
  if (a.p_id) {
    var w = WAITERS.find(function (x) { return x.id === String(a.p_id); }); if (!w) fail("Waiter not found.");
    w.name = name; w.active = a.p_active === false ? 0 : 1; audit(u.name, "waiter.edit", { id: w.id, name: name, active: a.p_active !== false });
  } else {
    var id = uuid(), sort = WAITERS.reduce(function (m, x) { return Math.max(m, x.sort || 0); }, 0) + 1;
    WAITERS.push({ id: id, name: name, active: 1, sort: sort, created: now() }); audit(u.name, "waiter.add", { id: id, name: name });
  }
  save("waiters"); return allWaiters();
};
function report(q, business) {
  var Rg = REPJS.range(q), rows = [];
  SALES.forEach(function (r) { var d = r.at.slice(0, 10); if (d >= Rg.start && d <= Rg.end) rows.push(r); });
  var C = rows.filter(function (r) { return r.st === "Completed"; }), F = rows.filter(function (r) { return r.st === "Refunded"; });
  var sum = function (a, f) { return a.reduce(function (t, r) { return t + (r[f] || 0); }, 0); };
  var kpi = { orders: C.length, gross: sum(C, "sub"), discount: sum(C, "disc"), tax: sum(C, "tax"), net: sum(C, "net"), refunds: F.length, refunded: sum(F, "net") };
  var pm = new Map(); C.forEach(function (r) { var x = pm.get(r.pay) || { method: r.pay, orders: 0, amount: 0 }; x.orders++; x.amount += r.net; pm.set(r.pay, x); });
  var payments = Array.from(pm.values()).sort(function (a, b) { return b.amount - a.amount; });
  var breakdown, ymd = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }, d;
  if (Rg.days === 1) {
    breakdown = { kind: "invoices", rows: rows.slice().sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : a.inv.localeCompare(b.inv); }).map(function (r) {
      return { invoice: r.inv, time: r.at.slice(11, 16), table: r.table || "", waiter: r.waiter || "", items: r.items, method: r.pay, status: r.st, subtotal: r.sub, discount: r.disc, tax: r.tax, net: r.net }; }) };
  } else if (Rg.days <= 31) {
    var g = new Map(); rows.forEach(function (r) { var k = r.at.slice(0, 10), x = g.get(k) || { orders: 0, gross: 0, refunds: 0, net: 0 }; if (r.st === "Completed") { x.orders++; x.gross += r.sub; x.net += r.net; } else x.refunds += r.net; g.set(k, x); });
    var out = []; for (d = new Date(Rg.start + "T12:00:00"); ymd(d) <= Rg.end; d.setDate(d.getDate() + 1)) { var x = g.get(ymd(d)) || {}; out.push({ day: ymd(d), orders: x.orders || 0, gross: x.gross || 0, refunds: x.refunds || 0, net: x.net || 0 }); }
    breakdown = { kind: "days", rows: out };
  } else {
    var gm = new Map(); C.forEach(function (r) { var k = r.at.slice(0, 7), x = gm.get(k) || { orders: 0, tax: 0, discount: 0, net: 0 }; x.orders++; x.tax += r.tax; x.discount += r.disc; x.net += r.net; gm.set(k, x); });
    var mo = []; for (d = new Date(Rg.start.slice(0, 7) + "-01T12:00:00"); ymd(d).slice(0, 7) <= Rg.end.slice(0, 7); d.setMonth(d.getMonth() + 1)) { var m = ymd(d).slice(0, 7), y = gm.get(m) || {}; mo.push({ month: m, orders: y.orders || 0, tax: y.tax || 0, discount: y.discount || 0, net: y.net || 0 }); }
    breakdown = { kind: "months", rows: mo };
  }
  var tsort = function (a, b) { var x = +String(a).replace(/\D+/g, ""), y = +String(b).replace(/\D+/g, ""); return x && y && x !== y ? x - y : String(a).localeCompare(String(b)); };
  var wm = new Map(); C.forEach(function (r) { if (!r.waiter) return; var x = wm.get(r.waiter) || { waiter: r.waiter, orders: 0, sales: 0, tables: new Set() }; x.orders++; x.sales += r.net; if (r.table) x.tables.add(r.table); wm.set(r.waiter, x); });
  var waiters = Array.from(wm.values()).sort(function (a, b) { return b.sales - a.sales; }).map(function (x) { return { waiter: x.waiter, orders: x.orders, sales: x.sales, tables: Array.from(x.tables).sort(tsort) }; });
  var file = "Sales_Report_" + (Rg.start === Rg.end ? Rg.start : Rg.start + "_to_" + Rg.end) + ".pdf";
  return { mode: Rg.mode, start: Rg.start, end: Rg.end, days: Rg.days, label: Rg.label, generated: REPJS.localStamp(now()), business: business, kpi: kpi, payments: payments, waiters: waiters, breakdown: breakdown, file: file };
}
R.sales_report = function (s, a) { ctx(s, "manager", true); try { return report((a && a.p) || {}, reportBiz()); } catch (e) { if (e.app) throw e; fail(e.message); } };
R.void_order = function (s, a) {
  var u = ctx(s, "manager", true);
  if (!String(a.p_reason || "").trim()) fail("Please enter a reason.");
  tx(function () {
    var r = BYNO.get(+a.p_no); if (!r) fail("Order not found."); if (r.status !== "paid") fail("This order is already void.");
    var o = orderData(r), items = allItems();
    o.lines.forEach(function (l) { takeStock(items, l.id, -l.qty); }); (o.freeItems || []).forEach(function (f) { takeStock(items, f.id, -f.qty); });
    items.filter(function (i) { return i._dirty; }).forEach(function (i) { delete i._dirty; setItemData(i); });
    Object.assign(o, { status: "void", voidReason: String(a.p_reason).slice(0, 120), voidBy: u.name, voidTs: now() });
    r.status = "void"; r.data = o; saveOrder(r);
    upsertSale(Object.assign({}, o, { id: r.id, no: r.no, status: "void" }));
    audit(u.name, "order.void", { no: a.p_no, reason: a.p_reason });
  });
  return null;
};
function cleanItem(p) {
  var sizes = [], addons = [];
  if (Array.isArray(p.sizes)) p.sizes.forEach(function (z) { if (String(z.l || "").trim() && Number(z.p) > 0 && sizes.length < 6) sizes.push({ l: String(z.l).trim().slice(0, 20), p: Math.round(Number(z.p)) }); });
  if (Array.isArray(p.addons)) p.addons.forEach(function (z) { if (String(z.l || "").trim() && z.p !== "" && Number(z.p) >= 0 && addons.length < 10) addons.push({ l: String(z.l).trim().slice(0, 30), p: Math.round(Number(z.p)) }); });
  var price = Math.max(0, Math.round(Number(p.price) || 0));
  if (!String(p.name || "").trim() || !String(p.cat || "").trim() || !String(p.code || "").trim()) fail("Name, category and code are required.");
  if (!sizes.length && price <= 0) fail("Enter a rate, or rates for the sizes.");
  if (sizes.length) price = 0;
  var ingr = [];
  if (Array.isArray(p.ingr)) p.ingr.forEach(function (g) { var n = String((g && g.n) || "").trim().slice(0, 30); if (n && ingr.length < 15 && !ingr.some(function (x) { return x.n.toLowerCase() === n.toLowerCase(); })) ingr.push({ n: n, x: Math.max(0, Math.round(Number(g.x) || 0)) }); });
  return { ingr: ingr.length ? ingr : null, code: String(p.code).trim().slice(0, 20), name: String(p.name).trim().slice(0, 120), cat: String(p.cat).trim().slice(0, 40), price: price,
    sizes: sizes.length ? sizes : null, addons: addons.length ? addons : null, barcode: String(p.barcode || "").trim().slice(0, 40),
    track: !sizes.length && !!p.track, stock: parseInt(p.stock, 10) || 0 };
}
R.save_item = function (s, a) {
  var u = ctx(s, "manager", true), p = (a && a.p) || {};
  return tx(function () {
    var c = cleanItem(p), items = allItems(), comps = [];
    if (Array.isArray(p.components)) p.components.forEach(function (x) { if (x && x.id && items.some(function (i) { return i.id === x.id; }) && comps.length < 10) comps.push({ id: x.id, size: x.size || null, qty: Math.max(1, Math.min(99, parseInt(x.qty, 10) || 1)) }); });
    var id = String(p.id || ""), old = id && getItem(id);
    if (items.some(function (i) { return i.id !== id && (i.code.toLowerCase() === c.code.toLowerCase() || (c.barcode && i.barcode === c.barcode)); })) fail("This code or barcode is already used by another item.");
    if (!old) id = uuid();
    var it = Object.assign({ id: id }, c, { components: comps.length ? comps : null });
    if (comps.length) it.track = false;
    if (old) { it.stock = old.track && it.track ? old.stock : it.stock; if (old.cost != null) it.cost = old.cost; if (old.sizeCosts) it.sizeCosts = old.sizeCosts; }
    if (canProfit(u) && ("cost" in p || "sizeCosts" in p)) {
      it.cost = p.cost === "" || p.cost == null ? null : Math.max(0, Math.round(Number(p.cost)));
      var sc = {}; if (p.sizeCosts && typeof p.sizeCosts === "object") (it.sizes || []).forEach(function (z) { if (p.sizeCosts[z.l] != null && p.sizeCosts[z.l] !== "") sc[z.l] = Math.max(0, Math.round(Number(p.sizeCosts[z.l]))); });
      it.sizeCosts = Object.keys(sc).length ? sc : null;
    }
    var sort = old ? itemRow(id).sort : ITEMS.reduce(function (m, r) { return Math.max(m, r.sort || 0); }, 0) + 1;
    putItem(it, sort); audit(u.name, "item.save", { id: id, name: it.name });
    return publicItem(it, canProfit(u));
  });
};
R.delete_item = function (s, a) { var u = ctx(s, "manager", true), i = ITEMS.findIndex(function (r) { return r.id === String(a.p_id); }); if (i < 0) fail("Item not found."); ITEMS.splice(i, 1); save("items"); audit(u.name, "item.delete", { id: a.p_id }); return null; };
R.restock = function (s, a) {
  var u = ctx(s, "manager", true), q = parseInt(a.p_qty, 10); if (!(q > 0 && q < 100000)) fail("Invalid quantity.");
  var it = getItem(a.p_id); if (!it || !it.track) fail("Item not found, or stock tracking is off for it.");
  it.stock += q; setItemData(it); audit(u.name, "item.restock", { id: a.p_id, qty: q }); return null;
};
var hex = function (x) { return /^#[0-9a-f]{6}$/i.test(x || "") ? x : null; };
var hm = function (x) { return /^\d\d:\d\d$/.test(x || "") ? x : ""; };
var ymdOk = function (x) { return /^\d{4}-\d\d-\d\d$/.test(x || "") ? x : ""; };
R.save_settings = function (s, a) {
  var u = ctx(s, "owner", true), p = (a && a.p) || {}, st = settings();
  ["name", "tagline", "address", "phone", "ntn", "footer"].forEach(function (k) { if (k in p) st[k] = String(p[k] || "").slice(0, 200); });
  ["cashTax", "cardTax", "deliveryFee", "lowStock"].forEach(function (k) { if (k in p) st[k] = Math.max(0, Number(p[k]) || 0); });
  if ("tables" in p) st.tables = Math.max(1, Math.min(200, Math.round(Number(p.tables) || 12)));
  ["taxOnTop", "pizzaDrink"].forEach(function (k) { if (k in p) st[k] = !!p[k]; });
  if ("width" in p) st.width = p.width === "w58" ? "w58" : "w80";
  if (p.offer && typeof p.offer === "object") st.offer = { on: !!p.offer.on, amt: Math.max(0, Number(p.offer.amt) || 0), cats: Array.isArray(p.offer.cats) ? p.offer.cats : [] };
  if ("logo" in p) { if (!p.logo) delete st.logo; else if (String(p.logo).indexOf("data:image/") === 0 && p.logo.length <= 400000) st.logo = p.logo; else fail("The logo file is too large or not a valid image."); }
  if (p.theme && typeof p.theme === "object") { var t = p.theme; st.theme = { mode: t.mode === "light" ? "light" : "dark", style: ["solid", "glass", "neu", "flat"].indexOf(t.style) >= 0 ? t.style : "solid", accent: hex(t.accent) || "#ffc800", bg: hex(t.bg), text: hex(t.text), card: hex(t.card), preset: String(t.preset || "").slice(0, 20) }; }
  if (p.receipt && typeof p.receipt === "object") { var r = p.receipt, sz = function (x) { return ["s", "m", "l"].indexOf(x) >= 0 ? x : "m"; }, b = function (x, d) { return x == null ? d : !!x; };
    st.receipt = { logo: b(r.logo, true), logoSize: sz(r.logoSize), font: sz(r.font), header: String(r.header || "").slice(0, 200), showAddress: b(r.showAddress, true), showPhone: b(r.showPhone, true), showCashier: b(r.showCashier, true), showCustomer: b(r.showCustomer, true), showTaxLine: b(r.showTaxLine, true), boldTotal: b(r.boldTotal, true), kot: b(r.kot, false) }; }
  if (p.perms && typeof p.perms === "object") st.perms = { manager: { profit: !!(p.perms.manager || {}).profit }, cashier: { profit: !!(p.perms.cashier || {}).profit } };
  if (Array.isArray(p.offers)) {
    st.offers = p.offers.filter(function (o) { return o && ["pct", "flat", "free"].indexOf(o.type) >= 0 && ["bill", "cats", "items", undefined].indexOf(o.scope) >= 0 && String(o.name || "").trim(); }).slice(0, 30).map(function (o) { return {
      id: String(o.id || uuid()).slice(0, 20), name: String(o.name).trim().slice(0, 60), on: o.on !== false, type: o.type, scope: o.scope || "bill", value: Math.max(0, Number(o.value) || 0),
      cats: Array.isArray(o.cats) ? o.cats : [], items: Array.isArray(o.items) ? o.items : [], minBill: Math.max(0, Number(o.minBill) || 0),
      free: o.type === "free" && o.free ? { id: o.free.id, size: o.free.size || null, qty: Math.max(1, parseInt(o.free.qty, 10) || 1) } : null,
      days: Array.isArray(o.days) ? o.days : [], from: hm(o.from), to: hm(o.to), start: ymdOk(o.start), end: ymdOk(o.end) }; });
  }
  setMeta("settings", st);
  if (st.name) setMeta("business", Object.assign({}, getMeta("business"), { name: st.name }));
  audit(u.name, "settings.save", {}); return st;
};
R.list_staff = function (s) { ctx(s, "owner", false); return USERS.slice().sort(function (a, b) { return a.created - b.created; }).map(function (r) { return { id: r.id, name: r.name, role: r.role, active: !!r.active, login: r.login, noPassword: r.algo !== "pbkdf2" }; }); };
R.staff_create = function (s, a) {
  var u = ctx(s, "owner", true), login = String(a.p_username || "").trim().toLowerCase();
  if (["manager", "cashier", "kitchen"].indexOf(a.p_role) < 0) fail("Choose a role.");
  if (!String(a.p_name || "").trim()) fail("Enter a name.");
  if (!unameOk(login)) fail("Username must be 3 to 30 characters (a-z, 0-9, . _ -).");
  if (String(a.p_password || "").length < 6) fail("Password must be at least 6 characters.");
  if (USERS.some(function (x) { return x.login === login; })) fail("This username is already taken.");
  return hashPw(a.p_password).then(function (h) {
    if (USERS.some(function (x) { return x.login === login; })) fail("This username is already taken.");
    USERS.push({ id: uuid(), login: login, name: String(a.p_name).trim().slice(0, 60), role: a.p_role, active: 1, salt: h.salt, hash: h.hash, algo: h.algo, must_change: 0, created: now() });
    save("users"); audit(u.name, "user.create", { login: login, role: a.p_role }); return null;
  });
};
function dropSessions(uid, keep) { Object.keys(SESS).forEach(function (t) { if (SESS[t].user_id === uid && t !== keep) delete SESS[t]; }); save("sessions"); }
R.staff_set_password = function (s, a) {
  var u = ctx(s, "owner", false); if (String(a.p_password || "").length < 6) fail("Password must be at least 6 characters.");
  if (!userById(a.p_user)) fail("User not found.");
  return hashPw(a.p_password).then(function (h) { var x = userById(a.p_user); x.salt = h.salt; x.hash = h.hash; x.algo = h.algo; save("users"); dropSessions(a.p_user); audit(u.name, "user.password", { id: a.p_user }); return null; });
};
R.set_staff_active = function (s, a) {
  var u = ctx(s, "owner", false); if (a.p_user === u.id) fail("You cannot disable your own account.");
  var x = userById(a.p_user); if (!x || x.role === "owner") fail("User not found.");
  x.active = a.p_active ? 1 : 0; save("users"); if (!a.p_active) dropSessions(a.p_user);
  audit(u.name, "user.active", { id: a.p_user, active: !!a.p_active }); return null;
};
R.password_changed = function (s) { if (!s) fail("Please log in.", 401); var u = userById(s.user_id); if (u) { u.must_change = 0; save("users"); } return null; };

/* ---------- tablet-only: license, storage, backup ---------- */
function storageInfo() {
  var st = navigator.storage, out = { persisted: null, usage: null, quota: null };
  if (!st) return Promise.resolve(out);
  return Promise.all([st.persisted ? st.persisted().catch(function () { return null; }) : null, st.estimate ? st.estimate().catch(function () { return {}; }) : {}]).then(function (r) {
    out.persisted = r[0]; out.usage = (r[1] || {}).usage || null; out.quota = (r[1] || {}).quota || null; return out; });
}
R.offline_info = function (s) {
  var u = ctx(s, "cashier", false);
  var out = { version: VERSION, tablet: true, limit: 1, license: licenseState(), lan: [], devices: [], backups: [], ocr: false };
  if (u.role !== "owner") return out;
  return storageInfo().then(function (st) {
    out.storage = st; out.lastDownload = getMeta("lastDownload", 0); out.orders = ORDERS.length; out.items = ITEMS.length; out.installed = getMeta("install", {}).at || 0; return out; });
};
R.offline_license = function (s, a) {
  var u = ctx(s, "owner", false), l = verifyKey(a.p_key);
  if (!l) fail("This license key is not valid for this device. Send the device code to the RestoPulse team for a new key.");
  setMeta("license", { key: String(a.p_key).trim(), at: now() }); audit(u.name, "license.set", { name: l.name, exp: l.exp || "lifetime" }); return licenseState();
};
R.offline_remove_device = function () { return null; };
R.offline_backup_now = function (s) { ctx(s, "owner", false); return { file: "Use “Download backup file”." }; };
R.offline_move_to_cloud = function () { fail("Contact the RestoPulse team to move to the cloud version."); };

function exportJson() {
  return { app: "RestoPulse", tablet: true, version: VERSION, exported: now(), business: getMeta("business"), settings: settings(), seq: getMeta("seq", 0), items: allItems(),
    orders: ORDERS.slice().sort(function (a, b) { return a.ts - b.ts; }).map(function (r) { return Object.assign(orderData(r), { cost: r.cost }); }),
    users: USERS.map(function (u) { return { id: u.id, login: u.login, name: u.name, role: u.role, active: u.active, salt: u.salt, hash: u.hash, algo: u.algo, must_change: u.must_change, created: u.created }; }),
    waiters: WAITERS.map(function (w) { return { id: w.id, name: w.name, active: w.active, sort: w.sort, created: w.created }; }) };
}
function importJson(d, sess) {
  if (!d || d.app !== "RestoPulse" || !Array.isArray(d.items) || !Array.isArray(d.orders) || !Array.isArray(d.users)) fail("This is not a RestoPulse backup file.");
  var safety = exportJson();
  var pw = null, owner = d.users.find(function (u) { return u.role === "owner"; });
  var p = Promise.resolve(null);
  // a backup from the PC version uses a password format browsers cannot check: the owner gets a new one-time password
  if (owner && owner.algo !== "pbkdf2") { pw = randPw(); p = hashPw(pw); }
  return p.then(function (h) {
    var seen = new Set(), wl = [];
    (Array.isArray(d.waiters) ? d.waiters : []).forEach(function (w) { var n = String(w.name || "").slice(0, 40); if (!n || seen.has(n.toLowerCase())) return; seen.add(n.toLowerCase()); wl.push({ id: String(w.id), name: n, active: w.active ? 1 : 0, sort: +w.sort || 0, created: +w.created || now() }); });
    var users = d.users.map(function (u) { var x = { id: u.id, login: u.login, name: u.name, role: u.role, active: u.active ? 1 : 0, salt: u.salt, hash: u.hash, algo: u.algo === "pbkdf2" ? "pbkdf2" : null, must_change: u.must_change ? 1 : 0, created: u.created || now() };
      if (!x.algo) { x.hash = null; x.salt = null; } if (h && u === owner) { x.salt = h.salt; x.hash = h.hash; x.algo = h.algo; x.must_change = 1; x.active = 1; } return x; });
    ORDERS = []; BYNO.clear(); BYKEY.clear(); SALES.clear();
    d.orders.forEach(function (o) { o = clone(o); var cost = o.cost || 0; delete o.cost; addOrder({ id: o.id, no: o.no, ikey: "r-" + o.id, ts: o.ts, status: o.status, cost: cost, data: o, table_number: o.table || null, waiter_id: o.waiterId || null }); upsertSale(o); });
    dirtyOrders.clear(); ORDERS.forEach(function (r) { dirtyOrders.set(r.id, r); });
    ITEMS = d.items.map(function (it, k) { return { id: it.id, sort: k, data: clone(it) }; });
    USERS = users; WAITERS = wl; SESS = {};
    M.settings = clone(d.settings || DEFAULT_SETTINGS); M.seq = d.seq || d.orders.reduce(function (a, o) { return Math.max(a, o.no || 0); }, 0); if (d.business) M.business = clone(d.business);
    M.safetyBackup = { at: now(), size: JSON.stringify(safety).length };
    ["meta", "users", "items", "waiters", "sessions"].forEach(save);
    audit(owner ? owner.name : "", "backup.restore", { orders: d.orders.length });
    return flush(true).then(function () { return { ok: true, safety: safety, owner: owner ? owner.login : "owner", password: pw }; });
  });
}

/* ---------- public API used by the app (rp-shim.js) ---------- */
var tries = { n: 0, at: 0 };
function session(token) { var s = token && SESS[token]; if (!s) return null; if (now() - s.last > 60e3) { s.last = now(); save("sessions"); } return s; }
function done(v) { return flush().then(function () { return v; }); }
function wrap(fn) { return function () { var a = arguments; return READY.then(function () { return fn.apply(null, a); }).then(done, function (e) { return flush().catch(function () {}).then(function () { throw e; }); }); }; }
function newSession(u) { var token = randHex(24); SESS[token] = { token: token, user_id: u.id, created: now(), last: now() }; save("sessions"); return token; }

var API = {
  version: VERSION,
  needsSetup: function () { return READY.then(function () { return !USERS.length; }); },
  setup: wrap(function (o) {
    if (USERS.length) fail("RestoPulse is already set up on this device.");
    var name = String(o.name || "").trim().slice(0, 60) || "My Restaurant", pw = String(o.password || "");
    if (pw.length < 8) fail("Password must be at least 8 characters.");
    var code = (randHex(3) + "-" + randHex(3) + "-" + randHex(3)).toUpperCase();
    return Promise.all([hashPw(pw), sha256hex("rp-recover|" + code)]).then(function (r) {
      var u = { id: uuid(), login: "owner", name: "Owner", role: "owner", active: 1, salt: r[0].salt, hash: r[0].hash, algo: r[0].algo, must_change: 0, created: now() };
      USERS.push(u); save("users");
      var st = settings(); st.name = name; setMeta("settings", st); setMeta("business", Object.assign({}, getMeta("business"), { name: name }));
      setMeta("recover", r[1]); setMeta("accepted", { at: now(), text: "Data is stored only on this device. The shopkeeper is solely responsible for it." });
      audit("Owner", "setup", { name: name });
      return { token: newSession(u), user: { id: u.id, email: "owner@users.ak47.app" }, recovery: code };
    });
  }),
  recover: wrap(function (o) {
    var code = String(o.code || "").trim().toUpperCase(), pw = String(o.password || "");
    if (pw.length < 8) fail("Password must be at least 8 characters.");
    if (now() - tries.at > 10 * 60e3) tries = { n: 0, at: now() };
    if (tries.n >= 10) fail("Too many wrong attempts. Try again in 10 minutes.");
    return sha256hex("rp-recover|" + code).then(function (h) {
      var own = USERS.find(function (u) { return u.role === "owner"; });
      if (!own || !getMeta("recover") || h !== getMeta("recover")) { tries.n++; fail("This recovery code is not correct."); }
      return hashPw(pw).then(function (x) { own.salt = x.salt; own.hash = x.hash; own.algo = x.algo; own.active = 1; own.must_change = 0; save("users"); dropSessions(own.id); audit("Owner", "owner.recover", {}); return { login: own.login }; });
    });
  }),
  login: wrap(function (login, pw) {
    if (now() - tries.at > 10 * 60e3) tries = { n: 0, at: now() };
    if (tries.n >= 10) fail("Too many wrong attempts. Try again in 10 minutes.");
    login = String(login || "").trim().toLowerCase();
    var u = USERS.find(function (x) { return x.login === login; });
    return checkPw(u, pw || "").then(function (ok) {
      if (!ok) { tries.n++; fail(u && u.algo !== "pbkdf2" ? "This user has no password on this device yet. The owner can set one in Settings → Staff." : "Invalid login credentials"); }
      if (!u.active) fail("Your account is disabled. Please contact the owner.");
      tries.n = 0; audit(u.name, "login", {});
      return { token: newSession(u), user: { id: u.id, email: u.login + "@users.ak47.app" } };
    });
  }),
  session: wrap(function (token) { var s = session(token); if (!s) fail("Please log in.", 401); var u = userById(s.user_id); return { user: { id: s.user_id, email: (u ? u.login : "") + "@users.ak47.app" } }; }),
  logout: wrap(function (token) { if (token && SESS[token]) { delete SESS[token]; save("sessions"); } return {}; }),
  password: wrap(function (token, pw) {
    var s = session(token); if (!s) fail("Please log in.", 401);
    if (String(pw || "").length < 8) fail("Password must be at least 8 characters.");
    var u = userById(s.user_id);
    return checkPw(u, pw).then(function (same) {
      if (same) fail("New password should be different from the old password.");
      return hashPw(pw).then(function (h) { u.salt = h.salt; u.hash = h.hash; u.algo = h.algo; save("users"); dropSessions(u.id, s.token); return {}; });
    });
  }),
  rpc: wrap(function (fn, args, token) { var f = R[fn]; if (!f) fail("Unknown function " + fn, 404); return f(session(token), args || {}); }),
  reportPdf: wrap(function (token, q) {
    ctx(session(token), "manager", true);
    var rep; try { rep = report(q || {}, reportBiz()); } catch (e) { fail(e.message); }
    return { bytes: REPJS.pdf(rep), file: rep.file };
  }),
  exportJson: wrap(function (token) { var u = ctx(session(token), "owner", false); setMeta("lastDownload", now()); audit(u.name, "backup.download", {}); return exportJson(); }),
  importJson: wrap(function (token, text) {
    ctx(session(token), "owner", false);
    var d; try { d = JSON.parse(text); } catch (e) { fail("This is not a RestoPulse backup file."); }
    return importJson(d);
  }),
  storage: function () { return storageInfo(); }
};

/* ---------- start ---------- */
var READY = idbOpen().then(function (d) { IDB = d; return Promise.all([idbAll("kv"), idbAll("orders")]); }).then(function (r) {
  var kv = r[0];
  M = kv.meta || {}; USERS = kv.users || []; ITEMS = kv.items || []; WAITERS = kv.waiters || []; SESS = kv.sessions || {}; AUDIT = kv.audit || [];
  ORDERS = r[1] || []; ORDERS.forEach(function (o) { BYNO.set(o.no, o); BYKEY.set(o.ikey, o); upsertSale(Object.assign({}, o.data, { id: o.id, no: o.no, status: o.status })); });
  if (!M.install) {
    setMeta("install", { id: uuid(), at: now() }); setMeta("business", { id: uuid(), name: "My Restaurant" }); setMeta("settings", DEFAULT_SETTINGS); setMeta("seq", 0);
  }
  // drop sessions unused for 30 days
  Object.keys(SESS).forEach(function (t) { if (now() - SESS[t].last > 30 * 864e5) { delete SESS[t]; save("sessions"); } });
  return sha256hex("restopulse-tablet|" + M.install.id);
}).then(function (h) {
  h = h.toUpperCase(); MC = "RT-" + h.slice(0, 4) + "-" + h.slice(4, 8) + "-" + h.slice(8, 12);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  return flush();
});
READY.catch(function (e) { console.error("RestoPulse storage failed", e); });
API.ready = READY;
window.RPT = API;
})();
