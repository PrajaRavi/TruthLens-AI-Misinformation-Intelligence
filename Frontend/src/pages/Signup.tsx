import { useState } from "react";
import Link from "@/router";
import { useRouter } from "@/router";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme";
import { useToast } from "@/components/ui/Toast";
import {supabase} from "../utils/supabase"
import { useNavigate } from "react-router-dom";
import AnalysisResultDemo from "@/components/AnalysisResult2";
import { AreaChart } from "@/components/charts/AreaChart1";
import { DashBoardTableMe, FactCheckReport } from "@/components/DataTable2";
export interface DataPoint {
  x: string;
  y: number;
}
 // adjust import path as needed

export const sampleFactCheckData: FactCheckReport[] = [
  {
    id: "rep-001",
    title: "COVID-19 Home Remedies & Miracle Cures",
    input_type: "social_media_post",
    risk_score: 92,
    risk_level: "CRITICAL",
    confidence: 0.95,
    date: "2026-08-18",
    sources: [
      "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters",
      "https://www.cdc.gov/coronavirus/2019-ncov/index.html",
    ],
    claims: [
      {
        claim_id: "claim-101",
        claim_text: "Drinking high-proof alcohol kills the coronavirus inside the respiratory system.",
        verdict: "False",
        confidence: 0.98,
        reason: "Ingesting alcohol does not sanitize internal organs and poses serious toxicological health risks.",
        supporting_evidence: [],
        contradicting_evidence: [
          { source: "WHO Medical Advisory", snippet: "Consuming alcohol does not protect against COVID-19 and can be dangerous." },
        ],
        user_input_id: "RaviPraj",
      },
      {
        claim_id: "claim-102",
        claim_text: "Holding your breath for 10 seconds without coughing proves you do not have pulmonary damage.",
        verdict: "Misleading",
        confidence: 0.91,
        reason: "This self-test is not clinically validated and cannot accurately diagnose viral respiratory infections.",
        supporting_evidence: [],
        contradicting_evidence: [],
        user_input_id: "RaviPraj",
      },
    ],
    risk_assessment: [
      {
        claim_id: "claim-101",
        claim_text: "Drinking high-proof alcohol kills the coronavirus inside the respiratory system.",
        risk_level: "CRITICAL",
        risk_score: 95,
        reason: "High risk of acute alcohol poisoning and severe organ injury if individuals act on this guidance.",
        user_input_id: "RaviPraj",
      },
      {
        claim_id: "claim-102",
        claim_text: "Holding your breath for 10 seconds without coughing proves you do not have pulmonary damage.",
        risk_level: "MEDIUM",
        risk_score: 55,
        reason: "May lead to false sense of security, delaying proper medical diagnosis and intervention.",
        user_input_id: "RaviPraj",
      },
    ],
  },
  {
    id: "rep-002",
    title: "5G Cellular Radiation & Environmental Impacts",
    input_type: "article_link",
    risk_score: 48,
    risk_level: "MEDIUM",
    confidence: 0.87,
    date: "2026-08-19",
    sources: [
      "https://www.fcc.gov/engineering-technology/electromagnetic-compatibility-division/radio-frequency-safety-0",
    ],
    claims: [
      {
        claim_id: "claim-201",
        claim_text: "5G mmWave frequencies cause immediate cellular mutations in humans.",
        verdict: "Unsupported",
        confidence: 0.89,
        reason: "5G radiation is non-ionizing and lacks sufficient energy to alter DNA structures directly.",
        supporting_evidence: [],
        contradicting_evidence: [],
        user_input_id: "RaviPraj",
      },
    ],
    risk_assessment: [
      {
        claim_id: "claim-201",
        claim_text: "5G mmWave frequencies cause immediate cellular mutations in humans.",
        risk_level: "MEDIUM",
        risk_score: 48,
        reason: "Spreads health anxiety and potential vandalism against local telecommunication infrastructure.",
        user_input_id: "RaviPraj",
      },
    ],
  },
  {
    id: "rep-003",
    title: "Global Supply Chain Logistics & Electric Vehicles",
    input_type: "text_prompt",
    risk_score: 12,
    risk_level: "LOW",
    confidence: 0.94,
    date: "2026-08-20",
    sources: [
      "https://www.iea.org/reports/global-ev-outlook-2025",
    ],
    claims: [
      {
        claim_id: "claim-301",
        claim_text: "Global lithium-ion battery manufacturing expanded over 20% in the last fiscal year.",
        verdict: "Supported",
        confidence: 0.96,
        reason: "Industry production metrics align with reported market growth figures.",
        supporting_evidence: [
          { source: "IEA Global EV Outlook", snippet: "Battery cell production grew ~22% year-over-year." },
        ],
        contradicting_evidence: [],
        user_input_id: "RaviPraj",
      },
    ],
    risk_assessment: [
      {
        claim_id: "claim-301",
        claim_text: "Global lithium-ion battery manufacturing expanded over 20% in the last fiscal year.",
        risk_level: "LOW",
        risk_score: 12,
        reason: "Factual statement regarding industrial manufacturing metrics; poses zero public risk.",
        user_input_id: "RaviPraj",
      },
    ],
  },
];

