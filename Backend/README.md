```text

Hive ai->
  ->Generative AI Detection Tools
  ->Reverse Image Search & Web Search API: Hive indexes billions of images across the public web. Their API allows businesses to submit an image and receive matching URLs, backlinks, and visual similarity scores from across the web.  Logo & Brand 

  ->Protection Search: Automatically scans web media, social platforms, and broadcasts to detect brand logos, trademarks, and copyright-protected assets.
  ->Text Moderation: Identifies spam, offensive language, hate speech, and harassment in real time.
  
  ```
  
  
### Tavliy workflow
```text
                    CLAIM
                      │
                      ▼
                    Tavily
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       PIB         Govt site    News
          │           │           │
          └───────────┼───────────┘
                      ▼
                 Web Evidence
```
### Google fact tools
```text
My claim
   ↓
Google Fact Check
   ↓
"Has this or a similar claim already been fact-checked?"
   ↓
Existing fact checks
```

### Full Fact AI's workflow

  ```text
News / TV / YouTube / Social Media / Podcasts
                     │
                     ▼
               Collect content
                     │
                     ▼
                Extract text
                     │
                     ▼
              Split into sentences
                     │
                     ▼
              Identify claims
                     │
                     ▼
            Claim-type classification
                     │
                     ▼
             Claim matching
                     │
                     ▼
       Has this claim been checked before?
                     │
                     ▼
             Help fact-checker


"When a user submits a claim, my LangGraph orchestrator sends it to three specialized systems. Google Fact Check searches for previously published professional fact-checks. Tavily searches the broader web to find current and authoritative evidence when existing fact-checks are insufficient. Full Fact AI provides claim identification and matching capabilities from a professional fact-checking ecosystem. I don't blindly trust any single result. I normalize their outputs and pass the evidence to my analysis layer, which determines whether each piece of evidence supports or contradicts the claim. Finally, the claim-assessment layer combines that evidence and produces an explainable verdict with source provenance."


*****************claims************************
id->  1
text->  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
----------------------------------------------------------------------------------------------------
id->  2
text->  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
----------------------------------------------------------------------------------------------------
id->  3
text->  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
----------------------------------------------------------------------------------------------------
id->  4
text->  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
----------------------------------------------------------------------------------------------------
id->  5
text->  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
----------------------------------------------------------------------------------------------------
id->  6
text->  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
----------------------------------------------------------------------------------------------------
*****************web evidences************************
source :  Instagram
title :  Instagram
claim :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
content :  \_sheerat\_

•

Follow

_sheerat_'s profile picture

\_sheerat\_

National Scholarship Scheme ₹50,000 🎓💰  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
#aktu #btech #college #university #education

immanishyadvv's profile picture

immanishyadvv

.

Reply

prasanvi_v's profile picture

prasanvi\_v

🙌

Reply

manish__rastogi_'s profile picture

manish\_\_rastogi\_

🙌

Reply

_maahi_ruhii's profile picture

\_maahi\_ruhii

General ko bhi milega kya yeh scholarship
url :  https://www.instagram.com/reel/DbIakFgTfOk
relevant_score :  0.6244086
----------------------------------------------------------------------------------------------------
source :  Instagram
title :  Instagram
claim :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
content :  🎓🇯🇲 The 2026 Ministry of Education, Skills, Youth & Information Scholarships are now OPEN!   
  
This is your opportunity to access funding support for primary, secondary, tertiary, and TVET education across Jamaica.   
  
Don’t miss the chance to apply for scholarships, grants, tuition assistance, book allowances, and other educational support opportunities that can help shape your future.
url :  https://www.instagram.com/p/DYgKzjjjMOt
relevant_score :  0.60358196
----------------------------------------------------------------------------------------------------
source :  TheDream.US National Scholarship for Immigrant Students
title :  TheDream.US National Scholarship for Immigrant Students
claim :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
content :  Have graduated or will graduate from a United States high school (or have earned or will earn a high school equivalency diploma) before the Fall of 2026;
 Graduated or will graduate with a high school GPA of 2.5 or better on a 4.0 scale and have a cumulative college GPA of 2.5 or better (if you have earned college credits after high school);
 Intend to enroll full-time in an associate or bachelor’s degree program at a Partner College in your state in the Fall of 2026 or Spring of 2027; and [...] The following are the requirements for the 2026-2027 Round: Applications are open to first generation immigrant students with or without DACA or TPS who came to the U.S. before the age of 16 and before Nov. 1, 2020. The National Scholarship Award will help cover your tuition and fees at one of our Partner Colleges up to a maximum of $33,000 for a bachelor’s degree. [...] Skip to content

Logo for: TheDream.us

# National Scholarship

The National scholarship is now closed.Our next scholarship application round opens November 1, 2026.

We think of our National Scholarship as the “Pell Grant” for highly motivated first generation immigrant students (aka Dreamers) who are eligible to receive in-state tuition in their home state (not applicable if attending a private, online, or Texas institution) but still have significant, unmet financial need.
url :  https://www.thedream.us/scholarships/national-scholarship
relevant_score :  0.5860734
----------------------------------------------------------------------------------------------------
source :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
title :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
claim :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
content :  Education Level: Enrolled at a college, university, trade school, or graduate school
     Age: 18 or older
     Residency: U.S. resident
     Background: Good academic standing

    $500

    Deadline:Oct 29, 2026

    One Click Apply

    24
25. ### DMV Future Builders Scholarship

    Funded by

    Originals 3D Prints

    This scholarship aims to support builders, problem-solvers, and future leaders who are actively working to make a difference rather than simply talking about it.
url :  https://bold.org/scholarships/by-type/national-scholarships
relevant_score :  0.6796259
----------------------------------------------------------------------------------------------------
source :  2026 College Scholarships | Application Deadlines for ...
title :  2026 College Scholarships | Application Deadlines for ...
claim :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
content :  ##### The Future is Now Scholarship   
Deadline: Sep 28, 2026

$2,999

The Lenny Scholarship offers support young individuals aged 16 and above, enrolled in college and residing in the US or India. Automatic disqualification may occur for multiple applications. EligibilityYou must be a resident of the US or IndiaYou must be 16 years of age or olderYou must be enrolled in a college

OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### 10 Words or Less Scholarship   
Deadline: Nov 15, 2026

$1,500 [...] $1,500

Scholarship Eligibility:A) Be between the ages of 17-25 B) Be attending college or university in the Fall of 2027 C) Be attending a college or university in the United States or CanadaThe successful applicants will receive notification by email no later than December 1, 2026. Applicants who are not selected may view the winner's announcement, which will be posted on this website...

OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### Common App Scholarship   
Deadline: Dec 15, 2026

$2,000 [...] OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### Niche $40,000 Scholarship   
Deadline: Oct 15, 2026

$40,000

Apply for our $40,000 No Essay Scholarship below and focus on your education, not your finances. The winner will be selected by random drawing and will be notified via email by Votigo, our official scholarship fulfillment partner, by November 15th. Good luck!Who Can ApplyAll high school and college students, as well as anyone looking to attend college or graduate school...
url :  https://studentscholarships.org/scholarships
relevant_score :  0.4611872
----------------------------------------------------------------------------------------------------
source :  15 Scholarships in 2026 for High School Students
title :  15 Scholarships in 2026 for High School Students
claim :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
content :  The national first-place winner receives a $35,000 scholarship, paid directly to their chosen American university, college, or vocational/technical school. Other national scholarships range from $1,000 to $15,000, and each state’s first-place winner is guaranteed at least $1,000 plus an all-expenses-paid trip to Valley Forge. [...] Previous scholarship winners may reapply each year for continued Carson Scholar recognition. To be eligible, students must attend an accredited K–12 school in the United States and be nominated by an educator (only one student per school may apply to ensure that each nominee truly represents academic excellence). [...] Students from households earning less than $65,000 per year (for a family of four), with limited assets, are typically eligible to apply. Ideal candidates are those who have earned mostly A’s in the most challenging courses, demonstrate strong writing skills, and show intellectual curiosity and motivation.
url :  https://dripbl.com/scholarships-in-2026-for-high-school-students
relevant_score :  0.49275014
----------------------------------------------------------------------------------------------------
source :  Instagram
title :  Instagram
claim :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
content :  \_sheerat\_

•

Follow

_sheerat_'s profile picture

\_sheerat\_

National Scholarship Scheme ₹50,000 🎓💰  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
.  
#aktu #btech #college #university #education

immanishyadvv's profile picture

immanishyadvv

.

Reply

prasanvi_v's profile picture

prasanvi\_v

🙌

Reply

manish__rastogi_'s profile picture

manish\_\_rastogi\_

🙌

Reply

_maahi_ruhii's profile picture

\_maahi\_ruhii

General ko bhi milega kya yeh scholarship
url :  https://www.instagram.com/reel/DbIakFgTfOk
relevant_score :  0.6244086
----------------------------------------------------------------------------------------------------
source :  Instagram
title :  Instagram
claim :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
content :  🎓🇯🇲 The 2026 Ministry of Education, Skills, Youth & Information Scholarships are now OPEN!   
  
This is your opportunity to access funding support for primary, secondary, tertiary, and TVET education across Jamaica.   
  
Don’t miss the chance to apply for scholarships, grants, tuition assistance, book allowances, and other educational support opportunities that can help shape your future.
url :  https://www.instagram.com/p/DYgKzjjjMOt
relevant_score :  0.60358196
----------------------------------------------------------------------------------------------------
source :  TheDream.US National Scholarship for Immigrant Students
title :  TheDream.US National Scholarship for Immigrant Students
claim :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
content :  Have graduated or will graduate from a United States high school (or have earned or will earn a high school equivalency diploma) before the Fall of 2026;
 Graduated or will graduate with a high school GPA of 2.5 or better on a 4.0 scale and have a cumulative college GPA of 2.5 or better (if you have earned college credits after high school);
 Intend to enroll full-time in an associate or bachelor’s degree program at a Partner College in your state in the Fall of 2026 or Spring of 2027; and [...] The following are the requirements for the 2026-2027 Round: Applications are open to first generation immigrant students with or without DACA or TPS who came to the U.S. before the age of 16 and before Nov. 1, 2020. The National Scholarship Award will help cover your tuition and fees at one of our Partner Colleges up to a maximum of $33,000 for a bachelor’s degree. [...] Skip to content

Logo for: TheDream.us

# National Scholarship

The National scholarship is now closed.Our next scholarship application round opens November 1, 2026.

We think of our National Scholarship as the “Pell Grant” for highly motivated first generation immigrant students (aka Dreamers) who are eligible to receive in-state tuition in their home state (not applicable if attending a private, online, or Texas institution) but still have significant, unmet financial need.
url :  https://www.thedream.us/scholarships/national-scholarship
relevant_score :  0.5860734
----------------------------------------------------------------------------------------------------
source :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
title :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
claim :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
content :  Education Level: Enrolled at a college, university, trade school, or graduate school
     Age: 18 or older
     Residency: U.S. resident
     Background: Good academic standing

    $500

    Deadline:Oct 29, 2026

    One Click Apply

    24
25. ### DMV Future Builders Scholarship

    Funded by

    Originals 3D Prints

    This scholarship aims to support builders, problem-solvers, and future leaders who are actively working to make a difference rather than simply talking about it.
url :  https://bold.org/scholarships/by-type/national-scholarships
relevant_score :  0.6796259
----------------------------------------------------------------------------------------------------
source :  2026 College Scholarships | Application Deadlines for ...
title :  2026 College Scholarships | Application Deadlines for ...
claim :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
content :  ##### The Future is Now Scholarship   
Deadline: Sep 28, 2026

$2,999

The Lenny Scholarship offers support young individuals aged 16 and above, enrolled in college and residing in the US or India. Automatic disqualification may occur for multiple applications. EligibilityYou must be a resident of the US or IndiaYou must be 16 years of age or olderYou must be enrolled in a college

OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### 10 Words or Less Scholarship   
Deadline: Nov 15, 2026

$1,500 [...] $1,500

Scholarship Eligibility:A) Be between the ages of 17-25 B) Be attending college or university in the Fall of 2027 C) Be attending a college or university in the United States or CanadaThe successful applicants will receive notification by email no later than December 1, 2026. Applicants who are not selected may view the winner's announcement, which will be posted on this website...

OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### Common App Scholarship   
Deadline: Dec 15, 2026

$2,000 [...] OPEN SCHOLARSHIP ELIGIBILITY PAGE

##### Niche $40,000 Scholarship   
Deadline: Oct 15, 2026

$40,000

Apply for our $40,000 No Essay Scholarship below and focus on your education, not your finances. The winner will be selected by random drawing and will be notified via email by Votigo, our official scholarship fulfillment partner, by November 15th. Good luck!Who Can ApplyAll high school and college students, as well as anyone looking to attend college or graduate school...
url :  https://studentscholarships.org/scholarships
relevant_score :  0.4611872
----------------------------------------------------------------------------------------------------
source :  15 Scholarships in 2026 for High School Students
title :  15 Scholarships in 2026 for High School Students
claim :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
content :  The national first-place winner receives a $35,000 scholarship, paid directly to their chosen American university, college, or vocational/technical school. Other national scholarships range from $1,000 to $15,000, and each state’s first-place winner is guaranteed at least $1,000 plus an all-expenses-paid trip to Valley Forge. [...] Previous scholarship winners may reapply each year for continued Carson Scholar recognition. To be eligible, students must attend an accredited K–12 school in the United States and be nominated by an educator (only one student per school may apply to ensure that each nominee truly represents academic excellence). [...] Students from households earning less than $65,000 per year (for a family of four), with limited assets, are typically eligible to apply. Ideal candidates are those who have earned mostly A’s in the most challenging courses, demonstrate strong writing skills, and show intellectual curiosity and motivation.
url :  https://dripbl.com/scholarships-in-2026-for-high-school-students
relevant_score :  0.49275014
----------------------------------------------------------------------------------------------------
*****************google Fact evidences************************
[]
*****************claim_assessment************************
claim_text :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
verdict :  NOT MATCH
confidence :  0.85
reason :  The claim states that every college student in India will receive ₹50,000 directly into their bank account under the National Student Future Scholarship 2026. However, the evidence provided mentions the National Scholarship Scheme and does not directly confirm the amount or the direct bank transfer as stated in the claim. The content is irrelevant to the specific details of the claim.
supporting_evidence_count :  0
contradicting_evidence_count :  1
====================================================================================================
claim_text :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
verdict :  SUPPORTS
confidence :  0.85
reason :  The content supports the claim as it mentions the 2026 Ministry of Education, Skills, Youth & Information Scholarships, which aligns with the topic of the National Student Future Scholarship 2026 scheme announced on August 10, 2026. Although the specific details of the scholarship are not mentioned, the general topic matches the claim.
supporting_evidence_count :  0
contradicting_evidence_count :  1
====================================================================================================
claim_text :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
verdict :  NOT ENOUGH INFO
confidence :  0.5
reason :  The evidence provided discusses the National Scholarship Award and its eligibility criteria, but it does not specifically address the income or academic requirements for the National Student Future Scholarship 2026 as claimed by the user. Therefore, there is not enough information to confirm or refute the claim.
supporting_evidence_count :  0
contradicting_evidence_count :  1
====================================================================================================
claim_text :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
verdict :  NOT ENOUGH INFO
confidence :  0.0
reason :  The provided evidence does not contain sufficient information to verify the claim. The title mentions 'Top 30 National Scholarships to Apply for in August 2026', but it does not provide details about the eligibility criteria for any specific scholarship. The claim states that students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026, but there is no evidence in the provided text to support this claim.
supporting_evidence_count :  0
contradicting_evidence_count :  1
====================================================================================================
claim_text :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
verdict :  NOT MATCH
confidence :  0.85
reason :  The content does not match the USER CLAIM as it contradicts the claim in terms of the mentioned institutions (private colleges and distance-learning programs) and eligibility criteria (US or India residents, age 16 or older).
supporting_evidence_count :  0
contradicting_evidence_count :  1
====================================================================================================
claim_text :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
verdict :  Supported
confidence :  0.95
reason :  The evidence provided in the claim text supports the claim that students who have already received other government scholarships can apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits. The evidence mentions that previous scholarship winners may reapply each year, which supports the claim that students can apply for the scholarship without losing their existing benefits. Additionally, the evidence highlights the importance of academic excellence, writing skills, and intellectual curiosity, which are all mentioned as essential qualities for students to be eligible for the scholarship. Overall, the evidence provided is strong and supports the claim with a high level of confidence.
supporting_evidence_count :  1
contradicting_evidence_count :  0
====================================================================================================
*****************hive_assessment************************
claim_id->  1
claim_text->  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
reason->  The claim describes a government initiative to provide scholarships to college students, which is a positive action aimed at supporting education. There are no harmful elements such as bullying, violence, exploitation, or hate in the claim.
harmful->  False
====================================================================================================
claim_id->  2
claim_text->  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
reason->  The claim provided is a straightforward announcement about a scholarship scheme by a governmental ministry. It contains no harmful content or signals as identified by the HIVE moderation results.
harmful->  False
====================================================================================================
claim_id->  3
claim_text->  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
reason->  The claim suggests that the National Student Future Scholarship 2026 does not have income or academic requirements, which is a policy-related statement. It does not contain any harmful content or signals such as bullying, violence, sexual content, drugs, exploitation, hate, self-harm, or any other harmful themes.
harmful->  False
====================================================================================================
claim_id->  4
claim_text->  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
reason->  The claim provided is informational and does not contain any elements that are typically considered harmful based on the moderation signals provided. It is a statement about eligibility for a scholarship and does not contain any bullying, violent, sexual, drug-related, child exploitation, self-harm, hate, or any other harmful content.
harmful->  False
====================================================================================================
claim_id->  5
claim_text->  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
reason->  The claim provided is a statement about eligibility for a scholarship program and does not contain any of the moderation signals that would indicate harmful content.
harmful->  False
====================================================================================================
claim_id->  6
claim_text->  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
reason->  The claim provided is a statement regarding the eligibility of students for a scholarship program. It does not contain any harmful content or signals according to the HIVE MODERATION RESULT. The claim appears to be informational and related to educational opportunities.
harmful->  False
====================================================================================================
*****************risk_assessment************************
claim_text :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
risk_level :  LOW
risk_score :  25
reason :  The claim is clearly identified as not matching the factual assessment provided. The factual assessment does not confirm the specifics of the claim, such as the amount of money or the direct bank transfer. The content is irrelevant to the specific details of the claim, and there is no supporting or contradicting evidence related to the claim itself. Therefore, the risk of misinformation is low.
====================================================================================================
claim_text :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
risk_level :  HIGH
risk_score :  85
reason :  The claim is partially true as it aligns with the general topic of the National Student Future Scholarship 2026 announced by the Ministry of Education. However, there is conflicting evidence regarding the specific details of the announcement date, which is August 10, 2026, as opposed to the actual announcement date of August 10, 2025. The confidence in the factual assessment is high (0.85), but the presence of contradictory evidence regarding the date lowers the risk slightly.
====================================================================================================
claim_text :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
risk_level :  CRITICAL
risk_score :  100
reason :  The claim is presented as TRUE without sufficient evidence to confirm it, and there is at least one piece of evidence that contradicts the claim. The confidence in the factual assessment is low (0.5), indicating that there is significant uncertainty regarding the claim's accuracy. The claim is potentially harmful as it may mislead students into believing they can qualify for the scholarship without meeting certain requirements, which could result in disappointment and wasted resources. Therefore, the risk of misinformation is high.
====================================================================================================
claim_text :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
risk_level :  CRITICAL
risk_score :  100
reason :  The claim cannot be verified due to lack of sufficient information. The provided evidence contradicts the claim by stating there is not enough information to confirm the eligibility criteria for the National Student Future Scholarship 2026.
====================================================================================================
claim_text :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
risk_level :  CRITICAL
risk_score :  90
reason :  The claim is FALSE as it contradicts the factual assessment. The content is classified as harmful because it could lead students to pursue scholarships for which they are not eligible, potentially causing financial harm.
====================================================================================================
claim_text :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
risk_level :  LOW
risk_score :  25
reason :  The factual assessment supports the claim with a high level of confidence (0.95), and there is strong supporting evidence mentioned in the claim text. There are no contradicting pieces of evidence. The claim is classified as harmless as it pertains to scholarship opportunities and does not contain any harmful content.
====================================================================================================
*****************supporting evidence************************
score :  0.98
reason :  The content provides detailed information about the eligibility criteria, application process, and benefits of the National Student Future Scholarship 2026. It also mentions that previous scholarship winners may reapply each year, which supports the claim that students can apply for the scholarship without losing their existing benefits. Additionally, the content highlights the importance of academic excellence, writing skills, and intellectual curiosity, which are all mentioned as essential qualities for students to be eligible for the scholarship.
claim :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
evidence_claim :  15 Scholarships in 2026 for High School Students
====================================================================================================
score :  0.98
reason :  The content provides detailed information about the eligibility criteria, application process, and benefits of the National Student Future Scholarship 2026. It also mentions that previous scholarship winners may reapply each year, which supports the claim that students can apply for the scholarship without losing their existing benefits. Additionally, the content highlights the importance of academic excellence, writing skills, and intellectual curiosity, which are all mentioned as essential qualities for students to be eligible for the scholarship.
claim :  Students who have already received other government scholarships can also apply for the National Student Future Scholarship 2026 without losing their existing scholarship benefits.
evidence_claim :  15 Scholarships in 2026 for High School Students
====================================================================================================
*****************contradicting evidence************************
score :  0.0
reason :  The content does not provide any information that contradicts the USER CLAIM. It discusses the National Scholarship Scheme, but does not mention the ₹50,000 directly into bank accounts. The content is irrelevant to the USER CLAIM.
claim :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
evidence_claim :  Instagram
====================================================================================================
score :  0.0
reason :  The content does not provide information that contradicts the factual proposition made by the USER CLAIM. The title mentions the 2026 Ministry of Education, Skills, Youth & Information Scholarships, which is the same topic as the USER CLAIM. However, the content does not mention the specific date (August 10, 2026) or any other detail that would contradict the USER CLAIM.
claim :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
evidence_claim :  Instagram
====================================================================================================
score :  0.0
reason :  The content does not provide information about the USER CLAIM. It discusses the National Scholarship Award, its eligibility criteria, and the next application round, but does not mention the income or academic requirements for the scholarship. Therefore, it does not support or contradict the USER CLAIM.
claim :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
evidence_claim :  TheDream.US National Scholarship for Immigrant Students
====================================================================================================
score :  0.0
reason :  The content does not provide information that supports the factual proposition made by the USER CLAIM. The title mentions 'Top 30 National Scholarships to Apply for in August 2026', which is unrelated to the eligibility criteria stated in the USER CLAIM.
claim :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
evidence_claim :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
====================================================================================================
score :  0.0
reason :  The content provides information that contradicts the factual proposition made by the USER CLAIM. The title of the content, '2026 College Scholarships', does not mention private colleges or distance-learning programs, while the USER CLAIM specifically mentions these types of institutions. Additionally, the content does not mention the eligibility criteria specified in the USER CLAIM, such as being a resident of the US or India, or being 16 years of age or older. The content provides information that contradicts the USER CLAIM in these aspects.
claim :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
evidence_claim :  2026 College Scholarships | Application Deadlines for ...
====================================================================================================
score :  0.0
reason :  The content does not provide any information that contradicts the USER CLAIM. It discusses the National Scholarship Scheme, but does not mention the ₹50,000 directly into bank accounts. The content is irrelevant to the USER CLAIM.
claim :  The Government of India has launched a new National Student Future Scholarship 2026 under which every college student in India will receive ₹50,000 directly into their bank account.
evidence_claim :  Instagram
====================================================================================================
score :  0.0
reason :  The content does not provide information that contradicts the factual proposition made by the USER CLAIM. The title mentions the 2026 Ministry of Education, Skills, Youth & Information Scholarships, which is the same topic as the USER CLAIM. However, the content does not mention the specific date (August 10, 2026) or any other detail that would contradict the USER CLAIM.
claim :  The Ministry of Education announced the National Student Future Scholarship 2026 scheme on August 10, 2026.
evidence_claim :  Instagram
====================================================================================================
score :  0.0
reason :  The content does not provide information about the USER CLAIM. It discusses the National Scholarship Award, its eligibility criteria, and the next application round, but does not mention the income or academic requirements for the scholarship. Therefore, it does not support or contradict the USER CLAIM.
claim :  Students do not need to meet any income or academic requirements to qualify for the National Student Future Scholarship 2026.
evidence_claim :  TheDream.US National Scholarship for Immigrant Students
====================================================================================================
score :  0.0
reason :  The content does not provide information that supports the factual proposition made by the USER CLAIM. The title mentions 'Top 30 National Scholarships to Apply for in August 2026', which is unrelated to the eligibility criteria stated in the USER CLAIM.
claim :  Students between 18 and 25 years of age are automatically eligible for the National Student Future Scholarship 2026.
evidence_claim :  Top 30 National Scholarships to Apply for in August 2026 | Bold.org
====================================================================================================
score :  0.0
reason :  The content provides information that contradicts the factual proposition made by the USER CLAIM. The title of the content, '2026 College Scholarships', does not mention private colleges or distance-learning programs, while the USER CLAIM specifically mentions these types of institutions. Additionally, the content does not mention the eligibility criteria specified in the USER CLAIM, such as being a resident of the US or India, or being 16 years of age or older. The content provides information that contradicts the USER CLAIM in these aspects.
claim :  Students studying in private colleges and distance-learning programs are eligible for the National Student Future Scholarship 2026.
evidence_claim :  2026 College Scholarships | Application Deadlines for ...
====================================================================================================
  ```