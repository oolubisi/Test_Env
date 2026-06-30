// =========================================================
// MODALS-CORE.JS — Modal System shared helpers (attachments,
//                  avatar photo, image previews)
//                  Staged Payment Helpers (payment schedule UI)
// Load order: 4th
// Depends on: core.js, init.js (populateUnitDropdown)
// =========================================================

// ─────────────────────────────────────────────
// § MODAL SYSTEM
// ─────────────────────────────────────────────
function populateModalInlineImageGalleryPreviews(renderBoxId) {
  const box = document.getElementById(renderBoxId);
  if (!box) return;
  if (currentModalFiles.length === 0) {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }
  box.style.display = "flex";
  box.innerHTML = currentModalFiles
    .map((url, idx) => {
      const isPdf =
        url.toLowerCase().includes(".pdf") ||
        url.toLowerCase().includes("pdf_");
      const content = isPdf
        ? `<div style="width:100%; height:100%; border:2px solid var(--text); border-radius:6px; background:#fff; display:flex; align-items:center; justify-content:center;"><i class="fas fa-file-pdf" style="font-size:24px; color:var(--danger);"></i></div>`
        : `<img src="${escapeHtml(getDirectImageUrl(url))}" style="width:100%; height:100%; object-fit:cover; border:2px solid var(--text); border-radius:6px; margin:0;" alt="Attachment ${idx + 1}">`;
      return `<div style="position:relative; width:60px; height:60px; flex-shrink:0;">
      ${content}
      <div onclick="removeAttachmentByIndex(${idx}, '${renderBoxId}')" style="position:absolute; top:-6px; right:-6px; background:var(--danger); color:white; border:2px solid white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; cursor:pointer; z-index:10;" role="button" aria-label="Remove">&times;</div>
    </div>`;
    })
    .join("");
}

function removeAttachmentByIndex(index, renderBoxId) {
  currentModalFiles.splice(index, 1);
  populateModalInlineImageGalleryPreviews(renderBoxId);
}

function clearAvatarPhotoFrame() {
  currentAvatarPhoto = "";
  const frame =
    document.getElementById("passport_frame_view") ||
    document.getElementById("vendor_frame_view");
  if (frame)
    frame.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='50' height='50'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%236c757d'/%3E%3C/svg%3E";
  const btn = document.getElementById("p_avatar_remove_btn");
  if (btn) btn.style.display = "none";
}

function processIncomingMultiAttachments(filesList, previewTargetId) {
  if (!filesList || filesList.length === 0) return;
  Array.from(filesList).forEach((file) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      if (file.size > 500 * 1024) {
        showToast(
          `PDF "${file.name}" exceeds 500KB limit. Skipped.`,
          "warning",
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const name =
          "pdf_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        callApi("uploadImage", { base64: evt.target.result, name }).then(
          (res) => {
            if (res?.url) {
              currentModalFiles.push(res.url);
              populateModalInlineImageGalleryPreviews(previewTargetId);
            }
          },
        );
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        let base64 = evt.target.result;
        if (file.size > 200 * 1024)
          base64 = await compressImageToTargetLimit(evt.target.result, 185000);
        const name =
          "img_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        callApi("uploadImage", { base64, name }).then((res) => {
          if (res?.url) {
            currentModalFiles.push(res.url);
            populateModalInlineImageGalleryPreviews(previewTargetId);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  });
}

// ─────────────────────────────────────────────
// § STAGED PAYMENT HELPERS
// ─────────────────────────────────────────────
let paymentStages = []; // in-modal state for staged payment editing

const STAGE_PRESETS = [
  "Mobilisation",
  "Progress Claim 1",
  "Progress Claim 2",
  "Retention Release",
  "Final Payment",
  "Materials Supply",
  "Labour Cost",
  "Variation Order",
];

function initPaymentStages(existingStagesJson) {
  if (existingStagesJson) {
    try {
      paymentStages = JSON.parse(existingStagesJson);
      return;
    } catch (e) {}
  }
  paymentStages = [
    { label: "Mobilisation", amount: "", status: "Pending" },
    { label: "Final Payment", amount: "", status: "Pending" },
  ];
}

function computeStageWarnings(totalJobValue) {
  const stageTotal = paymentStages.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0,
  );
  const unallocated = totalJobValue - stageTotal;

  // Specific rule: Mobilisation + Final Payment combined must not exceed Total Contract Value
  const mobilisation = paymentStages.find(
    (s) => String(s.label).trim().toLowerCase() === "mobilisation",
  );
  const finalPayment = paymentStages.find(
    (s) => String(s.label).trim().toLowerCase() === "final payment",
  );
  const mobAmount = parseFloat(mobilisation?.amount) || 0;
  const finalAmount = parseFloat(finalPayment?.amount) || 0;
  const mobFinalTotal = mobAmount + finalAmount;
  const mobFinalExceeds = totalJobValue > 0 && mobFinalTotal > totalJobValue;

  return { stageTotal, unallocated, mobFinalTotal, mobFinalExceeds };
}

