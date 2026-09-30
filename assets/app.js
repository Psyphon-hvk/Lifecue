const guides=[
 {id:"bleeding",title:"Severe bleeding",cat:"critical",label:"URGENT",meta:"Injury • Immediate response",desc:"Recognise serious blood loss and understand the immediate priorities while professional help is being arranged.",img:"bleeding.jpg",steps:["Check that the scene is safe and use protection if available.","Call for appropriate emergency assistance when bleeding is severe or life-threatening.","Apply firm, direct pressure with suitable dressing or clean material and maintain pressure.","Continue monitoring the person and follow professional emergency instructions."]},
 {id:"burns",title:"Burns",cat:"injury",label:"COMMON",meta:"Injury • Skin and tissue",desc:"Understand immediate first-aid priorities for thermal burns and when a burn needs urgent assessment.",img:"burns.jpg",steps:["Move away from the heat source and make the area safe.","Cool the affected area with cool running water as appropriate; avoid ice directly on the skin.","Remove nearby restrictive items if they are not stuck to the skin.","Seek medical assessment for severe, extensive or concerning burns."]},
 {id:"choking",title:"Choking",cat:"critical",label:"URGENT",meta:"Airway • Immediate response",desc:"A visual sequence for recognising airway obstruction and responding according to the person's condition.",img:"choking.jpg",steps:["Encourage effective coughing when the person can cough and breathe.","If the obstruction is severe, follow current first-aid guidance for appropriate back blows and abdominal or chest thrusts.","If the person becomes unresponsive, activate emergency help and begin appropriate resuscitation steps.","Do not blindly sweep the mouth or give food or drink to clear the obstruction."]},
 {id:"seizures",title:"Seizures",cat:"medical",label:"MEDICAL",meta:"Neurological • Safety",desc:"Focus on protecting the person from injury, timing the event and recognising situations that require emergency help.",img:"seizures.jpg",steps:["Protect the person from nearby hazards and cushion the head if practical.","Do not restrain the person and do not put anything in their mouth.","Time the seizure and stay with the person until they recover.","Seek urgent help when the seizure is prolonged, repeated, associated with serious injury, or occurs in a concerning context."]},
 {id:"fractures",title:"Suspected fractures",cat:"injury",label:"INJURY",meta:"Bones • Movement",desc:"Learn how to protect an injured area and avoid unnecessary movement while arranging appropriate care.",img:"fractures.jpg",steps:["Keep the person and scene safe and assess for other life-threatening problems first.","Avoid unnecessary movement of the injured area.","Support the area in a comfortable position without forcing it straight.","Arrange medical assessment, especially for severe pain, deformity, numbness or loss of circulation."]},
 {id:"fainting",title:"Fainting & collapse",cat:"medical",label:"MEDICAL",meta:"Collapse • Assessment",desc:"A structured approach to a person who has fainted or suddenly collapsed.",img:"fainting.jpg",steps:["Check responsiveness and breathing and make the environment safe.","If the person is unresponsive or not breathing normally, activate emergency assistance and follow resuscitation guidance.","If they recover, keep them safe and monitor for recurrence or other symptoms.","Get medical help for unexplained, repeated or concerning episodes."]},
 {id:"sprains",title:"Sprains & strains",cat:"injury",label:"INJURY",meta:"Soft tissue • Recovery",desc:"Basic immediate-care principles for common soft-tissue injuries.",img:"first-aid.jpg",steps:["Stop the activity and protect the injured area from further harm.","Support the area comfortably and avoid movements that increase pain.","Use appropriate cold therapy with a barrier when suitable; avoid direct ice contact.","Seek assessment when pain, swelling, function or circulation is significantly affected."]},
 {id:"poisoning",title:"Possible poisoning",cat:"critical",label:"URGENT",meta:"Exposure • Toxins",desc:"Immediate priorities when a person may have swallowed, inhaled or been exposed to a harmful substance.",img:"poisoning.jpg",steps:["Move away from ongoing exposure only when it is safe to do so.","Get urgent advice from an appropriate poison or emergency service and identify the substance if possible.","Do not induce vomiting unless specifically instructed by a qualified professional.","Monitor breathing and responsiveness and follow the emergency service's instructions."]}
];


