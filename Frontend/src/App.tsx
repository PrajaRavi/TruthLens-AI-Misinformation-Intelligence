import { Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import { AnalyzeClient } from "@/pages/Analyze";
import Claims from "@/pages/Claims";
import History from "@/pages/History";
import Insights from "@/pages/Insights";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Sources from "@/pages/Sources";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { supabase } from "./utils/supabase";
import { localUser } from "./lib/constants";
import { useContext, useEffect, useState } from "react";
import { UserContext,User} from "./context/counterContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/Error";
import { PrivateComponent } from "./components/PrivateComp";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}


export function App() {
  const {toast}=useToast()
  const navigate=useNavigate();
  let [user,setUser]=useState<User|undefined>({id:1,email:"",name:""})
  let [GetuserSignal,setGetuserSignal]=useState<boolean>(false)
  async function GetUser(){
     try {
       let {data,error}:{data:any,error:any}=await supabase.from("sih_users").select("*")
                                 .eq('email', localStorage.getItem(localUser)) // Filters where the email column matches
                                  // Optional: Returns a single object instead of an array of objects
         console.log(data)//->array-->empty
         if(data?.length==0){
           // toast.error("You have not created an account please create an account first")
           toast({
         type: "error",
         title: "Nothing",
         description: "This user already exist in database please login"
       });
         }
         else if(error){
           console.log(error)
          //  toast.error("signin failed")
          toast({
        type: "error",
        title: "Nothing",
        description: "signin failed"});
         }
         else{
           if(data[0].email){
             console.log(data[0])
       setUser(data[0])
           }
         }
     } catch (error) {
       console.log(error)
     }
   }
  
   useEffect(()=>{
     if(localStorage.getItem(localUser)){
       GetUser();
     }
    },[GetuserSignal])
   
  
     
  return (
    <UserContext.Provider value={{user , setUser,setGetuserSignal,GetuserSignal}}>

    <ThemeProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Landing />} />

          <Route  element={<PrivateComponent/>}>
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/analyze" element={<DashboardLayout><AnalyzeClient /></DashboardLayout>} />
          <Route path="/claims" element={<DashboardLayout><Claims /></DashboardLayout>} />
          <Route path="/history" element={<DashboardLayout><History /></DashboardLayout>} />
          <Route path="/insights" element={<DashboardLayout><Insights /></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/sources" element={<DashboardLayout><Sources /></DashboardLayout>} />

          </Route>
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
    </UserContext.Provider>
  );
}
