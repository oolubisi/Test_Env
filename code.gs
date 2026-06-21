const SECRET_TOKEN = "FieldScan2025!SecureToken"; // Must match frontend
const SHEET_SCHEMAS = {
  Projects: ["projectId","clientName","siteLocation","clientPhone","clientEmail","projectStatus","scope","contractSubtotal","notes","lastModified"],
  TakeOffItems: ["itemId","projectId","roomArea","tradeCategory","description","quantity","unit","beforePhotoUrl","scopeNotes","lastModified"],
  TakeOffTemplates: ["templateItemId","templateId","templateName","templateDescription","roomArea","tradeCategory","description","quantity","unit","scopeNotes","sortOrder","isActive","lastModified"],
  ProgressLogs: ["logId","projectId","tradeCategory","completionPercentage","commentNarrative","progressPhotoUrl","dateRecorded","lastModified"],
  Snags: ["snagId","projectId","notes","photoUrl","assigned","dateLogged","dateCompleted","status","lastModified"],
  Vendors: ["vendorId","company","trade","contactName","phone1","phone2","email","passport","attachments","archived","lastModified"],
  WorkOrders: ["workOrderId","projectId","vendorId","description","amount","status","attachments","dateCreated","lastModified"],
  Payments: ["paymentId","projectId","paymentDate","paymentDirection","payee","expenseCategory","referenceId","amount","paymentMethod","status","stage","totalInvoice","paymentGroupId","notes","attachments","lastModified"]
};