export const sampleActivityData: DataPoint[] = [
  { x: "2026-07-22", y: 12 },
  { x: "2026-07-23", y: 19 },
  { x: "2026-07-24", y: 15 },
  { x: "2026-07-25", y: 28 },
  { x: "2026-07-26", y: 22 },
  { x: "2026-07-27", y: 34 },
  { x: "2026-07-28", y: 41 },
  { x: "2026-07-29", y: 38 },
  { x: "2026-07-30", y: 45 },
  { x: "2026-07-31", y: 52 },
  { x: "2026-08-01", y: 48 },
  { x: "2026-08-02", y: 61 },
  { x: "2026-08-03", y: 55 },
  { x: "2026-08-04", y: 67 },
  { x: "2026-08-05", y: 73 },
  { x: "2026-08-06", y: 62 },
  { x: "2026-08-07", y: 80 },
  { x: "2026-08-08", y: 88 },
  { x: "2026-08-09", y: 76 },
  { x: "2026-08-10", y: 95 },
  { x: "2026-08-11", y: 89 },
  { x: "2026-08-12", y: 104 },
  { x: "2026-08-13", y: 112 },
  { x: "2026-08-14", y: 98 },
  { x: "2026-08-15", y: 125 },
  { x: "2026-08-16", y: 118 },
  { x: "2026-08-17", y: 132 },
  { x: "2026-08-18", y: 140 },
  { x: "2026-08-19", y: 128 },
  { x: "2026-08-20", y: 145 },
];
export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


async function submit(e: React.FormEvent) {
    e.preventDefault();
  setLoading(true);

    try {
      
      let {data,error}=await supabase.from("sih_users").insert({name:form.name,email:form.email,password:form.password})
      if(error){
        if(error.code=="23505"){
          toast({
        type: "error",
        title: "Nothing",
        description: "This user already exist in database please login"
      });
    }
    else{
          toast({
        type: "error",
        title: "Nothing",
        description: error?.message
      });
          
        }
  
      }
      else{
toast({
        type: "success",
        title: "Nothing",
        description: "user created successfully!!!!"
      });
        setForm({
        name: "",
        email: "",
        password:"",
        
      });
        
      setTimeout(() => {
        navigate(`/login`)
      }, 1000);

    }
      console.log(form);

      // success toast

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    
  }

  return (
    // <DashBoardTableMe data={sampleFactCheckData} />
    <AuthShell
      title="Create your account"
      subtitle="Start analyzing content and verifying claims."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input name="name" id="name" onChange={handleChange} value={form.name} required placeholder="Jane Doe" className="pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              placeholder="you@example.com"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              name="password"
              onChange={handleChange}
              value={form.password}

              type="password"
              required
              placeholder="Create a password"
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          {!loading && <UserPlus className="h-4 w-4" />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-2">
          By continuing you agree to the demo terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  );
}
