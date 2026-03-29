/**
 * CKYC Mock UI — calls same-origin API routes.
 * API_BASE empty = current host.
 */
const API = "";

/** Same keys as scripts/seed.py SEED_ID_JSON — enables A/B/D/F/G/02/03 search after batch upload. */
const SEED_ID_JSON_DEMO = {
  A: "A123456789012345678",
  B: "B123456789012345678",
  D: "D123456789012345678",
  F: "F12345678901234567890123456789012345678",
  G: "G123456789012345678",
  "02": "LEI12345678901234567890123456789012345678901234567890123456",
  "03": "GSTINSAMPLE123456789012345678901234567890123456789012345678",
};

const PRESETS = {
  search: {
    fi_code: "IN0106",
    request_id: "",
    id_type: "C",
    id_no: "ABCPA1234F",
  },
  batch: {
    fi_code: "IN0106",
    batch_reference: "UI-BATCH-" + Date.now(),
    simulate_checker_approve: true,
    records: [
      {
        customer_type: "individual",
        name: "UI Demo User",
        pan: "ABCPA1234F",
        fathers_name_or_na: "Demo Father",
        dob: "15-06-1992",
        gender: "M",
        aadhaar_last4: "1234",
        id_json: SEED_ID_JSON_DEMO,
        age: "32",
        photo_base64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        identity_rows: [{ type: "C", status: "03" }],
      },
    ],
  },
  fi: {
    admin_token: "dev-admin-token-change-me",
    fi_code: "UI99",
    name: "Browser Registered FI",
    registered_ip: "",
  },
};

/** group id → optgroup label */
const GROUP_LABELS = {
  flow: "Recommended flows",
  search_ind: "Secured search — individual (seed-rec-1, FI IN0106)",
  search_leg: "Secured search — legal entity (seed-rec-2)",
  search_json: "Secured search — id_json (seed or batch with demo values)",
};

/**
 * id_json values must match scripts/seed.py SEED_ID_JSON after `python scripts/seed.py`.
 */
