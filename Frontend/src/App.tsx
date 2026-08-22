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
import Signup, { DataPoint, sampleFactCheckData } from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { supabase } from "./utils/supabase";
import { localUser } from "./lib/constants";
import { useContext, useEffect, useState } from "react";
import { UserContext, User } from "./context/counterContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/Error";
import { PrivateComponent } from "./components/PrivateComp";
import { DashboardStats, RiskDistribution } from "./types";
import { formatDate } from "./lib/utils";
import { KeyObject } from "crypto";
import { FactCheckReport } from "./components/DataTable2";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export function App() {
  const { toast } = useToast();
  const navigate = useNavigate();

  let [user, setUser] = useState<User | undefined>({
    id: 1,
    email: "",
    name: "",
  });

  let [sampleActivityData, setsampleActivityData] = useState<DataPoint[]>([
    { x: "2026-05-05", y: 23 },
    { x: "2026-05-06", y: 40 },
    { x: "2026-05-07", y: 23 },
    { x: "2026-05-08", y: 80 },
    { x: "2026-05-09", y: 20 },
    { x: "2026-05-10", y: 13 },
    { x: "2026-05-11", y: 30 },
  ]);


  let [GetuserSignal, setGetuserSignal] = useState<boolean>(false);
  let [riskDistribution, setriskDistribution] = useState<RiskDistribution[]>([
    { count: 200, level: "high" },
    { count: 100, level: "critical" },
  ]);
  let [GoogleFactEvidence, setGoogleFactEvidence] = useState<any[]>([]);
  let [WebEvidence, setWebEvidence] = useState<any[]>([]);
  let [AllUserInputId, setAllUserInputId] = useState<any[]>(); //this is of particular user
  let [FilterdClaimAssessment, setFilterdClaimAssessment] = useState<any[]>([]);
  let [claim_map, setclaim_map] = useState(new Map<string, any[]>());
  let [risk_asses_map, setrisk_asses_map] = useState(new Map<string, any[]>());
  let [GlobalLoadingState, setGlobalLoadingState] = useState<boolean>(false);

  let [RecentAnalysis, setRecentAnalysis] =
    useState<FactCheckReport[]>([]); //this  is the recent analysis

  let [dashboardStats, setdashboardStats] = useState<DashboardStats>({
    averageConfidence: 0,
    highRiskClaims: 0,
    sourcesChecked: 0,
    totalAnalyses: 0,
  });

  async function GetUser() {
    try {
      setGlobalLoadingState(true);
      let { data, error }: { data: any; error: any } = await supabase
        .from("sih_users")
        .select("*")
        .eq("email", localStorage.getItem(localUser)); // Filters where the email column matches
      // Optional: Returns a single object instead of an array of objects
      console.log(data); //->array-->empty
      if (data?.length == 0) {
        // toast.error("You have not created an account please create an account first")
        toast({
          type: "error",
          title: "Nothing",
          description: "This user already exist in database please login",
        });
      } else if (error) {
        console.log(error);
        //  toast.error("signin failed")
        toast({
          type: "error",
          title: "Nothing",
          description: "signin failed",
        });
      } else {
        if (data[0].email) {
          await fetchAllUserInput(data[0].id);
          console.log(data[0]);
          setUser(data[0]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setGlobalLoadingState(false);
    }
  }

  async function FetchUrlFromEvidence(
    user_input_id: string,
  ): Promise<FetchUrlFromWebEvidenceReturnType> {
    try {
      let urls: string[] = [];
      let { data, error }: { data: any; error: any } = await supabase
        .from("google_fact_evidence")
        .select("*")
        .eq("user_input_id", user_input_id);

      if (error || data.length == 0) return { urls: [], data: [] };
      setGoogleFactEvidence(data);
      for (let item of data) {
        urls.push(item.url);
      }
      return { urls, data };
    } catch (error) {
      console.log(error);
      console.log("error in FetchUrlFromEvidenceAndWebEvidence");
      return { urls: [], data: [] };
    }
  }

  interface FetchUrlFromWebEvidenceReturnType {
    urls: string[];
    data: any[];
  }
  async function FetchUrlFromWebEvidence(
    user_input_id: string,
  ): Promise<FetchUrlFromWebEvidenceReturnType> {
    try {
      let urls: string[] = [];
      let { data, error }: { data: any; error: any } = await supabase
        .from("web_evidence")
        .select("*")
        .eq("user_input_id", user_input_id);

      if (error || data.length == 0) return { urls: [], data: [] };
      setWebEvidence(data);

      for (let item of data) {
        urls.push(item.url);
      }
      return { urls, data };
    } catch (error) {
      console.log(error);
      console.log("error in FetchUrlFromEvidenceAndWebEvidence");
      return { urls: [], data: [] };
    }
  }

  
  async function FetchSupportingDocOfClaim(claim_id: string): Promise<any[]> {
    let { data, error }: { data: any; error: any } = await supabase
      .from("supporting_evidence")
      .select("*")
      .eq("claim_id", claim_id);

    if (error || data.length == 0) return [];
    return data;
  }
  async function FetchContradictDocOfClaim(claim_id: string) {
    let { data, error }: { data: any; error: any } = await supabase
      .from("contradicting_evidence")
      .select("*")
      .eq("claim_id", claim_id);

    if (error || data.length == 0) return [];
    return data;
  }
  async function FetchClaimAssessment(user_input_id: string) {
    let { data, error }: { data: any; error: any } = await supabase
      .from("claim_assessment")
      .select("*")
      .eq("user_input_id", user_input_id);

    if (error || data.length == 0) return [];
    return data;
  }

  async function fetchAllRiskAssesmentBy_user_input_id(user_input_id: string) {
    try {
      let { data, error }: { data: any; error: any } = await supabase
        .from("risk_assessment")
        .select("*")
        .eq("user_input_id", user_input_id);

      if (error || data.length == 0) return [];
      return data;
    } catch (error) {
      console.log(error);
      console.log("error in fetchAllRiskAssesmentBy_user_input_id");
    }
  }
  async function fetchUrls(data: any[]): Promise<string[]> {
    /*
      
    ! this data:any[] is nothing but all the user_input_id of particular user
    console.log(data);
    
    */
    try {
      let urls: string[] = [];
      if (data.length == 0) return [];

      let DateCountMap = new Map<string, number>(); //! This is for graph in the right side of donut chart contains data->key and total no of analysis on that date as value

      let low = 0;
      let moderate = 0;
      let high = 0;
      let critical = 0;
      let RecentAnalysisArr: FactCheckReport[] = [];

      for (let item of data) {

        //! fetching all the risk_assessment of a particular user_input_id
        let risk_asssment_data = await fetchAllRiskAssesmentBy_user_input_id(item.id);
        risk_asses_map.set(item.id, risk_asssment_data);

        let claim_assessment_data = await FetchClaimAssessment(item.id);
        let supporting_evidence = [];
        let contradicting_evidence = [];
        let MyClaimObjectArr = [];

        for (let item1 of claim_assessment_data) {
          if (item1.supporting_evidence_count != 0) {
            supporting_evidence = await FetchSupportingDocOfClaim(
              item1.claim_id,
            );
            console.log(supporting_evidence);
          }
          if (item1.contradicting_evidence_count != 0) {
            contradicting_evidence = await FetchContradictDocOfClaim(
              item1.claim_id,
            );
            console.log(contradicting_evidence);
          }
          let MyClaimObject = {
            claim_id: item1.claim_id,
            claim_text: item1.claim_text,
            verdict: item1.verdict,
            confidence: item1.confidence,
            reason: item1.reason,
            supporting_evidence,
            contradicting_evidence,
          };
          MyClaimObjectArr.push(MyClaimObject);
        }

        /*


      */
        claim_map.set(item.id, MyClaimObjectArr);

        console.log(low, high, moderate, critical);
        const formattedDate = item.created_at.split(" ")[0];
        if (DateCountMap.has(formattedDate)) {
          let prev = DateCountMap.get(formattedDate) || 0;
          DateCountMap.set(formattedDate, prev + 1);
        } else {
          DateCountMap.set(formattedDate, 1);
        }

        if (item.risk_level == "LOW") {
          low += 1;
        } else if (item.risk_level == "HIGH") {
          high += 1;
        } else if (item.risk_level == "MODERATE") {
          moderate += 1;
        } else if (item.risk_level == "CRITICAL") {
          critical += 1;
        }

        let result: FetchUrlFromWebEvidenceReturnType =
          await FetchUrlFromWebEvidence(item.id);
        let result1: FetchUrlFromWebEvidenceReturnType =
          await FetchUrlFromEvidence(item.id);
        let just: string[] = [...result.urls, ...result1?.urls];
        urls.push(...just);

        //! now preparing my RecentAnalysis array

        let Websources: string[] = [];
        let Factsources: string[] = [];
        console.log("----------------------------------------------------");
        console.log(item.id);
        console.log(result.data);
        console.log(result1.data);
        console.log("----------------------------------------------------");
        if (result.data.length != 0) {
          for (let evidence of result.data) {
            if (evidence.user_input_id == item.id) {
              Websources.push(evidence.url);
            }
          }
        }
        if (result1.data.length != 0) {
          for (let evidence of result1.data) {
            if (evidence.user_input_id == item.id) {
              Factsources.push(evidence.url);
            }
          }
        }

        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);

          return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(date);
        };
        
        let RecentAnalysisObj: FactCheckReport = {
          id: item.id,
          title: String(item.text).slice(0, 15) + "...",
          input_type: item.type || "ravi",
          risk_score: Math.ceil(item.risk_score),
          risk_level: item.risk_level,
          confidence: item.confidence,
          date: formatDate(formattedDate),
          sources: [...Websources, ...Factsources],
          claims: MyClaimObjectArr,
          risk_assessment: risk_asssment_data,
        };
        console.log(RecentAnalysisObj);
        RecentAnalysisArr.push(RecentAnalysisObj);
      }

      console.log(claim_map);
      setRecentAnalysis(RecentAnalysisArr);

      let sampleActivityDataJust: DataPoint[] = [];
      for (const [key, value] of DateCountMap.entries()) {
        sampleActivityDataJust.push({ x: key, y: value });
      }

      let riskDistributionData: RiskDistribution[] = [];
      setsampleActivityData(sampleActivityDataJust);
      console.log(sampleActivityData);
      riskDistributionData.push({ count: low, level: "low" });
      riskDistributionData.push({ count: high, level: "high" });
      riskDistributionData.push({ count: moderate, level: "moderate" });
      riskDistributionData.push({ count: critical, level: "critical" });
      console.log(riskDistributionData);
      setriskDistribution([]);
      setriskDistribution(riskDistributionData);

      return urls;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async function fetchAllUserInput(userid: number) {
    let { data, error }: { data: any; error: any } = await supabase
      .from("user_input")
      .select("*")
      .eq("user_id", userid);

    if (data?.length == 0) {
      toast({
        type: "error",
        title: "Nothing",
        description: "user input is empty",
      });
    } else if (error) {
      console.log(error);
      toast({
        type: "error",
        title: "Nothing",
        description: "something went wrong in fetchAllUserInput ",
      });
    } else {
      setAllUserInputId(data);
      let totalAnalyses = data.length;
      let filterData = data.filter((item: any) => {
        return item.risk_level == "HIGH";
      });
      let arr=[]
      let highRiskClaims = filterData.length;
      let sum = 0;
      data.forEach((item: any) => {
        sum += item.confidence;
      });
      let averageConfidence = Math.round(sum / data.length);
      let url_data = await fetchUrls(data);
      let sourcesChecked = url_data.length;

      setdashboardStats({
        totalAnalyses,
        highRiskClaims,
        averageConfidence: averageConfidence * 100,
        sourcesChecked,
      });
    }
  }

  useEffect(() => {
    if (localStorage.getItem(localUser)) {
      GetUser();
    }
  }, [GetuserSignal]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        setGetuserSignal,
        GetuserSignal,
        RecentAnalysis,
        setRecentAnalysis,
        GlobalLoadingState,
      }}
    >
      <ThemeProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Landing />} />

            <Route element={<PrivateComponent />}>
              <Route
                path="/dashboard"
                element={
                  <DashboardLayout>
                    <Dashboard
                      RecentAnalysis={RecentAnalysis}
                      dashboardStats={dashboardStats}
                      riskDistribution={riskDistribution}
                      sampleActivityData={sampleActivityData}
                    />
                  </DashboardLayout>
                }
              />
              <Route
                path="/analyze"
                element={
                  <DashboardLayout>
                    <AnalyzeClient />
                  </DashboardLayout>
                }
              />
              <Route
                path="/claims"
                element={
                  <DashboardLayout>
                    <Claims />
                  </DashboardLayout>
                }
              />
              <Route
                path="/history"
                element={
                  <DashboardLayout>
                    <History />
                  </DashboardLayout>
                }
              />
              <Route
                path="/insights"
                element={
                  <DashboardLayout>
                    <Insights />
                  </DashboardLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                }
              />
              <Route
                path="/sources"
                element={
                  <DashboardLayout>
                    <Sources />
                  </DashboardLayout>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </UserContext.Provider>
  );
}