// ========== CORS PREFLIGHT ==========
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== MAIN POST HANDLER ==========
function doPost(e) {
  // Prevent race conditions on concurrent writes
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  var result;
  try {
    const req = JSON.parse(e.postData.contents);
    
    // Token validation — accept top-level token (new format) or legacy data.token
    if (req.token !== SECRET_TOKEN && req.data?.token !== SECRET_TOKEN) {
      throw new Error("Unauthorized");
    }
    
    const action = req.action;
    const data = req.data || {};

    // Route to handlers
    if (action === "getProjects") result = getTableData("Projects");
    else if (action === "getTakeOffItems") result = getTableData("TakeOffItems");
    else if (action === "getTakeOffTemplates") result = getTakeOffTemplates();
    else if (action === "getProgressLogs") result = getTableData("ProgressLogs");
    else if (action === "getVendors") result = getTableData("Vendors");
    else if (action === "getWorkOrders") result = getTableData("WorkOrders");
    else if (action === "getPayments") result = getTableData("Payments");
    else if (action === "getSnags") result = getTableData("Snags");
    else if (action === "getStats") result = { activeVendors: getActiveVendorsCount() };
    else if (action === "saveProject") result = saveProject(data);
    else if (action === "updateProject") result = updateProject(data);
    else if (action === "updateProjectScope") result = updateProjectScope(data);
    else if (action === "updateProjectContractSubtotal") result = updateProjectContractSubtotal(data);
    else if (action === "saveTakeOffItem") result = saveTakeOffItem(data);
    else if (action === "updateTakeOffItem") result = updateTakeOffItem(data);
    else if (action === "deleteTakeOffItem") result = deleteRow("TakeOffItems", data.itemId, 0);
    else if (action === "saveTakeOffTemplate") result = saveTakeOffTemplate(data);
    else if (action === "updateTakeOffTemplate") result = updateTakeOffTemplate(data);
    else if (action === "deleteTakeOffTemplate") result = deleteTakeOffTemplate(data);
    else if (action === "saveProgressLog") result = saveProgressLog(data);
    else if (action === "saveSnag") result = saveSnag(data);
    else if (action === "updateSnag") result = updateSnag(data);
    else if (action === "deleteSnag") result = deleteRow("Snags", data.snagId, 0);
    else if (action === "saveVendor") result = saveVendor(data);
    else if (action === "updateVendor") result = updateVendor(data);
    else if (action === "deleteVendor") result = deleteRow("Vendors", data.vendorId, 0);
    else if (action === "saveWorkOrder") result = saveWorkOrder(data);
    else if (action === "updateWorkOrder") result = updateWorkOrder(data);
    else if (action === "savePayment") result = savePayment(data);
    else if (action === "updatePayment") result = updatePayment(data);
    else if (action === "getSettings") result = getSettings_();
    else if (action === "updateSetting") result = updateSetting_(data.key, data.value);
    else throw new Error("Unknown action: " + action);

  } catch(err) {
    // Return format compatible with frontend error detection
    result = { status: "error", success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const id = e.parameter.id;
  const token = e.parameter.token;
  if (token !== SECRET_TOKEN) return ContentService.createTextOutput("Unauthorized");
  try {
    const file = DriveApp.getFileById(id);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    const dataUri = "data:" + blob.getContentType() + ";base64," + base64;
    return ContentService.createTextOutput(dataUri).setMimeType("text/plain");
  } catch(err) { return ContentService.createTextOutput("Not found"); }
}

// Helper: sanitize cell to prevent injection
function sanitize(v) { if (typeof v !== 'string') return v; return v.replace(/^[=+\-@]/,'').slice(0,5000); }
function validatePhone(p) { if (!p) return ""; const clean = p.replace(/\D/g,''); if (clean.length !== 11) throw new Error("Phone must be 11 digits"); return "'" + clean; }

function getTableData(sheetName) {
  const sheet = ensureSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h=>normalizeHeader(h));
  const schema = SHEET_SCHEMAS[sheetName];
  const tz = Session.getScriptTimeZone();
  // Phone columns whose values may be prefixed with ' (Google Sheets text prefix)
  const phoneKeys = new Set(["phone1","phone2","clientphone"]);
  return data.slice(1).map(row => {
    const obj = {};
    schema.forEach((key) => {
      let val = row[headers.indexOf(normalizeHeader(key))];
      if (val instanceof Date) {
        val = (normalizeHeader(key) === normalizeHeader("lastModified"))
          ? val.getTime()
          : Utilities.formatDate(val, tz, "yyyy/MM/dd");
      }
      if (val === null || val === undefined) val = "";
      // Strip leading apostrophe that Google Sheets adds to force text format
      if (typeof val === "string" && phoneKeys.has(normalizeHeader(key))) {
        val = val.replace(/^'/, "");
      }
      obj[key] = val;
    });
    return obj;
  });
}

function saveProject(data) {
  const id = data.projectId || getNextSequentialId("Projects", "PRJ/" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yy") + "/", 3);
  appendObjectRow("Projects", {
    projectId: id,
    clientName: sanitize(data.clientName),
    siteLocation: sanitize(data.siteLocation),
    clientPhone: validatePhone(data.clientPhone),
    clientEmail: sanitize(data.clientEmail),
    projectStatus: sanitize(data.projectStatus),
    scope: sanitize(data.scope),
    contractSubtotal: Number(data.contractSubtotal) || 0,
    notes: sanitize(data.notes),
    lastModified: Date.now()
  });
  return { success: true, projectId: id };
}
function updateProject(data) {
  return modifyRow("Projects", data.projectId, {
    clientName: sanitize(data.clientName),
    siteLocation: sanitize(data.siteLocation),
    clientPhone: validatePhone(data.clientPhone),
    clientEmail: sanitize(data.clientEmail),
    projectStatus: sanitize(data.projectStatus),
    scope: sanitize(data.scope),
    contractSubtotal: (data.contractSubtotal !== undefined && data.contractSubtotal !== null) ? (Number(data.contractSubtotal) || 0) : "",
    notes: sanitize(data.notes),
    lastModified: Date.now()
  }, 0);
}
function updateProjectScope(data) { return modifyRow("Projects", data.projectId, { scope: sanitize(data.scope), lastModified: Date.now() }, 0); }

function updateProjectContractSubtotal(data) {
  return modifyRow("Projects", data.projectId, {
    contractSubtotal: Number(data.contractSubtotal) || 0,
    lastModified: Date.now()
  }, 0);
}
function saveTakeOffItem(data) {
  appendObjectRow("TakeOffItems", {
    itemId: data.itemId,
    projectId: data.projectId,
    roomArea: sanitize(data.roomArea),
    tradeCategory: sanitize(data.tradeCategory),
    description: sanitize(data.description),
    quantity: data.quantity,
    unit: data.unit,
    beforePhotoUrl: processAttachments(data.beforePhotoUrl),
    scopeNotes: sanitize(data.scopeNotes),
    lastModified: Date.now()
  });
  return { success: true };
}
function updateTakeOffItem(data) { return modifyRow("TakeOffItems", data.itemId, { roomArea: sanitize(data.roomArea), tradeCategory: sanitize(data.tradeCategory), description: sanitize(data.description), quantity: data.quantity, unit: data.unit, beforePhotoUrl: processAttachments(data.beforePhotoUrl), scopeNotes: sanitize(data.scopeNotes), lastModified: Date.now() }, 0); }

function getDefaultTakeOffTemplateRows_() {
  const templateId = "tmpl-standard-construction";
  const templateName = "Standard Construction Take-Off";
  const templateDescription = "Detailed construction take-off template sorted by trade";
  const rows = [
    ["Preliminaries", "Mobilization and demobilization including transport of labour, tools, small plant and project setup/removal", "lot"],
    ["Preliminaries", "Site setup including temporary storage, protection, setting-out support and welfare provisions", "lot"],
    ["Preliminaries", "Health, safety and environmental provisions including PPE, signage, barricading and routine site controls", "lot"],
    ["Preliminaries", "Scaffolding, access equipment and temporary working platforms for safe execution of works", "lot"],
    ["Preliminaries", "Final cleaning, waste handling, cart-away and handover preparation", "lot"],
    ["Demolition / Strip-Out", "Careful demolition or removal of existing walls, finishes, fittings and redundant fixtures", "sqm"],
    ["Demolition / Strip-Out", "Removal and cart-away of demolition debris from site to approved disposal location", "lot"],
    ["Earthworks", "Site clearing, grubbing and preparation of work area before excavation or construction", "sqm"],
    ["Earthworks", "Excavation to required depth for foundations, drainage, trenches or service routes", "m3"],
    ["Earthworks", "Backfilling with approved material in layers including watering and compaction", "m3"],
    ["Earthworks", "Hardcore filling compacted to receive blinding or slab construction", "m3"],
    ["Earthworks", "Anti-termite treatment to formation level before slab or foundation works", "sqm"],
    ["Concrete Works", "Plain concrete blinding laid to required thickness under foundations or ground slabs", "m3"],
    ["Concrete Works", "Reinforced concrete footings including concrete placing, vibration and curing", "m3"],
    ["Concrete Works", "Reinforced concrete ground beams including formwork, reinforcement fixing, concrete and curing", "m3"],
    ["Concrete Works", "Reinforced concrete columns including formwork, reinforcement, concrete placing and curing", "m3"],
    ["Concrete Works", "Reinforced concrete slab including reinforcement, formwork/edge restraint, concrete and curing", "m3"],
    ["Concrete Works", "High yield reinforcement steel cut, bent and fixed in position including binding wire and spacers", "kg"],
    ["Blockwork / Masonry", "External block walling laid in cement-sand mortar including alignment, plumbing and jointing", "sqm"],
    ["Blockwork / Masonry", "Internal partition block walling laid in cement-sand mortar including openings and returns", "sqm"],
    ["Blockwork / Masonry", "Parapet, dwarf or boundary wall blockwork including coping preparation", "sqm"],
    ["Roofing", "Roof structural framing including timber or steel members, bracing, connectors and installation", "sqm"],
    ["Roofing", "Roof covering sheets or tiles including laps, fixings, ridge caps and flashings", "sqm"],
    ["Roofing", "Rainwater goods including gutters, downpipes, outlets and fixing accessories", "m"],
    ["Carpentry / Joinery", "Door frames and architraves supplied and installed plumb, level and ready for door hanging", "pcs"],
    ["Carpentry / Joinery", "Timber or flush doors including hanging, trimming and preparation for ironmongery", "pcs"],
    ["Carpentry / Joinery", "Kitchen cabinets including carcasses, shutters, shelves, worktop support and installation", "m"],
    ["Carpentry / Joinery", "Wardrobes, shelving and built-in joinery including boards, edging, accessories and installation", "m"],
    ["Metal Works", "Metal gate, grille, handrail or balustrade fabrication, painting and installation", "m"],
    ["Metal Works", "Structural steel members supplied, fabricated, primed and installed to required position", "kg"],
    ["Windows / Glazing", "Aluminium windows including frames, glass, ironmongery, sealant and installation", "sqm"],
    ["Windows / Glazing", "Sliding doors, glass partitions or glazed screens including tracks, glass and accessories", "sqm"],
    ["Plastering / Rendering", "Internal wall plaster in cement-sand mortar finished smooth and true to line", "sqm"],
    ["Plastering / Rendering", "External rendering in cement-sand mortar including surface preparation and curing", "sqm"],
    ["Plastering / Rendering", "Floor screed laid to required falls, levels and thickness ready to receive finishes", "sqm"],
    ["Tiling / Floor Finishes", "Floor tiles including adhesive/mortar bed, laying, cutting, grouting and cleaning", "sqm"],
    ["Tiling / Floor Finishes", "Wall tiles including surface preparation, adhesive, trims, grouting and cleaning", "sqm"],
    ["Tiling / Floor Finishes", "Tile skirting, trims, thresholds and edge finishing", "m"],
    ["Ceilings", "POP, gypsum or suspended ceiling including framing, boards/panels, jointing and finishing", "sqm"],
    ["Ceilings", "Cornices, bulkheads, access panels and ceiling trim details", "m"],
    ["Painting / Decoration", "Wall primer/sealer application including surface preparation and minor making-good", "sqm"],
    ["Painting / Decoration", "Internal emulsion or satin paint finish to walls in required number of coats", "sqm"],
    ["Painting / Decoration", "External weatherproof paint finish including preparation, primer and finishing coats", "sqm"],
    ["Painting / Decoration", "Wood or metal paint finish including sanding, priming and gloss/satin coat", "sqm"],
    ["Plumbing", "Water supply pipework including pipes, fittings, chasing/supports, testing and making good", "m"],
    ["Plumbing", "Waste and soil pipework including fittings, traps, supports, testing and connection", "m"],
    ["Plumbing", "Sanitary fittings including WC, basin, shower, sink, taps and accessories installation", "set"],
    ["Plumbing", "Water storage tank, pump, controls and associated pipe connections", "set"],
    ["Plumbing", "External drainage, inspection chambers, septic tank or soakaway works", "m"],
    ["Electrical", "Conduit installation including boxes, bends, saddles, chasing and making good", "m"],
    ["Electrical", "Cable wiring to lighting, power, AC, cooker, water heater and special points", "m"],
    ["Electrical", "Light points including wiring termination, switch connection and fitting installation", "pcs"],
    ["Electrical", "Socket outlets, switches, isolators and faceplates supplied and installed", "pcs"],
    ["Electrical", "Distribution board, breakers, earthing, labelling and testing", "set"],
    ["Mechanical / HVAC", "AC refrigerant pipework, insulation, drain lines and wall sleeves", "m"],
    ["Mechanical / HVAC", "Split AC indoor/outdoor unit installation including brackets, drain and commissioning", "set"],
    ["Mechanical / HVAC", "Extractor or ventilation fans including ducting, termination and electrical connection", "pcs"],
    ["External Works", "Concrete paving, driveway, apron or external floor finish including base preparation", "sqm"],
    ["External Works", "Kerbs, drainage channels, manholes and external water management works", "m"],
    ["External Works", "Boundary wall, fence, gate supports and related external enclosure works", "m"],
    ["External Works", "Landscaping including topsoil, planting, turfing and external clean-up", "sqm"],
    ["Fixtures / Fittings / Equipment", "Bathroom accessories, mirrors, curtain rails, blinds, signage or loose fittings installation", "pcs"],
    ["Testing / Handover", "Testing, commissioning, snag correction, as-built records and client handover documentation", "lot"]
  ];
  return rows.map(function(row, idx) {
    return {
      templateItemId: templateId + "-" + String(idx + 1).padStart(3, "0"),
      templateId: templateId,
      templateName: templateName,
      templateDescription: templateDescription,
      roomArea: "",
      tradeCategory: row[0],
      description: row[1],
      quantity: 0,
      unit: row[2],
      scopeNotes: "",
      sortOrder: idx + 1,
      isActive: "Yes",
      lastModified: Date.now()
    };
  });
}

function seedDefaultTakeOffTemplates_() {
  const sheet = ensureSheet("TakeOffTemplates");
  if (sheet.getLastRow() > 1) return;
  getDefaultTakeOffTemplateRows_().forEach(function(row) {
    appendObjectRow("TakeOffTemplates", row);
  });
}

function getTakeOffTemplates() {
  seedDefaultTakeOffTemplates_();
  return getTableData("TakeOffTemplates").filter(function(row) {
    return row.isActive !== "No";
  });
}

function saveTakeOffTemplate(data) {
  appendObjectRow("TakeOffTemplates", {
    templateItemId: data.templateItemId || ("TMPL-ITEM-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7)),
    templateId: sanitize(data.templateId),
    templateName: sanitize(data.templateName),
    templateDescription: sanitize(data.templateDescription),
    roomArea: sanitize(data.roomArea),
    tradeCategory: sanitize(data.tradeCategory),
    description: sanitize(data.description),
    quantity: 0,
    unit: sanitize(data.unit || "pcs"),
    scopeNotes: sanitize(data.scopeNotes),
    sortOrder: Number(data.sortOrder) || 0,
    isActive: data.isActive || "Yes",
    lastModified: Date.now()
  });
  return { success: true };
}

function updateTakeOffTemplate(data) {
  return modifyRow("TakeOffTemplates", data.templateItemId, {
    templateId: sanitize(data.templateId),
    templateName: sanitize(data.templateName),
    templateDescription: sanitize(data.templateDescription),
    roomArea: sanitize(data.roomArea),
    tradeCategory: sanitize(data.tradeCategory),
    description: sanitize(data.description),
    quantity: 0,
    unit: sanitize(data.unit || "pcs"),
    scopeNotes: sanitize(data.scopeNotes),
    sortOrder: Number(data.sortOrder) || 0,
    isActive: data.isActive || "Yes",
    lastModified: Date.now()
  }, 0);
}

function deleteTakeOffTemplate(data) {
  return modifyRow("TakeOffTemplates", data.templateItemId, {
    isActive: "No",
    lastModified: Date.now()
  }, 0);
}

function saveProgressLog(data) {
  appendObjectRow("ProgressLogs", {
    logId: data.logId,
    projectId: data.projectId,
    tradeCategory: sanitize(data.tradeCategory),
    completionPercentage: data.completionPercentage,
    commentNarrative: sanitize(data.commentNarrative),
    progressPhotoUrl: processAttachments(data.progressPhotoUrl),
    dateRecorded: currentDate(),
    lastModified: Date.now()
  });
  return { success: true };
}

function saveSnag(data) {
  const id = data.snagId || ("SNAG-" + Date.now());
  appendObjectRow("Snags", {
    snagId: id,
    projectId: data.projectId,
    notes: sanitize(data.notes),
    photoUrl: "", // intentionally left blank - snag photos are kept local-only on the device, never synced
    assigned: sanitize(data.assigned),
    dateLogged: data.dateLogged || currentDate(),
    dateCompleted: sanitize(data.dateCompleted),
    status: data.status || "Open",
    lastModified: Date.now()
  });
  return { success: true, snagId: id };
}
function updateSnag(data) {
  return modifyRow("Snags", data.snagId, {
    notes: sanitize(data.notes),
    assigned: sanitize(data.assigned),
    dateCompleted: sanitize(data.dateCompleted),
    status: data.status,
    lastModified: Date.now()
  }, 0);
}
function saveVendor(data) {
  appendObjectRow("Vendors", {
    vendorId: data.vendorId,
    company: sanitize(data.company),
    trade: sanitize(data.trade),
    contactName: sanitize(data.contactName),
    phone1: validatePhone(data.phone1),
    phone2: validatePhone(data.phone2),
    email: sanitize(data.email),
    passport: processAttachments(data.passport),
    attachments: processAttachments(data.attachments),
    archived: "No",
    lastModified: Date.now()
  });
  return { success: true };
}
function updateVendor(data) { return modifyRow("Vendors", data.vendorId, { company: sanitize(data.company), trade: sanitize(data.trade), contactName: sanitize(data.contactName), phone1: validatePhone(data.phone1), phone2: validatePhone(data.phone2), email: sanitize(data.email), passport: processAttachments(data.passport), attachments: processAttachments(data.attachments), lastModified: Date.now() }, 0); }
function saveWorkOrder(data) {
  const id = data.workOrderId || getNextSequentialId("WorkOrders", "WKO/" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yy") + "/", 3);
  appendObjectRow("WorkOrders", {
    workOrderId: id,
    projectId: data.projectId,
    vendorId: data.vendorId,
    description: sanitize(data.description),
    amount: Number(data.amount) || 0,
    status: data.status,
    attachments: processAttachments(data.attachments),
    dateCreated: currentDate(),
    lastModified: Date.now()
  });
  return { success: true };
}
function updateWorkOrder(data) { return modifyRow("WorkOrders", data.workOrderId, { vendorId: data.vendorId, description: sanitize(data.description), amount: Number(data.amount)||0, status: data.status, attachments: processAttachments(data.attachments), lastModified: Date.now() }, 0); }
function savePayment(data) {
  let id = data.paymentId;
  if (!id || id.startsWith("PAY-")) id = getNextSequentialPaymentId(data.projectId);
  appendObjectRow("Payments", {
    paymentId: id,
    projectId: data.projectId,
    paymentDate: data.paymentDate || currentDate(),
    paymentDirection: data.paymentDirection,
    payee: sanitize(data.payee),
    expenseCategory: sanitize(data.expenseCategory),
    referenceId: sanitize(data.referenceId),
    amount: Number(data.amount) || 0,
    paymentMethod: data.paymentMethod,
    status: data.status || (data.stage && Number(data.totalInvoice || 0) > (Number(data.amount || 0) + getPreviousStageTotal(data.projectId, data.paymentGroupId, id)) ? "Pending" : "Cleared"),
    stage: sanitize(data.stage),
    totalInvoice: Number(data.totalInvoice) || 0,
    paymentGroupId: sanitize(data.paymentGroupId) || id,
    notes: sanitize(data.notes),
    attachments: processAttachments(data.attachments),
    lastModified: Date.now()
  });
  return { success: true, paymentId: id };
}
function updatePayment(data) { return modifyRow("Payments", data.paymentId, { paymentDate: data.paymentDate, paymentDirection: data.paymentDirection, payee: sanitize(data.payee), expenseCategory: sanitize(data.expenseCategory), referenceId: sanitize(data.referenceId), amount: Number(data.amount)||0, paymentMethod: data.paymentMethod, status: data.status, notes: sanitize(data.notes), attachments: processAttachments(data.attachments), lastModified: Date.now() }, 0); }

// Extracts the last 3 digits of a project ID, e.g. "PRJ/26/001" -> "001"
function projectNumberSuffix(projectId) {
  const match = String(projectId || "").match(/(\d{1,3})\D*$/);
  if (match) return match[1].padStart(3, '0').slice(-3);
  return "000";
}

function getNextSequentialPaymentId(projectId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const prefix = projectNumberSuffix(projectId) + "-";
    const sheet = ensureSheet("Payments");
    const data = sheet.getDataRange().getValues();
    let max = 0;
    for (let i=1; i<data.length; i++) {
      const id = String(data[i][0]);
      if (id.startsWith(prefix)) {
        const num = parseInt(id.substring(prefix.length));
        if (!isNaN(num) && num > max) max = num;
      }
    }
    const next = max + 1;
    return prefix + String(next).padStart(2, '0');
  } finally {
    lock.releaseLock();
  }
}

function processAttachments(raw) {
  if (!raw) return "";
  const items = String(raw).split("|||");
  const processed = items.map(item => {
    if (item.startsWith("data:")) {
      const ext = item.includes("application/pdf") ? "pdf" : "jpg";
      const fileName = "img_" + Date.now() + "_" + Math.random().toString(36) + "." + ext;
      return uploadImageToDrive(item, fileName);
    }
    return item;
  }).filter(Boolean);
  return processed.join("|||");
}

function uploadImageToDrive(base64, fileName) {
  try {
    const folderName = "FieldScan_Files";
    let folder = DriveApp.getFoldersByName(folderName).hasNext() ? DriveApp.getFoldersByName(folderName).next() : DriveApp.createFolder(folderName);
    const parts = base64.split(",");
    const blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), parts[0].split(":")[1].split(";")[0], fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    return file.getId(); // store ID, not public URL
  } catch(e) { return ""; }
}

function getPreviousStageTotal(projectId, paymentGroupId, excludePaymentId) {
  if (!paymentGroupId) return 0;
  const sheet = ensureSheet("Payments");
  if (sheet.getLastRow() <= 1) return 0;
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(normalizeHeader);
  const projIdx = headers.indexOf(normalizeHeader("projectId"));
  const groupIdx = headers.indexOf(normalizeHeader("paymentGroupId"));
  const idIdx = headers.indexOf(normalizeHeader("paymentId"));
  const amtIdx = headers.indexOf(normalizeHeader("amount"));
  let total = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][projIdx]).trim() === String(projectId).trim() &&
        String(data[i][groupIdx]).trim() === String(paymentGroupId).trim() &&
        String(data[i][idIdx]).trim() !== String(excludePaymentId).trim()) {
      total += Number(data[i][amtIdx]) || 0;
    }
  }
  return total;
}

