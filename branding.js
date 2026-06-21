// branding.js
// Unified branding components for FieldScan Pro
// All reports and letterhead share the same logo, footer, and signature block.

const BRANDING = {
  companyName: "FieldScan Pro",
  address: "Road 1 House 5B, Isheri-Brooks Estate, Isheri-Olofin, Ogun State",
  phone1: "+234 809 260 8103",
  phone2: "+234 708 260 8103",
  email: "pi.projects20@gmail.com",
};

function _getSettings() {
  const cache = (typeof getCache === "function") ? getCache() : {};
  return cache.settings || {};
}

function _getLogoUrl() {
  const settings = _getSettings();
  return settings.Logo ? getDirectImageUrl(settings.Logo) : "";
}

function _getSignImageUrl() {
  const settings = _getSettings();
  return settings.Sign_Signed ? getDirectImageUrl(settings.Sign_Signed) : "";
}

function _getSignatoryName() {
  const settings = _getSettings();
  return settings.Name_Signed || "";
}

/**
 * Report header — date/title left, logo right, optional project info grid.
 * Used for all reports (financial, progress, take-off, work orders, etc.)
 */
function generateReportHeader(options) {
  const {
    title = "",
    date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    project = null,
    showDate = true,
  } = options || {};

  const logoUrl = _getLogoUrl();
  const dateStr = date;

  let html = `<div class="unified-header" style="border-bottom: 2.5px solid #000; padding-bottom: 2px; margin-bottom: 18px;">`;

  html += `<div style="display: flex; justify-content: space-between; align-items: flex-end;">`;
  html += `<div style="flex:1;">`;
  if (showDate) {
    html += `<div style="font-size: 11px; color: #495057; font-weight: 600; margin-bottom: 2px;">${escapeHtml(dateStr)}</div>`;
  }
  if (title) {
    html += `<div style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #495057; line-height: 1.1;">${escapeHtml(title)}</div>`;
  }
  html += `</div>`;

  if (logoUrl) {
    html += `<div style="flex-shrink:0; margin-left:16px; text-align:right;">`;
    html += `<img src="${escapeAttr(logoUrl)}" style="max-height:120px; max-width:280px; object-fit:contain;" onerror="this.style.display='none'">`;
    html += `</div>`;
  }
  html += `</div>`;

  if (project) {
    html += `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #adb5bd; font-size: 12px; line-height: 1.6;">`;
    html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 20px;">`;
    html += `<div><strong style="color:#000;">Client:</strong> ${escapeHtml(project.clientName || "—")}</div>`;
    html += `<div><strong style="color:#000;">Project ID:</strong> ${escapeHtml(project.projectId || "—")}</div>`;
    html += `<div><strong style="color:#000;">Location:</strong> ${escapeHtml(project.siteLocation || "—")}</div>`;
    html += `<div><strong style="color:#000;">Phone:</strong> ${escapeHtml(project.clientPhone || "—")}</div>`;
    html += `</div></div>`;
  }

  html += `</div>`;
  return html;
}

/**
 * Letterhead header — logo top-right, date below logo.
 * Used for formal letters.
 */
function generateLetterheadHeader(options) {
  const {
    date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  } = options || {};

  const logoUrl = _getLogoUrl();
  const dateStr = date;

  let html = `<div style="display: flex; justify-content: flex-end; align-items: flex-start; margin-bottom: 28px;">`;
  html += `<div style="text-align: right;">`;
  if (logoUrl) {
    html += `<img src="${escapeAttr(logoUrl)}" style="height: 120px; max-width: 200px; object-fit: contain; display: block; margin-left: auto;" onerror="this.style.display='none'">`;
  } else {
    html += `<div style="height:90px;"></div>`;
  }
  html += `<div style="font-size: 11pt; margin-top: 10px; color: #000;">${escapeHtml(dateStr)}</div>`;
  html += `</div></div>`;
  return html;
}

