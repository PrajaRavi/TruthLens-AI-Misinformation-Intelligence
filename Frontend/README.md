# TruthLens AI — Vite React edition

This is a standalone Vite + React + Tailwind CSS conversion of the supplied Next.js dashboard. It preserves every dashboard, analysis, history, sources, reports, settings, and authentication screen, along with the shared components, theme switching, mock data, uploads, and interactive demo flows.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm install`.
3. Run `npm run dev` and open the local address Vite prints.

Use `npm run build` to create a production build in `dist/`.

## What changed from Next.js

- Next App Router pages are now React Router routes in `src/App.tsx`.
- `next/link` and `next/navigation` are replaced by the small compatibility layer in `src/router.tsx`.
- The Next root layout, metadata, API route, Drizzle configuration, and database code were intentionally excluded: this is a frontend-only Vite application.
- The original Tailwind 4 theme and shared component styles are retained in `src/styles.css`.

```text
==>Storing everything in db and retrieving it for showing in dashboard
-->create table-> user_input(id,text,user_id,input_type)

->for now i will use InMemorySaver checkpointer

1. claims(id[auto genrated],text,user_input_id)

2. web_evidences(source,title,claim[text],content,url,relevant_score[between 0-1],user_input_id)

3. google_fact_evidences(source,claim[text,id],rating,user_input_id)

4. claim_assessment(claim_text,verdict,confidense[between 0-1],reason,supporting_evidence_count,contradict_evidence_count,user_input_id)

5. supporting_evidence(matching_score,reason,claim[id,text],evidence_claim,user_input_id)

6. contradicting_evidence(matching_score,reason,claim[id,text],evidence_claim,user_input_id)

7. hive_assessment(claim[id,text],reason,harmful,user_input_id)

8. risk_assessment(claim_text,risk_level,risk_score[between 0-100],reason,user_input_id)

*************************************confusion hi confusion hai[BE ALERT]***********************************
-->now 
dashboard overview===>
***actual user_input table-->user_input(id[auto genrated from 1],text,user_id,created_at[auto genrated],input_type,risk_level) 
-->here for the calculating {{risk_level}} i have to do something in all the risk_assessment  object and have to calculate a single risk_score[now donut part and overall Total analysis completed]

==>High risk claims->
  ***risk_assessment(claim_text,risk_level,risk_score[between 0-100],reason,user_input_id)
  ->now fetch all the rows with specific input_id and filter risk_level=="High"

==>source_chked->supporting_evidence+contradicting_evidence
==>avg_Confidence->fetch all the claims_assesment and find avg of confidence

********problem in claim explorer********
->showing contraditing and supporting document of particular claim.




```