const ALL_SCENARIOS = [
  {
    group: "flow",
    id: "flow_register",
    kind: "flow_register",
    label: "① Register FI — autofill + load PEM",
    blurb:
      "Fills admin token and FI fields, loads keys/fi_public.pem. Submit to register a new FI (change fi_code if IN0106/UI99 already exists).",
  },
  {
    group: "flow",
    id: "flow_batch",
    kind: "flow_batch",
    label: "② Batch upload — sample JSON",
    blurb: "Fills a valid batch payload. Submit; copy batch_id into step ③ for status.",
  },
  {
    group: "flow",
    id: "flow_status",
    kind: "flow_status",
    label: "③ Batch status — use batch_id",
    blurb: "Paste batch_id from upload response, then GET status (or use the button in section 3).",
  },
  {
    group: "search_ind",
    id: "s_c",
    kind: "search",
    label: "C — PAN",
    fi_code: "IN0106",
    id_type: "C",
    id_no: "ABCPA1234F",
    blurb: "PAN search; 4th character must be ABCFGHJLPT.",
  },
  {
    group: "search_ind",
    id: "s_e_ui",
    kind: "search",
    label: "E — Aadhaar (batch demo: UI Demo User)",
    fi_code: "IN0106",
    id_type: "E",
    id_no: "1234|UI Demo User|15-06-1992|M",
    blurb:
      "Matches default batch JSON (aadhaar_last4 1234 + name/DOB/gender). Upload batch first, same FI.",
  },
  {
    group: "search_ind",
    id: "s_e",
    kind: "search",
    label: "E — Aadhaar (seed: Alex)",
    fi_code: "IN0106",
    id_type: "E",
    id_no: "1234|Alex|15-09-1990|M",
    blurb: "Requires scripts/seed.py data (seed-rec-1). Pipe-separated name must match DB exactly.",
  },
  {
    group: "search_ind",
    id: "s_z",
    kind: "search",
    label: "Z — CKYC number (14 digits)",
    fi_code: "IN0106",
    id_type: "Z",
    id_no: "51234567890123",
    blurb: "Fixed number only on seed-rec-1. After batch upload, use Z from batch status (random per record).",
  },
  {
    group: "search_ind",
    id: "s_y",
    kind: "search",
    label: "Y — CKYC reference ID (14 chars)",
    fi_code: "IN0106",
    id_type: "Y",
    id_no: "INISAI17091999",
    blurb: "Fixed only for seed. After batch, copy CKYC_REFERENCE_ID from status / decrypted PID.",
  },
  {
    group: "search_leg",
    id: "s_z_leg",
    kind: "search",
    label: "Z — CKYC number (legal)",
    fi_code: "IN0106",
    id_type: "Z",
    id_no: "81234567890123",
    blurb: "Legal entity ARP limited from seed.",
  },
  {
    group: "search_leg",
    id: "s_y_leg",
    kind: "search",
    label: "Y — CKYC reference (legal)",
    fi_code: "IN0106",
    id_type: "Y",
    id_no: "LEARAV29072000",
    blurb: "Legal entity reference from seed.",
  },
  {
    group: "search_json",
    id: "s_a",
    kind: "search",
    label: "A — Passport / misc (id_json)",
    fi_code: "IN0106",
    id_type: "A",
    id_no: "A123456789012345678",
    blurb: "Needs id_json on the DB row (run seed.py or upload batch with demo id_json).",
  },
  {
    group: "search_json",
    id: "s_b",
    kind: "search",
    label: "B — ID proof (id_json)",
    fi_code: "IN0106",
    id_type: "B",
    id_no: "B123456789012345678",
    blurb: "Same as A.",
  },
  {
    group: "search_json",
    id: "s_d",
    kind: "search",
    label: "D — Driving licence (id_json)",
    fi_code: "IN0106",
    id_type: "D",
    id_no: "D123456789012345678",
    blurb: "Same as A.",
  },
  {
    group: "search_json",
    id: "s_f",
    kind: "search",
    label: "F — Form 60 (id_json)",
    fi_code: "IN0106",
    id_type: "F",
    id_no: "F12345678901234567890123456789012345678",
    blurb: "40-char max per validation.",
  },
  {
    group: "search_json",
    id: "s_g",
    kind: "search",
    label: "G — NREGA / job card (id_json)",
    fi_code: "IN0106",
    id_type: "G",
    id_no: "G123456789012345678",
    blurb: "",
  },
  {
    group: "search_json",
    id: "s_02",
    kind: "search",
    label: "02 — LEI (id_json)",
    fi_code: "IN0106",
    id_type: "02",
    id_no: "LEI12345678901234567890123456789012345678901234567890123456",
    blurb: "Type 02 in ID type field.",
  },
  {
    group: "search_json",
    id: "s_03",
    kind: "search",
    label: "03 — GSTIN (id_json)",
    fi_code: "IN0106",
    id_type: "03",
    id_no: "GSTINSAMPLE123456789012345678901234567890123456789012345678",
    blurb: "Type 03 in ID type field.",
  },
];

const SCENARIO_BY_ID = Object.fromEntries(ALL_SCENARIOS.map((s) => [s.id, s]));

const SEARCH_SCENARIOS = ALL_SCENARIOS.filter((s) => s.kind === "search");

/** Defaults when changing ID type without picking a full preset (matches frontend/src/data/searchScenarios.ts). */
const DEFAULT_ID_NO_BY_TYPE = {
  C: "ABCPA1234F",
  E: "1234|UI Demo User|15-06-1992|M",
  Z: "51234567890123",
  Y: "INISAI17091999",
  A: "A123456789012345678",
  B: "B123456789012345678",
  D: "D123456789012345678",
  F: "F12345678901234567890123456789012345678",
  G: "G123456789012345678",
  "02": "LEI12345678901234567890123456789012345678901234567890123456",
  "03": "GSTINSAMPLE123456789012345678901234567890123456789012345678",
};

function buildSearchPresetSelect() {
  const sel = $("sv_preset");
  if (!sel) return;
  sel.innerHTML = "";
  const z = document.createElement("option");
  z.value = "";
  z.textContent = "— Choose C, E, F, Z, … —";
  sel.appendChild(z);
  const byGroup = new Map();
  for (const s of SEARCH_SCENARIOS) {
    if (!byGroup.has(s.group)) byGroup.set(s.group, []);
    byGroup.get(s.group).push(s);
  }
  for (const [gid, items] of byGroup) {
    const og = document.createElement("optgroup");
    og.label = GROUP_LABELS[gid] || gid;
    for (const it of items) {
      const o = document.createElement("option");
      o.value = it.id;
      o.textContent = it.label;
      og.appendChild(o);
    }
    sel.appendChild(og);
  }
}

