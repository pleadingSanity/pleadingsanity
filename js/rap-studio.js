const $ = (id) => document.getElementById(id);
const form=$("rap-form"), topic=$("rap-topic"), source=$("rap-source"), result=$("rap-result"), status=$("rap-status");
const mode=$("rap-mode"), mic=$("rap-mic"), save=$("rap-save"), copy=$("rap-copy"), speak=$("rap-speak"), battle=$("rap-battle");
let last="";
function setStatus(t){status.textContent=t;}
async function create(modeName){
 const brief=topic.value.trim(), rap=source.value.trim();
 if(!brief && !rap){topic.focus();return;}
 setStatus("Arron is warming the mic…"); form.querySelector("button[type=submit]").disabled=true;
 try{
  const res=await fetch("/api/rap",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({mode:modeName,topic:brief,rap})});
  const data=await res.json();
  if(!res.ok) throw new Error(data.error||"The booth went quiet.");
  last=data.reply||""; result.textContent=last; save.hidden=false; copy.hidden=false; speak.hidden=!window.speechSynthesis;
  setStatus("Built by the AI family · "+(data.provider||"Arron"));
  localStorage.setItem("ps-rap-last",JSON.stringify({text:last,topic:brief,at:Date.now()}));
 }catch(e){setStatus(e.message||"Try again.");}finally{form.querySelector("button[type=submit]").disabled=false;}
}
form.addEventListener("submit",e=>{e.preventDefault();create(mode.value);});
battle.addEventListener("click",()=>{mode.value="battle";create("battle");});
$("rap-buff").addEventListener("click",()=>{mode.value="buff";create("buff");});
$("rap-load").addEventListener("click",()=>{try{const x=JSON.parse(localStorage.getItem("ps-rap-last")||"null");if(x){source.value=x.text;topic.value=x.topic||"";setStatus("Last rap loaded.");}}catch{}});
copy.addEventListener("click",async()=>{if(last) await navigator.clipboard.writeText(last);setStatus("Copied to your clipboard.");});
save.addEventListener("click",()=>{localStorage.setItem("ps-rap-saved",last);setStatus("Saved on this device.");});
speak.addEventListener("click",()=>{if(!last||!speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(last);u.lang="en-GB";u.rate=.9;speechSynthesis.speak(u);});
if(mic){
 const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Rec){mic.hidden=true;}else{
  const rec=new Rec();rec.lang="en-GB";rec.interimResults=true;
  rec.onstart=()=>{mic.textContent="⏹ Stop voice";setStatus("Listening…");};
  rec.onend=()=>{mic.textContent="🎙️ Speak your bars";};
  rec.onerror=()=>setStatus("Voice input was unavailable. You can type instead.");
  rec.onresult=e=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;source.value=t;};
  mic.addEventListener("click",()=>{try{rec.start();}catch{rec.stop();}});
 }
}
