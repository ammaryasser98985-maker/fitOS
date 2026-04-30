import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── Font injection ──────────────────────────────────────────────────────────
if (!document.getElementById("fitos-fonts")) {
  const s = document.createElement("style");
  s.id = "fitos-fonts";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:0}
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    button:active{transform:scale(0.97)}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
    .screen-in{animation:fadeIn 0.3s ease forwards}
  `;
  document.head.appendChild(s);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const F = "'Cairo', sans-serif";
const BG   = "#080810";
const BG2  = "#111118";
const BG3  = "#1a1a25";
const ACC  = "#C8FF00";
const ACC2 = "#FF6B35";
const BDR  = "rgba(255,255,255,0.08)";
const W    = "#fff";
const MUT  = "#888";
const DAYS_AR    = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const DAYS_S     = ["أح","إث","ثل","أر","خم","جم","سب"];
const MONTHS_AR  = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

// ─── Exercise Database ────────────────────────────────────────────────────────
const DB = {
  push_calis:[
    {id:"pu", ar:"ضغط عادي",      en:"Push-ups",            ms:"صدر، تراي، أكتاف",              s:{b:"3×10",i:"4×15",a:"5×20"},  tip:"ظهر مستقيم، صدر يلمس الأرض"},
    {id:"wp", ar:"ضغط عريض",      en:"Wide Push-ups",       ms:"صدر خارجي، أكتاف",              s:{b:"3×10",i:"4×12",a:"5×15"},  tip:"يدين أعرض من الكتف"},
    {id:"dp", ar:"ضغط الماسة",    en:"Diamond Push-ups",    ms:"تراي، صدر داخلي",               s:{b:"3×8", i:"3×12",a:"4×15"},  tip:"يدين قريبين بشكل ماسة"},
    {id:"pp", ar:"ضغط بايك",      en:"Pike Push-ups",       ms:"أكتاف، تراي",                   s:{b:"3×8", i:"3×12",a:"4×15"},  tip:"ورك فوق، راسك نازل للأرض"},
    {id:"di", ar:"ديبس كرسي",     en:"Chair Dips",          ms:"تراي، صدر",                     s:{b:"3×8", i:"3×12",a:"4×15"},  tip:"كوعين للخلف مش للجانب"},
    {id:"ap", ar:"ضغط الرامي",    en:"Archer Push-ups",     ms:"صدر (متقدم)",                   s:{b:null,  i:"3×8 كل جنب",a:"4×12 كل جنب"}, tip:"دراع ممدود جنبك وانت بتنزل"},
  ],
  pull_calis:[
    {id:"au", ar:"بول أب أسترالي",en:"Australian Pull-ups",ms:"ظهر، بايسبس",                   s:{b:"3×10",i:"3×15",a:"4×20"},  tip:"جسمك مستقيم، صدر للعارضة"},
    {id:"pu2",ar:"عقلة أمامية",   en:"Pull-ups",            ms:"لاتس، بايسبس",                  s:{b:"3×3", i:"3×8", a:"4×12"},  tip:"دراعين عرض الكتف، دقن فوق العارضة"},
    {id:"cu", ar:"عقلة خلفية",    en:"Chin-ups",            ms:"بايسبس، لاتس",                  s:{b:"3×3", i:"3×8", a:"4×12"},  tip:"قبضة للوجه، عصر البايسبس"},
    {id:"np", ar:"نيجاتيف بول أب",en:"Negative Pull-ups",  ms:"لاتس، بايسبس",                  s:{b:"3×5", i:"3×8", a:null},    tip:"اطلع بالقفز، نزل ببطء 5 ثواني"},
    {id:"ir", ar:"رو معكوس",      en:"Inverted Row",        ms:"ظهر وسط، بايسبس",               s:{b:"3×10",i:"3×15",a:"4×20"},  tip:"جسمك مستقيم، صدر للعارضة"},
  ],
  legs_calis:[
    {id:"sq", ar:"سكوات",          en:"Squats",              ms:"كوادز، جلوت، هامسترينج",        s:{b:"3×15",i:"4×20",a:"5×25"},  tip:"ركبك فوق صابعك، نزل لتحت الموازي"},
    {id:"lu", ar:"لانج",           en:"Lunges",              ms:"كوادز، جلوت",                   s:{b:"3×10 كل رجل",i:"3×15 كل رجل",a:"4×20 كل رجل"}, tip:"ركبة الأمام فوق كعبك"},
    {id:"bs", ar:"سكوات البلغاري", en:"Bulgarian Split Squat",ms:"كوادز، جلوت",                 s:{b:"3×8 كل رجل",i:"3×12 كل رجل",a:"4×15 كل رجل"}, tip:"رجل الخلف على كرسي، انزل عميق"},
    {id:"js", ar:"سكوات القفز",    en:"Jump Squats",         ms:"كوادز، جلوت، انفجارية",         s:{b:"3×10",i:"3×15",a:"4×20"},  tip:"انزل رافت، هبوط ناعم"},
    {id:"gb", ar:"جسر الجلوت",     en:"Glute Bridges",       ms:"جلوت، هامسترينج",               s:{b:"3×15",i:"3×20",a:"4×25"},  tip:"عصر الجلوت في الأعلى لثانية"},
    {id:"ps", ar:"سكوات المسدس",   en:"Pistol Squat",        ms:"كوادز، جلوت، توازن",            s:{b:null,  i:"3×5 كل رجل",a:"3×8 كل رجل"}, tip:"رجل ممدودة للأمام، انزل ببطء"},
  ],
  core_calis:[
    {id:"pl", ar:"بلانك",          en:"Plank",               ms:"كور كامل",                      s:{b:"3×30ث",i:"3×60ث",a:"3×90ث"}, tip:"ظهر مستقيم، بطن مشدود"},
    {id:"hb", ar:"هولو بودي",      en:"Hollow Body Hold",    ms:"كور، هيب فليكسور",              s:{b:"3×20ث",i:"3×40ث",a:"3×60ث"}, tip:"ضهرك ملصوق بالأرض"},
    {id:"lr", ar:"رفع الأرجل",     en:"Leg Raises",          ms:"بطن سفلي",                      s:{b:"3×10",i:"3×15",a:"4×20"},  tip:"متنزلش الأرجل على الأرض"},
    {id:"mc", ar:"متسلق الجبل",    en:"Mountain Climbers",   ms:"كور، كارديو",                   s:{b:"3×20ث",i:"3×40ث",a:"3×60ث"}, tip:"ورك ثابت، بس الأرجل بتتحرك"},
  ],
  chest_gym:[
    {id:"bp", ar:"بنش برس بار",    en:"Barbell Bench Press", ms:"صدر، تراي، أكتاف",              s:{b:"3×8", i:"4×8", a:"5×5"},   tip:"قوس بسيط في الظهر، قدمين على الأرض"},
    {id:"id", ar:"بنش علوي دمبل",  en:"Incline DB Press",    ms:"صدر علوي، أكتاف",               s:{b:"3×10",i:"3×10",a:"4×10"},  tip:"زاوية 30-45 درجة للصدر العلوي"},
    {id:"cf", ar:"فلاي كيبل",      en:"Cable Flyes",         ms:"صدر (تشكيل)",                   s:{b:"3×12",i:"3×15",a:"4×15"},  tip:"كوع بسيط، حس بالشد في الصدر"},
    {id:"pd", ar:"ماكينة الصدر",   en:"Pec Deck",            ms:"صدر داخلي",                     s:{b:"3×12",i:"3×15",a:"4×15"},  tip:"عصر الصدر في المنتصف"},
    {id:"db", ar:"بنش دمبل",       en:"Dumbbell Press",      ms:"صدر، تراي",                     s:{b:"3×10",i:"3×10",a:"4×10"},  tip:"نطاق حركة كامل"},
  ],
  back_gym:[
    {id:"dl", ar:"ديدليفت",        en:"Deadlift",            ms:"ظهر كامل، هامسترينج، جلوت",     s:{b:"3×5", i:"4×5", a:"5×3"},   tip:"عمود فقري محايد، ادفع الأرض"},
    {id:"br", ar:"رو بار",         en:"Barbell Row",         ms:"لاتس، رومبويدز، بايسبس",        s:{b:"3×8", i:"4×8", a:"4×6"},   tip:"اسحب لصدرك السفلي، عصر الكتفين"},
    {id:"lp", ar:"لات بول داون",   en:"Lat Pulldown",        ms:"لاتس، بايسبس",                  s:{b:"3×12",i:"3×10",a:"4×10"},  tip:"اسحب لصدرك العلوي، مايل للخلف بسيط"},
    {id:"sr", ar:"رو كيبل",        en:"Seated Cable Row",    ms:"ظهر وسط، رومبويدز",             s:{b:"3×12",i:"3×12",a:"4×10"},  tip:"ظهر مستقيم، اسحب الكوعين ورا"},
    {id:"fp", ar:"فيس بول",        en:"Face Pulls",          ms:"أكتاف خلفية، كاف كفة",          s:{b:"3×15",i:"3×15",a:"3×15"},  tip:"اسحب لمستوى الجبهة، دور للخارج"},
  ],
  shoulder_gym:[
    {id:"oh", ar:"أوفرهيد برس",    en:"Overhead Press",      ms:"أكتاف، تراي",                   s:{b:"3×8", i:"4×6", a:"5×5"},   tip:"اضغط الأرداف، ادفع البار فوق الراس"},
    {id:"la", ar:"رفع جانبي",      en:"Lateral Raises",      ms:"دلتا جانبي",                    s:{b:"3×15",i:"3×15",a:"4×15"},  tip:"قود بالكوع، مايل للأمام بسيط"},
    {id:"fr", ar:"رفع أمامي",      en:"Front Raises",        ms:"دلتا أمامي",                    s:{b:"3×12",i:"3×12",a:"3×12"},  tip:"مترجحش الجسم"},
  ],
  legs_gym:[
    {id:"sq2",ar:"سكوات بار",      en:"Barbell Squat",       ms:"كوادز، جلوت، كور",              s:{b:"3×8", i:"4×6", a:"5×5"},   tip:"كسر الموازي، عصر الكور قوي"},
    {id:"lpr",ar:"ليج برس",        en:"Leg Press",           ms:"كوادز، جلوت",                   s:{b:"3×12",i:"3×12",a:"4×10"},  tip:"قدم عالي أكثر جلوت، قدم واطي أكثر كوادز"},
    {id:"rd", ar:"ديدليفت روماني", en:"Romanian Deadlift",   ms:"هامسترينج، جلوت",               s:{b:"3×10",i:"3×10",a:"4×8"},   tip:"ورك للخلف، حس الشد في الهامسترينج"},
    {id:"lc", ar:"ليج كيرل",       en:"Leg Curl",            ms:"هامسترينج",                     s:{b:"3×12",i:"3×12",a:"4×12"},  tip:"عصر في الأعلى ثانية"},
    {id:"le", ar:"ليج اكستنشن",    en:"Leg Extension",       ms:"كوادز (عزل)",                   s:{b:"3×12",i:"3×12",a:"4×15"},  tip:"ثبّت في الأعلى ثانية"},
    {id:"cr", ar:"كالف رايز",      en:"Calf Raises",         ms:"جزء الساق",                     s:{b:"3×15",i:"4×15",a:"4×20"},  tip:"شد كامل في الأسفل، وقفة في الأعلى"},
  ],
  arms_gym:[
    {id:"bc", ar:"كيرل بار",       en:"Barbell Curl",        ms:"بايسبس",                        s:{b:"3×10",i:"3×10",a:"4×10"},  tip:"متحركش الكوع، امتداد كامل"},
    {id:"tp", ar:"بوش داون تراي",  en:"Tricep Pushdown",     ms:"تراي",                          s:{b:"3×12",i:"3×12",a:"4×12"},  tip:"كوعين ثابتين جنب الجسم"},
    {id:"hm", ar:"هامر كيرل",      en:"Hammer Curl",         ms:"بايسبس، براكياليس",             s:{b:"3×12",i:"3×12",a:"3×12"},  tip:"قبضة محايدة طول الوقت"},
    {id:"sk", ar:"سكال كراشرز",    en:"Skull Crushers",      ms:"تراي",                          s:{b:"3×10",i:"3×10",a:"4×10"},  tip:"نزّل للجبهة، الكوع ثابت"},
  ],
};

const META = {
  push_calis: {name:"يوم الدفع 💪",   col:"#FF6B35", groups:["push_calis"],                               core:true},
  pull_calis: {name:"يوم السحب 🏋️",  col:"#00B4D8", groups:["pull_calis"],                               core:true},
  legs_calis: {name:"يوم الأرجل 🦵",  col:"#FFD60A", groups:["legs_calis"],                               core:true},
  full_calis: {name:"تدريب كامل ⚡",  col:"#C8FF00", groups:["push_calis","pull_calis","legs_calis"],      core:true},
  upper_calis:{name:"أعلى الجسم 💪",  col:"#FF6B35", groups:["push_calis","pull_calis"],                  core:true},
  lower_calis:{name:"أسفل الجسم 🦵",  col:"#FFD60A", groups:["legs_calis"],                               core:true},
  push_gym:   {name:"يوم الدفع 💪",   col:"#FF6B35", groups:["chest_gym","shoulder_gym","arms_gym"],       core:false},
  pull_gym:   {name:"يوم السحب 🏋️",  col:"#00B4D8", groups:["back_gym","arms_gym"],                      core:false},
  legs_gym:   {name:"يوم الأرجل 🦵",  col:"#FFD60A", groups:["legs_gym"],                                 core:false},
  full_gym:   {name:"تدريب كامل ⚡",  col:"#C8FF00", groups:["chest_gym","back_gym","legs_gym"],           core:false},
  upper_gym:  {name:"أعلى الجسم 💪",  col:"#FF6B35", groups:["chest_gym","back_gym","shoulder_gym","arms_gym"], core:false},
  lower_gym:  {name:"أسفل الجسم 🦵",  col:"#FFD60A", groups:["legs_gym"],                                 core:false},
  rest:       {name:"يوم راحة 😴",    col:"#555",    groups:[],                                            core:false},
};

function getExercises(key, lvl) {
  const m = META[key];
  if (!m || !m.groups.length) return [];
  const perGroup = m.groups.length === 1 ? 5 : m.groups.length <= 2 ? 4 : 2;
  let out = [];
  m.groups.forEach(g => {
    const filtered = (DB[g]||[]).filter(e => e.s[lvl[0]]);
    out = out.concat(filtered.slice(0, perGroup));
  });
  if (m.core && !m.groups.includes("core_calis")) {
    const core = (DB.core_calis||[]).filter(e => e.s[lvl[0]]).slice(0,2);
    out = out.concat(core);
  }
  return out;
}

function makeSchedule(p) {
  const sfx = p.workoutType === "gym" ? "_gym" : "_calis";
  const pats = {
    3:["full","rest","full","rest","full","rest","rest"],
    4:["upper","lower","rest","upper","lower","rest","rest"],
    5:["push","pull","legs","rest","push","pull","rest"],
    6:["push","pull","legs","rest","push","pull","legs"],
  };
  const pat = pats[Math.min(Math.max(+p.daysPerWeek, 3), 6)] || pats[3];
  return pat.map(x => x==="rest" ? "rest" : x+sfx);
}

function calcNutrition(p) {
  const w=+p.weight, h=+p.height, a=+p.age, d=+p.daysPerWeek;
  const bmr = p.gender==="male" ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161;
  const af   = d<=3 ? 1.375 : d<=5 ? 1.55 : 1.725;
  const tdee = Math.round(bmr * af);
  const target = p.goal==="lose_fat" ? tdee-500 : p.goal==="build_muscle" ? tdee+300 : tdee;
  const protein = Math.round(w * 2);
  const fat     = Math.round(target * 0.25 / 9);
  const carbs   = Math.round((target - protein*4 - fat*9) / 4);
  return {bmr:Math.round(bmr), tdee, target, protein, fat, carbs};
}

// ─── Shared Primitives ────────────────────────────────────────────────────────
const Card = ({children, style={}}) => (
  <div style={{background:BG2, border:`1px solid ${BDR}`, borderRadius:16, padding:16, ...style}}>{children}</div>
);

const Pill = ({children, col=ACC}) => (
  <span style={{background:col+"22", color:col, border:`1px solid ${col}44`, borderRadius:20, padding:"2px 10px", fontSize:12, fontFamily:F, fontWeight:700}}>{children}</span>
);

const Btn = ({children, onClick, disabled, style={}, variant="primary"}) => {
  const base = variant==="primary"
    ? {background:ACC, color:"#000", border:"none"}
    : {background:BG3, color:W, border:`1.5px solid ${BDR}`};
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...base, borderRadius:12, padding:"13px 20px", fontFamily:F, fontWeight:900,
      fontSize:15, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.4:1,
      transition:"opacity 0.2s, transform 0.1s", ...style,
    }}>{children}</button>
  );
};

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({step, setStep, form, setForm, onDone}) {
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const lvls = [{k:"beginner",l:"مبتدئ",d:"أقل من سنة"},{k:"intermediate",l:"متوسط",d:"1-3 سنين"},{k:"advanced",l:"متقدم",d:"+3 سنين"}];
  const goals = [{k:"lose_fat",l:"خسارة دهون 🔥",d:"عايز أنحف وأتقطع"},{k:"build_muscle",l:"بناء عضلات 💪",d:"عايز أكبر وأقوى"},{k:"maintain",l:"حافظ على جسمي ⚖️",d:"ريضة وصحة عامة"}];
  const types = [{k:"calisthenics",l:"كاليستنيكس 🤸",d:"وزن الجسم، مش محتاج أدوات"},{k:"gym",l:"جيم 🏋️",d:"أثقال وماكينات في الجيم"}];
  const dOpts = [{d:3,l:"3 أيام",s:"مبتدئ / مشغول"},{d:4,l:"4 أيام",s:"مثالي للأغلبية"},{d:5,l:"5 أيام",s:"متقدم"},{d:6,l:"6 أيام",s:"احترافي"}];

  const inp = (ph, key, type="text") => (
    <input style={{width:"100%",background:BG3,border:`1.5px solid ${BDR}`,borderRadius:12,
      padding:"13px 14px",color:W,fontFamily:F,fontSize:15,outline:"none",direction:"rtl"}}
      type={type} placeholder={ph} value={form[key]||""} onChange={e=>set(key,e.target.value)}/>
  );

  const optBtn = (selected, onClick, children) => (
    <button onClick={onClick} style={{background:selected?ACC:BG3, border:`1.5px solid ${selected?ACC:BDR}`,
      borderRadius:14, padding:"13px 16px", display:"flex", flexDirection:"column", gap:3,
      cursor:"pointer", textAlign:"right", width:"100%"}}>
      {children}
    </button>
  );

  const STEPS = [
    <>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:64,marginBottom:8}}>⚡</div>
        <h1 style={{color:ACC,fontFamily:F,fontSize:32,fontWeight:900}}>FitOS</h1>
        <p style={{color:MUT,fontFamily:F,fontSize:14,marginTop:4}}>نظامك الذكي للوصول للجسم اللي بتحلم بيه</p>
      </div>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:6}}>اسمك</label>
      <div style={{marginBottom:14}}>{inp("مثلاً: أحمد أو Mona","name")}</div>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:6}}>سنك</label>
      <div style={{marginBottom:14}}>{inp("مثلاً: 22","age","number")}</div>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:8}}>الجنس</label>
      <div style={{display:"flex",gap:8}}>
        {[["male","ذكر 👦"],["female","أنثى 👧"]].map(([k,l])=>(
          <button key={k} onClick={()=>set("gender",k)} style={{flex:1,background:form.gender===k?ACC:BG3,
            border:`1.5px solid ${form.gender===k?ACC:BDR}`,borderRadius:10,padding:10,
            color:form.gender===k?"#000":W,fontFamily:F,fontWeight:700,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </>,
    <>
      <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:6}}>قياساتك 📏</h2>
      <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>محتاجينها نحسبلك السعرات والخطة الصح</p>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:6}}>الوزن (كيلو)</label>
      <div style={{marginBottom:14}}>{inp("مثلاً: 75","weight","number")}</div>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:6}}>الطول (سم)</label>
      <div style={{marginBottom:16}}>{inp("مثلاً: 175","height","number")}</div>
      <label style={{color:MUT,fontFamily:F,fontSize:13,display:"block",marginBottom:8}}>مستواك التدريبي</label>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {lvls.map(l=>optBtn(form.fitnessLevel===l.k,()=>set("fitnessLevel",l.k),<>
          <span style={{fontWeight:800,color:form.fitnessLevel===l.k?"#000":W}}>{l.l}</span>
          <span style={{fontSize:12,color:form.fitnessLevel===l.k?"#000":MUT}}>{l.d}</span>
        </>))}
      </div>
    </>,
    <>
      <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:6}}>هدفك إيه؟ 🎯</h2>
      <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>اختار الهدف الأساسي وهنرتب كل حاجة حواليه</p>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {goals.map(g=>optBtn(form.goal===g.k,()=>set("goal",g.k),<>
          <span style={{fontWeight:800,fontSize:16,color:form.goal===g.k?"#000":W}}>{g.l}</span>
          <span style={{fontSize:13,color:form.goal===g.k?"#000":MUT}}>{g.d}</span>
        </>))}
      </div>
    </>,
    <>
      <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:6}}>نوع التدريب 🤸</h2>
      <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>هتتدرب إيه وفين؟</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {types.map(t=>optBtn(form.workoutType===t.k,()=>set("workoutType",t.k),<>
          <span style={{fontWeight:800,fontSize:16,color:form.workoutType===t.k?"#000":W}}>{t.l}</span>
          <span style={{fontSize:13,color:form.workoutType===t.k?"#000":MUT}}>{t.d}</span>
        </>))}
      </div>
    </>,
    <>
      <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:6}}>كام يوم في الأسبوع؟ 📅</h2>
      <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>اختار عدد أيام التدريب المناسب لجدولك</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {dOpts.map(o=>(
          <button key={o.d} onClick={()=>set("daysPerWeek",o.d)} style={{
            background:form.daysPerWeek===o.d?ACC:BG3, border:`1.5px solid ${form.daysPerWeek===o.d?ACC:BDR}`,
            borderRadius:14, padding:14, cursor:"pointer", textAlign:"center",
          }}>
            <div style={{fontSize:30,fontWeight:900,color:form.daysPerWeek===o.d?"#000":W,fontFamily:F}}>{o.d}</div>
            <div style={{fontSize:12,color:form.daysPerWeek===o.d?"#000":W,fontFamily:F,fontWeight:700}}>أيام</div>
            <div style={{fontSize:11,color:form.daysPerWeek===o.d?"#000":MUT,fontFamily:F}}>{o.s}</div>
          </button>
        ))}
      </div>
      <div style={{background:`${ACC}11`,border:`1px solid ${ACC}33`,borderRadius:12,padding:14}}>
        <p style={{color:ACC,fontFamily:F,fontWeight:700,fontSize:13,marginBottom:4}}>💡 العلم بيقول:</p>
        <p style={{color:"#ccc",fontFamily:F,fontSize:12,lineHeight:1.7}}>
          أفضل تكرار هو 2-3 مرات للعضلة في الأسبوع. {form.daysPerWeek} أيام هيعطيك نتايج ممتازة حسب أبحاث ACSM.
        </p>
      </div>
    </>,
  ];

  const canNext = () => {
    if(step===1) return form.name && form.age;
    if(step===2) return form.weight && form.height;
    return true;
  };

  return (
    <div style={{background:BG,minHeight:"100%",display:"flex",flexDirection:"column"}} dir="rtl">
      <div style={{flex:1,padding:"20px 20px 100px",overflowY:"auto"}}>
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[1,2,3,4,5].map(i=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?ACC:BG3,transition:"background 0.3s"}}/>
          ))}
        </div>
        <div className="screen-in">{STEPS[step-1]}</div>
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"14px 20px",
        background:BG,borderTop:`1px solid ${BDR}`,display:"flex",gap:10}}>
        {step>1 && <Btn variant="secondary" onClick={()=>setStep(s=>s-1)} style={{flex:"0 0 80px"}}>← رجوع</Btn>}
        <Btn onClick={()=>step===5?onDone():setStep(s=>s+1)} disabled={!canNext()} style={{flex:1,fontSize:16}}>
          {step===5?"🚀 ابدأ رحلتك!":"التالي →"}
        </Btn>
      </div>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({profile, nutrition, weekDays, todayType, workoutLog, streak, onStart}) {
  const today = new Date();
  const m = META[todayType] || META.rest;
  const exercises = getExercises(todayType, profile.fitnessLevel||"beginner");
  const goalLabel = {lose_fat:"خسارة دهون 🔥",build_muscle:"بناء عضلات 💪",maintain:"حافظ ⚖️"};

  return (
    <div style={{overflowY:"auto",height:"100%",paddingBottom:80}} className="screen-in">
      {/* Header */}
      <div style={{padding:"18px 20px 0",background:`linear-gradient(180deg,${BG2} 0%,${BG} 100%)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <p style={{color:MUT,fontFamily:F,fontSize:13}}>
              {DAYS_AR[today.getDay()]}، {today.getDate()} {MONTHS_AR[today.getMonth()]}
            </p>
            <h1 style={{color:W,fontFamily:F,fontSize:23,fontWeight:900,marginTop:4}}>
              يلا يا {profile.name}! 👊
            </h1>
          </div>
          <div style={{textAlign:"center",background:BG3,borderRadius:12,padding:"8px 14px",border:`1px solid ${BDR}`}}>
            <div style={{fontSize:18}}>🔥</div>
            <div style={{color:ACC,fontFamily:F,fontWeight:900,fontSize:20,lineHeight:1}}>{streak}</div>
            <div style={{color:MUT,fontFamily:F,fontSize:10}}>سلسلة</div>
          </div>
        </div>

        {/* Week strip */}
        <div style={{display:"flex",gap:5,margin:"14px 0",overflowX:"auto",paddingBottom:4}}>
          {weekDays.map((d,i)=>{
            const dm = META[d.type]||META.rest;
            const isRest = d.type==="rest";
            return (
              <div key={i} onClick={()=>!isRest&&onStart(d.type)} style={{
                flex:"0 0 44px",borderRadius:12,padding:"7px 0",textAlign:"center",
                background:d.isToday?ACC:d.done?dm.col+"33":BG3,
                border:`1.5px solid ${d.isToday?ACC:d.done?dm.col:BDR}`,
                cursor:isRest?"default":"pointer",transition:"all 0.2s",
              }}>
                <div style={{color:d.isToday?"#000":MUT,fontFamily:F,fontSize:10,fontWeight:700}}>{DAYS_S[i]}</div>
                <div style={{fontSize:15,lineHeight:1.5}}>{d.done?"✅":isRest?"😴":"💪"}</div>
                <div style={{color:d.isToday?"#000":W,fontFamily:F,fontSize:11,fontWeight:d.isToday?900:400}}>{d.date.getDate()}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"4px 20px"}}>
        {/* Today's workout card */}
        <div style={{background:`linear-gradient(135deg,${m.col}25,${m.col}08)`,
          border:`1.5px solid ${m.col}44`,borderRadius:20,padding:18,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <p style={{color:MUT,fontFamily:F,fontSize:12}}>تمرين النهارده</p>
              <h2 style={{color:W,fontFamily:F,fontSize:20,fontWeight:900,margin:"4px 0"}}>{m.name}</h2>
              {todayType!=="rest"&&<p style={{color:MUT,fontFamily:F,fontSize:12}}>{exercises.length} تمرين</p>}
            </div>
            {todayType!=="rest" && (
              <Btn onClick={()=>onStart(todayType)} style={{padding:"10px 18px",fontSize:14}}>ابدأ ⚡</Btn>
            )}
          </div>
          {todayType!=="rest" ? (
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {exercises.slice(0,4).map(e=>(
                <span key={e.id} style={{background:"rgba(0,0,0,0.3)",color:"#ddd",borderRadius:8,
                  padding:"3px 9px",fontFamily:F,fontSize:12}}>{e.ar}</span>
              ))}
              {exercises.length>4&&<span style={{color:MUT,fontFamily:F,fontSize:12}}>+{exercises.length-4}</span>}
            </div>
          ):(
            <p style={{color:"#aaa",fontFamily:F,fontSize:13,marginTop:6}}>
              ⚡ العضلات بتكبر في الراحة مش في التمرين فقط!
            </p>
          )}
        </div>

        {/* Nutrition */}
        {nutrition && (
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{color:W,fontFamily:F,fontWeight:800,fontSize:16}}>هدفك اليومي 🍽️</h3>
              <Pill>{goalLabel[profile.goal]}</Pill>
            </div>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{color:ACC,fontFamily:F,fontSize:42,fontWeight:900,lineHeight:1}}>{nutrition.target}</div>
              <div style={{color:MUT,fontFamily:F,fontSize:13}}>سعر حراري يومي</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{l:"بروتين",v:nutrition.protein+"g",c:"#FF6B35"},{l:"كارب",v:nutrition.carbs+"g",c:"#FFD60A"},{l:"دهون",v:nutrition.fat+"g",c:"#00B4D8"}].map(x=>(
                <div key={x.l} style={{background:BG3,borderRadius:10,padding:10,textAlign:"center",border:`1px solid ${x.c}33`}}>
                  <div style={{color:x.c,fontFamily:F,fontWeight:800,fontSize:18}}>{x.v}</div>
                  <div style={{color:MUT,fontFamily:F,fontSize:11}}>{x.l}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Science tip */}
        <Card style={{background:`${ACC}10`,border:`1px solid ${ACC}33`}}>
          <p style={{color:ACC,fontFamily:F,fontWeight:700,fontSize:13,marginBottom:5}}>🧬 نصيحة علمية</p>
          <p style={{color:"#ccc",fontFamily:F,fontSize:12,lineHeight:1.75}}>
            {todayType==="rest"
              ? "الراحة مهمة زي التمرين. في الراحة بتحصل Muscle Protein Synthesis اللي هي الأساس في بناء العضلة."
              : "Progressive Overload هو مفتاح النتايج. حاول تزود تكرار أو وزن كل أسبوعين حتى لو بسيط."}
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────
function WorkoutTab({dayType, fitnessLevel, checks, setChecks, onDone, onBack}) {
  const exercises = getExercises(dayType, fitnessLevel||"beginner");
  const m = META[dayType]||META.rest;
  const done = exercises.filter(e=>checks[e.id]).length;
  const prog = exercises.length ? done/exercises.length : 0;
  const lvlK = (fitnessLevel||"beginner")[0];

  return (
    <div style={{overflowY:"auto",height:"100%",paddingBottom:20}} className="screen-in">
      <div style={{padding:"14px 20px",background:`linear-gradient(135deg,${m.col}33,${BG})`,
        position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:ACC,
          fontFamily:F,fontSize:14,cursor:"pointer",marginBottom:6,padding:0}}>← رجوع</button>
        <h2 style={{color:W,fontFamily:F,fontSize:21,fontWeight:900,marginBottom:8}}>{m.name}</h2>
        <div style={{background:BG3,borderRadius:8,height:6,overflow:"hidden"}}>
          <div style={{width:`${prog*100}%`,height:"100%",background:ACC,borderRadius:8,transition:"width 0.4s"}}/>
        </div>
        <p style={{color:MUT,fontFamily:F,fontSize:12,marginTop:4}}>{done}/{exercises.length} تمرين</p>
      </div>

      <div style={{padding:"6px 20px"}}>
        {exercises.map(ex=>(
          <div key={ex.id} style={{
            background:checks[ex.id]?`${m.col}20`:BG2,
            border:`1.5px solid ${checks[ex.id]?m.col:BDR}`,
            borderRadius:16,padding:15,marginBottom:11,transition:"all 0.3s",
          }}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <button onClick={()=>setChecks(c=>({...c,[ex.id]:!c[ex.id]}))} style={{
                width:28,height:28,borderRadius:8,flexShrink:0,marginTop:3,
                background:checks[ex.id]?ACC:"transparent",
                border:`2px solid ${checks[ex.id]?ACC:MUT}`,
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,transition:"all 0.2s",color:"#000",fontWeight:900,
              }}>{checks[ex.id]?"✓":""}</button>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div>
                    <div style={{color:checks[ex.id]?MUT:W,fontFamily:F,fontWeight:800,fontSize:15,
                      textDecoration:checks[ex.id]?"line-through":"none"}}>{ex.ar}</div>
                    <div style={{color:"#666",fontFamily:F,fontSize:11}}>{ex.en}</div>
                  </div>
                  <span style={{background:m.col+"33",color:m.col,borderRadius:8,padding:"3px 10px",
                    fontFamily:F,fontWeight:800,fontSize:13,flexShrink:0,marginRight:8}}>
                    {ex.s[lvlK]}
                  </span>
                </div>
                <div style={{marginBottom:6}}>
                  <span style={{background:BG3,color:"#aaa",borderRadius:6,padding:"2px 8px",fontFamily:F,fontSize:11}}>
                    💪 {ex.ms}
                  </span>
                </div>
                <div style={{background:BG3,borderRadius:8,padding:"6px 10px"}}>
                  <span style={{color:ACC,fontFamily:F,fontSize:11,fontWeight:700}}>💡 </span>
                  <span style={{color:"#bbb",fontFamily:F,fontSize:11}}>{ex.tip}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {prog>0 && (
          <Btn onClick={onDone} style={{width:"100%",fontSize:16,padding:16,marginTop:6}}>
            {prog===1?"🔥 تمرين خلص! احتسبه":"✅ اعتبرهولي خلصت"}
          </Btn>
        )}
      </div>
    </div>
  );
}

// ─── Plan Tab ─────────────────────────────────────────────────────────────────
function PlanTab({schedule, fitnessLevel, workoutLog, onView}) {
  const today = new Date();
  return (
    <div style={{overflowY:"auto",height:"100%",paddingBottom:80}} className="screen-in">
      <div style={{padding:20}}>
        <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:4}}>خطة الأسبوع 📅</h2>
        <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>اضغط على أي يوم تمرين تشوف التمارين وتبدأ</p>
        {schedule.map((dt,i)=>{
          const m = META[dt]||META.rest;
          const d = new Date(today); d.setDate(today.getDate()-today.getDay()+i);
          const key = d.toISOString().split("T")[0];
          const done = workoutLog[key]?.completed;
          const isToday = i===today.getDay();
          const isRest = dt==="rest";
          const cnt = isRest ? 0 : getExercises(dt,fitnessLevel||"beginner").length;
          return (
            <div key={i} onClick={()=>!isRest&&onView(dt)} style={{
              background:isToday?`${ACC}15`:BG2,
              border:`1.5px solid ${isToday?ACC:done?m.col:BDR}`,
              borderRadius:16,padding:16,marginBottom:9,cursor:isRest?"default":"pointer",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:12,background:m.col+"33",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                    {done?"✅":isRest?"😴":"💪"}
                  </div>
                  <div>
                    <div style={{color:W,fontFamily:F,fontWeight:800,fontSize:15}}>
                      {DAYS_AR[i]} {isToday&&<span style={{color:ACC,fontSize:12}}>(النهارده)</span>}
                    </div>
                    <div style={{color:isRest?MUT:m.col,fontFamily:F,fontSize:13}}>{m.name}</div>
                    {!isRest&&<div style={{color:MUT,fontFamily:F,fontSize:11}}>{cnt} تمرين</div>}
                  </div>
                </div>
                {!isRest&&<div style={{color:ACC,fontSize:18}}>←</div>}
              </div>
            </div>
          );
        })}
        <Card style={{background:`${ACC}10`,border:`1px solid ${ACC}33`,marginTop:12}}>
          <p style={{color:ACC,fontFamily:F,fontWeight:700,fontSize:13,marginBottom:6}}>🧬 ليه الخطة دي مبنية كده؟</p>
          <p style={{color:"#ccc",fontFamily:F,fontSize:12,lineHeight:1.75}}>
            الخطة مبنية على Progressive Overload وتكرار كل مجموعة عضلية 2-3 مرات/أسبوع.
            ده الأعلى فعالية علمياً لبناء العضل وتحسين القوة حسب Journal of Strength and Conditioning Research.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────
function ProgressTab({profile, weeklyW, setWeeklyW, workoutLog, schedule}) {
  const [inp, setInp] = useState("");
  const today = new Date();

  const weekWorkouts = schedule.filter(d=>d!=="rest").length;
  let weekDone = 0;
  for(let i=0;i<7;i++){
    const d=new Date(today); d.setDate(today.getDate()-today.getDay()+i);
    const key=d.toISOString().split("T")[0];
    if(workoutLog[key]?.completed) weekDone++;
  }

  const alreadyDone = weeklyW.length>0 &&
    (new Date()-new Date(weeklyW[weeklyW.length-1].date)) < 6*24*60*60*1000;

  const submit = async () => {
    if(!inp||isNaN(+inp)) return;
    const entry = {date:today.toISOString().split("T")[0],weight:+inp,week:weeklyW.length+1};
    const nw = [...weeklyW, entry];
    setWeeklyW(nw);
    try { await window.storage.set("fitos_weights", JSON.stringify(nw)); } catch(e){}
    setInp("");
  };

  const chartData = weeklyW.slice(-10).map(w=>({name:`أ${w.week}`,وزن:w.weight}));
  const first = weeklyW[0]?.weight, last = weeklyW[weeklyW.length-1]?.weight;
  const chg = first&&last ? (last-first).toFixed(1) : null;

  return (
    <div style={{overflowY:"auto",height:"100%",paddingBottom:80}} className="screen-in">
      <div style={{padding:20}}>
        <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:4}}>تقدمك 📈</h2>
        <p style={{color:MUT,fontFamily:F,fontSize:13,marginBottom:18}}>تابع وزنك ونتايجك كل أسبوع</p>

        {/* Week completion */}
        <Card style={{marginBottom:14}}>
          <h3 style={{color:W,fontFamily:F,fontWeight:800,fontSize:15,marginBottom:12}}>الأسبوع ده 🗓️</h3>
          <div style={{display:"flex",gap:5,marginBottom:10}}>
            {schedule.map((dt,i)=>{
              const d=new Date(today); d.setDate(today.getDate()-today.getDay()+i);
              const key=d.toISOString().split("T")[0];
              const done=workoutLog[key]?.completed;
              const isRest=dt==="rest";
              const dm=META[dt]||META.rest;
              return (
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontFamily:F,fontSize:9,color:MUT,marginBottom:3}}>{DAYS_S[i]}</div>
                  <div style={{height:34,borderRadius:8,
                    background:done?ACC:isRest?BG3:BG3,
                    border:`1.5px solid ${done?ACC:BDR}`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
                    {done?"✅":isRest?"💤":"○"}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{color:MUT,fontFamily:F,fontSize:13,textAlign:"center"}}>
            {weekDone} من {weekWorkouts} تمارين ✨
          </p>
        </Card>

        {/* Weight input */}
        <Card style={{marginBottom:14}}>
          <h3 style={{color:W,fontFamily:F,fontWeight:800,fontSize:15,marginBottom:4}}>سجّل وزنك الأسبوعي ⚖️</h3>
          <p style={{color:MUT,fontFamily:F,fontSize:12,marginBottom:12}}>
            وزّن نفسك الصبح على الريق في نفس اليوم كل أسبوع
          </p>
          {alreadyDone ? (
            <div style={{background:`${ACC}20`,border:`1px solid ${ACC}44`,borderRadius:10,padding:12,textAlign:"center"}}>
              <p style={{color:ACC,fontFamily:F,fontWeight:700}}>
                ✅ وزن هذا الأسبوع: {weeklyW[weeklyW.length-1].weight} كيلو
              </p>
              <p style={{color:MUT,fontFamily:F,fontSize:12,marginTop:4}}>ارجع الأسبوع الجاي</p>
            </div>
          ):(
            <div style={{display:"flex",gap:8}}>
              <input style={{flex:1,background:BG3,border:`1.5px solid ${BDR}`,borderRadius:12,
                padding:"12px 14px",color:W,fontFamily:F,fontSize:15,outline:"none",direction:"rtl"}}
                type="number" placeholder="وزنك بالكيلو" value={inp} onChange={e=>setInp(e.target.value)}/>
              <Btn onClick={submit} style={{padding:"12px 16px",whiteSpace:"nowrap"}}>سجّل</Btn>
            </div>
          )}
        </Card>

        {/* Chart */}
        {weeklyW.length>=2 && (
          <Card style={{marginBottom:14}}>
            <h3 style={{color:W,fontFamily:F,fontWeight:800,fontSize:15,marginBottom:14}}>سجل الوزن 📉</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke={MUT} tick={{fill:MUT,fontFamily:F,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis stroke={MUT} tick={{fill:MUT,fontFamily:F,fontSize:11}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                <Tooltip contentStyle={{background:BG3,border:`1px solid ${BDR}`,borderRadius:8,fontFamily:F,color:W}} labelStyle={{color:MUT}}/>
                <Line type="monotone" dataKey="وزن" stroke={ACC} strokeWidth={2.5} dot={{fill:ACC,r:4}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
            {chg!==null && (
              <div style={{background:BG3,borderRadius:10,padding:12,textAlign:"center",marginTop:12}}>
                <p style={{color:MUT,fontFamily:F,fontSize:12,marginBottom:4}}>التغيير الإجمالي</p>
                <p style={{color:+chg<0?"#4CAF50":+chg>0?ACC2:ACC,fontFamily:F,fontWeight:900,fontSize:26}}>
                  {+chg>0?"+":""}{chg} كيلو
                </p>
                <p style={{color:MUT,fontFamily:F,fontSize:11,marginTop:4}}>
                  {profile.goal==="lose_fat"&&+chg<0?"✅ في الطريق الصح!"
                  :profile.goal==="build_muscle"&&+chg>0?"✅ الوزن بيزيد ممتاز!":""}
                </p>
              </div>
            )}
          </Card>
        )}

        <Card style={{background:`${ACC}10`,border:`1px solid ${ACC}33`}}>
          <p style={{color:ACC,fontFamily:F,fontWeight:700,fontSize:13,marginBottom:5}}>💡 نصيحة المتابعة</p>
          <p style={{color:"#ccc",fontFamily:F,fontSize:12,lineHeight:1.75}}>
            الوزن بيتذبذب ±2 كيلو يومياً بسبب الماء والأكل. دايماً قارن وزنك الأسبوعي مش اليومي.
            النتيجة الحقيقية بتظهر بعد 4-6 أسابيع من الاتساق.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({profile, nutrition, onReset}) {
  const [conf, setConf] = useState(false);
  const lvlL = {beginner:"مبتدئ",intermediate:"متوسط",advanced:"متقدم"};
  const goalL = {lose_fat:"خسارة دهون 🔥",build_muscle:"بناء عضلات 💪",maintain:"حافظ ⚖️"};
  const days = Math.floor((new Date()-new Date(profile.startDate||Date.now()))/86400000);

  return (
    <div style={{overflowY:"auto",height:"100%",paddingBottom:80}} className="screen-in">
      <div style={{padding:20}}>
        <h2 style={{color:W,fontFamily:F,fontSize:22,fontWeight:900,marginBottom:18}}>ملفك 👤</h2>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{width:76,height:76,borderRadius:"50%",background:`${ACC}33`,
            border:`3px solid ${ACC}`,margin:"0 auto 10px",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:38}}>{profile.gender==="male"?"🧑":"👩"}</div>
          <h3 style={{color:W,fontFamily:F,fontWeight:900,fontSize:22}}>{profile.name}</h3>
          <p style={{color:MUT,fontFamily:F,fontSize:13,marginTop:3}}>بدأت منذ {days} يوم</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {l:"الوزن",v:profile.weight+" كيلو"},{l:"الطول",v:profile.height+" سم"},
            {l:"العمر",v:profile.age+" سنة"},{l:"المستوى",v:lvlL[profile.fitnessLevel]},
            {l:"هدفك",v:goalL[profile.goal]},{l:"أيام التمرين",v:profile.daysPerWeek+" أيام/أسبوع"},
          ].map(s=>(
            <Card key={s.l}>
              <div style={{color:MUT,fontFamily:F,fontSize:11,marginBottom:4}}>{s.l}</div>
              <div style={{color:W,fontFamily:F,fontWeight:800,fontSize:14}}>{s.v}</div>
            </Card>
          ))}
        </div>
        {nutrition&&(
          <Card style={{marginBottom:14}}>
            <h3 style={{color:W,fontFamily:F,fontWeight:800,fontSize:15,marginBottom:12}}>معدلاتك الغذائية 🧬</h3>
            {[
              {l:"BMR (الحرق في الراحة)",v:nutrition.bmr+" سعر",c:MUT},
              {l:"TDEE (الحرق اليومي)",v:nutrition.tdee+" سعر",c:ACC2},
              {l:"هدفك اليومي",v:nutrition.target+" سعر",c:ACC},
              {l:"بروتين يومي",v:nutrition.protein+"g",c:"#FF6B35"},
              {l:"كاربوهيدرات",v:nutrition.carbs+"g",c:"#FFD60A"},
              {l:"دهون صحية",v:nutrition.fat+"g",c:"#00B4D8"},
            ].map((r,i,arr)=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                marginBottom:i<arr.length-1?10:0,paddingBottom:i<arr.length-1?10:0,
                borderBottom:i<arr.length-1?`1px solid ${BDR}`:"none"}}>
                <span style={{color:MUT,fontFamily:F,fontSize:13}}>{r.l}</span>
                <span style={{color:r.c,fontFamily:F,fontWeight:800,fontSize:14}}>{r.v}</span>
              </div>
            ))}
          </Card>
        )}
        {!conf
          ? <Btn variant="secondary" onClick={()=>setConf(true)} style={{width:"100%"}}>🔄 إعادة تعيين من الأول</Btn>
          : <div style={{background:"#FF4D2E22",border:"1px solid #FF4D2E66",borderRadius:12,padding:16}}>
              <p style={{color:W,fontFamily:F,fontWeight:700,textAlign:"center",marginBottom:12}}>متأكد؟ هيتمسح كل بياناتك!</p>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="secondary" onClick={()=>setConf(false)} style={{flex:1}}>لا، ارجع</Btn>
                <button onClick={onReset} style={{flex:1,background:"#FF4D2E",color:W,border:"none",
                  borderRadius:12,padding:"13px 20px",fontFamily:F,fontWeight:900,fontSize:15,cursor:"pointer"}}>
                  نعم، امسح
                </button>
              </div>
            </div>
        }
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({active, setActive}) {
  const tabs = [{k:"home",l:"الرئيسية",ic:"🏠"},{k:"plan",l:"الخطة",ic:"📅"},{k:"progress",l:"تقدمك",ic:"📈"},{k:"profile",l:"ملفك",ic:"👤"}];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:BG2,
      borderTop:`1px solid ${BDR}`,display:"flex",padding:"8px 0 12px",zIndex:100}}>
      {tabs.map(t=>(
        <button key={t.k} onClick={()=>setActive(t.k)} style={{flex:1,background:"none",border:"none",
          cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"3px 0"}}>
          <span style={{fontSize:20}}>{t.ic}</span>
          <span style={{color:active===t.k?ACC:MUT,fontFamily:F,fontSize:10,fontWeight:active===t.k?700:400,transition:"color 0.2s"}}>{t.l}</span>
          {active===t.k&&<div style={{width:4,height:4,borderRadius:"50%",background:ACC,marginTop:-2}}/>}
        </button>
      ))}
    </div>
  );
}

// ─── Notification ─────────────────────────────────────────────────────────────
function Notif({msg, type="success"}) {
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
      zIndex:1000,background:type==="success"?ACC:"#FF4D2E",borderRadius:12,
      padding:"12px 20px",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",whiteSpace:"nowrap",
      animation:"pop 0.3s ease forwards"}}>
      <span style={{color:type==="success"?"#000":W,fontFamily:F,fontWeight:700,fontSize:14}}>{msg}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FitOS() {
  const [screen, setScreen] = useState("loading");
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({name:"",age:"",gender:"male",weight:"",height:"",
    fitnessLevel:"beginner",goal:"build_muscle",workoutType:"calisthenics",daysPerWeek:4});
  const [schedule, setSchedule] = useState([]);
  const [workoutLog, setWorkoutLog] = useState({});
  const [weeklyW, setWeeklyW] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [viewWorkout, setViewWorkout] = useState(null);
  const [checks, setChecks] = useState({});
  const [notif, setNotif] = useState(null);

  const showNotif = (msg,type="success") => {
    setNotif({msg,type});
    setTimeout(()=>setNotif(null),3000);
  };

  useEffect(()=>{
    (async()=>{
      try {
        const pr = await window.storage.get("fitos_profile");
        if(pr){
          const p = JSON.parse(pr.value);
          setProfile(p); setSchedule(makeSchedule(p));
          try{const lg=await window.storage.get("fitos_log"); if(lg) setWorkoutLog(JSON.parse(lg.value));} catch(e){}
          try{const ww=await window.storage.get("fitos_weights"); if(ww) setWeeklyW(JSON.parse(ww.value));} catch(e){}
          setScreen("main");
        } else setScreen("onboarding");
      } catch(e){ setScreen("onboarding"); }
    })();
  },[]);

  const onDoneOnboard = async () => {
    const p={...form,age:+form.age,weight:+form.weight,height:+form.height,
      daysPerWeek:+form.daysPerWeek,startDate:new Date().toISOString()};
    setProfile(p); setSchedule(makeSchedule(p));
    try { await window.storage.set("fitos_profile", JSON.stringify(p)); } catch(e){}
    setScreen("main"); setActiveTab("home");
  };

  const onReset = async () => {
    try { await window.storage.delete("fitos_profile"); await window.storage.delete("fitos_log"); await window.storage.delete("fitos_weights"); } catch(e){}
    setProfile({}); setWorkoutLog({}); setWeeklyW([]); setSchedule([]);
    setStep(1); setForm({name:"",age:"",gender:"male",weight:"",height:"",
      fitnessLevel:"beginner",goal:"build_muscle",workoutType:"calisthenics",daysPerWeek:4});
    setScreen("onboarding");
  };

  const today = new Date();
  const todayType = schedule[today.getDay()] || "rest";
  const nutrition = profile.weight ? calcNutrition(profile) : null;

  const getStreak = () => {
    let s=0;
    const d=new Date();
    for(let i=0;i<30;i++){
      const dd=new Date(d); dd.setDate(d.getDate()-i);
      const key=dd.toISOString().split("T")[0];
      const dayType=schedule[dd.getDay()];
      if(dayType==="rest"||dayType===undefined) continue;
      if(workoutLog[key]?.completed) s++;
      else if(i>0) break;
    }
    return s;
  };

  const weekDays = Array.from({length:7},(_,i)=>{
    const d=new Date(today); d.setDate(today.getDate()-today.getDay()+i);
    const key=d.toISOString().split("T")[0];
    const type=schedule[i]||"rest";
    return {date:d, type, key, done:workoutLog[key]?.completed, isToday:i===today.getDay()};
  });

  const startWorkout = (dt) => { setViewWorkout(dt); setChecks({}); };

  const finishWorkout = async () => {
    const key=today.toISOString().split("T")[0];
    const nl={...workoutLog,[key]:{completed:true,dayType:viewWorkout,checks,ts:Date.now()}};
    setWorkoutLog(nl);
    try { await window.storage.set("fitos_log", JSON.stringify(nl)); } catch(e){}
    showNotif("🔥 تمام! تمرين اليوم خلص!");
    setViewWorkout(null); setActiveTab("home");
  };

  if(screen==="loading") return (
    <div style={{background:BG,minHeight:"100%",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:60}}>⚡</div>
      <p style={{color:ACC,fontFamily:F,fontSize:18}}>جاري التحميل...</p>
    </div>
  );

  if(screen==="onboarding") return (
    <Onboarding step={step} setStep={setStep} form={form} setForm={setForm} onDone={onDoneOnboard}/>
  );

  return (
    <div style={{background:BG,minHeight:"100%",display:"flex",flexDirection:"column",
      maxWidth:440,margin:"0 auto",position:"relative"}} dir="rtl">
      {notif && <Notif msg={notif.msg} type={notif.type}/>}

      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",height:"calc(100vh - 70px)"}}>
        {viewWorkout ? (
          <WorkoutTab dayType={viewWorkout} fitnessLevel={profile.fitnessLevel}
            checks={checks} setChecks={setChecks} onDone={finishWorkout} onBack={()=>setViewWorkout(null)}/>
        ) : activeTab==="home" ? (
          <HomeTab profile={profile} nutrition={nutrition} weekDays={weekDays}
            todayType={todayType} workoutLog={workoutLog} streak={getStreak()} onStart={startWorkout}/>
        ) : activeTab==="plan" ? (
          <PlanTab schedule={schedule} fitnessLevel={profile.fitnessLevel}
            workoutLog={workoutLog} onView={(dt)=>{startWorkout(dt); setActiveTab("home");}}/>
        ) : activeTab==="progress" ? (
          <ProgressTab profile={profile} weeklyW={weeklyW} setWeeklyW={setWeeklyW} workoutLog={workoutLog} schedule={schedule}/>
        ) : (
          <ProfileTab profile={profile} nutrition={nutrition} onReset={onReset}/>
        )}
      </div>

      {!viewWorkout && <BottomNav active={activeTab} setActive={setActiveTab}/>}
    </div>
  );
}
