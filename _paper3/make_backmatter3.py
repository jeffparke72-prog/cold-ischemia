#!/usr/bin/env python3
"""Renumber 'Source Notes S#' in reading order and write the appendices for 'What We Promised'."""
import re, glob, os, sys
HERE=os.path.dirname(os.path.abspath(__file__)); SPL=HERE+'/ms_split'; PRE=HERE+'/ms_pre'
sys.path.insert(0,HERE+'/../_paper2'); import make_backmatter as M
SN=dict(M.SN)
SN.update({
60:('A†','International Delphi consensus survey on core outcomes in hemodialysis (2017): 1,181 first-round participants (202 patients and caregivers, 979 professionals) from 73 countries; patients and caregivers rated ability to travel, time free from dialysis, adequacy of dialysis and feeling washed out higher than professionals.','Title, authors'),
61:('A†','Seminars in Dialysis meta-analysis (2025; doi 10.1111/sdi.70043): 137 cross-sectional studies, 21,608 hemodialysis patients; pooled depression 45.8% (95% CI 42.0 to 49.6); 38.9% in high-income countries.','Authors'),
62:('A†','2026 population-based cohort of people with chronic kidney disease (PMC12825595): most socially isolated group 33% higher mortality, lonely group 10% higher; life-expectancy losses of roughly 2 to 3 years in the most isolated.','Title, authors; association, not causation'),
63:('B†','History of dialysis and transplantation (Kolff 1943 to 1945; Scribner and Quinton shunt 1960; Clyde Shields; Seattle admissions committee and the 1962 Life article by Shana Alexander; home dialysis from the mid-1960s; Herrick twins, 23 December 1954; Murray Nobel Prize 1990). Widely retold; I could not consult the primary texts, so counts, ages and parts vary between sources.','Primary texts (Kolff, Scribner, Alexander 1962, Murray Nobel lecture)'),
64:('A†','USRDS 2023 Annual Data Report (data through 2021): traditional Medicare cost per person $99,325 (hemodialysis), $86,976 (peritoneal dialysis), $43,913 (functioning transplant); 12.3% of prevalent dialysis patients waitlisted.','Table numbers'),
65:('A†','USRDS 2025 Annual Data Report (American Journal of Kidney Diseases, 2026): Medicare ESRD spending $55.3 billion in 2023; adjusted prevalence 2,327 per million; first year since 2019 that prevalence did not fall.','Table numbers'),
66:('B','ASN letter to CMS (15 May 2024): beneficiaries with ESRD are about 1% of Medicare beneficiaries and about 7% of traditional Medicare spending; over 800,000 with kidney failure nationally.','USRDS table'),
67:('B','Accounts of the 1972 entitlement: Shep Glazer’s dialysis demonstration before the House Ways and Means Committee (November 1971; sources differ on date and organization); Social Security Amendments of 1972, P.L. 92-603, signed 30 October 1972, effective 1 July 1973; projection of about 10,000 patients and $135 million (sources differ on whether annual); 525,481 Medicare ESRD beneficiaries and over $28.6 billion in 2012. Based on Institute of Medicine (1991), Kidney Failure and the Federal Government, and secondary summaries.','Primary hearing record; IOM volume'),
68:('B','Meta-analysis summarized in a trade report (2025 to 2026): sexual dysfunction 71.2% across CKD, 77.6% hemodialysis, 76.7% predialysis, 56.9% transplant, linked to depression and lower quality of life; 2010 meta-analysis; one review noting 21 meta-analyses in men and 2 in women; single studies in women ranging from about 25% to 76%.','Primary meta-analysis'),
70:('B','Person-first language guidance (Temple Health, “Our Words Matter”); Home Dialysis Central commentary on “non-compliant”; nephrology opinion piece warning against label substitution; non-nephrology vignette experiment on stigmatizing chart language.','Primary papers'),
71:('A†/B','2024 nationwide analysis of 945,251 dialysis patients in 245 US cities: deaths rose 15% to 20% during extreme humid-heat events, highest in the Southeast; a 2023 analysis of weather and missed hemodialysis did not examine high temperatures.','Authors, journal'),
73:('C','American Kidney Fund fact sheet: American Indian and Alaska Native kidney failure about twice the rate in white Americans; year and source of the comparison not found.','USRDS table'),
74:('A†/B','Canadian study of transplant crowdfunding (PLoS ONE, 2019): 258 kidney campaigns raised about 11.5% of requested amounts, liver campaigns nearly half; abstract of 1,324 US campaigns (mean raised $10,701; mean goal $30,365).','Authors, abstract source'),
75:('C','Secondhand summary of a study of nearly 20,000 US organ-transplant campaigns: Black and Hispanic campaigners raised less and met goals less often.','Primary paper'),
76:('B','National Kidney Foundation explainer (April 2026) and an Associated Press report (September 2025): FDA approval of formal pig-kidney trials from fall 2025; eGenesis trial approved.','Trial registry entries'),
77:('C†','News coverage of Richard Slayman (Massachusetts General Hospital, March 2024; died May 2024, hospital reported no indication the transplant caused death), Lisa Pisano (NYU Langone, 2024) and Towana Looney (NYU Langone, November 2024; kidney removed spring 2025 for rejection). Not re-confirmed from primary sources in this session.','Hospital press releases and journal reports'),
78:('A/B','Tim Andrews (Massachusetts General Hospital; eGenesis EGEN-2784 kidney, January 2025): 271 days without dialysis, kidney removed October 2025, human kidney January 2026 (Harvard Medical School news); Nature Medicine immune-profiling report (2025); American Journal of Transplantation review (2026).','Peer-reviewed case report'),
79:('B','National Kidney Registry announcements: 10,000th living-donor transplant; 1,744 transplants in 2024; about 30% of US living-donor kidney transplants expected in 2025; 104 member centers. Organization’s own figures.','Independent registry confirmation'),
80:('A/B','Spanish Ministry of Health release (January 2026): 51.9 deceased donors per million in 2025, 2,547 deceased donors, 408 living donors, about 6,335 transplants; 2024 record of 52.6 per million (La Moncloa, January 2025).','Method of counting'),
81:('A†','OPTN/SRTR 2024 Annual Data Report (kidney): share of recovered deceased-donor kidneys not transplanted 18.2% (2013), 26.6% (2022), 27.9% (2023), 29.3% (2024).','Table numbers'),
82:('B','Median albuminuria testing in 52.9% of adults with type 2 diabetes in primary care across 24 organizations (cited in FLOW commentary).','Primary study'),
83:('A†','FLOW trial (Nature Medicine 2024; PMC11485243): semaglutide in type 2 diabetes with chronic kidney disease; benefit regardless of concomitant SGLT2 inhibitor use.','Trial report'),
84:('C','Trade report (MassDevice) of FDA clearance of the Quanta home hemodialysis system, November 2024.','FDA database entry'),
85:('B','Federal analysis of chronic kidney disease awareness reported in the trade press (Becker’s Hospital Review): 96% of early-stage disease unaware; 48% of severely reduced function not on dialysis unaware.','CDC source'),
})
REFS=M.REFS.strip()+"""

Centers for Disease Control and Prevention. (2017)†. Vital signs: Decrease in incidence of diabetes-related end-stage renal disease among American Indians/Alaska Natives, United States, 1996–2013. *Morbidity and Mortality Weekly Report, 66*(1), 26–32.

Hladunewich, M. A., et al. (2014)†. Intensive hemodialysis associates with improved pregnancy outcomes: A Canadian and United States cohort comparison. *Journal of the American Society of Nephrology, 25*(5), 1103–1109."""
PUBDOM="""All epigraphs are quotations from works in the public domain. Lincoln, A. (1865). Second inaugural address. The Holy Bible, King James Version (1611): Jeremiah 8:22; Deuteronomy 30:19; Psalm 90:12; Isaiah 40:4 and 58:12; Matthew 25:35; John 15:13; Ecclesiastes 11:1; Proverbs 11:1. Dickinson, E. (c. 1862). After great pain, a formal feeling comes (Johnson no. 341; first published 1929). Donne, J. (1624). *Devotions upon emergent occasions*, Meditation XVII. Tennyson, A. (1850). *In memoriam A.H.H.* Bacon, F. (1620). *Novum organum*. Hippocratic Oath (1923 translation by W. H. S. Jones)."""
def main():
    order=[f for f in sorted(glob.glob(PRE+'/*.md')) if not os.path.basename(f).startswith('zz')]
    mapping={}; nxt=1; texts={f:open(f).read() for f in order}
    for f in order:
        for m in re.finditer(r'Source Notes S(\d+)',texts[f]):
            o=int(m.group(1))
            if o not in SN: print('MISSING SN',o)
            if o not in mapping: mapping[o]=nxt; nxt+=1
    for o in SN:
        if o not in mapping: SN_unused=True
    for f in order:
        t=re.sub(r'Source Notes S(\d+)',lambda m:'Source Notes S%d'%mapping[int(m.group(1))],texts[f]); open(SPL+'/'+os.path.basename(f),'w').write(t)
    rows=['| Note | Grade | What it supports and where it was found | Still to confirm |','|---|---|---|---|']
    for o,n in sorted(mapping.items(),key=lambda kv:kv[1]):
        g,w,c=SN[o]; rows.append(f'| S{n} | {g} | {w} | {c} |')
    app="""# Appendix A: Source Notes

Sources cited in the text as "Source Notes S" and a number are described here, with the grade I assigned. Grade A is a primary document or registry whose key figures I confirmed. Grade B is a credible secondary account. Grade C is a single-source figure or one from an advocacy group or manufacturer. A dagger (†) marks details that are only partly confirmed.

""" + '\n'.join(rows) + """

## What is thin or unfinished

Several matters deserve a plain statement. The history in Chapters 1 to 3 rests on widely repeated accounts, and I could not consult the primary texts. The figures on the 1972 projection and cost differ between sources. The hemodialysis sexual-dysfunction figures come from a trade summary of a meta-analysis, and the evidence for women is thin. The pregnancy comparison is small and retrospective. Whether heat causes missed treatments has not, to my knowledge, been studied. The American Indian and Alaska Native comparison of overall kidney-failure rates comes from an advocacy source with no year attached. The crowdfunding studies are partly secondhand. The 103-of-351 case figure is the agency’s own summary, and I could not verify what proportion of concerns would be borne out. The accounts of the first pig-kidney recipients come from news coverage. The Registry’s figures on its own growth come from the Registry. The tolerance and oxygen-carrier results are small or manufacturer-reported.

# Appendix B: References

Entries marked † have bibliographic details that are partly confirmed and should be completed from the original before any future edition. Works cited in the text only by author and year, such as the epigraph sources, appear at the end.

""" + REFS + """

## Sources of the epigraphs

""" + PUBDOM + """

# About the Author

Jeff Parke is the founder of the Cold Ischemia Foundation, an independent advocacy organization based in Ellenton, Florida, for patients, living donors, and care partners in the kidney and transplant communities. The Foundation accepts no donations, grants, or sponsorships and charges posted fees only for services that individuals request. The author has spent the better part of two decades inside the transplant system, in more than one role, and writes from the conviction that the people in these rooms deserve to be counted.
"""
    open(SPL+'/zz-appendices.md','w').write(app)
    print('renumbered',len(mapping),'notes')
if __name__=='__main__': main()
