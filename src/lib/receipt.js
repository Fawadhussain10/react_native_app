// Builds a print-ready HTML receipt (identical design to the web app) and
// prints it via expo-print's native print dialog.
import * as Print from "expo-print";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function money(n, c = "$") {
  const v = (Number(n) || 0).toFixed(2);
  const [i, d] = v.split(".");
  return `${c}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${d}`;
}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
function fmtTime(dt) {
  if (!dt) return "";
  let h = dt.getHours(); const m = dt.getMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function fmtDate(dt) {
  if (!dt) return "";
  return `${DAYS[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

const LOTUS = `<svg viewBox="0 0 48 48" width="40" height="40" fill="#fff"><g transform="translate(24,33)"><path opacity=".5" transform="rotate(-60)" d="M0 0 C -5 -7 -5 -15 0 -21 C 5 -15 5 -7 0 0 Z"/><path opacity=".5" transform="rotate(60)" d="M0 0 C -5 -7 -5 -15 0 -21 C 5 -15 5 -7 0 0 Z"/><path opacity=".75" transform="rotate(-31)" d="M0 0 C -5 -8 -5 -17 0 -23 C 5 -17 5 -8 0 0 Z"/><path opacity=".75" transform="rotate(31)" d="M0 0 C -5 -8 -5 -17 0 -23 C 5 -17 5 -8 0 0 Z"/><path d="M0 2 C -5 -8 -4 -20 0 -27 C 4 -20 5 -8 0 2 Z"/></g></svg>`;

export function buildReceiptHTML(d = {}) {
  const {
    companyName = "SPA", companyAddress = "", companyPhone = "", companyEmail = "",
    currency = "$", ref = "", customerName = "—", employeeName = "—",
    start = null, end = null, durationMin = 0,
    services = [], total = 0, invoice = null, note = "",
  } = d;

  const rows = services.map((s) => {
    const line = s.amount != null ? Number(s.amount) : (Number(s.price) || 0) * (Number(s.qty) || 1);
    return `<tr>
      <td class="it"><div class="itname">${esc(s.name)}</div>
      <div class="itmeta">${s.duration ? s.duration + " min" : ""}${s.qty > 1 ? `  ·  ${s.qty} × ${money(s.price, currency)}` : ""}</div></td>
      <td class="ip">${money(line, currency)}</td></tr>`;
  }).join("");

  const invBadge = invoice
    ? `<div class="inv ${invoice.state === "posted" ? "paid" : ""}">${invoice.state === "posted" ? "PAID" : "INVOICE"} · ${esc(invoice.name || "")}</div>`
    : "";
  const contact = [companyAddress, companyPhone, companyEmail].filter(Boolean).map(esc).join(" · ");

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{background:#eef2f7;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0f172a}
  .wrap{max-width:400px;margin:0 auto;padding:14px}
  .card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(15,42,74,.16)}
  .head{background:linear-gradient(135deg,#34d399 0%,#10b981 45%,#0d9488 100%);color:#fff;padding:28px 24px 32px;text-align:center}
  .head .logo{width:60px;height:60px;border-radius:18px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
  .head h1{font-size:22px;font-weight:800;letter-spacing:-.3px}
  .head .tag{font-size:11px;font-weight:700;letter-spacing:2.5px;opacity:.85;margin-top:5px;text-transform:uppercase}
  .perf{height:16px;background:#fff;-webkit-mask:radial-gradient(11px at 11px 0,transparent 98%,#000) repeat-x;-webkit-mask-size:22px 16px;margin-top:-8px}
  .body{padding:6px 24px 20px}
  .refrow{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:6px 0 16px}
  .chip{background:#ecfdf5;color:#047857;font-weight:800;font-size:12.5px;padding:6px 12px;border-radius:999px}
  .refrow .date{font-size:12px;color:#64748b;font-weight:600;text-align:right}
  .who{display:flex;gap:12px;margin-bottom:16px}
  .who .box{flex:1;background:#f8fafc;border:1px solid #eef2f7;border-radius:14px;padding:11px 13px}
  .who .lbl{font-size:10px;font-weight:800;letter-spacing:1px;color:#94a3b8;text-transform:uppercase}
  .who .val{font-size:14px;font-weight:700;margin-top:3px}
  .appt{display:flex;align-items:center;gap:6px;background:#f0fdfa;border:1px dashed #99f6e4;border-radius:14px;padding:12px 14px;margin-bottom:16px;font-size:13px;font-weight:600;color:#0f766e}
  table{width:100%;border-collapse:collapse}
  .th td{font-size:10px;font-weight:800;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;border-bottom:1.5px solid #eef2f7;padding:0 0 8px}
  .th td:last-child{text-align:right}
  td.it{padding:12px 0;border-bottom:1px solid #f3f5f9}
  .itname{font-size:14px;font-weight:700}
  .itmeta{font-size:11.5px;color:#94a3b8;margin-top:2px}
  td.ip{padding:12px 0;border-bottom:1px solid #f3f5f9;text-align:right;font-weight:700;font-size:14px;vertical-align:top}
  .tot .r{display:flex;justify-content:space-between;font-size:13px;color:#64748b;font-weight:600;margin:14px 0 6px}
  .grand{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:12px;border-top:2px solid #0f172a}
  .grand .l{font-size:13.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
  .grand .v{font-size:26px;font-weight:800;color:#0d9488}
  .inv{margin:14px auto 0;width:max-content;font-size:11px;font-weight:800;letter-spacing:.6px;color:#0d9488;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:6px 13px}
  .inv.paid{color:#047857;background:#dcfce7;border-color:#86efac}
  .note{font-size:12px;color:#64748b;margin-top:14px;padding:11px 13px;background:#f8fafc;border-radius:12px;line-height:1.5}
  .tear{border-top:2px dashed #d7dee8}
  .foot{text-align:center;padding:18px 24px 26px}
  .foot .ty{font-size:15px;font-weight:800;color:#0d9488}
  .foot .c{font-size:11px;color:#94a3b8;margin-top:7px;line-height:1.6}
  .foot .p{font-size:10.5px;color:#cbd5e1;margin-top:9px;font-weight:600;letter-spacing:.4px}
</style></head><body><div class="wrap"><div class="card">
  <div class="head"><div class="logo">${LOTUS}</div><h1>${esc(companyName)}</h1><div class="tag">Appointment Receipt</div></div>
  <div class="perf"></div>
  <div class="body">
    <div class="refrow"><span class="chip">${esc(ref || "Booking")}</span><span class="date">${fmtDate(start)}</span></div>
    <div class="who"><div class="box"><div class="lbl">Customer</div><div class="val">${esc(customerName)}</div></div>
    <div class="box"><div class="lbl">Staff</div><div class="val">${esc(employeeName)}</div></div></div>
    <div class="appt">🕒 <b>${fmtTime(start)}</b> — ${fmtTime(end)} &nbsp;·&nbsp; ${durationMin || 0} min</div>
    <table><tr class="th"><td>Service</td><td>Amount</td></tr>${rows || `<tr><td class="it" colspan="2">No services</td></tr>`}</table>
    <div class="tot"><div class="r"><span>Subtotal</span><span>${money(total, currency)}</span></div>
    <div class="grand"><span class="l">Total</span><span class="v">${money(total, currency)}</span></div></div>
    ${invBadge}${note ? `<div class="note">${esc(note)}</div>` : ""}
  </div>
  <div class="tear"></div>
  <div class="foot"><div class="ty">Thank you for visiting ${esc(companyName)}!</div>
  ${contact ? `<div class="c">${contact}</div>` : ""}<div class="p">Powered by ASRBPO</div></div>
</div></div></body></html>`;
}

export async function printBookingReceipt(data) {
  const html = buildReceiptHTML(data);
  await Print.printAsync({ html });
}