/* LifeCue narrator */
const narrator = {
  utterances: [],
  index: 0,
  speaking: false,
  paused: false,
  currentTitle: "",
};

const narratorBar = document.getElementById("narratorBar");
const narratorPlay = document.getElementById("narratorPlay");
const narratorPause = document.getElementById("narratorPause");
const narratorStop = document.getElementById("narratorStop");
const narratorTitle = document.getElementById("narratorTitle");
const narratorStatus = document.getElementById("narratorStatus");

function narratorSetStatus(title, status) {
  narratorTitle.textContent = title || "LifeCue assistant";
  narratorStatus.textContent = status || "Listen to the guide without reading the screen";
}

function narratorStopAll() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  narrator.utterances = [];
  narrator.index = 0;
  narrator.speaking = false;
  narrator.paused = false;
  narratorPause.textContent = "Pause";
  narratorPlay.textContent = "Start narrator";
  narratorSetStatus("LifeCue assistant", "Listen to the guide without reading the screen");
}

function narratorSpeakNext() {
  if (!narrator.speaking || narrator.index >= narrator.utterances.length) {
    if (narrator.index >= narrator.utterances.length) {
      narrator.speaking = false;
      narrator.play = false;
      narratorPlay.textContent = "Start narrator";
      narratorSetStatus(narrator.currentTitle, "Guide finished");
    }
    return;
  }

  const item = narrator.utterances[narrator.index];
  const u = new SpeechSynthesisUtterance(item);
  u.rate = 0.92;
  u.pitch = 1;
  u.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /^en[-_](GB|KE|US)/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
  if (preferred) u.voice = preferred;

  u.onstart = () => narratorSetStatus(narrator.currentTitle, `Reading step ${narrator.index + 1} of ${narrator.utterances.length}`);
  u.onend = () => {
    narrator.index++;
    narratorSpeakNext();
  };
  u.onerror = () => {
    narrator.speaking = false;
    narratorPlay.textContent = "Start narrator";
    narratorSetStatus(narrator.currentTitle, "Narrator stopped");
  };

  window.speechSynthesis.speak(u);
}

function startNarrator(title, parts) {
  if (!("speechSynthesis" in window)) {
    narratorSetStatus("Narrator unavailable", "Use a browser that supports text to speech");
    return;
  }
  window.speechSynthesis.cancel();
  narrator.currentTitle = title || "LifeCue guide";
  narrator.utterances = parts.filter(Boolean).map(x => x.trim());
  narrator.index = 0;
  narrator.speaking = true;
  narrator.paused = false;
  narratorPlay.textContent = "Restart narrator";
  narratorPause.textContent = "Pause";
  narratorSetStatus(narrator.currentTitle, "Starting");
  narratorSpeakNext();
}

function narratorFromGuide(g) {
  const parts = [
    `You are listening to the ${g.title} guide.`,
    g.desc,
    "Step 1. Make the scene safe. " + g.steps[0],
    "Step 2. Get help early. " + (g.steps[1] || ""),
    "Step 3. Take the immediate action. " + (g.steps[2] || ""),
    "Step 4. Continue monitoring and get further help. " + (g.steps[3] || ""),
    "Important. This is educational first-aid information. If the person is seriously unwell, worsening, unconscious, not breathing normally, or you are unsure what to do, seek appropriate emergency assistance."
  ];
  startNarrator(g.title, parts);
}

