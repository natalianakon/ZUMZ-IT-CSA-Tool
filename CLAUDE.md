# IT Current State Analysis Tool — Claude Code Context

> **Project:** IT Current State Analysis (CSA) — Application Portfolio Tracker
> **Last Updated:** 2026-03-17
> **Status:** Active — Prototype (Natalia / Digital)
> **Owner:** Natalia Nakonieczny
> **Read this file first.** It is the primary context file for all work in this project.

---

## Intake

| Question | Answer |
|----------|--------|
| **Spark** | Quin flagged a potential project with Jesse Higgins (Group Mgr Delivery) + Jarrod Wiles (End User Services GM) — a Current State Analysis of all IT-touching applications across the business |
| **Problem** | No central place to see all systems, who owns them, which ones are shadow IT, what's Boomi-connected, and how teams feel about them |
| **The Dream** | An interactive, clean, filterable CSA tool — visual enough to wow IT leadership, organized enough to actually use as a source of truth |
| **Who Benefits** | Natalia (PM), Jesse Higgins, Jarrod Wiles, IT leadership |
| **Why Now** | Getting ahead of the project before it's formally assigned — DC documentation was available to pre-seed the data |
| **Smallest Version** | ✅ Built — React/Vite app with Landscape + Catalog views, 35 pre-seeded DC systems, auto-save |

---

## 1. What It Is

A React/Vite application portfolio tracker for Zumiez's IT Current State Analysis. Runs locally via Vite dev server with a built-in file API — data auto-saves to `data/csa-systems.json` on every change. No manual import/export needed.

**Pre-seeded data:** 35 systems extracted from 15 DC CSA PDFs (March 2024 docs). All marked `verified: false` pending IT validation with Jesse and Jarrod.

---

## 2. Views

| View | Purpose |
|------|---------|
| **Landscape** | Card grid grouped by system type — visual overview of the full portfolio |
| **Catalog** | Full table with sortable columns — detailed list with all metadata |

---

## 3. System Data Model

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | System name |
| Category | Text | e.g. "Core WMS", "Shadow IT", "Analytics" |
| System Type | Select | Vendor / SaaS / Custom / Shadow IT / Hardware / Platform |
| Departments | Multi-select | Which DC/business areas use this |
| Business Units | Multi-select | DC / Stores / HQ / Ecommerce / All |
| IT Owner | Text | IT contact responsible for the system |
| Dept Owner | Text | Business-side owner |
| Status | Select | Active / Under Review / Deprecate / Unknown |
| Boomi Connected | Checkbox | Is this system integrated via Boomi? |
| Purpose | Text | What does it do? Who benefits? |
| Users | Text | Who uses it |
| Satisfaction | Select | Happy / Neutral / Unhappy / Unknown |
| Features Needed | Text | What's missing from the current tool |
| Scope of Improvement | Text | Process or tech improvements identified |
| Notes | Text | Context, caveats, links |
| Source | Text | Which CSA doc or interview this came from |
| Verified | Checkbox | Has this been validated with IT/Dept owner? |

---

## 4. System Types (Color Coding)

| Type | Color | Meaning |
|------|-------|---------|
| Vendor | Blue | Licensed third-party software |
| SaaS | Purple | Cloud-hosted subscription software |
| Custom | Orange | Built in-house by Zumiez IT |
| Shadow IT | Amber | Excel/unmanaged tools — risk items |
| Hardware | Gray | Physical hardware systems |
| Platform | Teal | Broad platform tools (Power BI, Magento, etc.) |

---

## 5. Files

| File | Location | Description |
|------|----------|-------------|
| `it-csa-tool.jsx` | `src/` | Live source — edit this to change the app |
| `it-csa-tool-YYYY-MM-DD.jsx` | root | Dated code snapshots |
| `csa-systems.json` | `data/` | **Always-current data** — auto-saved |
| `csa-systems-backup-YYYY-MM-DD.json` | `data/` | Dated data backups |
| `LOG-daily-changes.md` | `docs/` | Running change log |

---

## 6. How to Run

**Via Claude Code (recommended):**
> Say "start the CSA tool" — TARS fires up the Vite server and renders it in the Preview panel.

**Local Vite (manual):**
```bash
cd "Natalia/IT CSA Tool"
npm install   # first time only
npm run dev   # opens at http://127.0.0.1:5177
```

---

## 7. Persistence Architecture

```
System change → auto-save (1.2s debounce) → data/csa-systems.json
"Save a backup" → TARS saves dated files (see backup protocol)
```

### Backup Protocol

When Natalia says **"save a backup"**, TARS saves:

| # | File | Saved To | What It Is |
|---|------|----------|-----------|
| 1 | `csa-systems-backup-YYYY-MM-DD.json` | `data/` | System data snapshot |
| 2 | `it-csa-tool-YYYY-MM-DD.jsx` | root | Tool code snapshot |

---

## 8. Pre-Seeded Data

35 systems extracted from 15 DC CSA PDFs (2024 vintage). All marked `verified: false`.

### Breakdown by Type
| Type | Count | Systems |
|------|-------|---------|
| Vendor | 8 | Apropos, Sort Director, Pick Director, Dematic Pick Admin, Extensiv, Proship, Stromberg, NexGen |
| Hardware | 4 | Dematic Put-to-Light, Cubiscan, Mettler Toledo, Bestpack R6 |
| Custom | 9 | WIP Dashboard, PIM IVR INT Dashboard, RTV Check-in Tool, Carton Creator, SIM Tool, ZTC Truck Mgmt, VAS Research Tool, JT Data Archive, FineLine |
| Shadow IT | 8 | Chargeback Excel Tools, Master Traffic Report, Priority PO Tracker, VAS POD Metrix Sheet, Master Vendor Commitment, PBS Grouping Sheet, Hub Shrink Reports |
| SaaS | 3 | CrowdTwist, myCOI, Radius Logistics |
| Platform | 3 | MagentoApp, Power BI, SalesWarp |

---

## 9. Roadmap

- [ ] Add Stores systems (SIM, iQmetrix POS, etc.)
- [ ] Add HQ systems (ERP, HR, Finance tools)
- [ ] Add IT infrastructure layer (Azure, Okta, etc.)
- [ ] Validate all DC systems with Jesse Higgins / Jarrod Wiles
- [ ] Fill in IT Owner and Dept Owner for every system
- [ ] "Gap Finder" view — highlight Shadow IT candidates for replacement
- [ ] Integrations view — visualize Boomi-connected systems
- [ ] Export to PDF for stakeholder presentation
- [ ] Health view — status/satisfaction dashboard by department
