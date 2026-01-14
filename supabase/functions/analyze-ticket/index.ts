import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedBet {
  homeTeam: string;
  awayTeam: string;
  market: string;
  line: string;
  odds: number;
  competition?: string;
  matchDate?: string;
}

interface AnalyzedBet extends ExtractedBet {
  risk: "low" | "medium" | "high";
  confidence: number;
  reasoning: string;
  suggestion?: string;
  suggestedLine?: string;
}

interface AnalysisResult {
  extractedData: {
    bets: ExtractedBet[];
    totalOdds: number;
    stake?: number;
    potentialReturn?: number;
  };
  analysis: {
    bets: AnalyzedBet[];
    overallRisk: "low" | "medium" | "high";
    summary: string;
    recommendations: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, analysisId } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update analysis status to processing
    if (analysisId) {
      await supabase
        .from("bet_analyses")
        .update({ status: "processing" })
        .eq("id", analysisId);
    }

    console.log("Starting OCR extraction with Lovable AI...");

    // Step 1: Extract bet data from image using vision model
    const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em ler bilhetes de apostas esportivas. Extraia todas as informações de apostas da imagem.
            
Retorne um objeto JSON com esta estrutura exata:
{
  "bets": [
    {
      "homeTeam": "Time A",
      "awayTeam": "Time B",
      "market": "Gols Mais/Menos",
      "line": "Mais de 2.5",
      "odds": 1.85,
      "competition": "Brasileirão",
      "matchDate": "2024-01-15"
    }
  ],
  "totalOdds": 5.25,
  "stake": 100,
  "potentialReturn": 525
}

Mantenha os nomes dos mercados em português: "Over X" = "Mais de X", "Under" = "Menos de", "Win" = "Vitória", "Draw" = "Empate", "Asian Handicap" = "Handicap Asiático", "Both Teams to Score" = "Ambas Marcam", "Corners" = "Escanteios".

Se não conseguir ler algo claramente, faça sua melhor interpretação. Sempre retorne JSON válido.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all betting information from this betting slip image. Return only valid JSON, no markdown."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.error("Extraction API error:", extractionResponse.status, errorText);
      
      if (extractionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Extraction failed: ${extractionResponse.status}`);
    }

    const extractionData = await extractionResponse.json();
    const extractedContent = extractionData.choices?.[0]?.message?.content || "";
    
    console.log("Extraction response:", extractedContent);

    // Parse extracted data
    let extractedData: AnalysisResult["extractedData"];
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanJson = extractedContent.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```$/, "");
      }
      extractedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse extraction:", e);
      extractedData = {
        bets: [],
        totalOdds: 0,
      };
    }

    // Step 2: Analyze each bet for risk
    console.log("Starting risk analysis...");

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista especialista em apostas de futebol. Analise cada aposta quanto ao risco e forneça insights acionáveis. RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.

Para cada aposta, avalie:
1. Desempenho histórico das equipes neste mercado
2. Forma atual e tendências
3. Histórico de confrontos diretos
4. Valor das odds oferecidas

Níveis de risco:
- "low": Forte embasamento estatístico, odds com bom valor, tendências favoráveis
- "medium": Sinais mistos, valor médio, algumas preocupações
- "high": Contra tendências recentes, valor ruim, ou mercado arriscado

Retorne um objeto JSON:
{
  "bets": [
    {
      "homeTeam": "...",
      "awayTeam": "...",
      "market": "...",
      "line": "...",
      "odds": 1.85,
      "risk": "low|medium|high",
      "confidence": 75,
      "reasoning": "Explicação breve da avaliação de risco em português",
      "suggestion": "Sugestão alternativa se o risco for alto, em português",
      "suggestedLine": "Mais de 1.5"
    }
  ],
  "overallRisk": "low|medium|high",
  "summary": "Avaliação geral do bilhete em português",
  "recommendations": ["Dica 1 em português", "Dica 2 em português"]
}`
          },
          {
            role: "user",
            content: `Analyze these bets for risk and provide insights:\n\n${JSON.stringify(extractedData.bets, null, 2)}\n\nTotal odds: ${extractedData.totalOdds}\n\nReturn only valid JSON.`
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      console.error("Analysis API error:", analysisResponse.status);
      throw new Error(`Analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysisContent = analysisData.choices?.[0]?.message?.content || "";
    
    console.log("Analysis response:", analysisContent);

    // Parse analysis
    let analysis: AnalysisResult["analysis"];
    try {
      let cleanJson = analysisContent.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```$/, "");
      }
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse analysis:", e);
      // Provide fallback analysis
      analysis = {
        bets: extractedData.bets.map(bet => ({
          ...bet,
          risk: "medium" as const,
          confidence: 50,
          reasoning: "Unable to analyze - please review manually",
        })),
        overallRisk: "medium",
        summary: "Analysis incomplete - please review manually",
        recommendations: ["Review each bet carefully before placing"],
      };
    }

    const result: AnalysisResult = {
      extractedData,
      analysis,
    };

    // Update database with results
    if (analysisId) {
      await supabase
        .from("bet_analyses")
        .update({
          status: "completed",
          extracted_data: extractedData,
          analysis_result: analysis,
          overall_risk: analysis.overallRisk,
        })
        .eq("id", analysisId);
    }

    // Update user's daily analysis count
    await supabase
      .from("profiles")
      .update({
        daily_analyses_used: supabase.rpc("increment_analyses"),
      })
      .eq("user_id", user.id);

    // Alternative: direct increment
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_analyses_used")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ daily_analyses_used: (profile.daily_analyses_used || 0) + 1 })
        .eq("user_id", user.id);
    }

    console.log("Analysis complete!");

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-ticket:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
