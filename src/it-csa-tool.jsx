import { useState, useEffect, useRef, useMemo } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const C = {
  bg:           "#F0EDE8",
  surface:      "#FFFFFF",
  surfaceElev:  "#F7F4F0",
  surfaceHigh:  "#EDE9E2",
  border:       "#DDD8D0",
  borderMid:    "#CAC3B8",
  borderHigh:   "#A89F94",
  orange:       "#F05A22",
  orangeDim:    "#C04818",
  orangeFaint:  "rgba(240,90,34,0.10)",
  blue:         "#1A6FA3",
  blueFaint:    "rgba(26,111,163,0.10)",
  amber:        "#C47D0A",
  amberFaint:   "rgba(196,125,10,0.12)",
  purple:       "#7B5CF5",
  purpleFaint:  "rgba(123,92,245,0.10)",
  teal:         "#0E8A7E",
  tealFaint:    "rgba(14,138,126,0.10)",
  gray:         "#6B7280",
  grayFaint:    "rgba(107,114,128,0.12)",
  text:         "#1A1208",
  textSub:      "#6B5E52",
  textMuted:    "#9E9186",
  success:      "#2D9B6F",
  successFaint: "rgba(45,155,111,0.12)",
  danger:       "#B03025",
  dangerFaint:  "rgba(176,48,37,0.10)",
  warning:      "#C47D0A",
  warningFaint: "rgba(196,125,10,0.12)",
  white:        "#FFFFFF",
};

const NAV = {
  bg:       "#0B1C2E",
  border:   "#1E3347",
  text:     "#E8EEF4",
  textSub:  "#8BA5BE",
  textMuted:"#4E6A84",
  surface:  "#162840",
};

// ── TAXONOMY ───────────────────────────────────────────────────────────────────
const TYPE_META = {
  "Vendor":    { color: C.blue,   bg: C.blueFaint,   icon: "🏢" },
  "SaaS":      { color: C.purple, bg: C.purpleFaint,  icon: "☁️" },
  "Custom":    { color: C.orange, bg: C.orangeFaint,  icon: "🔧" },
  "Shadow IT": { color: C.amber,  bg: C.amberFaint,   icon: "⚠️" },
  "Hardware":  { color: C.gray,   bg: C.grayFaint,    icon: "🖥️" },
  "Platform":  { color: C.teal,   bg: C.tealFaint,    icon: "⚙️" },
};

const STATUS_META = {
  "Active":       { color: C.success, bg: C.successFaint },
  "Under Review": { color: C.warning, bg: C.warningFaint },
  "Deprecate":    { color: C.danger,  bg: C.dangerFaint  },
  "Unknown":      { color: C.textMuted, bg: "rgba(158,145,134,0.12)" },
};

const SATISFACTION_META = {
  "Happy":   { color: C.success, icon: "😊" },
  "Neutral": { color: C.amber,   icon: "😐" },
  "Unhappy": { color: C.danger,  icon: "😞" },
  "Unknown": { color: C.textMuted, icon: "❓" },
};

const DEPARTMENTS = [
  "Cross-Dept / DC-Wide",
  "Count & Flow (CFL)",
  "Hub",
  "Pallet In/Out",
  "Pick by Store (PBS)",
  "Product Info Management (PIM)",
  "Put to Lights",
  "Quality Control",
  "Receiving",
  "RTV & Chargeback",
  "Shipping Audits",
  "Stash / Loyalty",
  "Traffic & Logistics",
  "Value Added Service (VAS)",
  "Vendor Relations",
  "Corporate / HQ",
  "Ecommerce",
  "Stores",
];

const SYSTEM_TYPES = ["Vendor", "SaaS", "Custom", "Shadow IT", "Hardware", "Platform"];
const STATUS_LIST  = ["Active", "Under Review", "Deprecate", "Unknown"];
const BU_LIST      = ["DC", "Stores", "HQ", "Ecommerce", "All"];
const SAT_LIST     = ["Happy", "Neutral", "Unhappy", "Unknown"];

