/* =========================================================
   Techria — Order form logic
   Collects the order, uploads any attached files to the Drive
   folder + logs the order to Google Sheets (via Apps Script),
   then hands off the full message to WhatsApp.
   ========================================================= */

let selectedFiles = [];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initSelectedProductBanner() {
  const name = getQueryParam("name");
  const banner = document.getElementById("selectedProductBanner");
  const hiddenField = document.getElementById("f_product");
  if (name) {
    if (hiddenField) hiddenField.value = name;
    if (banner) {
      banner.style.display = "flex";
      banner.querySelector("strong").textContent = name;
    }
  }
}

/* ---------------- File upload UI ---------------- */
function initUploadZone() {
  const zone = document.getElementById("uploadZone");
  const input = document.getElementById("fileInput");
  const list = document.getElementById("uploadList");
  if (!zone || !input) return;

  const addFiles = (files) => {
    [...files].forEach((file) => {
      if (selectedFiles.length >= TECHRIA.MAX_FILES) return;
      if (file.size > TECHRIA.MAX_FILE_MB * 1024 * 1024) {
        alert(`الملف "${file.name}" أكبر من ${TECHRIA.MAX_FILE_MB}MB`);
        return;
      }
      selectedFiles.push(file);
    });
    renderList();
  };

  const renderList = () => {
    list.innerHTML = selectedFiles
      .map(
        (f, i) => `
      <div class="upload-item">
        <span>📎 ${f.name} <span class="upload-progress">(${(f.size / 1024 / 1024).toFixed(1)}MB)</span></span>
        <button type="button" data-remove="${i}" aria-label="حذف">&times;</button>
      </div>`
      )
      .join("");
  };

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    selectedFiles.splice(Number(btn.dataset.remove), 1);
    renderList();
  });

  zone.addEventListener("click", () => input.click());
  input.addEventListener("change", (e) => addFiles(e.target.files));

  ["dragenter", "dragover"].forEach((evt) =>
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.add("drag");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      zone.classList.remove("drag");
    })
  );
  zone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
}

/* ---------------- Signature-less simple submit ---------------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setMsg(text, type) {
  const el = document.getElementById("formMsg");
  if (!el) return;
  el.className = `form-msg ${type}`;
  el.innerHTML = text;
}

function buildWhatsAppMessage(data, fileNames) {
  const lines = [
    "✨ *طلب جديد — Techria*",
    "",
    `*المنتج/الخدمة:* ${data.product || "—"}`,
    `*الاسم:* ${data.fullName}`,
    `*رقم الهاتف:* ${data.phone}`,
    `*العنوان:* ${data.address || "—"}`,
  ];
  if (data.giftFor) lines.push(`*اسم مستلم الهدية:* ${data.giftFor}`);
  if (data.notes) lines.push(`*ملاحظات:* ${data.notes}`);
  if (fileNames.length) {
    lines.push("", `*ملفات مرفوعة (${fileNames.length}):*`);
    fileNames.forEach((n) => lines.push(`• ${n}`));
    lines.push("", `📁 مجلد الملفات: ${TECHRIA.DRIVE_FOLDER_URL}`);
  }
  lines.push("", `🕓 ${new Date().toLocaleString("ar-EG")}`);
  return lines.join("\n");
}

async function submitOrder(e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    id: "ord_" + Date.now(),
    product: document.getElementById("f_product")?.value || "",
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    giftFor: form.giftFor.value.trim(),
    notes: form.notes.value.trim(),
    createdAt: new Date().toISOString(),
  };

  if (!data.fullName || !data.phone) {
    setMsg("من فضلك أكمل الاسم ورقم الهاتف.", "err");
    return;
  }
  if (!form.agree.checked) {
    setMsg("من فضلك وافق على شروط الطلب أولًا.", "err");
    return;
  }

  setMsg('جاري إرسال طلبك<span class="spinner"></span>', "loading");

  // Prepare files (renamed so the team can find them by customer + date)
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const namedFiles = selectedFiles.map((f) => ({
    name: `${data.fullName}_${stamp}_${f.name}`,
    mimeType: f.type || "application/octet-stream",
  }));

  try {
    if (TECHRIA.SHEET_WEBAPP_URL) {
      const filesPayload = await Promise.all(
        selectedFiles.map(async (f, i) => ({
          name: namedFiles[i].name,
          mimeType: namedFiles[i].mimeType,
          base64: await fileToBase64(f),
        }))
      );
      // Apps Script Web Apps don't return usable CORS headers, so this
      // is a fire-and-forget request — the script still receives and
      // saves everything even though we can't read the response here.
      fetch(TECHRIA.SHEET_WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...data,
          driveFolderId: TECHRIA.DRIVE_FOLDER_ID,
          files: filesPayload,
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Sheet/Drive submit failed", err);
  }

  const message = buildWhatsAppMessage(data, namedFiles.map((f) => f.name));
  const waUrl = `https://wa.me/${TECHRIA.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  setMsg("تم تجهيز طلبك ✅ جاري تحويلك لواتساب لإرساله لينا…", "ok");
  showSuccessOverlay();

  setTimeout(() => {
    window.open(waUrl, "_blank");
  }, 700);
}

function showSuccessOverlay() {
  const overlay = document.getElementById("successOverlay");
  if (!overlay) return;
  overlay.classList.add("show");
  const closeBtn = document.getElementById("successClose");
  if (closeBtn) closeBtn.onclick = () => overlay.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  initSelectedProductBanner();
  initUploadZone();
  const form = document.getElementById("orderForm");
  if (form) form.addEventListener("submit", submitOrder);
});