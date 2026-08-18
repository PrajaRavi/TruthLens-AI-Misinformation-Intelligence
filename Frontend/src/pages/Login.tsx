import { useState } from "react";
import Link from "@/router";
import { useRouter } from "@/router";
import { Mail, Lock, LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/utils/supabase";
import { localUser } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/counterContext";

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {setGetuserSignal,GetuserSignal}=useUser()
  const navigate=useNavigate();
const [form, setForm] = useState({
    email:"",
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
   try {
      setLoading(true)
      let {data,error}:{data:any,error:any}=await supabase.from("sih_users").select("*")
                          .eq('email', form.email) 
  if(data?.length==0){
    toast({
        type: "error",
        title: "Nothing",
        description: "You have not created an account please create an account first"
      });
  }
  else if(error){
    console.log(error)
    toast({
        type: "error",
        title: "Nothing",
        description: "signin failed!!!!"
      });
  }
  else{
    if(data[0].email){
if(data[0].password==form.password){
  setGetuserSignal(!GetuserSignal)
  toast({
        type:"success",
        title: "Nothing",
        description: "User loged in successfully!!!"
      });      
        // Navigate Here
        localStorage.setItem(localUser,data[0]?.email)
        navigate("/");
      }
      else{
        // toast.warn("Invalid credentials")
        toast({
        type: "error",
        title: "Nothing",
        description: "Invalid credentials"
      });
      }

    }
  }
  console.log(error)//->null-->null


      // success toast

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your misinformation intelligence workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="email"
              name="email"
              // value={form.email}
              onChange={handleChange}
              type="email"
              required
              // defaultValue="aditi.rao@truthlens.ai"
              placeholder="you@example.com"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
            name="password"
              value={form.password}
              onChange={handleChange}
              
              id="password"
              type="password"
              required
              // defaultValue="password"
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          {!loading && <LogIn className="h-4 w-4" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