// ── UTILS ──────────────────────────────────────────────────────────────────────
const uid   = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split("T")[0];

function applyFilters(systems, f) {
  return systems.filter(s => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) &&
          !s.purpose.toLowerCase().includes(q) &&
          !s.category.toLowerCase().includes(q) &&
          !(s.itOwner || "").toLowerCase().includes(q) &&
          !(s.deptOwner || "").toLowerCase().includes(q)) return false;
    }
    if (f.department !== "All" && !(s.departments || []).includes(f.department)) return false;
    if (f.systemType !== "All" && s.systemType !== f.systemType) return false;
    if (f.status !== "All" && s.status !== f.status) return false;
    if (f.boomi === "Yes" && !s.boomiConnected) return false;
    if (f.boomi === "No"  &&  s.boomiConnected) return false;
    if (f.verified === "Verified"   &&  s.verified) return false; // show unverified
    if (f.verified === "Unverified" && !s.verified) return false; // show verified only ... wait, let me re-think
    return true;
  });
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Modal({ open, onClose, title, width = 600, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, border: `1px solid ${C.borderMid}`,
        borderRadius: 14, width: "100%", maxWidth: width,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
          position: "sticky", top: 0, background: C.surface, zIndex: 1
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.textMuted,
            cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px"
          }}>×</button>
        </div>
        <div style={{ padding: "22px 22px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function Badge({ label, color, bg, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "2px 7px" : "3px 9px",
      borderRadius: 20,
      background: bg || "rgba(0,0,0,0.06)",
      color: color || C.textSub,
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function StatusDot({ status }) {
  const m = STATUS_META[status] || STATUS_META["Unknown"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", background: m.color,
        boxShadow: `0 0 0 2px ${m.bg}`, flexShrink: 0
      }}/>
      <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{status}</span>
    </span>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</div>;
}

function TextInput({ value, onChange, placeholder, style }) {
  return (
    <input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "8px 10px", border: `1px solid ${C.borderMid}`,
        borderRadius: 7, fontSize: 13, color: C.text, background: C.surface,
        outline: "none", ...style
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", padding: "8px 10px", border: `1px solid ${C.borderMid}`,
        borderRadius: 7, fontSize: 13, color: C.text, background: C.surface,
        outline: "none", resize: "vertical", fontFamily: "inherit"
      }}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "8px 10px", border: `1px solid ${C.borderMid}`,
        borderRadius: 7, fontSize: 13, color: value ? C.text : C.textMuted,
        background: C.surface, outline: "none", cursor: "pointer"
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Multi-select checkbox list
function MultiCheckList({ options, selected = [], onChange, columns = 2 }) {
  const toggle = val => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "6px 12px", maxHeight: 160, overflowY: "auto",
      border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px"
    }}>
      {options.map(o => (
        <label key={o} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12, color: C.text }}>
          <input
            type="checkbox"
            checked={selected.includes(o)}
            onChange={() => toggle(o)}
            style={{ accentColor: C.orange }}
          />
          {o}
        </label>
      ))}
    </div>
  );
}