function narratorFromVisiblePage() {
  const activeGuide = document.querySelector("#drawerContent .response-step");
  if (activeGuide) {
    const title = document.querySelector("#drawerContent h2")?.textContent || "LifeCue guide";
    const desc = document.querySelector("#drawerContent .drawer-lead")?.textContent || "";
    const steps = [...document.querySelectorAll("#drawerContent .response-step")].map((el, i) => {
      const p = el.querySelector("p")?.textContent || "";
      return `Step ${i + 1}. ${p}`;
    });
    startNarrator(title, [title, desc, ...steps, "Continue monitoring the person and seek appropriate emergency assistance when needed."]);
    return;
  }
  startNarrator("LifeCue assistant", [
    "Welcome to LifeCue.",
    "Choose the emergency guide that matches the situation.",
    "The guide will give you one step at a time.",
    "If the person is seriously unwell, worsening, unconscious, or not breathing normally, seek appropriate emergency assistance."
  ]);
}

narratorPlay.addEventListener("click", () => {
  if (narrator.speaking) {
    if (narrator.index < narrator.utterances.length) {
      window.speechSynthesis.cancel();
      narrator.index = 0;
      narrator.paused = false;
      narratorPause.textContent = "Pause";
      narratorSpeakNext();
    }
    return;
  }
  narratorFromVisiblePage();
});

narratorPause.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) return;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    narrator.paused = true;
    narratorPause.textContent = "Resume";
    narratorSetStatus(narrator.currentTitle, "Paused");
  } else if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    narrator.paused = false;
    narratorPause.textContent = "Pause";
    narratorSetStatus(narrator.currentTitle, `Reading step ${narrator.index + 1} of ${narrator.utterances.length}`);
  }
});

narratorStop.addEventListener("click", narratorStopAll);
document.getElementById("heroNarrator")?.addEventListener("click", narratorFromVisiblePage);
window.addEventListener("beforeunload", narratorStopAll);

const guideGrid=document.getElementById("guideGrid");
function renderGuides(filter="all",q=""){
 const query=q.toLowerCase();
 guideGrid.innerHTML=guides.map(g=>{
   const match=(filter==="all"||g.cat===filter)&&(!query||(g.title+" "+g.meta+" "+g.desc).toLowerCase().includes(query));
   return `<article class="guide-card ${match?"":"hidden-card"}"><div class="guide-img"><img src="assets/images/${g.img}" alt="${g.title} demonstration illustration"><span class="urgency">${g.label}</span></div><div class="guide-body"><div class="guide-meta">● ${g.meta}</div><h3>${g.title}</h3><p>${g.desc}</p><div class="guide-foot"><span class="tag">STEP-BY-STEP</span><button onclick="openGuide('${g.id}')">Open guide →</button></div></div></article>`
 }).join("");
}
renderGuides();
document.getElementById("guideSearch").addEventListener("input",e=>renderGuides(document.querySelector(".filter-pills .active").dataset.filter,e.target.value));
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderGuides(b.dataset.filter,document.getElementById("guideSearch").value)}));

