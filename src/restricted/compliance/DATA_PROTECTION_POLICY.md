# Data Protection Policy (Internal) — Coalfinch / Crown Dependencies Observatory

**Status:** DRAFT — for internal use, pending legal review.
**Applies to:** observatory.coalfinch.com and any associated tools, code, and infrastructure.
**Owner:** [Your name], operating as Coalfinch.
**Last updated:** 18 June 2026.
**Review cycle:** at least annually, and immediately on any material change to processing (e.g. opening the Restricted tab to other users, incorporating real microdata, changing hosting providers).

---

## 1. Purpose

This policy sets out how Coalfinch handles personal data in connection with the Crown Dependencies Observatory, so that data protection obligations are met consistently even though the operation is currently a one-person project. It is written conservatively: where the law is ambiguous for a small/early-stage operator, this policy takes the more protective reading rather than the more permissive one.

## 2. Scope and legal framework

The primary point of reference is the **Isle of Man Data Protection Act 2018**, together with the GDPR and LED Implementing Regulations 2018 and the Data Protection (Application of GDPR) Order 2018 (collectively, "Applied GDPR"), administered by the Isle of Man Information Commissioner (IC) (inforights.im). The Isle of Man's data protection regime has held an EU adequacy finding since 2004.

Because the Observatory's subject matter and audience span Guernsey and Jersey as well, this policy also has regard to:

- the Data Protection (Bailiwick of Guernsey) Law, 2017; and
- the Data Protection (Jersey) Law 2018.

Both are GDPR-equivalent regimes with their own regulators (the Office of the Data Protection Authority in Guernsey; the Jersey Office of the Information Commissioner). No separate registration is currently believed necessary in either jurisdiction, as Coalfinch has no establishment, staff, or targeted commercial offering there — but see the action item in Section 4.

## 3. Roles and responsibilities

- **Data controller:** currently the individual operating Coalfinch ([Your name]), as no separate legal entity yet exists. All decisions about purposes and means of processing are made by this person.
- **On formal registration of Coalfinch as a company or other entity:** this section, the Privacy Policy, and any processor contracts should be updated to name that entity as controller, and this policy re-issued.
- **Data Protection Officer (DPO):** not currently required (no large-scale, systematic monitoring, and no special-category data processed at scale) and not appointed. This will be reassessed if the Restricted tab or any future tool expands materially in scope or user base.
- **Processors:** Vercel, Inc. (hosting); Supabase (authentication/database); Plausible Insights OÜ (analytics); GitHub/Microsoft (source code hosting — processes no personal data in the ordinary course, see Section 9).

## 4. Action items arising from this policy (track to completion)

1. **Registration check:** confirm whether Coalfinch/[Your name] is required to register with the Isle of Man Information Commissioner. Registration is mandatory for controllers processing personal data unless a narrow exemption applies (e.g. staff administration, accounts-keeping, certain non-profit activity) — a public website with analytics and a login system is unlikely to fall within these exemptions. Conservative position: assume registration is required (current fee: £70/year) until confirmed otherwise, or until a written exemption assessment is documented.
2. ~~Confirm Supabase project region~~ — **done**: confirmed as AWS `eu-west-2` (London, UK), an adequate jurisdiction. See Transfer Risk Assessment.
3. **Confirm Vercel DPA is in place** and check current EU–US Data Privacy Framework certification status for Vercel (see Transfer Risk Assessment, Action 2).
4. **Decide retention period** for Restricted-tab accounts that become inactive, and implement it (currently undefined in practice — see Section 8.3).
5. **Re-run the DPIA** before any of the following: opening the Restricted tab beyond the current single account holder; incorporating real (non-synthetic) microdata into any public tool; adding any new tool that processes data about real, identifiable individuals.
6. **If an AI feature is ever added to the live product** (a chatbot, AI-assisted query, or anything that sends visitor/account data to an AI provider such as Anthropic at runtime — as distinct from using AI tools purely during development, which is covered in Section 9): add the provider to the processor list, ROPA, and Transfer Risk Assessment, and re-run the DPIA before launch.

## 5. Data protection principles in practice

| Principle | How it is met today |
|---|---|
| Lawfulness, fairness, transparency | Public Privacy Policy published; processing limited to what's described in it. |
| Purpose limitation | Analytics used only to understand site usage; login used only to gate the Restricted tool. |
| Data minimisation | Core design choice: re-identification, k-anonymity, demographics and area tools run on **synthetic populations calibrated to public marginals**, not real individual records — this is privacy-by-design, not an afterthought. |
| Accuracy | Statistical/economic source data is dated and sourced; synthetic population parameters are documented and flagged where provisional (e.g. "pending calibration data"). |
| Storage limitation | Analytics data is not separately retained by us; account data is retained only while the account is active (see Action 4 above for a gap to close). |
| Integrity and confidentiality | TLS in transit; encrypted credential storage via Supabase; restricted access to hosting/repo accounts; no personal data committed to the public GitHub repository. |
| Accountability | This policy, the Privacy Policy, the DPIA, and the Transfer Risk Assessment together constitute the accountability record. |

## 6. Records of Processing Activities (ROPA)

| Activity | Data subjects | Categories of data | Purpose | Legal basis | Recipients | Retention | Location |
|---|---|---|---|---|---|---|---|
| Site analytics | Site visitors | Transient IP/user-agent (hashed, not stored), aggregate page/event counts | Understand site usage | Legitimate interests | Plausible Insights OÜ | Governed by Plausible (no raw IP retained) | EU only |
| Restricted-tab authentication | Account holder(s) (currently: operator only) | Email address, encrypted password, sign-in metadata | Gate access to a sensitive research tool | Legitimate interests / contract | Supabase (processor) | While account active + short recovery window (action item to formalise) | AWS `eu-west-2`, London (UK) — adequate jurisdiction |
| Enquiries | People who email the contact address | Email address, message content | Respond to enquiries | Legitimate interests | None beyond the operator | Until resolved + short follow-up window | N/A |
| Website hosting | Site visitors | Basic request/server logs | Deliver the site; security/abuse prevention | Legitimate interests | Vercel, Inc. (processor) | Per Vercel's standard log retention | Global edge / US company |
| Source code | N/A (no personal data) | None by design | Development | N/A | GitHub/Microsoft | N/A | Global |

