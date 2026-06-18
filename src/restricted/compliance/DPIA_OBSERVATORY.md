# Data Protection Impact Assessment (DPIA) — Crown Dependencies Observatory

**Status:** DRAFT — pending legal review.
**Assessed by:** [Your name], operating as Coalfinch.
**Date of assessment:** 18 June 2026.
**Review trigger:** before any of the events listed in Section 2.3; otherwise annually.

---

## 1. Why this DPIA exists

Under the Isle of Man's Applied GDPR (mirroring Art. 35 GDPR), a DPIA is formally required only where processing is "likely to result in a high risk" to individuals — for example, large-scale processing, systematic monitoring, or processing of special-category data at scale. Strictly assessed, the Observatory's actual personal-data processing (a single login account, cookieless aggregate analytics) does not meet that threshold.

This DPIA is conducted **voluntarily and conservatively** anyway, for two reasons:

1. The site's subject matter is re-identification risk itself. Even where no real individual's data is processed, getting privacy-by-design wrong here would be a significant reputational and credibility failure for a project whose entire premise is "we take re-identification seriously."
2. There is a known forward roadmap item — calibrating the synthetic population models against real data supplied by the island statistics offices — that, if and when it happens, would change this risk profile materially. Doing the DPIA work now establishes the baseline against which that future change must be re-assessed.

## 2. Description of the processing

### 2.1 What exists today

| Component | What it does | Real personal data involved? |
|---|---|---|
| Re-identification explorer, k-anonymity tool, area rankings, demographics explorer | Calculates illustrative re-identification risk and population uniqueness using **synthetic populations** generated to match published 2021 census marginals (age, sex, occupation, area, etc.), with correlations estimated from UK census microdata | No. No real individual's record is queried, stored, or output. A user's hypothetical profile entered into the tool is processed client-side in the browser and is never transmitted to or stored by Coalfinch. |
| Fiscal flows Sankey, inflation explorer, unemployment explorer | Visualise published aggregate government and statistical data | No. All inputs are aggregate published statistics, not individual records. |
| Site analytics (Plausible) | Aggregate, cookieless visit counting | Marginal/transient only — IP and user-agent are processed for under a second to produce a one-day, non-reversible hash; not stored or linked to identity. |
| Restricted tab (auth-gated attack simulator) | A research tool exploring re-identification "attack" techniques, accessible only to a logged-in user | Yes, but minimal: the login system (Supabase) holds the account holder's email and encrypted password. **Currently exactly one account exists, held by the operator.** |

### 2.2 Purpose and necessity

- The public tools exist to make re-identification risk tangible and to support public-interest data journalism and policy analysis across the Crown Dependencies. Using synthetic data rather than real microdata is itself the core risk-mitigation: it lets the project demonstrate *how* re-identification works without creating any actual re-identification risk to a real person.
- The Restricted tab exists to let more sensitive "attack simulation" content be explored without being fully public, while it's still a single-operator research tool. Gating it behind login (rather than, say, leaving it open) is itself a proportionate safeguard.
- Analytics exist to understand usage; a cookieless, non-identifying tool was deliberately chosen over Google Analytics specifically to minimise privacy impact (see Developer Brief: "Do not use Google Analytics or any cookie-based tracker — this is a privacy research site").

### 2.3 Review triggers — re-run this DPIA before

- Opening the Restricted tab to any account holder other than the current operator.
- Incorporating any real (non-synthetic) individual-level data into any tool — including the planned "future calibration of synthetic re-identification data from island statistics offices," **if** that calibration involves receiving real microdata rather than updated aggregate marginals/parameters. (If the statistics offices only provide updated published marginals — the same kind of aggregate input already used — this DPIA likely still holds; if they provide row-level microdata, it does not, and this must be reassessed before that data is used.)
- Adding the planned population model or GDP-per-capita feed to the system dynamics work, if either ever requires individual-level rather than aggregate data (current plan, per project notes, is aggregate official statistics, so no trigger expected from this alone).
- Any change of hosting/auth provider, or any change to where Supabase data is stored.

## 3. Necessity and proportionality assessment

