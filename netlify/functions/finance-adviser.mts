import type { Config, Context } from "@netlify/functions";
import { runChain, ARRON_VOICE } from "../lib/ai-chain.js";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(v:unknown,max:number)=>String(v??"").trim().slice(0,max);
export default async(req:Request,_context:Context)=>{
 if(req.method!=="POST")return json({error:"POST only"},405);
 try{
  const body=await req.json().catch(()=>({}));const question=clean(body.question,5000);
  if(!question)return json({error:"Ask a finance question first."},400);
  const system=`${ARRON_VOICE}
You are the Pleading Sanity Finance Adviser: a neutral UK consumer-credit education and preparation assistant.
Rules:
- Explain options plainly; do not claim to be a lender, broker, solicitor, accountant or FCA-authorised adviser.
- Never guarantee approval, acceptance, a rate, or savings.
- Never tell someone to falsify income, documents, employment, expenses or identity.
- Put affordability and total cost before commission or conversion.
- Prefer soft-search eligibility checks before full applications where available.
- Warn that multiple full applications in a short period can affect a credit record.
- Distinguish factual provider information from estimates and user-entered quotes.
- Do not recommend high-cost credit simply because it is easier to obtain; mention safer alternatives when relevant.
- For current lender rates or live availability, say the user must verify on the lender/comparison site's current eligibility checker.
- If the user appears to be in financial difficulty, signpost free debt guidance rather than encouraging new borrowing.
Answer in concise UK English with: 1) what matters, 2) what to compare, 3) safest next step. This tool is free-first and not a sales funnel.`;
  const result=await runChain(system,[{role:"user",content:question}],{maxTokens:700});
  return json({reply:result.text,provider:result.provider,model:result.model});
 }catch(error){console.error("Finance adviser error:",error);return json({error:"The adviser is unavailable right now. Try again shortly."},503)}
};
export const config:Config={path:"/api/finance-adviser"};