This table should be kept current as processing changes and reviewed alongside the annual policy review.

## 7. Lawful basis summary

No processing under this project currently relies on consent, special-category data (Art. 9), or criminal-offence data (Art. 10). Where future tools might process anything resembling special-category data (e.g. ethnicity fields already used in synthetic demographic breakdowns), note that **this data is synthetic, not about real identifiable individuals**, and therefore falls outside the scope of "personal data" under the Applied GDPR. If real microdata is ever introduced, this assessment must be redone (see Action 5).

## 8. Individual rights procedure

1. Acknowledge any rights request (access, rectification, erasure, restriction, objection, portability) within 5 working days.
2. Verify identity proportionately to the data involved (for this project, email confirmation from the address on file is normally sufficient).
3. Respond substantively within **one calendar month** of receipt (extendable by two further months for complex requests, with the requester informed of the extension and reason within the first month).
4. No fee is charged unless a request is manifestly unfounded or excessive, in which case a reasonable fee may be charged or the request refused, with reasons given.
5. Log all requests and responses (even informal ones, e.g. "please delete my account") for the accountability record.

### 8.3 Retention specifics

- Analytics: not retained by Coalfinch directly; governed by Plausible's policy.
- Restricted-tab accounts: retain while active. **Action item:** define and implement an inactivity period (suggested: 24 months without sign-in) after which the account and associated data is deleted or the holder is prompted to confirm continued need.
- Enquiry emails: delete or archive-and-redact after the enquiry is resolved, subject to a reasonable follow-up window (suggested: 12 months).

## 9. Processor management

- Maintain a current list of processors (Section 3) and the categories of data each touches.
- Before adding a new processor that will touch personal data, check it offers a Data Processing Agreement (DPA) consistent with Art. 28 Applied GDPR, and — if based outside the Isle of Man/UK/EEA — an appropriate international transfer mechanism (see Transfer Risk Assessment).
- GitHub: ensure no personal data (real names, emails, credentials, etc.) is ever committed to the repository, including in comments, sample data, or commit messages. Treat any accidental commit of personal data as a potential security incident requiring assessment under Section 10.
- **AI development tools (including Claude/Anthropic):** the same discipline extends to any AI tool used during development. Never paste, upload, or otherwise expose real personal data (real account holder emails, real visitor data, real credentials, etc.) to Claude or any other AI assistant while working on this project — project knowledge, code, and data shared in that context should remain limited to synthetic/aggregate data, exactly as already practised in the codebase itself. This is a development-tooling discipline, not a processor relationship: as of this version of the policy, no AI provider is integrated into the live site or processes visitor/account data on Coalfinch's behalf, so no entry for Anthropic currently appears in the ROPA (Section 6) or Transfer Risk Assessment. **If an AI feature is ever added to the live product** (e.g. a chatbot, AI-assisted query tool, or anything that sends visitor or account data to an AI provider at runtime), that is a trigger event: add the provider to Section 3 and the ROPA, check its current DPA/sub-processor terms and transfer mechanism, and re-run the DPIA and Transfer Risk Assessment before launch — see Section 4, item 6.

## 10. Personal data breach response

A "breach" includes any loss, unauthorised access, disclosure, alteration, or destruction of personal data — for example, a compromised Supabase admin account, an exposed API key granting access to account data, or personal data accidentally pushed to a public repository.

1. **Contain:** revoke compromised credentials/keys immediately; take affected systems offline if needed.
2. **Assess:** what data, how many people, what likely consequences (the only realistic population at risk today is the single Restricted-tab account holder, but reassess if that changes).
3. **Notify the Isle of Man Information Commissioner** without undue delay and, where feasible, **within 72 hours** of becoming aware, unless the breach is unlikely to result in a risk to anyone's rights and freedoms. Failure to notify when required can attract a penalty of up to £1,000,000.
4. **Notify affected individuals** without undue delay if the breach is likely to result in a high risk to them.
5. **Document** the breach, the assessment of risk, and the actions taken, regardless of whether notification was required — this documentation is itself a legal requirement.
6. Review and, if needed, update this policy and the relevant DPIA/Transfer Risk Assessment in light of the incident.

## 11. Relationship to the DPIA and Transfer Risk Assessment

This policy is the umbrella document. Two companion documents sit underneath it:

- **DPIA — Crown Dependencies Observatory** (separate file): screens and assesses risk arising from the re-identification/demographics tools and the Restricted-tab authentication, including a forward-looking assessment of risks that would arise if real (non-synthetic) data is ever incorporated.
- **Transfer Risk Assessment** (separate file): assesses international transfers arising from the use of Vercel, Supabase, Plausible, and GitHub.

Both should be reviewed alongside this policy on the same annual cycle, and immediately on any trigger event listed in Section 4.

## 12. Sign-off

| Version | Date | Author | Notes |
|---|---|---|---|
| 0.1 (draft) | 18 June 2026 | [Your name] | Initial draft, pending legal review and resolution of action items in Section 4. |

---

*This document is a working internal policy, not legal advice. It should be reviewed by a qualified data protection adviser, in particular regarding the registration question (Section 4, item 1) and once Coalfinch's legal entity status is settled.*
