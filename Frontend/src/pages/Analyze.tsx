import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "@/router";
import {
  FileText,
  Image as ImageIcon,
  Link2,
  Mic,
  Music,
  RotateCcw,
  Search,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";

import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UploadZone, type UploadedFile } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Disclaimer } from "@/components/states";
import { useToast } from "@/components/ui/Toast";
import { analyses, processingSteps as baseSteps } from "@/data/mockData";
import type { Analysis, InputType, ProcessingStep } from "@/types";
import axios from "axios";
import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "@/context/counterContext";
import { ApiAnalysisResult } from "@/components/MyAnalysisResult";

type Stage = "input" | "processing" | "results";

const FASTAPI_BASE_URL = `http://localhost:8000`;
const tabItems = [
  { value: "text", label: "Text", icon: <FileText className="h-4 w-4" /> },
  { value: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "audio", label: "Audio", icon: <Mic className="h-4 w-4" /> },
  { value: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
  { value: "url", label: "URL", icon: <Link2 className="h-4 w-4" /> },
];

const resultByType: Record<InputType, Analysis> = {
  text: analyses[0],
  url: analyses[1],
  image: analyses[2],
  audio: analyses[4],
  video: analyses[2],
};

export function AnalyzeClient() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get("id");
  const { toast } = useToast();

  const [tab, setTab] = useState<InputType>("text");
  const [stage, setStage] = useState<Stage>("input");
  const [steps, setSteps] = useState<ProcessingStep[]>(baseSteps);
  const [result, setResult] = useState<Analysis | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  interface Inputvalidation {
    error: boolean;
    is_valid: boolean;
    reason: string;
  }
  // Form state
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [author, setAuthor] = useState("");
  const [pubDate, setPubDate] = useState("");
  const { user } = useUser();

  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<UploadedFile | null>(null);
  const [audioFile, setAudioFile] = useState<UploadedFile | null>(null);
  const [videoFile, setVideoFile] = useState<UploadedFile | null>(null);
  const [urlPreview, setUrlPreview] = useState(false);
  let [InputValidationLoading, setInputValidationLoading] =
    useState<boolean>(false);

  // Preset (view existing analysis)
  useEffect(() => {
    if (presetId) {
      const found = analyses.find((a) => a.id === presetId);
      if (found) {
        setResult(found);
        setTab(found.inputType);
        setStage("results");
      }
    }
  }, [presetId]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const canAnalyze = useMemo(() => {
    switch (tab) {
      case "text":
        return text.trim().length > 0;
      case "url":
        return url.trim().length > 5;
      case "image":
        return !!imageFile;
      case "audio":
        return !!audioFile;
      case "video":
        return !!videoFile;
    }
  }, [tab, text, url, imageFile, audioFile, videoFile]);

  async function Validate_input(text: string): Promise<Inputvalidation> {
    try {
      setInputValidationLoading(true);
      let { data } = await axios.post(
        `${FASTAPI_BASE_URL}/api/validate-input/`,
        { input: text },
      );
      let response = data?.msg;

      if (data?.success) {
        return {
          error: false,
          is_valid: response?.is_valid,
          reason: response?.reason,
        };
      } else {
        return {
          error: true,
          is_valid: false,
          reason: "validate input failed error",
        };
      }
    } catch (error) {
      console.log(error);
      return {
        error: true,
        is_valid: false,
        reason: "validate input failed error",
      };
    } finally {
      setInputValidationLoading(false);
    }
  }

  async function saveClaims(claims: any[],evidence:any[],web_evidence:any[],supporting_evidence:any[],contradicting_evidence:any[],claim_assessment:any[],hive_assessment:any[],risk_assessment:any[]) {
    if (!claims?.length) return;
    /*

    let filterClaims=claims.map((item:any)=>{
      return {text:item.text,user_input_id:item.user_input_id}
    })
    const { data, error } = await supabase.from("claims").insert(filterClaims);

    if (error) {
      console.error("Error storing claims:", error);
      throw error;
    }

      */
     for (let item of claims){
        let filterClaim={text:item.text,user_input_id:item.user_input_id};
        let OldClaimId=item.id;//This is  the  old id genrated by backend starting from 1
        const {data,error} = await supabase.from("claims").insert(filterClaim).select().single();
        if(error){
          return console.log(error)
        }
        let evidence_filter=evidence.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let web_evidence_filter=web_evidence.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let supporting_evidence_filter=supporting_evidence.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let contradicting_evidence_filter=contradicting_evidence.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let claim_assesment_filter=claim_assessment.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let hive_assesment_filter=hive_assessment.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })
        let risk_assesment_filter=risk_assessment.filter((item:any)=>{
          return item.claim_id=OldClaimId
        })

        await saveEvidence(evidence_filter,data.id)
        await saveWebEvidence(web_evidence_filter,data.id)
        await saveContradictingEvidence(supporting_evidence_filter,data.id)
        await saveSupportingEvidence(contradicting_evidence_filter,data.id)
        await saveClaimAssessment(claim_assesment_filter,data.id)
        await saveHiveAssessment(hive_assesment_filter,data.id)
        await saveRiskAssessment(risk_assesment_filter,data.id)


     }

    return true
  }

  async function saveUserInput(text: string, tab: string, user_id: number,id:string,createdAt:any,risk_score:number,risk_level:string,confidence:number) {
    if (!text || !tab || !user_id)
      return alert("required fields not found error in saveUserInput!!!!!");
    // alert("calling")
    const { data, error } = await supabase
      .from("user_input")
      .insert({id,text: text, type: tab, user_id: user_id,created_at:createdAt,risk_score,risk_level,confidence})
      .select()
      .single(); //now this data contains the newly created row

    if (error) {
      console.error("Error storing claims:", error);
      throw error;
    }

    return data;
  }
  async function saveEvidence(evidence: any[],claim_id:string) {
    if (!evidence?.length) return;
    let filterdEvidence=evidence.map((item:any)=>{
      return {
        "source":item.source,
        "claim_text":item.claim,
        "claim_id":claim_id,
        "rating":item.rating,
        "user_input_id":item.user_input_id,
      }
    })



    const{ data,error} = await supabase
      .from("google_fact_evidence")
      .insert(filterdEvidence)
    
    if(error){
      console.log(error)
      return alert(error)
    }
    

    return data;
  }

  /**
   * 
  useEffect(()=>{
    saveEvidence([
      {
        "source": "AFP Fact Check",
        "claim": "Drinking alcoholic beverages prevents coronavirus infection",
        "claim_id": "1",
        "rating": "False",
        "url": "https://factcheck.afp.com/fake-us-hospital-letter-says-alcohol-reduces-covid-19-risks",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      },
      {
        "source": "BOOM Fact Check",
        "claim": "People who drink alcohol will not be infected by the Coronavirus",
        "claim_id": "1",
        "rating": "Misleading",
        "url": "https://www.boomlive.in/health/does-drinking-alcohol-prevent-coronavirus-6935",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      }],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
    },[])

    */
  async function saveWebEvidence(webEvidence: any[],claim_id:string) {
    if (!webEvidence?.length) return;


    let filterData=webEvidence.map((item:any)=>{
      return {
        "source":item.source,
        "claim_text":item.claim,
        "content":item.content,
        "url":item.url,
        "relevance_score":item.relevance_score,
        "claim_id":claim_id,
        "user_input_id":item.user_input_id,

      }
    })
        
    const { data, error } = await supabase
      .from("web_evidence")
      .insert(filterData);

    if (error) {
      console.error("Error storing web evidence:", error);
      throw error;
    }

    return data;
  }

  /*
  useEffect(()=>{
saveWebEvidence([
      {
        "source": "Does Alcohol Kill COVID-19? (Cleaning Surfaces or Drinking)",
        "title": "Does Alcohol Kill COVID-19? (Cleaning Surfaces or Drinking)",
        "claim": "Drinking alcohol helps to defeat the coronavirus.",
        "claim_id": "1",
        "content": "Drinking alcohol (also known as ethyl alcohol) does not kill coronavirus. You cannot disinfect surfaces or cure coronavirus with drinking alcohol.\n\nConsuming alcoholic beverages may actually increase your susceptibility and worsen the effects of the coronavirus. This is because alcohol weakens your immune system. [...] Here are some safe and effective ways to reduce the transmission of the coronavirus. Of course, wearing a mask, social distancing, and getting vaccinated will also help to protect you against the COVID-19 virus.\n\n### Hand Sanitizer\n\nHand sanitizer can help kill germs. If used correctly, an alcohol-based hand sanitizer that has at least 60 percent alcohol can kill the COVID-19 virus. [...] While some people may use alcohol as a coping mechanism to deal with the stress of the COVID-19 pandemic, doing so is a slippery slope. Unfortunately, for most people (almost two-thirds), their drinking has increased compared to their consumption in pre-pandemic times. This may be due to stress and boredom.",
        "url": "https://alcoholrehabhelp.org/resources/does-alcohol-kill-covid-19",
        "relevance_score": 0.87605256,
        "source_type": "web_search",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      },
      {
        "source": "Does Alcohol Kill COVID-19? (Cleaning Surfaces or Drinking)",
        "title": "Does Alcohol Kill COVID-19? (Cleaning Surfaces or Drinking)",
        "claim": "Drinking alcohol helps to defeat the coronavirus.",
        "claim_id": "1",
        "content": "Drinking alcohol (also known as ethyl alcohol) does not kill coronavirus. You cannot disinfect surfaces or cure coronavirus with drinking alcohol.\n\nConsuming alcoholic beverages may actually increase your susceptibility and worsen the effects of the coronavirus. This is because alcohol weakens your immune system. [...] Here are some safe and effective ways to reduce the transmission of the coronavirus. Of course, wearing a mask, social distancing, and getting vaccinated will also help to protect you against the COVID-19 virus.\n\n### Hand Sanitizer\n\nHand sanitizer can help kill germs. If used correctly, an alcohol-based hand sanitizer that has at least 60 percent alcohol can kill the COVID-19 virus. [...] While some people may use alcohol as a coping mechanism to deal with the stress of the COVID-19 pandemic, doing so is a slippery slope. Unfortunately, for most people (almost two-thirds), their drinking has increased compared to their consumption in pre-pandemic times. This may be due to stress and boredom.",
        "url": "https://alcoholrehabhelp.org/resources/does-alcohol-kill-covid-19",
        "relevance_score": 0.87605256,
        "source_type": "web_search",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      }
    ],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
  },[])

  */
  async function saveSupportingEvidence(supportingEvidence: any[],claim_id:string) {
    if (!supportingEvidence?.length) return;
    let filterData=supportingEvidence.map((item:any)=>{
      return {
        "matching_score":item.matching_score,
        "reason":item.reason,
        "claim_id":claim_id,
        "claim_text":item.claim_text,
        "evidence_claim":item.evidence_claim,
        "user_input_id":item.user_input_id,
      }
    })
    const { data, error } = await supabase
      .from("supporting_evidence")
      .insert(filterData);

    if (error) {
      console.error("Error storing supporting evidence:", error);
      throw error;
    }

    return data;
  }


  /*

  useEffect(()=>{
saveSupportingEvidence([
      {
        "matching_score": 0.9,
        "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "evidence_claim": "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      },
      {
        "matching_score": 0.9,
        "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "evidence_claim": "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      }
    ],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
  },[])

  */

  async function saveContradictingEvidence(contradictingEvidence: any[],claim_id:string) {
    if (!contradictingEvidence?.length) return;
    let filterData=contradictingEvidence.map((item:any)=>{
      return {
        "matching_score":item.matching_score,
        "reason":item.reason,
        "claim_id":claim_id,
        "claim_text":item.claim_text,
        "evidence_claim":item.evidence_claim,
        "user_input_id":item.user_input_id,
      }
    })
    const { data, error } = await supabase
      .from("contradicting_evidence")
      .insert(filterData);

    if (error) {
      console.error("Error storing contradicting evidence:", error);
      throw error;
    }

    return data;
  }


  async function saveClaimAssessment(claimAssessment: any[],claim_id:string) {
    if (!claimAssessment?.length) return;
    let filterData=claimAssessment.map((item:any)=>{
      return {
        "claim_id":claim_id,
        "claim_text":item.claim_text,
        "verdict":item.verdict,
        "confidence":item.confidence,
        "reason":item.reason,
        "supporting_evidence_count":item.supporting_evidence_count,
        "contradicting_evidence_count":item.contradicting_evidence_count,
        "user_input_id":item.user_input_id,
      }
    })
    const { data, error } = await supabase
      .from("claim_assessment")
      .insert(filterData);

    if (error) {
      console.error("Error storing claim assessment:", error);
      throw error;
    }

    return data;
  }

  /*
  useEffect(()=>{
saveClaimAssessment([
      {
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "verdict": "Supported",
        "confidence": 0.9,
        "reason": "The fact-checked claim is substantially the same as the user's claim, and the fact-checker's conclusion about the fact-checked claim is True/Correct.",
        "supporting_evidence_count": 1,
        "contradicting_evidence_count": 3,
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      },
      {
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "verdict": "False",
        "confidence": 0.85,
        "reason": "The fact-checked claim contradicts the user's claim. Drinking alcoholic beverages does not prevent coronavirus infection.",
        "supporting_evidence_count": 1,
        "contradicting_evidence_count": 3,
        "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
      }],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
  },[])

  */

  async function saveHiveAssessment(hiveAssessment: any[],claim_id:string) {
    if (!hiveAssessment?.length) return;
    let filterData=hiveAssessment.map((item)=>{
      return {
        "claim_id":claim_id,
        "claim_text":item.claim_text,
        "reason":item.reason,
        "harmful":item.harmful,
        "user_input_id":item.user_input_id,
      }
    })

    const { data, error } = await supabase
      .from("hive_assessment")
      .insert(filterData);

    if (error) {
      console.error("Error storing Hive assessment:", error);
      throw error;
    }

    return data;
  }

  /*


  useEffect(()=>{
    saveHiveAssessment([{
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "reason": "The claim suggests that drinking alcohol can help defeat a virus, which is medically inaccurate and could lead to harmful health consequences. Promoting such a claim can undermine public health efforts and encourage risky behaviors.",
        "harmful": "true",
        "user_input_id":"6320cd7a-3ada-4caa-a8c9-792431217d56",
      }],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
 },[])

 */

  async function saveRiskAssessment(riskAssessment: any[],claim_id:string) {
    if (!riskAssessment?.length) return;
    let filterData=riskAssessment.map((item)=>{
      return {
      "claim_id":claim_id,
      "claim_text":item.claim_text,
      "risk_level":item.risk_level,
      "risk_score":item.risk_score,
      "reason":item.reason,
      "user_input_id":item.user_input_id,
      }
    })
    const { data, error } = await supabase
      .from("risk_assessment")
      .insert(filterData);

    if (error) {
      console.error("Error storing risk assessment:", error);
      throw error;
    }

    return data;
  }

  
  /* 
useEffect(()=>{
saveRiskAssessment([
      {
        "claim_id": "1",
        "claim_text": "Drinking alcohol helps to defeat the coronavirus.",
        "risk_level": "CRITICAL",
        "risk_score": 90,
        "reason": "The claim has been assessed as TRUE, which is medically inaccurate. Alcohol consumption can impair the immune system and interfere with the effectiveness of COVID-19 vaccines, increasing the risk of severe illness. The high confidence in the factual assessment and the presence of contradicting evidence (3) outweigh the supporting evidence (1), and the content is classified as harmful due to its potential to cause health risks.",
        "user_input_id":"6320cd7a-3ada-4caa-a8c9-792431217d56"
      }],"307bdf9d-60aa-43b0-8d92-a7b18a70afa1")
},[])  

    
  async function saveAnalysis(result: any) {
    await saveClaims(result.claims);
    
    await saveEvidence(result.evidence);

    await saveWebEvidence(result.web_evidence);

    await saveSupportingEvidence(result.supporting_evidence);

    await saveContradictingEvidence(result.contradicting_evidence);
    
    await saveClaimAssessment(result.claim_assessment);

    await saveHiveAssessment(result.hive_assessment);

    await saveRiskAssessment(result.risk_assessment);
  }


  */
  

 
 
 /*

    
  useEffect(()=>{
    let claims_data=saveClaims([
      {
        "id": "1",
        "user_input_id":"6320cd7a-3ada-4caa-a8c9-792431217d56",
        "text": "Drinking alcohol helps to defeat the coronavirus."
      }
    ]);
    console.log(claims_data)
    
  },[])


  */
  function get_confidence_score(data: any[]): any {
    let confidence_score = data[0].confidence;
    data.map((item:any)=>{
      if(Number(item.confidence)>Number(confidence_score)){
        confidence_score=Number(item.confidence);
      }
    })
    return confidence_score;
  }
  function Risk_score_level(data: any[]): any {
    if (data?.length == 0) return;
    let risk_score = Number(data[0].risk_score);
    let idx = 0;
    data.map((item: any, idx: number) => {
      if (Number(item.risk_score) > risk_score) {
        risk_score = Number(item.risk_score);
        idx = idx;
      }
    });
    let filterdData = data[idx];

    let risk_level = filterdData.risk_level || 10;
    return { risk_score, risk_level };
  }
  function get_assesment_summmary(supporting_evidence:any[],contradicting_evidence:any[]):any{
    let ans:any[]=[]
    if(supporting_evidence.length>0){
      supporting_evidence.map((item:any)=>{
        if(item.evidence_claim!="")
        ans.push(item.evidence_claim)
      })
    }
    if(contradicting_evidence.length>0){
      contradicting_evidence.map((item:any)=>{
        if(item.evidence_claim!="")
        ans.push(item.evidence_claim)
      })
    }
    return ans;

  }

  async function runAnalysis() {
    if (!canAnalyze) return;
    if (tab != "text") {
      return toast({
        type: "info",
        title: "Coming Soon",
        description: "This feature is not implemented yet.",
      });
    }
    /*
    setStage("processing");
    setSteps(
      baseSteps.map((s, i) => ({
        ...s,
        status: i < 2 ? "done" : i === 2 ? "active" : "pending",
      })),
    );

    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Advance the timeline step by step.
    baseSteps.forEach((_, idx) => {
      if (idx < 3) return;
      const t = setTimeout(
        () => {
          setSteps((prev) =>
            prev.map((s, i) => ({
              ...s,
              status: i < idx ? "done" : i === idx ? "active" : "pending",
            })),
          );
        },
        (idx - 2) * 700,
      );
      timers.current.push(t);
    });
    const done = setTimeout(
      () => {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

        setResult(resultByType[tab]);
        setStage("results"); //this means now the api call is ended

        
      },
      baseSteps.length * 700 + 400,
    );
    timers.current.push(done);
*/

    
    let validation_msg = await Validate_input(text);
    console.log(validation_msg);
    if (validation_msg?.error) {
      return toast({
        type: "error",
        title: "InputValidation",
        description: validation_msg.reason,
      });
    } else if (validation_msg.is_valid == false) {
      return alert(validation_msg.reason);
    }

    setStage("processing");
    setSteps(
      baseSteps.map((s, i) => ({
        ...s,
        status: i < 2 ? "done" : i === 2 ? "active" : "pending",
      })),
    );

    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Advance the timeline step by step.
    baseSteps.forEach((_, idx) => {
      if (idx < 3) return;
      const t = setTimeout(
        () => {
          setSteps((prev) =>
            prev.map((s, i) => ({
              ...s,
              status: i < idx ? "done" : i === idx ? "active" : "pending",
            })),
          );
        },
        (idx - 2) * 700,
      );
      timers.current.push(t);
    });
    const done = setTimeout(
      () => {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

        // setResult(resultByType[tab]);
        // setStage("results"); //this means now the api call is ended

        
      },
      baseSteps.length * 700 + 400,
    );
    timers.current.push(done);

    try {
      let user_input_id=uuidv4();

      let { data } = await axios.post(`${FASTAPI_BASE_URL}/api/research`, {
        input: text,
        type: tab,
        thread_id: user_input_id,
      });
      let response = data?.msg;
      let success = data?.success;
      if (success) {
        let createdAt = new Date().toISOString();
        let data=await saveUserInput(text,tab,user?.id,user_input_id,createdAt,response.risk_score,response.risk_level,response.confidence);
        if(data.length==0){
          console.log("user input is not saved in DB")
          return
        }
        // await saveAnalysis(response);
        // Preparing data for showing in ui after analysis
        let claims_data=await saveClaims(response.claims,response.evidence,response.web_evidence,response.supporting_evidence,response.contradicting_evidence,response.claim_assessment,response.hive_assessment,response.risk_assessment);

        /*
        this claim data=> {
    "id": "d1166316-c227-428a-8815-0bb3806c8e05",
    "created_at": "2026-08-18T12:08:46.656381+00:00",
    "text": "Drinking alcohol helps to defeat the coronavirus.",
    "user_input_id": "6320cd7a-3ada-4caa-a8c9-792431217d56"
}

*/
        if(claims_data==undefined){
          return;
        }
        let newclaim:string[]=response.claims.map((item:any)=>{
          return item.text
        })
        //! finding the risk_score
        //! evidence-strength->coming soong
        //! category->coming soon
        
        
        let assessmentSummary=get_assesment_summmary(response.supporting_evidence,response.contradicting_evidence);

        let dashboard_data = {
          id: user_input_id,
          title:text.slice(0,30)+ "...",
          inputType:tab,
          riskScore: response.risk_score,
          riskLevel: response.risk_level,
          confidence:response.confidence,
          claimsCount: response.claims?.length,
          evidenceStrength:"moderate",
          category: "climate",
          status:"completed",
          createdAt,
          submittedContent: text,
           supporting_evidence :response.supporting_evidence,
          contradicting_evidence :response.contradicting_evidence,
          claims:newclaim,
          sourcesCount:
            response?.supporting_evidence?.length +
            response?.contradicting_evidence?.length,
          assessmentSummary: assessmentSummary,
        };
        setResult(dashboard_data);
        console.log("printing dashboard data")
        console.log(dashboard_data)
        toast({
          type: "success",
          title: "Analysis complete",
          description: "Risk assessment and sources are ready to review.",
        });
        setStage("results"); //this means now the api call is ended
        
      } else {
        console.log(response);
      alert("something went wrong!!!!");
    }
  } catch (error) {
    console.log(error);
    setStage("input");
    alert("error in research");
  } finally {
    setStage("results");
  }
    
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    setStage("input");
    setResult(null);
    setSteps(baseSteps);
  }

  function clearForm() {
    setText("");
    setSource("");
    setAuthor("");
    setPubDate("");
    setUrl("");
    setUrlPreview(false);
    setImageFile(null);
    setAudioFile(null);
    setVideoFile(null);
    toast({ type: "info", title: "Inputs cleared" });
  }

  if (stage === "processing") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analyze Content"
          description="Submit content to assess misinformation risk and verify its claims."
        />
        <AnalysisProgress steps={steps} />
      </div>
    );
  }

  if (stage === "results" && result) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis Results"
          description="AI-generated misinformation risk assessment with cross-referenced sources."
          actions={
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              New Analysis
            </Button>
          }
        />
        <ApiAnalysisResult analysisResult={result}/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyze Content"
        description="Submit content to assess misinformation risk and verify its claims."
      />

      <Tabs
        items={tabItems}
        value={tab}
        onValueChange={(v) => setTab(v as InputType)}
      />

      {tab === "text" && (
        <Card>
          <CardHeader>
            <CardTitle>Text Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a claim, article, social media post, message, or statement here…"
              />
              <p className="mt-1.5 text-right text-xs text-muted">
                {text.length} characters
              </p>
            </div>
            {/* <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="src">Source (optional)</Label>
                <Input
                  id="src"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author">Author (optional)</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pub">Publication date (optional)</Label>
                <Input
                  id="pub"
                  type="date"
                  value={pubDate}
                  onChange={(e) => setPubDate(e.target.value)}
                />
              </div>
            </div> */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={runAnalysis}
                loading={InputValidationLoading}
                disabled={!canAnalyze}
              >
                <Search className="h-4 w-4" />
                {InputValidationLoading
                  ? "Validating your input..."
                  : "Analyze Content"}
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "image" && (
        <Card>
          <CardHeader>
            <CardTitle>Image Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadZone
              accept="image/jpeg,image/png,image/webp"
              formatsLabel="JPG, PNG, WEBP"
              icon={<ImageIcon className="h-6 w-6" />}
              file={imageFile}
              onFile={setImageFile}
              preview={(f) => (
                <img
                  src={f.url}
                  alt="Uploaded preview"
                  className="max-h-64 w-full rounded-lg object-contain"
                />
              )}
            />
            <div className="rounded-lg border border-dashed border-border-strong bg-surface-2/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                OCR Extracted Text
              </p>
              <p className="mt-1.5 text-sm text-muted-2">
                Text extracted from the image will appear here after analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAnalysis} disabled={!canAnalyze}>
                <Search className="h-4 w-4" />
                Analyze Content
              </Button>
              <Button variant="outline" onClick={() => setImageFile(null)}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "audio" && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadZone
              accept="audio/*"
              formatsLabel="MP3, WAV, M4A"
              icon={<Music className="h-6 w-6" />}
              file={audioFile}
              onFile={setAudioFile}
              preview={(f) => (
                <audio controls src={f.url} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Transcription",
                "Detected Claims",
                "Manipulation Indicators",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-dashed border-border-strong bg-surface-2/40 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-2">
                    Available after analysis.
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAnalysis} disabled={!canAnalyze}>
                <Search className="h-4 w-4" />
                Analyze Content
              </Button>
              <Button variant="outline" onClick={() => setAudioFile(null)}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "video" && (
        <Card>
          <CardHeader>
            <CardTitle>Video Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadZone
              accept="video/*"
              formatsLabel="MP4, WEBM, MOV"
              icon={<Video className="h-6 w-6" />}
              file={videoFile}
              onFile={setVideoFile}
              preview={(f) => (
                <video
                  controls
                  src={f.url}
                  className="max-h-72 w-full rounded-lg bg-black"
                />
              )}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Extracted Speech",
                "OCR Text",
                "Key Frames",
                "Detected Claims",
                "Manipulation Indicators",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-dashed border-border-strong bg-surface-2/40 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-2">
                    Available after analysis.
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={runAnalysis} disabled={!canAnalyze}>
                <Search className="h-4 w-4" />
                Analyze Content
              </Button>
              <Button variant="outline" onClick={() => setVideoFile(null)}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "url" && (
        <Card>
          <CardHeader>
            <CardTitle>URL Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlPreview(false);
                }}
                placeholder="Paste an article, webpage, or social media URL"
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (url.trim().length > 5) setUrlPreview(true);
                }}
                variant="outline"
              >
                Fetch Preview
              </Button>
            </div>

            {urlPreview && (
              <div className="animate-fade-in rounded-lg border border-border bg-surface-2/40 p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">
                    {url.replace(/^https?:\/\//, "").split("/")[0] ||
                      "example.com"}
                  </Badge>
                  <span className="text-xs text-muted">
                    Published Jan 8, 2026
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-foreground">
                  Regional election turnout figures spark debate online
                </h4>
                <p className="mt-1 text-sm text-muted">
                  An article claims voter turnout exceeded 95% in every
                  district, citing unnamed officials. Preview generated from the
                  submitted URL for demonstration purposes.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={runAnalysis} disabled={!canAnalyze}>
                <Search className="h-4 w-4" />
                Analyze URL
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUrl("");
                  setUrlPreview(false);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Disclaimer />
    </div>
  );
}