| Question | Assessment |
|---|---|
| Could the purpose be achieved with less data? | Already minimised: synthetic data instead of real records; cookieless analytics instead of identifying analytics; login restricted to one account rather than open access. |
| Is the processing proportionate to the purpose? | Yes. The personal data actually processed (one login, transient analytics signals) is small relative to the public-interest purpose of the site. |
| Is there a less intrusive way to achieve the Restricted tab's goal? | Considered: leaving it fully public (rejected — the subject matter, an "attack simulator," warrants gating); requiring real identity verification beyond email/password (not currently warranted given single-user scope; would need revisiting if access expands). |

## 4. Risk identification

| Risk | Likelihood | Impact | Current mitigation | Residual risk |
|---|---|---|---|---|
| Synthetic re-identification tool is mistaken by users for, or repurposed to attempt, actual re-identification of real individuals | Low | Medium (reputational; could undermine the site's credibility on its own subject matter) | Explicit on-page caveats describing the tool as illustrative/synthetic; no real microdata is ever queried | Low |
| Supabase account credentials for the Restricted tab are compromised | Low–Medium (single account, but credential-stuffing/phishing risk exists for any internet-facing login) | Low today (only the operator's own data is at risk); would become Medium+ if access expands | Encrypted password storage (Supabase-managed); recommend enabling MFA on the Supabase dashboard and on the account itself if not already enabled | Low, pending MFA confirmation (action item) |
| Analytics data is later combined with other data to re-identify a visitor | Very low | Low | Plausible's architecture (no cookies, no persistent identifiers, no cross-site tracking, no raw IP retention) structurally prevents this | Very low |
| Future calibration data from statistics offices turns out to include real microdata, processed under the current low-risk assumptions | Low (not yet happened) | High if it occurs without reassessment | This DPIA's review trigger (Section 2.3) | Controlled, contingent on follow-through |
| Personal data accidentally committed to the public GitHub repository (e.g. in a sample file, comment, or commit) | Low | Medium (public exposure) | Practice of using only synthetic/aggregate data in the codebase; recommend a periodic repo scan for accidental secrets/personal data as a habit, not just a one-off check | Low |

## 5. Mitigating measures already in place

- Privacy-by-design choice of synthetic population modelling over real microdata for every public-facing analytical tool.
- Cookieless, non-identifying analytics provider chosen deliberately over more invasive alternatives.
- Restricted tab gated behind authentication rather than left open, given its more sensitive "attack simulation" framing.
- AI-crawler blocking via robots.txt (reduces unintended scraping/repurposing of the site's content, though this is a content-protection rather than personal-data measure).
- On-page caveats throughout the re-identification tools describing them as illustrative and noting where full calibration is pending.

## 6. Outstanding actions from this DPIA

1. Confirm MFA is enabled on the Supabase project dashboard and (if available) on individual account sign-in.
2. Define, in writing, what "calibration data from Statistics IoM/Jersey/Guernsey" is expected to consist of (aggregate marginals vs. microdata) before it is requested or received, so this DPIA's assumptions can be checked against reality in advance rather than after the fact.
3. Add a brief internal checklist (could live alongside `OBSERVATORY_DEV_BRIEF.md`) reminding future contributors never to commit real personal data, sample real records, or credentials to the repository.
4. Revisit this DPIA before opening the Restricted tab to any additional account holder, with particular attention to identity verification and access logging for the new population of users.

## 7. Consultation

As a sole-operator project, no internal stakeholder consultation was required. No data subjects were consulted (the processing affects, at most, the operator's own account and visitors' non-identifying analytics signals). This should be revisited if the project gains other contributors or expands its user base.

## 8. Conclusion

On the basis of the processing as it exists today, the Crown Dependencies Observatory does not present a high risk to individuals' rights and freedoms, and a formal statutory DPIA is not strictly required. This voluntary DPIA is retained as a baseline record and should be re-run at the trigger points in Section 2.3, particularly **before any real (non-synthetic) individual-level data is introduced into any tool**.

---

*This is a working internal assessment, not legal advice. It should be reviewed by a qualified data protection adviser, particularly if the Restricted tab's user base or the data sources behind any tool change.*
