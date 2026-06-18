# Transfer Risk Assessment (TIA) — Crown Dependencies Observatory

**Status:** DRAFT — pending legal review and the open action items below.
**Assessed by:** [Your name], operating as Coalfinch.
**Date of assessment:** 18 June 2026.

---

## 1. Purpose

This assessment identifies every "restricted transfer" of personal data outside the Isle of Man (and, by extension, the UK/EEA framework it mirrors) arising from the Observatory's infrastructure, and records whether an appropriate safeguard is in place for each. Under the Isle of Man's Applied GDPR, a restricted transfer to a country without an EU adequacy decision requires either an approved safeguard (Standard Contractual Clauses, an equivalent instrument, or — for transfers from the UK specifically — the UK International Data Transfer Addendum) or specific Information Commissioner approval.

This is written conservatively: where a provider's data location is not yet confirmed, this assessment treats it as a transfer risk requiring action, not as a non-issue.

## 2. What personal data actually exists to transfer

As set out in the DPIA, the personal data footprint is small: analytics signals (transient, not stored), and one Restricted-tab login (email + encrypted password, held via Supabase). There is, at present, no personal data about members of the public stored anywhere in this stack beyond the transient analytics signal. This materially limits the real-world consequence of any transfer, but does not remove the legal requirement to have the right safeguard documented for each processor.

## 3. Processor-by-processor assessment

### 3.1 Plausible Insights OÜ (analytics)

- **Data involved:** transient IP/user-agent (used to produce a one-day hash, not retained as raw data).
- **Location:** Plausible is incorporated in Estonia (EU) and its hosted service runs entirely on infrastructure owned by European companies — Hetzner (Germany), UpCloud (Finland), and Bunny (Slovenia). Plausible states visitor data never leaves the EU.
- **Transfer risk:** **None.** This is an intra-EU/EEA processing arrangement from the Isle of Man's perspective in substance, though formally the Isle of Man is not an EU member state — note below.
- **Action:** none required beyond keeping a copy of Plausible's data policy/DPA on file for the accountability record.

> Note: the Isle of Man's data protection law treats the Isle of Man as if it were an EU member state for the purposes of the Applied GDPR, so transfers to genuinely EU-only infrastructure do not require an additional transfer mechanism. Keep this assumption documented in case it needs revisiting.

### 3.2 Vercel, Inc. (hosting)

- **Data involved:** basic request/server logs (IP addresses, timestamps) generated as a normal incident of serving the website; no account or analytics data is processed by Vercel for this project.
- **Location:** Vercel is a US-incorporated company operating a global edge network; data may be processed in the US and elsewhere.
- **Transfer mechanism available:** Vercel's Data Processing Addendum incorporates the 2021 EU Standard Contractual Clauses and the UK International Data Transfer Addendum for transfers from the EEA/UK. Vercel also states it holds an EU–US Data Privacy Framework adequacy-equivalent certification covering transfers from the EU/UK/Switzerland.
- **Transfer risk:** **Low**, contingent on confirming the items below.
- **Action items:**
  1. Confirm Vercel's DPA has actually been accepted/executed for this account (most platforms require an explicit click-through or settings toggle — check the Vercel dashboard's legal/DPA section).
  2. Check Vercel's current Data Privacy Framework certification status at the time of any formal compliance review (certifications can lapse or be renewed; verify via Vercel's compliance page or the official DPF list at dataprivacyframework.gov rather than relying on a marketing page).
  3. Note for the record: even though the Isle of Man is not the EU, the same restricted-transfer logic applies under the Applied GDPR, so the SCC/UK IDTA safeguard is the correct one to point to rather than relying on Vercel's EU/UK-specific framing alone.

### 3.3 Supabase (authentication / database)

- **Data involved:** the only real personal data in the stack — email address and encrypted password for the Restricted-tab account holder(s).
- **Location: confirmed.** The project ("jc-bb07's Project") is provisioned on AWS region `eu-west-2`, i.e. **London, United Kingdom**.
- **Transfer risk: resolved — no additional safeguard required.** The UK is not the EU, but it holds an EU Commission adequacy decision (renewed 19 December 2025, valid until 27 December 2031). The Isle of Man's Applied GDPR defines an "Adequate Jurisdiction" by reference to the EU Commission's own adequacy list, so a transfer from the Isle of Man to UK-hosted infrastructure is treated the same as a transfer to an EU member state — no Standard Contractual Clauses, UK IDTA, or ICO approval are needed for this leg.
- **Residual item:** keep a record of this confirmation (region, date checked, screenshot) in case the project is ever migrated or the UK adequacy decision is revisited at its scheduled review. No action needed otherwise.

### 3.4 GitHub / Microsoft (source code hosting)

- **Data involved:** none, by design. The codebase should never contain real personal data, sample real records, or credentials (see DPIA action item 3 and Data Protection Policy Section 9).
- **Location:** global infrastructure; Microsoft is US-headquartered.
- **Transfer risk:** **None**, provided the "no personal data in the repo" discipline holds. This should be periodically spot-checked (e.g. grep for email-address patterns, real names, or API keys before any commit that touches data files), since a lapse here would turn a non-issue into a real transfer-risk question.

## 4. Summary table

| Processor | Data | Location | Mechanism | Status |
|---|---|---|---|---|
| Plausible | Transient analytics signal | EU only | Isle of Man's EU-equivalent treatment | Resolved |
| Vercel | Server logs | Global/US | SCCs + UK IDTA; possible DPF certification | Low risk — confirm DPA acceptance & current DPF status |
| Supabase | Login credentials | AWS `eu-west-2` (London, UK) — confirmed | UK adequacy decision (EU Commission, renewed to 2031) | Resolved |
| GitHub | None (by design) | Global/US | N/A | Resolved, subject to ongoing discipline |

## 5. Overall conclusion

Given the very limited personal data actually in play (one login account, transient analytics signals), the real-world transfer risk is low even before any safeguard is formally documented. The Supabase region is now confirmed as UK-based (an adequate jurisdiction), which closes out the main open item from the earlier draft. To be on the conservative side, as requested, this assessment is **not closed out** until:

1. Vercel's DPA acceptance and current DPF certification status are confirmed and filed alongside this document.

Once that item is closed, this Transfer Risk Assessment can be marked fully resolved and reviewed only on the annual cycle (or sooner if a new processor is added, the Restricted tab's user base changes, or the Supabase project is ever migrated to a different region — see the Data Protection Policy and DPIA for related triggers).

---

*This is a working internal assessment, not legal advice. Given the multi-jurisdictional nature of the project (Isle of Man-based controller, content covering Guernsey and Jersey, processors based in the US and EU), a qualified data protection adviser should confirm the transfer-mechanism analysis above before this is relied upon formally.*