function getActiveVendorsCount() {
  const sheet = ensureSheet("Vendors");
  if (sheet.getLastRow() <= 1) return 0;
  const data = sheet.getRange(2, 10, sheet.getLastRow()-1, 1).getValues(); // column "archived"
  return data.filter(r => r[0] !== "Yes").length;
}

// ======================== SHEET HELPERS ========================
function ensureSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  const schema = SHEET_SCHEMAS[name];
  if (!sheet) { sheet = ss.insertSheet(name); sheet.appendRow(schema); return sheet; }
  let headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(normalizeHeader);
  schema.forEach(h => {
    if (!headers.includes(normalizeHeader(h))) {
      sheet.getRange(1, sheet.getLastColumn()+1).setValue(h);
      headers.push(normalizeHeader(h));
    }
  });
  if (!headers.includes(normalizeHeader("lastModified"))) {
    sheet.getRange(1, sheet.getLastColumn()+1).setValue("lastModified");
  }
  return sheet;
}
function appendRow(sheetName, row) { ensureSheet(sheetName).appendRow(row); }
function appendObjectRow(sheetName, values) {
  const sheet = ensureSheet(sheetName);
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => {
    const key = Object.keys(values).find(k => normalizeHeader(k) === normalizeHeader(header));
    return key ? values[key] : "";
  });
  const newRowNum = sheet.getLastRow() + 1;
  // Force plain-text format on date-shaped columns before writing
  headers.forEach((header, idx) => {
    if (/date/i.test(header)) sheet.getRange(newRowNum, idx+1).setNumberFormat("@");
  });
  sheet.getRange(newRowNum, 1, 1, row.length).setValues([row]);
}
function modifyRow(sheetName, id, updates, idCol=0) {
  const sheet = ensureSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(normalizeHeader);
  for (let i=1; i<data.length; i++) {
    if (String(data[i][idCol]).trim() === String(id).trim()) {
      // Conflict detection: reject if incoming data is older than server
      const lastModIdx = headers.indexOf(normalizeHeader("lastModified"));
      const existingLastMod = lastModIdx !== -1 ? data[i][lastModIdx] : null;
      if (updates.lastModified && existingLastMod != null && existingLastMod !== "") {
        const existingTime = Number(existingLastMod);
        const incomingTime = Number(updates.lastModified);
        if (!isNaN(existingTime) && !isNaN(incomingTime) && incomingTime < existingTime) {
          return { success: false, error: "Conflict: server has newer version" };
        }
      }
      for (let [k,v] of Object.entries(updates)) {
        const col = headers.indexOf(normalizeHeader(k));
        if (col !== -1) {
          if (/date/i.test(k)) sheet.getRange(i+1, col+1).setNumberFormat("@");
          sheet.getRange(i+1, col+1).setValue(v);
        }
      }
      return { success: true };
    }
  }
  return { success: false, error: "Not found" };
}
function deleteRow(sheetName, id, idCol=0) {
  const sheet = ensureSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i=1; i<data.length; i++) {
    if (String(data[i][idCol]).trim() === String(id).trim()) { sheet.deleteRow(i+1); return { success: true }; }
  }
  return { success: false, error: "Not found" };
}
function getNextSequentialId(sheetName, prefix, pad) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    let max = 0;
    for (let i=1; i<data.length; i++) {
      const cell = String(data[i][0]);
      if (cell.startsWith(prefix)) {
        const num = parseInt(cell.substring(prefix.length));
        if (!isNaN(num) && num > max) max = num;
      }
    }
    return prefix + String(max+1).padStart(pad, '0');
  } finally {
    lock.releaseLock();
  }
}
function normalizeHeader(h) { return String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, ''); }
function currentDate() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy/MM/dd"); }

