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
import { AnalysisResult } from "@/components/AnalysisResult2";
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
    <div>
      <AnalysisResult claim_assessment={[{
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "verdict": "Supported",
        "confidence": 0.9,
        "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
        "supporting_evidence":[{
                "matching_score": 0.9,
                "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
                "claim_id": "1",
                "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
                "evidence_claim": "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
                "user_input_id": "RaviPraj"
              }] ,
        "contradicting_evidence": [{
                "matching_score": 0.9,
                "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
                "claim_id": "1",
                "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
                "evidence_claim": "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
                "user_input_id": "RaviPraj"
              }],
        "user_input_id": "RaviPraj"
      }]} risk_assessments={[{"claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "risk_level": "CRITICAL",
        "risk_score": 90,
        "reason": "The claim has been assessed as TRUE, which is medically inaccurate. Alcohol consumption can impair the immune system and interfere with the effectiveness of COVID-19 vaccines, increasing the risk of severe illness. The high confidence in the factual assessment and the presence of contradicting evidence (3) outweigh the supporting evidence (1), and the content is classified as harmful due to its potential to cause health risks.",
        "user_input_id": "RaviPraj"}
]} urls={["https://www.boomlive.in/health/does-drinking-alcohol-prevent-coronavirus-6935,https://www.boomlive.in/health/does-drinking-alcohol-prevent-coronavirus-6935"]} />
    </div>
    // <AuthShell
    //   title="Create your account"
    //   subtitle="Start analyzing content and verifying claims."
    //   footer={
    //     <>
    //       Already have an account?{" "}
    //       <Link href="/login" className="font-medium text-primary hover:underline">
    //         Sign in
    //       </Link>
    //     </>
    //   }
    // >
    //   <div className="mb-4 flex justify-end">
    //     <ThemeToggle />
    //   </div>
    //   <form onSubmit={submit} className="space-y-4">
    //     <div className="space-y-1.5">
    //       <Label htmlFor="name">Full name</Label>
    //       <div className="relative">
    //         <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    //         <Input name="name" id="name" onChange={handleChange} value={form.name} required placeholder="Jane Doe" className="pl-9" />
    //       </div>
    //     </div>
    //     <div className="space-y-1.5">
    //       <Label htmlFor="email">Email</Label>
    //       <div className="relative">
    //         <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    //         <Input
    //           name="email"
    //           id="email"
    //           value={form.email}
    //           onChange={handleChange}
    //           type="email"
    //           required
    //           placeholder="you@example.com"
    //           className="pl-9"
    //         />
    //       </div>
    //     </div>
    //     <div className="space-y-1.5">
    //       <Label htmlFor="password">Password</Label>
    //       <div className="relative">
    //         <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    //         <Input
    //           id="password"
    //           name="password"
    //           onChange={handleChange}
    //           value={form.password}

    //           type="password"
    //           required
    //           placeholder="Create a password"
    //           className="pl-9"
    //         />
    //       </div>
    //     </div>
    //     <Button type="submit" className="w-full" loading={loading}>
    //       {!loading && <UserPlus className="h-4 w-4" />}
    //       Create account
    //     </Button>
    //     <p className="text-center text-xs text-muted-2">
    //       By continuing you agree to the demo terms and privacy policy.
    //     </p>
    //   </form>
    // </AuthShell>
  );
}