const drawer=document.getElementById("drawer"),content=document.getElementById("drawerContent");
function openGuide(id){
 const g=guides.find(x=>x.id===id); if(!g)return;
 content.innerHTML=`<span class="eyebrow">${g.label} RESPONSE GUIDE</span><h2>${g.title}</h2><p class="drawer-lead">${g.desc}</p><div class="drawer-hero"><img src="assets/images/${g.img}" alt="${g.title} demonstration"></div><div class="drawer-note"><b>Important:</b> This is educational first-aid information. If the person is seriously unwell, worsening, unconscious, not breathing normally, or you are unsure what to do, seek appropriate emergency assistance.</div>${g.steps.map((s,i)=>`<div class="response-step"><span>${String(i+1).padStart(2,"0")}</span><div><h4>${["Make the scene safe","Get help early","Take the immediate action","Monitor and escalate"][i]||"Continue monitoring"}</h4><p>${s}</p></div></div>`).join("")}<button class="primary" style="margin-top:22px" onclick="closeDrawer()">Return to emergency library</button>`;
 drawer.classList.remove("hidden");document.body.style.overflow="hidden";
 narrator.currentTitle = g.title;
 narrator.utterances = [
   `You are listening to the ${g.title} guide.`,
   g.desc,
   "Step 1. " + g.steps[0],
   "Step 2. " + (g.steps[1] || ""),
   "Step 3. " + (g.steps[2] || ""),
   "Step 4. " + (g.steps[3] || ""),
   "Important. This is educational first-aid information. If the person is seriously unwell, worsening, unconscious, not breathing normally, or you are unsure what to do, seek appropriate emergency assistance."
 ].filter(Boolean);
 narrator.index = 0;
 narrator.speaking = false;
 narrator.paused = false;
 narratorPlay.textContent = "Start narrator";
 narratorPause.textContent = "Pause";
 narratorSetStatus(g.title, "Guide ready. Start the narrator to hear every step.");
}
function openContent(type){
 const data={
  safety:["Safety note","LifeCue is a reference concept, not a substitute for a trained responder, clinician or local emergency service. Emergency numbers and clinical protocols vary by location. Use current, locally appropriate guidance."],
  first60:["The first 60 seconds","Start with scene safety. Check responsiveness and breathing, identify immediately life-threatening problems, activate appropriate emergency help and provide the basic first aid you are trained to provide. Reassess continuously rather than assuming the situation is stable."],
  assessment:["How to assess an emergency","Think in priorities rather than trying to diagnose. First make the scene safe. Then check responsiveness and breathing. Look for severe bleeding or other immediately dangerous conditions. Call for appropriate help early and keep monitoring the person."],
  kit:["Preparedness checklist","A useful first-aid kit is organised, accessible and regularly checked. Include supplies appropriate to your household or workplace and keep medicines or specialist items according to professional advice."]
 };
 const [title,lead]=data[type]||data.safety;
 content.innerHTML=`<span class="eyebrow">LIFECUE LEARNING</span><h2>${title}</h2><p class="drawer-lead">${lead}</p><div class="checklist">${["Clean dressings and gauze","Adhesive tape and bandages","Disposable gloves","Antiseptic or wound-cleaning supplies","Scissors and a basic thermometer","A written list of emergency contacts","Any personally required emergency supplies"].map(x=>`<label class="check"><input type="checkbox"> ${x}</label>`).join("")}</div><div class="drawer-note">Review your supplies periodically and replace anything used, expired or damaged. For medicines or specialised equipment, follow advice from a qualified healthcare professional.</div>`;
 drawer.classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeDrawer(){drawer.classList.add("hidden");document.body.style.overflow=""}
document.querySelector(".drawer-close").onclick=closeDrawer;
document.querySelector(".drawer-backdrop").onclick=closeDrawer;
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>{const t=b.dataset.open;if(t==="emergency"){document.getElementById("guides").scrollIntoView({behavior:"smooth"});setTimeout(()=>openGuide("bleeding"),500)}else if(t==="guides"){document.getElementById("guides").scrollIntoView({behavior:"smooth"})}else if(t==="prepare"){document.getElementById("prepare").scrollIntoView({behavior:"smooth"})}else if(t==="search"){document.getElementById("guideSearch").focus();document.getElementById("guides").scrollIntoView({behavior:"smooth"})}else openContent(t)}));
document.querySelectorAll("[data-nav]").forEach(a=>a.addEventListener("click",e=>{if(a.getAttribute("href")==="#")e.preventDefault()}));
document.querySelector(".mobile-toggle").addEventListener("click",()=>{document.querySelector(".main-nav").style.display=document.querySelector(".main-nav").style.display==="flex"?"none":"flex";document.querySelector(".main-nav").style.cssText+=";position:absolute;top:65px;left:0;right:0;background:#ffffff;padding:18px 25px;flex-direction:column;box-shadow:0 12px 30px #31313115;"});
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