function buildIdTypeSelect() {
  const sel = $("sv_id_type");
  if (!sel) return;
  sel.innerHTML = "";
  const rows = [
    ["C", "C — PAN"],
    ["E", "E — Aadhaar-style"],
    ["F", "F — Form 60"],
    ["Z", "Z — CKYC number"],
    ["Y", "Y — CKYC ref"],
    ["A", "A — Passport"],
    ["B", "B — ID proof"],
    ["D", "D — Driving licence"],
    ["G", "G — NREGA"],
    ["02", "02 — LEI"],
    ["03", "03 — GSTIN"],
  ];
  for (const [v, label] of rows) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = label;
    sel.appendChild(o);
  }
}

function applySearchPreset(id) {
  const s = SCENARIO_BY_ID[id];
  if (!s || s.kind !== "search") return;
  $("sv_fi_code").value = s.fi_code;
  $("sv_request_id").value = "";
  $("sv_id_type").value = s.id_type;
  $("sv_id_no").value = s.id_no;
  const blurb = $("sv_preset_blurb");
  if (blurb) blurb.textContent = s.blurb || "";
  const cfg = $("cfg_select");
  if (cfg) cfg.value = id;
  setSearchMessage("Preset: " + s.label + ". " + (s.blurb || ""), false);
}

function onIdTypeChange() {
  const t = $("sv_id_type").value;
  const d = DEFAULT_ID_NO_BY_TYPE[t];
  if (d !== undefined) $("sv_id_no").value = d;
}

function $(id) {
  return document.getElementById(id);
}

function out(id, text, isErr) {
  const el = $(id);
  el.textContent = typeof text === "string" ? text : JSON.stringify(text, null, 2);
  el.classList.toggle("err", !!isErr);
}

/** Pretty-print XML (full PHOTO base64 preserved). */
function prettyXml(xmlStr) {
  const src = (xmlStr || "").trim();
  if (!src) return "(empty)";
  try {
    const doc = new DOMParser().parseFromString(src, "application/xml");
    if (doc.querySelector("parsererror")) return src;
    return serializeXmlElement(doc.documentElement, 0);
  } catch {
    return src;
  }
}

function serializeXmlElement(el, depth) {
  const pad = "  ".repeat(depth);
  const name = el.tagName;
  let attrs = "";
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    const v = String(a.value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    attrs += ` ${a.name}="${v}"`;
  }
  const onlyText =
    el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE;
  if (onlyText) {
    const raw = el.textContent || "";
    const esc = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `${pad}<${name}${attrs}>${esc}</${name}>\n`;
  }
  const hasKids = [...el.childNodes].some(
    (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
  );
  if (!hasKids) return `${pad}<${name}${attrs}/>\n`;
  let out = `${pad}<${name}${attrs}>\n`;
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = (child.textContent || "").trim();
      if (t) out += `${pad}  ${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}\n`;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      out += serializeXmlElement(child, depth + 1);
    }
  }
  out += `${pad}</${name}>\n`;
  return out;
}

function addXmlDetails(parent, title, xmlString, open) {
  const det = document.createElement("details");
  if (open) det.open = true;
  const sum = document.createElement("summary");
  sum.textContent = title;
  const pre = document.createElement("pre");
  pre.className = "xml-dump";
  pre.textContent = prettyXml(xmlString);
  det.appendChild(sum);
  det.appendChild(pre);
  parent.appendChild(det);
}

