# IT CSA Tool — Change Log

---

## 2026-03-17 — Initial Build

**By:** TARS (Natalia session)

### Added
- React/Vite project scaffolded at `Natalia/IT CSA Tool/`
- Vite file API plugin (GET /api/load, POST /api/save → `data/csa-systems.json`)
- **Landscape view** — card grid grouped by system type (Vendor / SaaS / Custom / Shadow IT / Hardware / Platform), each with type-colored accent bar, dept pills, purpose, status, Boomi/Verified indicators
- **Catalog view** — sortable table with: Name, Type badge, Departments, IT Owner, Dept Owner, Status, Boomi Connected, Verified, Satisfaction
- **Stats bar** — Total / Active / Shadow IT / Boomi Connected / Custom Built / Unverified counts
- **Filter bar** — search (name/purpose/category/owner), Department, System Type, Status, Boomi, Verified filter
- **Add/Edit modal** — all 17 fields, multi-select dept checkboxes, BU toggle pills, satisfaction dropdown
- **Export CSV** button — downloads filtered view to CSV
- Auto-save (1.2s debounce) to `data/csa-systems.json`
- 35 DC systems pre-seeded from 15 DC CSA PDFs (2024 vintage), all marked `verified: false`
- Port 5177 (avoiding conflicts with existing tools)

### Pre-seeded systems (35)
Apropos, Sort Director, Pick Director, Dematic Put-to-Light, Dematic Pick Admin, Cubiscan, Mettler Toledo, Bestpack R6, Extensiv, Proship, Stromberg, NexGen, CrowdTwist, SalesWarp, MagentoApp, Power BI, myCOI, FineLine, Radius Logistics, WIP Dashboard, PIM IVR INT Dashboard, RTV Check-in Tool, Carton Creator, SIM Tool, ZTC Truck Management, VAS Research Tool, JT Data Archive, Chargeback Excel Tools, Master Traffic Report, Priority PO Tracker, VAS POD Employee Metrix Sheet, Master Vendor Commitment Spreadsheet, PBS Grouping Sheet, Hub Shrink Reports (35 total)

### Source docs
15 DC CSA PDFs: Count & Flow, Cubiscan, Hub, Pallet In/Out, PIM, Put to Lights, QC, Receiving, RTV & Chargeback, Shipping Audits, Traffic, VAS, Vendor Relations, Pick by Store, Stash SOP

---