// Full structural re-render: rebuilds all row DOM. Only call this when rows are
// added/removed or on initial render — NOT on every keystroke, since rebuilding
// the inputs mid-typing steals focus from whichever field the user is in.
function renderPaymentStagesTable() {
  const container = document.getElementById("stages-table-container");
  if (!container) return;

  const totalJobValue =
    parseFloat(document.getElementById("p_total_job")?.value || 0) || 0;
  const { stageTotal, unallocated, mobFinalTotal, mobFinalExceeds } =
    computeStageWarnings(totalJobValue);

  container.innerHTML = `
    <div style="background:#f8f9fa; border:2px solid var(--border); border-radius:12px; padding:12px; margin:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <strong style="font-size:14px; text-transform:uppercase; color:var(--text);">Payment Schedule</strong>
        <button onclick="addPaymentStageRow()" type="button" style="background:var(--primary); color:#fff; border:none; border-radius:8px; padding:6px 12px; font-size:13px; font-weight:800; cursor:pointer;"><i class="fas fa-plus"></i> Add Stage</button>
      </div>

      <div id="stages-rows">
        ${paymentStages
          .map(
            (stage, idx) => `
          <div style="display:grid; grid-template-columns:1fr 90px 80px 32px; gap:6px; align-items:center; margin-bottom:6px;">
            <input list="stage-presets" value="${escapeHtml(stage.label)}" placeholder="Stage label" oninput="updateStageField(${idx}, 'label', this.value, false)"
              style="padding:8px 10px; border:2px solid var(--border); border-radius:8px; font-size:15px; font-weight:600; background:white; color:black;">
            <input type="number" value="${escapeHtml(stage.amount)}" placeholder="Amount" oninput="updateStageField(${idx}, 'amount', this.value, false)"
              style="padding:8px 8px; border:2px solid var(--border); border-radius:8px; font-size:15px; font-weight:600; background:white; color:black;">
            <select onchange="updateStageField(${idx}, 'status', this.value, true)"
              style="padding:8px 4px; border:2px solid ${stage.status === "Paid" ? "var(--success)" : stage.status === "Partial" ? "var(--warning)" : "var(--border)"}; border-radius:8px; font-size:13px; font-weight:700; background:${stage.status === "Paid" ? "#e8f5e9" : stage.status === "Partial" ? "#fff8e1" : "white"}; color:black;">
              <option value="Pending" ${stage.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Partial" ${stage.status === "Partial" ? "selected" : ""}>Partial</option>
              <option value="Paid" ${stage.status === "Paid" ? "selected" : ""}>Paid</option>
            </select>
            <button onclick="removeStageRow(${idx})" type="button" style="background:var(--danger); color:white; border:none; border-radius:6px; width:32px; height:32px; cursor:pointer; font-size:14px;">×</button>
          </div>
        `,
          )
          .join("")}
      </div>

      <datalist id="stage-presets">
        ${STAGE_PRESETS.map((p) => `<option value="${escapeHtml(p)}">`).join("")}
      </datalist>

      <div id="stages-summary-block">${renderStagesSummaryHtml(stageTotal, unallocated, mobFinalTotal, mobFinalExceeds, totalJobValue)}</div>

      <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;" id="stages-status-chips">
        ${paymentStages.map((s) => `<span style="padding:3px 8px; border-radius:12px; font-size:11px; font-weight:800; background:${s.status === "Paid" ? "var(--success)" : s.status === "Partial" ? "var(--warning)" : "#e9ecef"}; color:${s.status === "Paid" ? "#fff" : s.status === "Partial" ? "#333" : "#666"};">${escapeHtml(s.label)}: ${s.status}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderStagesSummaryHtml(
  stageTotal,
  unallocated,
  mobFinalTotal,
  mobFinalExceeds,
  totalJobValue,
) {
  return `
    <div style="border-top:2px solid var(--border); margin-top:8px; padding-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <div style="text-align:center; background:#fff; border:1px solid var(--border); border-radius:8px; padding:8px;">
        <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Stage Total</div>
        <div style="font-size:18px; font-weight:900; color:var(--primary);">₦${formatMoney(stageTotal)}</div>
      </div>
      <div style="text-align:center; background:${unallocated < 0 ? "#fdecea" : "#fff"}; border:1px solid ${unallocated < 0 ? "var(--danger)" : "var(--border)"}; border-radius:8px; padding:8px;">
        <div style="font-size:11px; font-weight:700; color:${unallocated < 0 ? "var(--danger)" : "var(--muted)"}; text-transform:uppercase;">Unallocated</div>
        <div style="font-size:18px; font-weight:900; color:${unallocated < 0 ? "var(--danger)" : "var(--success)"};">₦${formatMoney(Math.abs(unallocated))}</div>
      </div>
    </div>
    ${
      mobFinalExceeds
        ? `
      <div style="margin-top:8px; background:#fdecea; border:2px solid var(--danger); border-radius:8px; padding:8px 10px; display:flex; align-items:center; gap:8px;">
        <i class="fas fa-exclamation-triangle" style="color:var(--danger); font-size:16px;"></i>
        <div style="font-size:12px; font-weight:700; color:#842029;">Mobilisation + Final Payment (₦${formatMoney(mobFinalTotal)}) exceeds Total Contract Value (₦${formatMoney(totalJobValue)}). Adjust amounts before saving.</div>
      </div>
    `
        : ""
    }
  `;
}

// Lightweight update: patches in-memory state and refreshes only the summary
// numbers/warnings via targeted DOM updates, WITHOUT touching the input
// elements themselves. This is what runs on every keystroke so focus is
// never lost. `structural` (true for status changes) triggers a full
// re-render instead, since status drives border/background colors that are
// only set at render time — that's an intentional, infrequent re-render
// (user selecting from a dropdown, not typing).
function updateStageField(idx, field, value, structural) {
  if (!paymentStages[idx]) return;
  paymentStages[idx][field] = value;

  if (structural) {
    renderPaymentStagesTable();
    syncPaymentAmountFromRequestSelection();
    return;
  }

  const totalJobValue =
    parseFloat(document.getElementById("p_total_job")?.value || 0) || 0;
  const { stageTotal, unallocated, mobFinalTotal, mobFinalExceeds } =
    computeStageWarnings(totalJobValue);

  const summaryBlock = document.getElementById("stages-summary-block");
  if (summaryBlock)
    summaryBlock.innerHTML = renderStagesSummaryHtml(
      stageTotal,
      unallocated,
      mobFinalTotal,
      mobFinalExceeds,
      totalJobValue,
    );

  const chipsBlock = document.getElementById("stages-status-chips");
  if (chipsBlock) {
    chipsBlock.innerHTML = paymentStages
      .map(
        (s) =>
          `<span style="padding:3px 8px; border-radius:12px; font-size:11px; font-weight:800; background:${s.status === "Paid" ? "var(--success)" : s.status === "Partial" ? "var(--warning)" : "#e9ecef"}; color:${s.status === "Paid" ? "#fff" : s.status === "Partial" ? "#333" : "#666"};">${escapeHtml(s.label)}: ${s.status}</span>`,
      )
      .join("");
  }

  // Keep the displayed Amount in sync if the edited stage is the one currently selected
  syncPaymentAmountFromRequestSelection();
}

// Called when the Total Contract Value field itself changes (oninput on p_total_job).
// Updates only the summary numbers — the row inputs aren't touched.
function refreshStagesSummaryOnly() {
  const totalJobValue =
    parseFloat(document.getElementById("p_total_job")?.value || 0) || 0;
  const { stageTotal, unallocated, mobFinalTotal, mobFinalExceeds } =
    computeStageWarnings(totalJobValue);
  const summaryBlock = document.getElementById("stages-summary-block");
  if (summaryBlock)
    summaryBlock.innerHTML = renderStagesSummaryHtml(
      stageTotal,
      unallocated,
      mobFinalTotal,
      mobFinalExceeds,
      totalJobValue,
    );
}

function addPaymentStageRow() {
  paymentStages.push({ label: "New Stage", amount: "", status: "Pending" });
  renderPaymentStagesTable();
}

function removeStageRow(idx) {
  paymentStages.splice(idx, 1);
  renderPaymentStagesTable();
}

// Returns true if the schedule is valid, false (and shows a toast) if not.
// Call this before allowing the payment record to be saved.
function validatePaymentStages() {
  const totalJobValue =
    parseFloat(document.getElementById("p_total_job")?.value || 0) || 0;
  const { mobFinalTotal, mobFinalExceeds } =
    computeStageWarnings(totalJobValue);
  if (mobFinalExceeds) {
    showToast(
      `Mobilisation + Final Payment (₦${formatMoney(mobFinalTotal)}) cannot exceed Total Contract Value (₦${formatMoney(totalJobValue)}).`,
      "error",
    );
    return false;
  }
  return true;
}

// Reads the "Payment Request" dropdown (Mobilisation / Final Payment) and writes
// that stage's amount into the hidden p_amount field, which is what actually gets
// saved and is what the printed Disbursement Details section displays.
function syncPaymentAmountFromRequestSelection() {
  const requestEl = document.getElementById("p_payment_request");
  const amountEl = document.getElementById("p_amount");
  if (!requestEl || !amountEl) return;

  const selectedLabel = requestEl.value;
  if (!selectedLabel) {
    amountEl.value = "";
    return;
  }

  const matchedStage = paymentStages.find(
    (s) =>
      String(s.label).trim().toLowerCase() ===
      selectedLabel.trim().toLowerCase(),
  );
  amountEl.value = matchedStage ? matchedStage.amount || "" : "";
}

// ─────────────────────────────────────────────