/**
 * Unified footer — pinned to bottom, centred contact block with emoji icons.
 * Used for both letters and reports.
 */
function generateUnifiedFooter() {
  return `<div class="unified-footer" style="
    position: absolute;
    bottom: 5mm;
    left: 20mm;
    right: 20mm;
    border-top: 1px solid #888;
    padding-top: 6px;
    text-align: center;
    font-size: 9pt;
    color: #444;
    line-height: 1.6;
  ">
    <div>&#128205; ${escapeHtml(BRANDING.address)}</div>
    <div>
      &#128222; ${escapeHtml(BRANDING.phone1)} &nbsp;&nbsp;&nbsp;
      &#128222; ${escapeHtml(BRANDING.phone2)} &nbsp;&nbsp;&nbsp;
      &#9993; ${escapeHtml(BRANDING.email)}
    </div>
  </div>`;
}

/**
 * Unified signature block — uses Settings sign image + name.
 * Options: label (default "Authorized Signatory"), signatoryName, signatoryTitle
 */
function generateUnifiedSignatureBlock(options) {
  const {
    label = "Authorized Signatory",
    signatoryName = "",
    signatoryTitle = "",
  } = options || {};

  const signImageUrl = _getSignImageUrl();
  const settingsName = _getSignatoryName();
  const finalName = signatoryName || settingsName || "";

  return `<div style="margin-top: 32px; page-break-inside: avoid; text-align: left;">
    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; color: #495057;">${escapeHtml(label)}</div>
    <div style="display: inline-block; text-align: center;">
      ${signImageUrl ? `<div style="margin-bottom: 4px;"><img src="${escapeAttr(signImageUrl)}" style="max-height:50px; max-width:150px; object-fit:contain;" onerror="this.style.display='none'"></div>` : ""}
      <div style="border-bottom: 1.5px solid #000; width: 200px; margin: 0 auto 4px auto;"></div>
      <div style="font-size: 12px; font-weight: 700;">${escapeHtml(finalName || "_________________________")}</div>
      ${signatoryTitle ? `<div style="font-size: 11pt; color: #333;">${escapeHtml(signatoryTitle)}</div>` : ""}
    </div>
  </div>`;
}

/**
 * Full A4 page wrapper — letterhead style.
 * Used for letters AND reports. Wraps content with header, signature, and footer.
 */
function wrapLetterheadPage(content, options) {
  const {
    title = "",
    date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    project = null,
    showSignature = true,
    signatoryName = "",
    signatoryTitle = "",
    signatureLabel = "Authorized Signatory",
    isLetter = false,
  } = options || {};

  const header = isLetter
    ? generateLetterheadHeader({ date })
    : generateReportHeader({ title, date, project });
  const footer = generateUnifiedFooter();
  const signature = showSignature 
    ? generateUnifiedSignatureBlock({ label: signatureLabel, signatoryName, signatoryTitle })
    : "";

  return `<div class="letterhead-page" style="
    position: relative;
    min-height: calc(297mm - 1mm);
    background: white;
    font-family: 'Calibri', 'Georgia', serif;
    font-size: 12pt;
    color: #000;
    padding: 10mm 10mm 15mm 15mm;
    box-sizing: border-box;
  ">
    ${header}
    <div class="letterhead-content" style="margin-bottom: 32px;">
      ${content}
    </div>
    ${signature}
    ${footer}
  </div>`;
}

/**
 * Report page wrapper — alias for wrapLetterheadPage.
 * Same unified look for all reports.
 */
function wrapReportPage(content, options) {
  return wrapLetterheadPage(content, options);
}

// Expose to global scope
window.BRANDING = BRANDING;
window.generateReportHeader = generateReportHeader;
window.generateLetterheadHeader = generateLetterheadHeader;
window.generateUnifiedFooter = generateUnifiedFooter;
window.generateUnifiedSignatureBlock = generateUnifiedSignatureBlock;
window.wrapLetterheadPage = wrapLetterheadPage;
window.wrapReportPage = wrapReportPage;
