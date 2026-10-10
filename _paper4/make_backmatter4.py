#!/usr/bin/env python3
"""Renumber 'Source Notes S#' in reading order (ms_pre -> ms_split) and write the back matter for 'The Discard'."""
import re, glob, os
HERE=os.path.dirname(os.path.abspath(__file__)); SPL=HERE+'/ms_split'; PRE=HERE+'/ms_pre'
SN={
1:('A†/B','JAMA Network Open (2019), Husain, Mohan and colleagues: about 14 million kidney offers, 2008 to 2015, to more than 350,000 candidates; those who died received a median of 16 offers over 651 days; about 93% of declines attributed to organ or donor quality; about 76% of candidates had at least one viable offer; authors note some declines were correct. Via institutional press release and trade coverage.','Journal article text'),
2:('A','OPTN/SRTR 2024 Annual Data Report (Overview and Kidney chapters): nonuse of recovered deceased-donor kidneys 29.3% in 2024, 27.9% in 2023, 26.6% in 2022, 18.2% in 2013; biopsied kidneys 40.8% vs 6.4% not biopsied; donors 65 and older 68.9%; record 27,660 kidney transplants in 2024 (27,351 in 2023).','Table numbers'),
3:('A','Aubert and colleagues, JAMA Internal Medicine 2019;179(10):1365–1374: 2004 to 2014, United States discarded 27,987 of 156,089 recovered kidneys (17.9%), France 2,732 of 29,984 (9.1%); mean donor age of transplanted kidneys about 36.5 (US) and 50.9 (France); under the French model 17,435 (62%) of US discards would have been transplanted; model estimate of 132,445 extra allograft life-years.','Full text'),
4:('A','Garg and colleagues (MyTEMP), Lancet 2022;400:1693–1703: cluster-randomised Ontario trial of personalised cooler dialysate vs 36.5°C; composite cardiovascular death or hospitalisation 21.4% vs 22.4%, not significant; no difference in intradialytic hypotension; more than 15,000 patients.','Exact patient count, title'),
5:('A','OPTN/SRTR 2024 Annual Data Report: Kidney: 143,982 adult candidates on the list in 2024.','Table numbers'),
6:('A','OPTN/SRTR 2024 Annual Data Report: Kidney: record 49,249 adult additions in 2024; 3,743 removals for death and 4,901 for too sick; authors note progress offset by rising nonuse, longer cold ischemia and higher delayed graft function under broader sharing.','Table numbers'),
7:('C','News report (2026) citing registry counts of 6,419 living kidney donors in 2024 (6,522 in 2025); single source.','OPTN living-donor table'),
8:('B','Healio (8 August 2023), reporting 2022 OPTN data: 7,540 kidneys (26%) unused; experts estimated 62% viable, implying 4,675 dialysis patients could have received one.','Original analysis'),
9:('A†','USRDS 2023 Annual Data Report (data through 2021): traditional Medicare cost per person $99,325 (in-center hemodialysis), $86,976 (peritoneal dialysis), $43,913 (functioning transplant).','Table numbers'),
10:('B','National Kidney Foundation consensus report and a registry analysis of discards: leading recorded reasons "no recipient located" (about 35%) and biopsy findings (about 29%); regulatory and outcome risk cited as drivers of risk aversion.','Primary analysis'),
11:('B†','Mohan and colleagues, Kidney International (2018): discard rate rose from 14.9% (2000) to 19.0% (2015), by a definition different from the registry nonuse rate.','Authors, exact figures'),
12:('B','InvestigateTV (12 February 2026): about one in five donated organs never transplanted; kidney waste higher; Georgia 17% of organs in 2024. Scope of the kidney figure not confirmed.','Full report'),
13:('A†','OPTN-based analysis and Clinical Transplantation 2026 survey introduction: delayed graft function 26% in 2023; 2021 circle-based allocation increased cold ischemia time and delayed graft function.','Table numbers'),
14:('B','Literature on offer decisions: median seven offers per kidney; 2017 randomized study of 68 physicians (within-center variation about ten times among-center); 2023 survey Fleiss kappa 0.13.','Primary papers'),
15:('A†','Study of 193 adult kidney programs (PMC12795041): programs accepted a median of 12.5% of non-suboptimal and 7.2% of suboptimal offers; widest variation for cold time over 36 hours; data 2021 to 2023.','Title, authors'),
16:('A','Reproducibility studies of procurement biopsies: single-center classification match 64% (kappa 0.25; glomerulosclerosis kappa 0.15); repeat biopsies kappa 0.12 to 0.17; second biopsy, not first, associated with graft survival; only glomerulosclerosis over 20% independently associated with discard; 94% frozen sections.','Titles, authors'),
17:('B','UNOS analysis of provisional acceptances: time spent waiting for a decline can lengthen ischemic time.','Primary document'),
18:('B','OPTN offer-filter pilot (ATC abstracts and OPTN committee documents): centers avoided 67% of offers; recommended filters could bypass 59%; some centers increased volume with up to 75% fewer offers; HRSA/OPTN board approval of default filters based on acceptance history (2026).','Board resolution text'),
19:('A†','Debout and colleagues, Kidney International 2015;87(2):343–349 (3,839 recipients, 2000 to 2011): hazard ratio 1.013 per added hour for graft failure, 1.018 for death; 30 hours vs 6 hours about 40% higher risk.','Confirm'),
20:('A†','Transplant International, June 2026 (doi 10.3389/ti.2026.15840): 74 kidney pairs from older donors; cold ischemia over 12 h vs under 8 h, delayed graft function adjusted odds ratio 6.30 (95% CI 1.52 to 26.06); over 12 h tripled mortality risk; small single center.','Authors'),
21:('B','Propensity analysis: regional sharing added about 2.9 hours of cold ischemia vs local; OPTN committee statements; network analysis of 106,160 kidneys; median same-hospital cold time 3.3 to 29 hours across 206 centers; weekend procurement more likely discarded.','Primary papers'),
22:('A/B','HRSA organ-transport working group final report (May 2025, 20 recommendations); FAA organ-transport website (2025); industry briefing (2024) that the contract in force could not require tracking.','Documents'),
23:('B','Casey Ross, STAT (11 August 2016; republished by PBS NewsHour 13 August 2016): hospitals discarding organs and declining transplants to protect federal performance ratings; Bozorgzadeh study of waitlist removals after 2007 standards; CMS changed benchmarks; 2016 CMS memo; 3,159 kidneys discarded in the year examined, up 20% from 2007.','Original study'),
24:('A','Federal Register, 30 March 2007: Medicare conditions of participation for approval and re-approval of transplant centers (outcome and clinical-experience requirements based on registry data).','Rule text'),
25:('A','Bowring and colleagues, American Journal of Transplantation 2018: 14 programs under CMS Systems Improvement Agreements vs 28 matched; acceptance fell 5.9 percentage points (22%); 26.9% to 22.1% vs 33.9% to 44.4%; largest drop for KDPI 0 to 40.','Full text'),
26:('A/B','Omnibus Burden Reduction final rule, 84 Fed. Reg. 51732 (30 September 2019; effective 29 November 2019) removed re-approval requirements; American Society of Transplant Surgeons commentary (advocacy claim that requirements caused avoidance).','Rule text'),
27:('A/B','SRTR technical methods and OPTN performance-monitoring documents: offer acceptance ratio used by the MPSC from summer 2023; flag below 0.30 for adults; offers counted only if accepted or declined before an accepted offer (offers for eventually discarded organs excluded).','Current document'),
28:('A/B','CMS IOTA model fact sheet and 2026 rule: began 1 July 2025; scoring 60 achievement, 20 efficiency (offer acceptance ratio), 20 quality; no first-year results published as of October 2026.','Results when published'),
29:('A†/B','OPTN/HRSA memorandum of 6 August 2025 on allocation out of sequence; Husain and colleagues (NYU), policy period 6 August to 23 September 2025: lower recovery, transplants, out-of-sequence allocation; about 1,500 fewer transplants a year if sustained; a separate analysis summarized by an advocacy group: recovery fell from about 85 to 76 per day, discard rates did not rise; American Journal of Transplantation 2026 paper on a 30-day elimination of out-of-sequence allocation. Early, short-window analyses.','Peer-reviewed versions'),
30:('B','Healio (6 April 2026): unilateral out-of-sequence kidney allocations rose 17-fold since 2020.','Original analysis'),
31:('A†','OPTN-based study (data through 2023): hypothermic machine perfusion used for 39% of deceased-donor kidneys.','Table numbers'),
32:('A','SRTR 2024 Annual Data Report: nonuse of hepatitis C antibody-positive, NAT-negative kidneys 32.2% in 2024 (49.5% in 2016); Durand and colleagues, Annals of Internal Medicine 2018 (10 recipients) and later trials.','Table numbers'),
33:('A/B','Blankestijn and colleagues (CONVINCE), NEJM 2023: 1,360 patients, mortality 17.3% vs 21.9%, hazard ratio 0.77 (0.65 to 0.93), median 30 months, mostly fewer infection deaths; Fresenius 5008X FDA 510(k) clearance February 2024 and May 2025; broader US launch 2026; about 160,000 in-center machines (company estimate).','FDA database entry'),
34:('B','OPTN board meeting, 16 April 2026: update on defining an offer and an expedited kidney placement pathway; no formal action; projects paused pending HRSA review.','Later board minutes'),
35:('A','Associated Press (28 October 2024): about 170 people a day removed from the national donor registry in the week after coverage of a Kentucky case, ten times the same week of 2023.','Donate Life data'),
36:('A','HRSA Division of Transplantation report on Kentucky Organ Donor Affiliates (24 March 2025): about 351 cases; 73 where removal should have been reconsidered sooner; 20.8% with features not conducive to donation after circulatory death; at least 28 with no cardiac time of death recorded; HHS summary of concerns in 103 of 351; the organization disputes characterizations.','Final HHS text'),
37:('A/B','CMS/HHS decertification of Life Alliance Organ Recovery Agency (September 2025), first mid-cycle decertification; reasons cited; organization said it would not appeal.','CMS notice'),
38:('A/B','OPO tier system (2020 final rule); CMS-3409-P proposed rule (30 January 2026); first recertification cycle ending 2026 on 2024 data. No published roster of Tier 3 organizations found.','Final rule and roster'),
39:('A†','Transplantation 2026: CMS performance metrics and the disproportionate impact of decertifying OPOs on minority populations.','Authors, details'),
40:('A/B','Spanish Ministry of Health (January 2026): 51.9 deceased donors per million in 2025, about 6,335 transplants; 2024 record 52.6 per million.','Method of counting'),
41:('B†','Australian interview study of 49 potential donor families; literature review of donor-family satisfaction.','Titles, authors'),
42:('A†','Heliyon (2024): analysis of CMS-2728 forms 2007 to 2019 (N = 133,414): 15% not informed about transplant; informed patients listed sooner; chain facilities more likely to inform but not more likely to waitlist; acquired independent facilities less likely to waitlist.','Authors'),
43:('A','Gander and colleagues, JAMA 2019;322(10):957–973: 1,478,564 patients, 6,511 facilities, 2000 to 2016; for-profit facilities had lower waitlisting; senior author attributes to incentives.','Full text'),
44:('A†','Kidney Medicine/related 2026 study of pre-dialysis care and access type: more than half of patients started dialysis without access or pre-dialysis nephrology care; unprepared patients more often at for-profit and smaller facilities.','Title, authors'),
45:('B','CMS ESRD Treatment Choices model evaluations: model in about 31% of regions from 2021; no impact on transplant waitlisting or living-donor transplantation through three years.','Evaluation report'),
46:('A†','Peer-reviewed market-structure analysis: two largest companies 59.1% (2005) to 77.1% (2019); other estimates about 72% to 80%.','Authors, title'),
47:('A','MedPAC March 2026 report: aggregate FFS Medicare dialysis margin -0.2% (2023) and 4.5% (2024); recommendation to eliminate the 2027 update; industry letter argues margin overstated by about two points.','Final tables'),
48:('B/C','DaVita corporate integrity agreement (2014); DOJ settlement over $34 million (July 2024; found via journal reference); 2016 whistleblower allegations about charity premium assistance (disputed); California AB 290 enjoined 2019; claim that about 80% of the charity funding comes from two companies (advocacy).','Court and DOJ records'),
49:('B','DOJ complaint (2022) against Fresenius Vascular Care alleging 1,288 of 2,303 angioplasties among 60 patients unnecessary (allegation); American Access Care settlement $3,594,791; industry commentary (2026) on fistulas and catheters outside hospitals.','Court records'),
50:('A†','Registry-based study of home dialysis among incident patients: 6.8% (2010) to 13.3% (2020).','Title, authors'),
51:('A/B','RaDIANT facility-level trial (Georgia): more than 9,000 patients, 134 facilities; improved referral for evaluation and narrowed racial disparity.','Journal article'),
52:('A','Moers and colleagues, New England Journal of Medicine 2009;360:7–19: 336 donors, 672 recipients, paired kidneys; delayed graft function 70 vs 89 (adjusted odds ratio 0.57); better one-year graft survival.','Exact survival percentages'),
53:('A†/C','NEJM correspondence, 5 November 2025 (doi 10.1056/NEJMc2406608): benefit persisted at 10 years; investigators\' university release 79% vs 73% functioning; device-maker summary of 27% lower risk of graft failure; 99% follow-up response.','Exact hazard ratio'),
54:('A','Concepcion and colleagues, Clinical Transplantation 2026 (doi 10.1111/ctr.70637): survey of 88 centers using hypothermic perfusion (35% of centers, 63% of 2024 volume); 74% exclusively OPO-run; OPO refusal the leading barrier (58%); 92% endorse for kidney selection, 90% for reducing delayed graft function; 60% sometimes and 20% would decline a kidney if pumping failed.','Full text'),
55:('A','Transplant International 2025 (doi 10.3389/ti.2025.15282): Belgium national reimbursement of hypothermic perfusion from September 2022; 242 transplants; delayed graft function 14.4%; donation-after-circulatory-death transplants 90 to 175 per year; estimated savings EUR 3.59 million per year. Retrospective.','Budget model assumptions'),
56:('A†','Hosgood and colleagues, Nature Medicine 2023: warm perfusion vs cold storage, delayed graft function 60.7% vs 58.5%; American Journal of Transplantation 2026 randomized trial (n=80) adding warm perfusion to cold pump, no improvement; oxygenated pump trial in older donors, no benefit; Nature Reviews Nephrology 2025 review.','Authors, titles'),
57:('B','Hakai Magazine, Connexion France and company-linked sources on Franck Zal, Roscoff, the lugworm and Hemarina (founded 2007); Zal is a founder and shareholder.','Primary interviews'),
58:('B/C','Foundation essays on oxygen-carrier history (Autopsy of Five Companies; The Dog Got There First) drawing on reviews and reporting: Baxter, Hemosol, Northfield, Biopure; Oxyglobin approved for dogs in the late 1990s; Biopure bankruptcy 16 July 2009. Secondary; figures such as the 72% mortality increase come from a review and should be checked against original trials.','Original trial reports'),
59:('A','Natanson and colleagues, JAMA 2008;299(19):2304–2312: 16 trials, 5 products, 3,711 patients; mortality 164 vs 123 (relative risk 1.30, 1.05 to 1.61); myocardial infarction 59 vs 16 (relative risk 2.71, 1.67 to 4.40).','Confirmed in abstract'),
60:('B/C','OXYOP study of HEMO2life (60 paired kidneys, French centers, 2016 to 2018); 4-year patient survival 98.3% vs 86% (p=0.016, company-linked source); control kidneys had longer cold time by design; Le Meur and colleagues, Artificial Organs 2022 (conflict of interest disclosed); OxyOp2 randomized trial protocol, Trials 2023; sources differ on enrollment (60 vs 120).','Journal text, results of OxyOp2'),
61:('C','Cold Ischemia Foundation pages on BHOC Therapeutics and BHOC Transplant: described as a research concept; sponsors state BHOC has not been shown to change transplant outcomes.','Sponsor documents'),
62:('B','Atul Gawande, "Slow Ideas," The New Yorker (29 July 2013), via summaries; histories of anesthesia (1846) and of Semmelweis (1847), widely retold; figures commonly cited and not independently confirmed here.','Primary texts'),
65:('A†','American Journal of Transplantation (2021) registry analysis of median graft survival: deceased-donor 8.2 years (1995 to 1999) to about 11.7 years (recent); living-donor 12.1 to about 19.2 years (2014 to 2017).','Authors, titles'),
66:('C','News report (2026) citing national counts of living kidney donors: 6,290 (2023), 6,419 (2024), 6,522 (2025), 6,867 (2019); single source.','OPTN living-donor table'),
67:('B','Older analysis of living kidney donation declining after a mid-2000s peak, most among men, Black adults, and younger and lower-income adults; Medical Journal of Australia 2026: 253 living-donor kidney transplants in 2024 vs 354 in 2008.','Primary papers'),
68:('A/B','Honor Our Living Donors Act (Consolidated Appropriations Act, 2026, P.L. 119-75, enacted 3 February 2026); HRSA notices 2026-13250 (1 July 2026) and 2026-19911; reimbursement up to $6,000 per organ for travel, lost wages, child and elder care; donor-side priority at or below 350% of poverty guidelines; 21% of donors reach the cap (physicians\' group letter).','Final notice text, source of 21%'),
69:('B','National Kidney Registry and American Kidney Fund descriptions of private donor-protection programs; American Kidney Fund report card on state protections (May 2026): gains in several states, little or no progress in many.','Program terms'),
70:('B/C','End Kidney Deaths Act, H.R. 2687 (119th Congress): refundable credit $10,000 in the donation year and each of four following years for non-directed living kidney donors; kidneys removed after 2026; sunset 2036; about 60 cosponsors (campaign count, March 2026); policy tracker rated chance of passage low.','Congress.gov text'),
71:('B','National Kidney Registry report of a chain begun in 2008 (30 transplants, 17 hospitals, 11 states, four months); University of Alabama at Birmingham announcements of a chain of 74 donors and 74 recipients, later more than 100 recipients.','Current totals'),
72:('B','National Kidney Registry figures: 10,000th living-donor transplant; 1,744 transplants in 2024; expected about 30% of US living-donor kidney transplants in 2025. Organization\'s own figures.','Independent confirmation'),
73:('B','Live Donor Champion program (Johns Hopkins): pilot of 15 vs 15 matched candidates; 163-candidate follow-up with 81 referrals and about 5.5-fold odds; conference abstracts and registry entry; no randomized trial found.','Published papers'),
74:('B†','BMC Health Services Research 2023 process-improvement study of living-donor evaluation: about 25% of potential living-donor transplants missed for reasons related to inadequate timing.','Title, authors'),
75:('A/B','Massachusetts General Hospital and Harvard Medical School accounts of Tim Andrews (pig kidney January 2025; 271 days; removed October 2025; human kidney January 2026); Nature Medicine 2025 immune profiling report; American Journal of Transplantation 2026 review.','Peer-reviewed case report'),
76:('C†','News coverage of Richard Slayman (Massachusetts General Hospital, March 2024; died May 2024; hospital reported no indication the transplant caused death) and Towana Looney (NYU Langone, November 2024; kidney removed spring 2025 for rejection). Not reconfirmed from primary sources.','Hospital releases'),
77:('A/B','FDA clearance of living-patient pig-kidney trials (autumn 2025); eGenesis trial approval (September 2025); United Therapeutics EXPAND trial (NCT06878560; ten gene edits; first transplant announced 3 November 2025; 24-week monitoring).','Trial registry'),
78:('A/B','Medeor MDR-101 phase 3 (American Journal of Transplantation, July 2025; interim 2023): 20 treated, 10 control; 16 of 19 off immunosuppression at two years (interim); about 95% discontinued all immunosuppression about one year; 75% off more than two years; four resumed.','Journal article'),
79:('B','HCPLive (23 April 2026) interview with a transplant nephrologist on tolerance as the frontier of kidney care.','Primary interview'),
}
REFS="""
American Society of Transplant Surgeons. (2019, September 27). *CMS removes outcomes requirement for transplant center re-approval*. https://www.asts.org/connect/news/2019/09/27/cms-removes-outcomes-requirement-for-transplant-center-re-approval

Associated Press. (2024, October 28). *People opt out of organ donation programs after reports of a man mistakenly declared dead*.

Aubert, O., et al. (2019). Disparities in acceptance of deceased donor kidneys between the United States and France and estimated effects of increased US acceptance. *JAMA Internal Medicine, 179*(10), 1365–1374.

Belgium nationwide hypothermic machine perfusion for ECD and DCD kidney transplantation: One-year outcomes and impact on transplant rates and budget impact analysis. (2025). *Transplant International*. https://doi.org/10.3389/ti.2025.15282

Blankestijn, P. J., et al. (2023)†. Effect of hemodiafiltration or hemodialysis on mortality in kidney failure. *New England Journal of Medicine*. https://doi.org/10.1056/NEJMoa2304820

Bowring, M. G., et al. (2018). Kidney offer acceptance at programs undergoing a Systems Improvement Agreement. *American Journal of Transplantation*. https://doi.org/10.1111/ajt.14907

Campbell, D. T. (1979). Assessing the impact of planned social change. *Evaluation and Program Planning, 2*(1), 67–90.

Centers for Medicare & Medicaid Services. (2007, March 30). Medicare program; hospital conditions of participation: Requirements for approval and re-approval of transplant centers to perform organ transplants. *Federal Register*.

Centers for Medicare & Medicaid Services. (2019, September 30). Regulatory provisions to promote program efficiency, transparency, and burden reduction (Part II). *Federal Register, 84*, 51732.

Centers for Medicare & Medicaid Services. (2026, January 30). *Organ procurement organizations conditions for coverage: Revisions (CMS-3409-P)*. https://www.cms.gov/newsroom/fact-sheets/organ-procurement-organizations-opos-conditions-coverage-revisions-cms-3409-p-proposed-rule

Centers for Medicare & Medicaid Services. (n.d.). *Increasing Organ Transplant Access (IOTA) model fact sheet*. https://www.cms.gov/priorities/innovation/files/iota-model-fs.pdf

Concepcion, B. P., et al. (2026)†. Hypothermic machine perfusion in deceased donor kidney transplantation: Provider and transplant center practices and perspectives. *Clinical Transplantation, 40*(8). https://doi.org/10.1111/ctr.70637

Debout, A., et al. (2015)†. Each additional hour of cold ischemia time significantly increases the risk of graft failure and mortality following renal transplantation. *Kidney International, 87*(2), 343–349.

Durand, C. M., et al. (2018)†. Direct-acting antiviral prophylaxis in kidney transplantation from hepatitis C virus-infected donors to noninfected recipients. *Annals of Internal Medicine, 168*(8), 533–540.

Fresenius Medical Care. (2025, June 4)†. *Updated 5008X CAREsystem receives FDA 510(k) clearance* [Press release].

Gander, J. C., et al. (2019). Association of dialysis facility ownership with access to kidney transplantation. *JAMA, 322*(10), 957–973.

Garg, A. X., et al. (2022)†. Effect of personalised cooler dialysate on cardiovascular outcomes in hemodialysis (MyTEMP): A pragmatic, cluster-randomised trial. *The Lancet, 400*, 1693–1703.

Gawande, A. (2013, July 29). Slow ideas. *The New Yorker*.

Goodhart, C. A. E. (1975)†. Problems of monetary management: The U.K. experience. In *Papers in monetary economics*. Reserve Bank of Australia.

Hakai Magazine. (n.d.). *Lugworm blood, coming soon to a pharmacy near you*. https://hakaimagazine.com/news/lugworm-blood-coming-soon-to-a-pharmacy-near-you/

Health Resources and Services Administration. (2026). *OPTN board approves measures to improve kidney offer acceptance process*. https://www.hrsa.gov/optn/news-events/news/optn-board-approves-measures-improve-kidney-offer-acceptance-process

Health Resources and Services Administration, Division of Transplantation. (2025, March 24). *Information memo to the Associate Administrator: Kentucky Organ Donor Affiliates*.

Healio. (2023, August 8). *High rate of donated organs going unused is costing lives*. https://www.healio.com/news/nephrology/20230808/high-rate-of-donated-organs-going-unused-is-costing-lives

Healio. (2026, April 6). *Unilateral out-of-sequence kidney allocations rose 17-fold since 2020*. https://www.healio.com/news/nephrology/20260406/unilateral-outofsequence-kidney-allocations-rose-17fold-since-2020

Healio. (2026, March 4). *Kidney transplant, recovery rates dropped following allocation memorandum*. https://www.healio.com/news/nephrology/20260304/kidney-transplant-recovery-rates-dropped-following-allocation-memorandum

Hosgood, S. A., et al. (2023)†. Normothermic machine perfusion versus static cold storage in donation after circulatory death kidney transplantation: A randomized controlled trial. *Nature Medicine, 29*, 1511–1519.

Husain, S. A., et al. (2019)†. Association between declined offers of deceased donor kidney allograft and outcomes in kidney transplant candidates. *JAMA Network Open, 2*(8).

Husain, S. A., et al. (2026)†. Changes in deceased donor kidney recovery and transplantation following increased regulatory oversight of allocation out of sequence. https://pmc.ncbi.nlm.nih.gov/articles/PMC12826291/

InvestigateTV. (2026, February 12). *Investigation reveals 20% of donated organs in U.S. go unused*. https://www.investigatetv.com/2026/02/12/investigation-reveals-20-donated-organs-us-go-unused/

Le Meur, Y., et al. (2022)†. HEMO2life improves renal function independent of cold ischemia time in kidney recipients: A comparison with a large multicenter prospective cohort study. *Artificial Organs*. https://doi.org/10.1111/aor.14141

Machiavelli, N. (1910). *The Prince* (N. H. Thomson, Trans.). P. F. Collier & Son. (Original work published 1532)

Medicare Payment Advisory Commission. (2026, March). *Report to the Congress: Medicare payment policy, chapter 5: Outpatient dialysis services*. https://www.medpac.gov/wp-content/uploads/2026/03/Mar26_Ch5_MedPAC_Report_To_Congress_SEC.pdf

Mill, J. S. (1859). *On liberty*. John W. Parker and Son.

Moers, C., et al. (2009). Machine perfusion or cold storage in deceased-donor kidney transplantation. *New England Journal of Medicine, 360*(1), 7–19. https://doi.org/10.1056/NEJMoa0802289

Moers, C., et al. (2025)†. Cold perfusion vs. static cold storage of deceased-donor kidneys: At 10 years. *New England Journal of Medicine* [Correspondence]. https://doi.org/10.1056/NEJMc2406608

Mohan, S., et al. (2018)†. Factors leading to the discard of deceased donor kidneys in the United States. *Kidney International, 94*(1), 187–198.

Natanson, C., et al. (2008). Cell-free hemoglobin-based blood substitutes and risk of myocardial infarction and death: A meta-analysis. *JAMA, 299*(19), 2304–2312.

Organ Recovery Systems. (2025, November 5). *Organ Recovery Systems announces publication of 10-year follow-up data of landmark hypothermic machine perfusion study featuring LifePort Kidney Transporter in the New England Journal of Medicine* [Press release].

Organ Procurement and Transplantation Network, & Scientific Registry of Transplant Recipients. (2026). *OPTN/SRTR 2024 annual data report: Overview of US solid organ transplantation* and *Kidney*. https://srtr.hrsa.gov/adr/2024/

Planck, M. (1949). *Scientific autobiography and other papers* (F. Gaynor, Trans.). Philosophical Library.

Ross, C. (2016, August 11). Hospitals are throwing out organs and denying transplants to meet federal standards. *STAT*. https://www.statnews.com/2016/08/11/organ-transplant-federal-standards/

Sinclair, U. (1935). *I, candidate for governor: And how I got licked*. Author.

Smith, A. (1776). *An inquiry into the nature and causes of the wealth of nations*. W. Strahan and T. Cadell.

Strathern, M. (1997). "Improving ratings": Audit in the British university system. *European Review, 5*(3), 305–321.

United States Renal Data System. (2023). *2023 annual data report*. National Institute of Diabetes and Digestive and Kidney Diseases.

United States Renal Data System. (2026). *2025 annual data report: Epidemiology of kidney disease in the United States*. *American Journal of Kidney Diseases*.
""".strip()
PUBDOM="All epigraphs are quotations from works in the public domain, or short quotations from scholarly works cited in the references. Bacon, F. (1625). Of innovations. Hippocrates, Aphorisms, section 1 (Adams translation, 1849). Campbell, D. T. (1979). Cameron, W. B. (1963). Informal sociology. Goldratt, E. M. (1990). The haystack syndrome. Gibson, W. (c. 1993). Pasteur, L. (1854). Lecture at the University of Lille. Lincoln, A. (1862). Annual message to Congress. Thoreau, H. D. (1854). Walden. Carroll, L. (1865). Alice's adventures in Wonderland. Nightingale, F. (1863). Notes on hospitals. The Holy Bible, King James Version (1611): Ecclesiastes 9:11; Proverbs 13:12; Job 12:7; John 15:13. Strathern, M. (1997). Burke, E. (1792). Speech on the petition of the Unitarian Society; Burke, E. (1790). Reflections on the revolution in France. Shakespeare, W. (c. 1603). Othello. Sinclair, U. (1935). Machiavelli, N. (1910 translation). Douglass, F. (1857). Seneca, Letters to Lucilius (Gummere translation, 1917)."
GLOSS=[('Allocation out of sequence (AOOS)','Offering an organ to a candidate other than the next one on the computer-generated list, usually after repeated declines.'),
('Cold ischemia time (CIT)','The hours an organ spends cooled and without blood flow, between recovery and transplantation.'),
('Delayed graft function (DGF)','A transplanted kidney that does not work at once, so that the recipient needs dialysis within the first week.'),
('Donation after circulatory death (DCD)','Donation after the heart has stopped, as opposed to after brain death.'),
('Discard / nonuse','A kidney recovered for transplant that is not transplanted into anyone.'),
('Hemodiafiltration (HDF)','A form of dialysis that cleans blood by convection as well as diffusion.'),
('Hemoglobin-based oxygen carrier (HBOC, BHOC)','A hemoglobin solution, outside red cells, designed to carry oxygen; BHOC denotes a bovine-derived version.'),
('HRSA','Health Resources and Services Administration, the federal agency that oversees the transplant network.'),
('Hypothermic machine perfusion (HMP)','A pump that moves cold preservation fluid through a kidney while it waits.'),
('IOTA','Increasing Organ Transplant Access, a mandatory CMS payment model for kidney transplant hospitals that began in July 2025.'),
('KDPI','Kidney Donor Profile Index, a 0 to 100 percentile summarizing the expected quality of a deceased donor kidney; higher means shorter expected life.'),
('Match run','The computer-generated ranked list of candidates for a given organ.'),
('MPSC','The OPTN committee that reviews the performance of transplant programs and organizations.'),
('Offer acceptance ratio (OAR)','A program\'s observed acceptance of kidney offers compared with the number expected for similar candidates.'),
('Offer filters','A tool that lets programs screen out kinds of offers in advance so they are not sent.'),
('OPO','Organ procurement organization: one of 55 regional nonprofits that recover organs and offer them to the list.'),
('OPTN','Organ Procurement and Transplantation Network: writes the rules and runs the matching system.'),
('Orphan innovation','A tool with proven benefit but no party whose budget or metric it fits (the author\'s term).'),
('Perfusion','The flow of fluid or blood through an organ.'),
('SRTR','Scientific Registry of Transplant Recipients: publishes risk-adjusted program results.'),
('Systems Improvement Agreement (SIA)','A corrective plan between CMS and a transplant program whose outcomes fell below expectations.'),
('Waiting list','The national list of candidates registered for a transplant.')]
def main():
    order=[f for f in sorted(glob.glob(PRE+'/*.md')) if not os.path.basename(f).startswith('zz')]
    mapping={}; nxt=1; texts={f:open(f).read() for f in order}
    for f in order:
        for m in re.finditer(r'Source Notes S(\d+)',texts[f]):
            o=int(m.group(1))
            if o not in SN: print('MISSING SN',o)
            if o not in mapping: mapping[o]=nxt; nxt+=1
    for f in order:
        t=re.sub(r'Source Notes S(\d+)',lambda m:'Source Notes S%d'%mapping[int(m.group(1))],texts[f]); open(SPL+'/'+os.path.basename(f),'w').write(t)
    for o in SN:
        if o not in mapping: print('never cited:',o)
    rows=['| Note | Grade | What it supports and where it was found | Still to confirm |','|---|---|---|---|']
    for o,n in sorted(mapping.items(),key=lambda kv:kv[1]):
        g,w,c=SN[o]; rows.append(f'| S{n} | {g} | {w} | {c} |')
    gl='\n\n'.join(f'**{a}.** {b}' for a,b in GLOSS)
    app=f"""# Glossary

{gl}

# Appendix A: Source Notes

Sources cited in the text as "Source Notes S" and a number are described here with the grade I assigned. Grade A is a primary document, registry or peer-reviewed paper whose key figures I could confirm. Grade B is a credible secondary account such as trade press or a news investigation. Grade C is a single source, an advocacy group, a manufacturer or a press release. A dagger (†) marks details only partly confirmed. Where my own arithmetic appears in the text, it is labeled as such.

""" + '\n'.join(rows) + """

## What is thin or unfinished

Several matters deserve a plain statement. The count of unused kidneys in 2024 is my arithmetic from registry rates and should be replaced by the registry's table. The analyses of the August 2025 memorandum are early, brief and in part summarized by trade or advocacy sources. The ten-year follow-up of the machine-perfusion trial reached me through the investigators' university and the device maker. The oxygen-carrier evidence is early, small and partly company-sourced. The allegations about dialysis companies and vascular access centers are allegations; I did not find final judgments. The outcome of the April 2026 board discussion of out-of-sequence allocation, and the 2026 OPO recertification results, had not been published when this book was written.

# Appendix B: References

Entries marked † have bibliographic details that are partly confirmed. Sources described only in the Source Notes are not repeated here.

""" + REFS + """

## Sources of the epigraphs

""" + PUBDOM + "\n"
    open(SPL+'/zz-appendices.md','w').write(app)
    print('renumbered',len(mapping),'notes')
if __name__=='__main__': main()
