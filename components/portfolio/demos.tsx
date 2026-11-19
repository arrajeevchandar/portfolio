"use client";
import "./demo-detail.css";
import { useState } from "react";
import { Check, ChevronRight, Fingerprint, Layers, LockKeyhole, Mic, Captions, ScanFace, RotateCcw, ScanLine, Sparkles, Upload, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Waveform({ variant = 0 }: { variant?: number }) {
  return <div className="waveform" aria-hidden="true">{Array.from({ length: 43 }, (_, i) => <i key={i} style={{ height: `${Math.round(10 + Math.abs(Math.sin(i * 0.8 + variant) * Math.cos(i * 0.27)) * 90)}%`, animationDelay: `${(i * -0.067).toFixed(3)}s` }} />)}</div>;
}

const journalSignals = [
  { id: "voice", label: "Voice", icon: Mic, description: "Hear the pauses and changes in energy across a recording." },
  { id: "speech", label: "Speech", icon: Captions, description: "Read the words from the recording in a timestamped transcript." },
  { id: "visual", label: "Visual", icon: ScanFace, description: "Sample frames at intervals and retain frames suitable for analysis." },
] as const;

export function SolenneDemo({ step }: { step: number }) {
  const [signal, setSignal] = useState("voice");
  const SignalIcon = journalSignals.find(item => item.id === signal)?.icon ?? Mic;
  return <div className="demo-rig solenne-rig" data-step={step}>
    <div className="float-chip chip-one"><span className="tiny-dot" />{step === 0 ? "A PRIVATE MOMENT" : step === 1 ? "SIGNALS, CONNECTED" : "READY TO REFLECT"}</div>
    <div className="app-window solenne-window"><div className="app-top"><span className="solenne-brand">solenne<span>✳</span></span><span className="app-avatar">R</span></div><div className="app-body"><span className="micro">YOUR DAILY SPACE</span><h4>{step === 0 ? <>Some things are<br />better said.</> : step === 1 ? <>A little more<br />understanding.</> : <>A moment.<br />A new perspective.</>}</h4><div className="journal-visual"><span className="journal-orbit orbit-one"/><span className="journal-orbit orbit-two"/><span className="journal-orbit orbit-three"/><div className="journal-core"><SignalIcon size={26}/></div><span className="journal-time">{step === 0 ? "YOUR STORY STARTS HERE" : step === 1 ? "FINDING THE SIGNAL" : "REFLECTION, DELIVERED"}</span></div><Tabs value={signal} onValueChange={setSignal} className="signal-tabs">
      <TabsList aria-label="Explore Solenne signals">
        {journalSignals.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}
      </TabsList>
      {journalSignals.map(item => <TabsContent key={item.id} value={item.id}>
        <div className="sample-signal">
          {item.id === "voice" && <Waveform/>}
          {item.id === "speech" && <div className="transcript-sample"><time>00:04</time><q>I took a walk after class.</q></div>}
          {item.id === "visual" && <div className="frame-sample" aria-label="Three illustrative frame samples">
            {["00:00", "00:02", "00:04"].map(time => <span key={time}><ScanFace size={16}/><small>{time}</small></span>)}
          </div>}
        </div>
        <p className="signal-explanation">{item.description}</p>
      </TabsContent>)}
    </Tabs><div className="app-action"><span>{step === 2 ? "Reflection ready" : step === 1 ? "Analysis pipeline" : "Video journal"}</span>{step === 2 && <Check size={17}/>}</div></div><div className="app-bottom"><LockKeyhole size={11}/> NON-CLINICAL REFLECTION PROTOTYPE</div></div>
    <div className="floating-panel solenne-insight"><Sparkles size={18}/><span className="micro">{step === 2 ? "REFLECTION PROMPT" : "ONE CONNECTED PIPELINE"}</span><p>{step === 2 ? "What made you pause today?" : "Speech + voice + visual signals"}</p><div className="panel-line"/><span>{step === 2 ? "A gentle invitation to look inward." : "Processed in a background worker."}</span></div>
  </div>;
}

export function CortexDemo({ step }: { step: number }) {
  const [checked, setChecked] = useState(false);
  return <div className="demo-rig cortex-rig" data-step={step}><div className="float-chip chip-one"><span className="tiny-dot"/>CLASSROOM → CLARITY</div><div className="app-window cortex-window"><div className="app-top"><span className="cortex-brand"><Layers size={21}/> CortexEdu</span><span className="app-avatar">RC</span></div><div className="app-body"><span className="micro">ILLUSTRATIVE STUDENT VIEW</span><h4>A good day<br />to learn something.</h4><div className="class-banner"><span className="micro">YOUR CLASSROOM</span><h5>Software Engineering</h5><span>Interactive class · Faculty & students</span><div className="avatar-stack"><b>R</b><b>A</b><b>S</b><b>J</b></div></div><div className="class-panels"><div className="attendance-panel"><ScanLine size={24}/><span>Class check-in</span><strong role="status">{checked ? "You're checked in" : "Ready when you are"}</strong><button onClick={() => setChecked(!checked)}>{checked ? "Reset demo" : "Try check-in"}{checked ? <Check size={14}/> : <ChevronRight size={14}/>}</button></div><div className="assessment-panel"><span className="micro">ASSESSMENT FLOW</span><div className="assessment-steps"><span className={step >= 0 ? "done" : ""}>Classwork</span><i/><span className={step >= 1 ? "done" : ""}>Calculate</span><i/><span className={step >= 2 ? "done" : ""}>Review</span></div></div></div><div className="reward-row"><span className="reward-icon">✳</span><div><strong>{step === 2 || checked ? "Participation recognized" : "Every contribution matters"}</strong><span>Student token reward system</span></div></div></div></div><div className="floating-panel cortex-float"><span className="micro">LESS REPETITION</span><strong>More room<br />for learning.</strong><span>Classes. Attendance. Assessment.</span></div></div>;
}

export function DoChainDemo({ step }: { step: number }) {
  const [trial, setTrial] = useState(0);
  const actions = ["Connect demo wallet", "Store sample document", "Record sample receipt", "Restart simulation"];
  const feedback = [
    "Local simulation. Uses a sample document.",
    "Demo wallet connected. The sample file is ready to store.",
    "Sample content ID created. The receipt can now reference it.",
    "Sample receipt recorded with the wallet identity and content ID.",
  ];
  return <div className="demo-rig dochain-rig" data-step={step}><div className="float-chip chip-one"><span className="tiny-dot"/>A TRANSACTION YOU CAN TRACE</div><div className="app-window dochain-window"><div className="app-top"><span className="dochain-brand"><Fingerprint size={24}/> DoChain</span><span className="network-pill">POLYGON TESTNET</span></div><div className="app-body"><span className="micro">DOCUMENT TRANSACTION / DEMO</span><h4>Trust starts<br />with a clear trail.</h4><div className="document-visual"><div className="document-sheet"><span>DOC / 001</span><h5>document.pdf</h5><div/><div/><div/><b>{trial === 3 ? <Check/> : <LockKeyhole/>}</b></div><div className="document-shadow"/></div><div className="chain-stages" aria-label="Simulation progress">
      <span className={trial >= 1 ? "done" : ""}><Wallet size={15}/>Wallet</span><i/>
      <span className={trial >= 2 ? "done" : ""}><Upload size={15}/>IPFS</span><i/>
      <span className={trial >= 3 ? "done" : ""}><Layers size={15}/>Contract</span>
    </div>
    <button className="demo-primary" onClick={() => setTrial(previous => (previous + 1) % actions.length)}>
      {actions[trial]}{trial === 3 ? <RotateCcw size={15}/> : <ChevronRight size={15}/>}
    </button>
    <p role="status" className="demo-disclaimer">{feedback[trial]}</p></div></div><div className="floating-panel chain-receipt"><span className="micro">{step === 2 ? "TRANSACTION FLOW" : "SEPARATION OF CONCERNS"}</span><div><span>Identity</span><strong>MetaMask</strong></div><div><span>File storage</span><strong>IPFS / Pinata</strong></div><div><span>Transaction</span><strong>Solidity</strong></div><p><Check size={13}/>{step === 2 ? "Conceptual flow complete" : "Files off-chain. Logic on-chain."}</p></div></div>;
}

export function FitnessDemo({ step }: { step: number }) {
  const [goal, setGoal] = useState("strength");
  const plans = [
    { id: "strength", label: "Strength", title: "STRONGER.", lead: "BUILD", sessions: ["Movement preparation", "Strength practice", "Recovery"] },
    { id: "endurance", label: "Endurance", title: "FURTHER.", lead: "GO", sessions: ["Warm-up", "Steady movement", "Cool-down"] },
    { id: "balance", label: "Balance", title: "BALANCE.", lead: "FIND", sessions: ["Mobility", "Balance practice", "Recovery"] },
  ];
  return <div className="demo-rig fitness-rig" data-step={step}><div className="float-chip chip-one"><span className="tiny-dot"/>A PLAN THAT STARTS WITH YOU</div><div className="app-window fitness-window"><div className="app-top"><span className="fitness-brand">AI<span>FITNESS</span></span><Sparkles size={20}/></div><div className="app-body"><span className="micro">PERSONALIZED BY DESIGN</span><h4>Your starting point.<br />Your next step.</h4><Tabs value={goal} onValueChange={setGoal} className="goal-tabs">
      <TabsList aria-label="Preview a fitness goal">{plans.map(plan =>
        <TabsTrigger key={plan.id} value={plan.id}>{plan.label}</TabsTrigger>)}</TabsList>
      {plans.map((plan, i) => <TabsContent key={plan.id} value={plan.id}>
        <div className="fitness-metric"><span>{plan.lead}</span><strong>{plan.title}</strong><Waveform variant={i * 2}/></div>
        <div className="plan-preview"><span className="micro">SAMPLE SESSION</span>
          {plan.sessions.map((session, j) => <div key={session}><span>0{j + 1}</span><strong>{session}</strong></div>)}
        </div>
      </TabsContent>)}
    </Tabs><p className="demo-disclaimer">Preview only · No live AI call or exercise prescription.</p></div></div><div className="floating-panel fitness-float"><Sparkles size={17}/><span className="micro">CONTEXT → GENERATION</span><p>Individual inputs.<br />Personalized output.</p><span>Powered by Gemini in the project.</span></div></div>;
}