// ── SYSTEM CARD (Landscape) ────────────────────────────────────────────────────
function SystemCard({ system, onClick }) {
  const tm = TYPE_META[system.systemType] || TYPE_META["Vendor"];
  const sm = STATUS_META[system.status] || STATUS_META["Unknown"];
  const deps = system.departments || [];

  return (
    <div
      onClick={() => onClick(system)}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
        display: "flex", flexDirection: "column",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Type color accent bar */}
      <div style={{ height: 4, background: tm.color, flexShrink: 0 }} />

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, lineHeight: 1.3 }}>{system.name}</div>
            <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{system.category}</div>
          </div>
          <Badge label={system.systemType} color={tm.color} bg={tm.bg} small />
        </div>

        {/* Departments */}
        {deps.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {deps.slice(0, 2).map(d => (
              <span key={d} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 10,
                background: C.surfaceHigh, color: C.textSub, fontWeight: 500
              }}>{d}</span>
            ))}
            {deps.length > 2 && (
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 10,
                background: C.surfaceHigh, color: C.textMuted, fontWeight: 500
              }}>+{deps.length - 2}</span>
            )}
          </div>
        )}

        {/* Purpose */}
        {system.purpose && (
          <div style={{
            fontSize: 12, color: C.textSub, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", flex: 1
          }}>{system.purpose}</div>
        )}

        {/* Footer row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          paddingTop: 8, borderTop: `1px solid ${C.border}`, flexWrap: "wrap"
        }}>
          <StatusDot status={system.status} />
          {system.boomiConnected && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: "rgba(14,138,126,0.12)", color: C.teal, fontWeight: 600
            }}>Boomi</span>
          )}
          {!system.verified && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: C.amberFaint, color: C.amber, fontWeight: 600, marginLeft: "auto"
            }}>Unverified</span>
          )}
          {system.verified && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: C.successFaint, color: C.success, fontWeight: 600, marginLeft: "auto"
            }}>✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CATALOG ROW ────────────────────────────────────────────────────────────────
function CatalogRow({ system, onClick, isEven }) {
  const tm = TYPE_META[system.systemType] || TYPE_META["Vendor"];
  const deps = system.departments || [];
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={() => onClick(system)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surfaceElev : (isEven ? C.surface : C.surfaceElev),
        cursor: "pointer", transition: "background 0.1s",
        borderBottom: `1px solid ${C.border}`
      }}
    >
      {/* Name + type */}
      <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: tm.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{system.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{system.category}</div>
          </div>
        </div>
      </td>
      {/* Type */}
      <td style={{ padding: "11px 12px" }}>
        <Badge label={system.systemType} color={tm.color} bg={tm.bg} small />
      </td>
      {/* Departments */}
      <td style={{ padding: "11px 12px", maxWidth: 220 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {deps.slice(0, 2).map(d => (
            <span key={d} style={{
              fontSize: 10, padding: "2px 6px", borderRadius: 8,
              background: C.surfaceHigh, color: C.textSub, fontWeight: 500
            }}>{d}</span>
          ))}
          {deps.length > 2 && (
            <span style={{ fontSize: 10, color: C.textMuted }}>+{deps.length - 2}</span>
          )}
        </div>
      </td>
      {/* IT Owner */}
      <td style={{ padding: "11px 12px", fontSize: 12, color: system.itOwner ? C.text : C.textMuted }}>
        {system.itOwner || "—"}
      </td>
      {/* Dept Owner */}
      <td style={{ padding: "11px 12px", fontSize: 12, color: system.deptOwner ? C.text : C.textMuted }}>
        {system.deptOwner || "—"}
      </td>
      {/* Status */}
      <td style={{ padding: "11px 12px" }}>
        <StatusDot status={system.status} />
      </td>
      {/* Boomi */}
      <td style={{ padding: "11px 12px", textAlign: "center" }}>
        {system.boomiConnected
          ? <span style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>✓</span>
          : <span style={{ fontSize: 12, color: C.textMuted }}>—</span>}
      </td>
      {/* Verified */}
      <td style={{ padding: "11px 12px" }}>
        {system.verified
          ? <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>✓ Yes</span>
          : <span style={{ fontSize: 11, color: C.amber, fontWeight: 600 }}>⚠ No</span>}
      </td>
      {/* Satisfaction */}
      <td style={{ padding: "11px 12px", fontSize: 12 }}>
        {system.satisfaction && system.satisfaction !== "Unknown"
          ? <span style={{ color: SATISFACTION_META[system.satisfaction]?.color }}>
              {SATISFACTION_META[system.satisfaction]?.icon} {system.satisfaction}
            </span>
          : <span style={{ color: C.textMuted }}>—</span>}
      </td>
    </tr>
  );
}

// ── ADD/EDIT MODAL ─────────────────────────────────────────────────────────────
function SystemModal({ system, onSave, onClose, onDelete }) {
  const isNew = !system?.id;
  const [form, setForm] = useState(() => system || {
    id: uid(), name: "", category: "", systemType: "Vendor",
    departments: [], businessUnits: ["DC"],
    itOwner: "", deptOwner: "", status: "Unknown",
    boomiConnected: false, purpose: "", users: "",
    satisfaction: "Unknown", featuresNeeded: "",
    scopeOfImprovement: "", notes: "", source: "",
    verified: false,
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || uid() });
  };

  const f2col = (a, b) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div>{a}</div><div>{b}</div>
    </div>
  );

  return (
    <Modal open title={isNew ? "Add System" : `Edit — ${system.name}`} onClose={onClose} width={680}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Name */}
        <div>
          <FieldLabel>System Name *</FieldLabel>
          <TextInput value={form.name} onChange={v => set("name", v)} placeholder="e.g. Apropos" />
        </div>

        {/* Category + Type */}
        {f2col(
          <div>
            <FieldLabel>Category</FieldLabel>
            <TextInput value={form.category} onChange={v => set("category", v)} placeholder="e.g. Core WMS" />
          </div>,
          <div>
            <FieldLabel>System Type</FieldLabel>
            <SelectInput value={form.systemType} onChange={v => set("systemType", v)} options={SYSTEM_TYPES} />
          </div>
        )}

        {/* Departments */}
        <div>
          <FieldLabel>Departments / Areas</FieldLabel>
          <MultiCheckList options={DEPARTMENTS} selected={form.departments} onChange={v => set("departments", v)} columns={2} />
        </div>

        {/* Business Units */}
        <div>
          <FieldLabel>Business Units</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BU_LIST.map(bu => (
              <label key={bu} style={{
                display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                padding: "5px 12px", borderRadius: 20,
                border: `1px solid ${(form.businessUnits || []).includes(bu) ? C.orange : C.border}`,
                background: (form.businessUnits || []).includes(bu) ? C.orangeFaint : C.surface,
                fontSize: 12, color: C.text,
              }}>
                <input type="checkbox" style={{ display: "none" }}
                  checked={(form.businessUnits || []).includes(bu)}
                  onChange={() => {
                    const cur = form.businessUnits || [];
                    set("businessUnits", cur.includes(bu) ? cur.filter(b => b !== bu) : [...cur, bu]);
                  }}
                />
                {bu}
              </label>
            ))}
          </div>
        </div>

        {/* Owners */}
        {f2col(
          <div>
            <FieldLabel>IT Owner</FieldLabel>
            <TextInput value={form.itOwner} onChange={v => set("itOwner", v)} placeholder="Name or TBD" />
          </div>,
          <div>
            <FieldLabel>Department Owner</FieldLabel>
            <TextInput value={form.deptOwner} onChange={v => set("deptOwner", v)} placeholder="Name or TBD" />
          </div>
        )}

        {/* Status + Boomi + Verified */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <FieldLabel>Status</FieldLabel>
            <SelectInput value={form.status} onChange={v => set("status", v)} options={STATUS_LIST} />
          </div>
          <div>
            <FieldLabel>Satisfaction</FieldLabel>
            <SelectInput value={form.satisfaction} onChange={v => set("satisfaction", v)} options={SAT_LIST} />
          </div>
          <div style={{ paddingTop: 4 }}>
            <FieldLabel>&nbsp;</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.text }}>
                <input type="checkbox" checked={!!form.boomiConnected} onChange={e => set("boomiConnected", e.target.checked)} style={{ accentColor: C.teal, width: 14, height: 14 }} />
                Boomi Connected
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.text }}>
                <input type="checkbox" checked={!!form.verified} onChange={e => set("verified", e.target.checked)} style={{ accentColor: C.success, width: 14, height: 14 }} />
                Verified
              </label>
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div>
          <FieldLabel>Purpose</FieldLabel>
          <TextArea value={form.purpose} onChange={v => set("purpose", v)} placeholder="What does this system do? Who benefits?" rows={2} />
        </div>

        {/* Users */}
        <div>
          <FieldLabel>Users / Teams</FieldLabel>
          <TextInput value={form.users} onChange={v => set("users", v)} placeholder="e.g. All DC departments, Shipping team" />
        </div>

        {/* Features + Improvement */}
        {f2col(
          <div>
            <FieldLabel>Features Needed</FieldLabel>
            <TextArea value={form.featuresNeeded} onChange={v => set("featuresNeeded", v)} placeholder="What's missing?" rows={2} />
          </div>,
          <div>
            <FieldLabel>Scope of Improvement</FieldLabel>
            <TextArea value={form.scopeOfImprovement} onChange={v => set("scopeOfImprovement", v)} placeholder="Process or tech improvements needed?" rows={2} />
          </div>
        )}

        {/* Notes */}
        <div>
          <FieldLabel>Notes</FieldLabel>
          <TextArea value={form.notes} onChange={v => set("notes", v)} placeholder="Context, links, caveats..." rows={2} />
        </div>

        {/* Source */}
        <div>
          <FieldLabel>Source</FieldLabel>
          <TextInput value={form.source} onChange={v => set("source", v)} placeholder="e.g. DCCSA-Shipping Audits, IT interview — Jarrod" />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <div>
            {!isNew && (
              <button onClick={() => { if (window.confirm(`Delete "${system.name}"?`)) onDelete(system.id); }}
                style={{ padding: "8px 16px", background: C.dangerFaint, border: `1px solid ${C.danger}`, borderRadius: 7, color: C.danger, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Delete
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "8px 18px", background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 7, color: C.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!form.name.trim()} style={{
              padding: "8px 22px", background: form.name.trim() ? C.orange : C.borderMid,
              border: "none", borderRadius: 7, color: C.white,
              fontSize: 13, fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed"
            }}>
              {isNew ? "Add System" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── FILTER BAR ─────────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilters, count, total }) {
  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const hasActive = filters.search || filters.department !== "All" || filters.systemType !== "All"
    || filters.status !== "All" || filters.boomi !== "All" || filters.verified !== "All";

  const sel = (key, opts, label) => (
    <select value={filters[key]} onChange={e => setF(key, e.target.value)} style={{
      padding: "7px 10px", border: `1px solid ${filters[key] !== "All" ? C.orange : C.borderMid}`,
      borderRadius: 7, fontSize: 12, color: filters[key] !== "All" ? C.orange : C.textSub,
      background: filters[key] !== "All" ? C.orangeFaint : C.surface,
      outline: "none", cursor: "pointer", fontWeight: filters[key] !== "All" ? 600 : 400,
    }}>
      <option value="All">{label}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "12px 20px",
      background: C.surfaceElev, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap"
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13 }}>🔍</span>
        <input
          value={filters.search} onChange={e => setF("search", e.target.value)}
          placeholder="Search systems..."
          style={{
            width: "100%", padding: "7px 10px 7px 30px",
            border: `1px solid ${filters.search ? C.orange : C.borderMid}`,
            borderRadius: 7, fontSize: 12, color: C.text, background: C.surface, outline: "none"
          }}
        />
      </div>

      {sel("department", DEPARTMENTS, "All Departments")}
      {sel("systemType", SYSTEM_TYPES, "All Types")}
      {sel("status", STATUS_LIST, "All Statuses")}

      <select value={filters.boomi} onChange={e => setF("boomi", e.target.value)} style={{
        padding: "7px 10px", border: `1px solid ${filters.boomi !== "All" ? C.teal : C.borderMid}`,
        borderRadius: 7, fontSize: 12,
        color: filters.boomi !== "All" ? C.teal : C.textSub,
        background: filters.boomi !== "All" ? C.tealFaint : C.surface,
        outline: "none", cursor: "pointer"
      }}>
        <option value="All">Boomi: All</option>
        <option value="Yes">Boomi: Yes</option>
        <option value="No">Boomi: No</option>
      </select>

      <select value={filters.verified} onChange={e => setF("verified", e.target.value)} style={{
        padding: "7px 10px", border: `1px solid ${filters.verified !== "All" ? C.amber : C.borderMid}`,
        borderRadius: 7, fontSize: 12,
        color: filters.verified !== "All" ? C.amber : C.textSub,
        background: filters.verified !== "All" ? C.amberFaint : C.surface,
        outline: "none", cursor: "pointer"
      }}>
        <option value="All">Verified: All</option>
        <option value="verified_only">Verified Only</option>
        <option value="unverified_only">Unverified Only</option>
      </select>

      {hasActive && (
        <button onClick={() => setFilters({ search: "", department: "All", systemType: "All", status: "All", boomi: "All", verified: "All" })}
          style={{ padding: "7px 12px", background: "none", border: `1px solid ${C.borderMid}`, borderRadius: 7, fontSize: 11, color: C.textSub, cursor: "pointer", fontWeight: 600 }}>
          Clear filters
        </button>
      )}

      <div style={{ marginLeft: "auto", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>
        {count === total ? `${total} systems` : `${count} of ${total}`}
      </div>
    </div>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────
function StatsBar({ systems }) {
  const total    = systems.length;
  const active   = systems.filter(s => s.status === "Active").length;
  const shadow   = systems.filter(s => s.systemType === "Shadow IT").length;
  const boomi    = systems.filter(s => s.boomiConnected).length;
  const unver    = systems.filter(s => !s.verified).length;
  const custom   = systems.filter(s => s.systemType === "Custom").length;

  const stat = (label, value, color, bg) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "10px 20px", background: bg, borderRadius: 10,
      minWidth: 90
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 3, letterSpacing: "0.03em", textAlign: "center" }}>{label}</div>
    </div>
  );

  return (
    <div style={{
      display: "flex", gap: 10, padding: "14px 20px",
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      flexWrap: "wrap", alignItems: "center"
    }}>
      {stat("Total Systems", total, C.text, C.surfaceHigh)}
      {stat("Active", active, C.success, C.successFaint)}
      {stat("Shadow IT", shadow, C.amber, C.amberFaint)}
      {stat("Boomi Connected", boomi, C.teal, C.tealFaint)}
      {stat("Custom Built", custom, C.orange, C.orangeFaint)}
      {stat("Unverified", unver, unver > 0 ? C.warning : C.success, unver > 0 ? C.warningFaint : C.successFaint)}
    </div>
  );
}

// ── CATALOG VIEW ───────────────────────────────────────────────────────────────
function CatalogView({ systems, onEdit }) {
  const [sort, setSort] = useState({ key: "name", dir: "asc" });

  const sorted = useMemo(() => {
    return [...systems].sort((a, b) => {
      let av = a[sort.key] || "";
      let bv = b[sort.key] || "";
      if (typeof av === "boolean") av = av ? "1" : "0";
      if (typeof bv === "boolean") bv = bv ? "1" : "0";
      const cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [systems, sort]);

  const SortTh = ({ k, label, style }) => (
    <th
      onClick={() => setSort(s => ({ key: k, dir: s.key === k && s.dir === "asc" ? "desc" : "asc" }))}
      style={{
        padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700,
        color: sort.key === k ? C.orange : C.textSub,
        letterSpacing: "0.04em", textTransform: "uppercase",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        borderBottom: `2px solid ${sort.key === k ? C.orange : C.border}`,
        background: C.surfaceElev, ...style
      }}
    >
      {label} {sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  if (systems.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMuted }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>No systems match your filters</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing filters or adding a new system</div>
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <SortTh k="name" label="System" style={{ paddingLeft: 16 }} />
            <SortTh k="systemType" label="Type" />
            <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `2px solid ${C.border}`, background: C.surfaceElev }}>Departments</th>
            <SortTh k="itOwner" label="IT Owner" />
            <SortTh k="deptOwner" label="Dept Owner" />
            <SortTh k="status" label="Status" />
            <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: C.textSub, letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: `2px solid ${C.border}`, background: C.surfaceElev, textAlign: "center" }}>Boomi</th>
            <SortTh k="verified" label="Verified" />
            <SortTh k="satisfaction" label="Happy?" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <CatalogRow key={s.id} system={s} onClick={onEdit} isEven={i % 2 === 0} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── LANDSCAPE VIEW ─────────────────────────────────────────────────────────────
function LandscapeView({ systems, onEdit }) {
  if (systems.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMuted }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>No systems match your filters</div>
    </div>
  );

  // Group by system type for landscape
  const grouped = {};
  SYSTEM_TYPES.forEach(t => { grouped[t] = systems.filter(s => s.systemType === t); });

  const hasGroupedContent = Object.values(grouped).some(g => g.length > 0);

  return (
    <div style={{ padding: "20px" }}>
      {SYSTEM_TYPES.map(type => {
        const group = grouped[type];
        if (group.length === 0) return null;
        const tm = TYPE_META[type];
        return (
          <div key={type} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ height: 2, width: 24, background: tm.color, borderRadius: 1 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: tm.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {tm.icon} {type} · {group.length}
              </div>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: 14
            }}>
              {group.map(s => <SystemCard key={s.id} system={s} onClick={onEdit} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── EXPORT HELPERS ─────────────────────────────────────────────────────────────
function exportCSV(systems) {
  const headers = ["Name","Category","Type","Departments","Business Units","IT Owner","Dept Owner","Status","Boomi Connected","Verified","Satisfaction","Purpose","Features Needed","Scope of Improvement","Notes","Source"];
  const rows = systems.map(s => [
    s.name, s.category, s.systemType,
    (s.departments || []).join("; "),
    (s.businessUnits || []).join("; "),
    s.itOwner || "", s.deptOwner || "",
    s.status, s.boomiConnected ? "Yes" : "No",
    s.verified ? "Yes" : "No",
    s.satisfaction || "",
    (s.purpose || "").replace(/"/g, '""'),
    (s.featuresNeeded || "").replace(/"/g, '""'),
    (s.scopeOfImprovement || "").replace(/"/g, '""'),
    (s.notes || "").replace(/"/g, '""'),
    s.source || "",
  ].map(v => `"${v}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `zumiez-csa-${today()}.csv`;
  a.click();
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [systems, setSystems]       = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const [activeTab, setActiveTab]   = useState("landscape");
  const [filters, setFilters]       = useState({ search: "", department: "All", systemType: "All", status: "All", boomi: "All", verified: "All" });
  const [editSystem, setEditSystem] = useState(null);  // null | system obj
  const [showAdd, setShowAdd]       = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const debounceRef = useRef(null);

  // Load on mount
  useEffect(() => {
    fetch("/api/load")
      .then(r => r.json())
      .then(data => {
        if (data?.systems) setSystems(data.systems);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Auto-save (1.2s debounce)
  useEffect(() => {
    if (!loaded || systems.length === 0) return;
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systems, lastUpdated: today(), version: "1.0.0" }),
      })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, 1200);
  }, [systems, loaded]);

  // Filter logic
  const filteredSystems = useMemo(() => {
    return systems.filter(s => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) &&
            !(s.purpose || "").toLowerCase().includes(q) &&
            !(s.category || "").toLowerCase().includes(q) &&
            !(s.itOwner || "").toLowerCase().includes(q) &&
            !(s.deptOwner || "").toLowerCase().includes(q) &&
            !(s.notes || "").toLowerCase().includes(q)) return false;
      }
      if (filters.department !== "All" && !(s.departments || []).includes(filters.department)) return false;
      if (filters.systemType !== "All" && s.systemType !== filters.systemType) return false;
      if (filters.status !== "All" && s.status !== filters.status) return false;
      if (filters.boomi === "Yes" && !s.boomiConnected) return false;
      if (filters.boomi === "No"  &&  s.boomiConnected) return false;
      if (filters.verified === "verified_only"   && !s.verified) return false;
      if (filters.verified === "unverified_only" &&  s.verified) return false;
      return true;
    });
  }, [systems, filters]);

  const handleSave = (updated) => {
    setSystems(prev => {
      const idx = prev.findIndex(s => s.id === updated.id);
      if (idx >= 0) return prev.map(s => s.id === updated.id ? updated : s);
      return [...prev, updated];
    });
    setEditSystem(null);
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setSystems(prev => prev.filter(s => s.id !== id));
    setEditSystem(null);
  };

  const navTab = (id, label, icon) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "8px 18px", background: "none", border: "none",
        borderBottom: `2px solid ${activeTab === id ? C.orange : "transparent"}`,
        color: activeTab === id ? C.orange : NAV.textSub,
        fontWeight: activeTab === id ? 700 : 500,
        fontSize: 13, cursor: "pointer", display: "flex",
        alignItems: "center", gap: 6, transition: "color 0.15s",
        whiteSpace: "nowrap",
      }}
    >{icon} {label}</button>
  );

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: NAV.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: NAV.textSub, fontSize: 14 }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── NAV ── */}
      <div style={{ background: NAV.bg, borderBottom: `1px solid ${NAV.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 0 }}>

          {/* Logo area */}
          <div style={{ padding: "14px 0", marginRight: 28, flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: NAV.text, letterSpacing: "-0.01em" }}>
              <span style={{ color: C.orange }}>Z</span>UMIEZ
            </div>
            <div style={{ fontSize: 10, color: NAV.textSub, marginTop: 1, letterSpacing: "0.06em", textTransform: "uppercase" }}>IT Current State Analysis</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, flex: 1, height: "100%" }}>
            {navTab("landscape", "Landscape", "🗺️")}
            {navTab("catalog", "Catalog", "📋")}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16 }}>
            <div style={{ fontSize: 11, color: saveStatus === "saving" ? C.amber : saveStatus === "error" ? C.danger : NAV.textMuted }}>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "⚠ Save failed" : "● Auto-saved"}
            </div>
            <button
              onClick={() => exportCSV(filteredSystems)}
              style={{ padding: "7px 14px", background: "none", border: `1px solid ${NAV.border}`, borderRadius: 7, color: NAV.textSub, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
              Export CSV
            </button>
            <button
              onClick={() => setShowAdd(true)}
              style={{ padding: "7px 16px", background: C.orange, border: "none", borderRadius: 7, color: C.white, fontSize: 12, cursor: "pointer", fontWeight: 700, letterSpacing: "0.01em" }}>
              + Add System
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <StatsBar systems={systems} />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <FilterBar filters={filters} setFilters={setFilters} count={filteredSystems.length} total={systems.length} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", background: C.surface }}>
        {activeTab === "catalog"
          ? <CatalogView systems={filteredSystems} onEdit={setEditSystem} />
          : <LandscapeView systems={filteredSystems} onEdit={setEditSystem} />}
      </div>

      {/* ── MODALS ── */}
      {editSystem && (
        <SystemModal
          system={editSystem}
          onSave={handleSave}
          onClose={() => setEditSystem(null)}
          onDelete={handleDelete}
        />
      )}
      {showAdd && (
        <SystemModal
          system={null}
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