/* ======================== SETTINGS SHEET ======================== */
function getSettingsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
    sheet.appendRow(["Key", "Value", "Description"]);
    sheet.appendRow(["VAT", 0.075, "Value Added Tax (7.5%)"]);
    sheet.appendRow(["WHT", 0.05, "Withholding Tax (5%)"]);
    // Work Order Terms & Conditions defaults (WO1-W10)
    const woDefaults = [
      ["WO1", "All work shall be carried out in accordance with the project specifications and approved drawings.", "Work Order Terms 1"],
      ["WO2", "The contractor shall maintain adequate insurance coverage for all workers and equipment on site.", "Work Order Terms 2"],
      ["WO3", "Payment shall be made within 14 days of satisfactory completion and sign-off of work.", "Work Order Terms 3"],
      ["WO4", "Any variations to the scope of work must be approved in writing before commencement.", "Work Order Terms 4"],
      ["WO5", "The contractor shall comply with all health and safety regulations applicable on site.", "Work Order Terms 5"],
      ["WO6", "Defects liability period shall be 6 months from the date of practical completion.", "Work Order Terms 6"],
      ["WO7", "The contractor shall be responsible for the removal of all waste materials from site.", "Work Order Terms 7"],
      ["WO8", "All materials used shall be new and of good quality, conforming to relevant standards.", "Work Order Terms 8"],
      ["WO9", "The contractor shall provide progress reports at intervals agreed with the project manager.", "Work Order Terms 9"],
      ["WO10", "Termination of this work order requires 7 days written notice by either party.", "Work Order Terms 10"],
      ["Logo", "", "Company logo (base64 or Drive ID)"],
      ["Name_Signed", "", "Signatory name for reports"],
      ["Sign_Signed", "", "Signature image (base64 or Drive ID)"]
    ];
    woDefaults.forEach(row => sheet.appendRow(row));
    sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
    sheet.getRange(2, 2, 2, 1).setNumberFormat("0.00%");
  }
  return sheet;
}

function getSettings_() {
  const sheet = getSettingsSheet_();
  const data = sheet.getDataRange().getValues();
  const settings = {};
  const TEXT_KEYS = new Set(["Logo", "Name_Signed", "Sign_Signed"]);
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    if (!key) continue;
    const val = data[i][1];
    if (key.startsWith("WO") || TEXT_KEYS.has(key)) {
      settings[key] = String(val || "").trim();
    } else {
      settings[key] = typeof val === 'number' ? val : (parseFloat(val) || 0);
    }
  }
  return { success: true, data: settings };
}

function updateSetting_(key, value) {
  const sheet = getSettingsSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return { success: true, message: "Updated" };
    }
  }
  sheet.appendRow([key, value, ""]);
  return { success: true, message: "Created" };
}