function renderSearchResult(data) {
  const root = $("search-result");
  if (!root) return;
  root.classList.remove("err");
  root.innerHTML = "";

  if (data == null || typeof data !== "object") {
    root.textContent = String(data);
    return;
  }

  const summary = document.createElement("div");
  summary.className = "search-summary";
  summary.innerHTML = `<p><strong>http_status</strong> — ${escapeHtml(
    String(data.http_status ?? "")
  )} (HTTP status; 200 means the pipeline returned a body, including validation errors inside encrypted PID).</p>
<p><strong>request_id_used</strong> — ${escapeHtml(
    String(data.request_id_used ?? "")
  )} (echo of the REQUEST_ID; must stay unique per FI per calendar day in the mock).</p>
<p><strong>request_xml</strong> — Signed request your browser did not build; the demo endpoint builds the same v1.3 XML server-side.</p>
<p><strong>response_xml</strong> — CERSAI-signed response: encrypted PID + SESSION_KEY for the FI to decrypt.</p>
<p><strong>decrypted_pid_xml</strong> — What you get after decrypting with <code>keys/fi_private.pem</code> (shown here for learning). Multiple <code>&lt;SearchResponsePID&gt;</code> blocks for type <strong>C</strong> mean several DB rows share that PAN (e.g. repeated batch uploads).</p>
<p><strong>PAN / Aadhaar</strong> — v1.3 <code>PID_DATA</code> does not define a PAN element; full Aadhaar is not returned. Type E search uses last four + demographics only.</p>`;
  root.appendChild(summary);

  if (data.decrypted_pid_xml) addXmlDetails(root, "Decrypted PID (formatted)", data.decrypted_pid_xml, true);
  if (data.request_xml) addXmlDetails(root, "Request XML (formatted)", data.request_xml, false);
  if (data.response_xml) addXmlDetails(root, "Response XML (formatted)", data.response_xml, false);

  const raw = document.createElement("details");
  const rawSum = document.createElement("summary");
  rawSum.textContent = "Full JSON (raw API response)";
  const pre = document.createElement("pre");
  pre.className = "xml-dump";
  pre.textContent = JSON.stringify(data, null, 2);
  raw.appendChild(rawSum);
  raw.appendChild(pre);
  root.appendChild(raw);

  if (data.error_body_if_any) {
    const err = document.createElement("p");
    err.className = "search-err-line";
    err.style.color = "var(--err)";
    err.textContent = "error_body_if_any: " + data.error_body_if_any;
    root.appendChild(err);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setSearchMessage(text, isErr) {
  const root = $("search-result");
  if (!root) return;
  root.classList.toggle("err", !!isErr);
  root.textContent = text;
}

function buildScenarioSelect() {
  const sel = $("cfg_select");
  if (!sel) return;
  sel.innerHTML = "";
  const z = document.createElement("option");
  z.value = "";
  z.textContent = "— Pick a recommended scenario —";
  sel.appendChild(z);

  const byGroup = new Map();
  for (const s of ALL_SCENARIOS) {
    if (!byGroup.has(s.group)) byGroup.set(s.group, []);
    byGroup.get(s.group).push(s);
  }
  for (const [gid, items] of byGroup) {
    const og = document.createElement("optgroup");
    og.label = GROUP_LABELS[gid] || gid;
    for (const it of items) {
      const o = document.createElement("option");
      o.value = it.id;
      o.textContent = it.label;
      og.appendChild(o);
    }
    sel.appendChild(og);
  }
}

async function applyScenario(id) {
  const s = SCENARIO_BY_ID[id];
  const blurbEl = $("cfg_blurb");
  if (!s) {
    if (blurbEl) blurbEl.textContent = "";
    return;
  }
  if (blurbEl) blurbEl.textContent = s.blurb || "";

  if (s.kind === "flow_register") {
    autofillFi();
    await loadSampleFiPublic();
    out("fi-out", "Applied: Register FI preset. Review and submit.", false);
    return;
  }
  if (s.kind === "flow_batch") {
    autofillBatch();
    out("batch-out", "Applied: batch preset. Submit to upload.", false);
    return;
  }
  if (s.kind === "flow_status") {
    out("status-out", "Paste batch_id from an upload response, then GET status.", false);
    $("status_batch_id").focus();
    return;
  }
  if (s.kind === "search") {
    $("sv_fi_code").value = s.fi_code;
    $("sv_request_id").value = "";
    $("sv_id_type").value = s.id_type;
    $("sv_id_no").value = s.id_no;
    const sp = $("sv_preset");
    if (sp) sp.value = s.id;
    const blurb = $("sv_preset_blurb");
    if (blurb) blurb.textContent = s.blurb || "";
    setSearchMessage(
      "Applied: " +
        s.label +
        ". Request ID cleared (server assigns random if empty). " +
        (s.blurb || ""),
      false
    );
  }
}

async function loadSampleFiPublic() {
  const r = await fetch(API + "/api/ui/sample-fi-public-key");
  const t = await r.text();
  if (!r.ok) {
    out("fi-pem-out", t, true);
    return;
  }
  $("fi_public_key_pem").value = t;
  out("fi-pem-out", "Loaded keys/fi_public.pem (" + t.length + " chars)", false);
}

function autofillSearch() {
  Object.assign(PRESETS.search, { request_id: "" });
  for (const [k, v] of Object.entries(PRESETS.search)) {
    const el = $("sv_" + k);
    if (el) el.value = v;
  }
  const sp = $("sv_preset");
  if (sp) sp.value = "s_c";
  const blurb = $("sv_preset_blurb");
  if (blurb && SCENARIO_BY_ID.s_c) blurb.textContent = SCENARIO_BY_ID.s_c.blurb || "";
  const cfg = $("cfg_select");
  if (cfg) cfg.value = "s_c";
  setSearchMessage("Autofill: C — PAN (seed). Edit any field before Run.", false);
}

function autofillBatch() {
  PRESETS.batch.batch_reference = "UI-BATCH-" + Date.now();
  $("batch_json").value = JSON.stringify(PRESETS.batch, null, 2);
  out("batch-out", "Autofill applied. batch_reference is unique.", false);
}

function autofillFi() {
  for (const [k, v] of Object.entries(PRESETS.fi)) {
    const el = $("fi_" + k);
    if (el) el.value = v;
  }
  const tok = $("fi_admin_token");
  if (tok) tok.value = PRESETS.fi.admin_token;
  out("fi-out", "Autofill applied. Load public key or paste PEM.", false);
}

async function submitRegisterFi(e) {
  e.preventDefault();
  const body = {
    fi_code: $("fi_fi_code").value.trim(),
    name: $("fi_name").value.trim(),
    fi_public_key_pem: $("fi_public_key_pem").value.trim(),
    registered_ip: $("fi_registered_ip").value.trim() || null,
    admin_token: $("fi_admin_token").value.trim(),
  };
  try {
    const r = await fetch(API + "/api/ui/register-fi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    out("fi-out", r.ok ? data : data, !r.ok);
  } catch (err) {
    out("fi-out", String(err), true);
  }
}

async function submitBatch(e) {
  e.preventDefault();
  let payload;
  try {
    payload = JSON.parse($("batch_json").value);
  } catch (err) {
    out("batch-out", "Invalid JSON: " + err, true);
    return;
  }
  try {
    const r = await fetch(API + "/ckyc/batch/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    out("batch-out", data, !r.ok);
    if (r.ok && data.batch_id) $("status_batch_id").value = data.batch_id;
  } catch (err) {
    out("batch-out", String(err), true);
  }
}

async function getBatchStatus() {
  const bid = $("status_batch_id").value.trim();
  if (!bid) {
    out("status-out", "Enter batch_id", true);
    return;
  }
  try {
    const r = await fetch(API + "/ckyc/batch/" + encodeURIComponent(bid) + "/status");
    const data = await r.json().catch(() => ({}));
    out("status-out", data, !r.ok);
  } catch (err) {
    out("status-out", String(err), true);
  }
}

async function runDemoSearch(e) {
  e.preventDefault();
  const body = {
    fi_code: $("sv_fi_code").value.trim(),
    request_id: $("sv_request_id").value.trim(),
    id_type: $("sv_id_type").value.trim(),
    id_no: $("sv_id_no").value.trim(),
  };
  try {
    const r = await fetch(API + "/api/demo/verify-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (
      r.ok &&
      data &&
      typeof data === "object" &&
      ("request_xml" in data || "decrypted_pid_xml" in data || "http_status" in data)
    ) {
      renderSearchResult(data);
    } else {
      setSearchMessage(typeof data === "object" ? JSON.stringify(data, null, 2) : String(data), !r.ok);
    }
    if (data && data.request_id_used) $("sv_request_id").placeholder = "last used: " + data.request_id_used;
  } catch (err) {
    setSearchMessage(String(err), true);
  }
}

async function pingHealth() {
  try {
    const r = await fetch(API + "/health");
    const data = await r.json();
    out("health-out", data, false);
  } catch (err) {
    out("health-out", String(err), true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildScenarioSelect();
  buildSearchPresetSelect();
  buildIdTypeSelect();
  $("cfg_select").addEventListener("change", (e) => applyScenario(e.target.value));
  $("btn-apply-scenario").addEventListener("click", () => applyScenario($("cfg_select").value));

  const svPreset = $("sv_preset");
  if (svPreset) svPreset.addEventListener("change", (e) => applySearchPreset(e.target.value));
  const svIdType = $("sv_id_type");
  if (svIdType) svIdType.addEventListener("change", onIdTypeChange);

  $("form-fi").addEventListener("submit", submitRegisterFi);
  $("form-batch").addEventListener("submit", submitBatch);
  $("form-search").addEventListener("submit", runDemoSearch);
  $("btn-health").addEventListener("click", pingHealth);
  $("btn-status").addEventListener("click", getBatchStatus);
  $("btn-autofill-search").addEventListener("click", autofillSearch);
  $("btn-autofill-batch").addEventListener("click", autofillBatch);
  $("btn-autofill-fi").addEventListener("click", autofillFi);
  $("btn-load-pem").addEventListener("click", loadSampleFiPublic);
  autofillSearch();
  autofillBatch();
  autofillFi();
  pingHealth();
});
