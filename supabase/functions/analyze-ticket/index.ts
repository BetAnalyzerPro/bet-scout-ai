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

interface MarketAnalysis {
  market: string;
  prediction: string;
  confidence: number;
  reasoning: string;
}

interface AnalyzedBet extends ExtractedBet {
  risk: "low" | "medium" | "high";
  confidence: number;
  reasoning: string;
  suggestion?: string;
  suggestedLine?: string;
  marketAnalyses?: MarketAnalysis[];
  predictedScore?: {
    home: number;
    away: number;
    confidence: number;
    reasoning: string;
  };
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

    // Step 2: Analyze each bet for risk with comprehensive scout analysis
    console.log("Starting comprehensive scout analysis...");

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Você é um SCOUT PROFISSIONAL de apostas esportivas com acesso a dados estatísticos completos. Analise cada aposta como um verdadeiro analista de futebol, considerando TODOS os mercados relevantes. RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.

## ANÁLISE OBRIGATÓRIA POR MERCADO

Para CADA partida, você DEVE analisar TODOS estes mercados:

### 1. ESCANTEIOS
- **Escanteios 1º Tempo (HT)**: Mais/Menos de 3.5, 4.5, 5.5
- **Escanteios Tempo Total (FT)**: Mais/Menos de 7.5, 8.5, 9.5, 10.5, 11.5, 12.5
- **Escanteios por Equipe**: Qual time tende a ter mais escanteios
- **Handicap de Escanteios**: Diferença esperada entre os times

### 2. GOLS - TODAS AS LINHAS
- **Gols 1º Tempo (HT)**: Mais/Menos de 0.5, 1.5, 2.5
- **Gols Tempo Total (FT)**: Mais/Menos de 0.5, 1.5, 2.5, 3.5, 4.5, 5.5
- **Ambas Marcam (BTTS)**: Sim/Não
- **Ambas Marcam + Over**: Combinações

### 3. RESULTADO
- **Resultado 1º Tempo (HT)**: 1X2
- **Resultado Final (FT)**: 1X2
- **Dupla Chance**: 1X, 12, X2
- **Empate Anula Aposta (Draw No Bet)**

### 4. HANDICAP EUROPEU
- **Handicap -1, -2, -3**: Para favoritos
- **Handicap +1, +2, +3**: Para azarões
- Avalie se o favorito vence por margem suficiente

### 5. PLACAR EXATO
Ao final de CADA análise de partida, forneça uma SUGESTÃO DE PLACAR EXATO baseada em:
- Histórico de confrontos diretos (últimos 10 jogos)
- Escalações prováveis e desfalques
- Momento atual das equipes
- Padrões de gols marcados/sofridos
- Fator casa/fora

## ESTRUTURA DE RESPOSTA

Retorne um objeto JSON:
{
  "bets": [
    {
      "homeTeam": "...",
      "awayTeam": "...",
      "market": "...",
      "line": "...",
      "odds": 1.85,
      "competition": "...",
      "risk": "low|medium|high",
      "confidence": 75,
      "reasoning": "Análise detalhada considerando estatísticas, forma, H2H",
      "suggestion": "Sugestão alternativa se aplicável",
      "suggestedLine": "Linha sugerida",
      "marketAnalyses": [
        {
          "market": "Escanteios FT",
          "prediction": "Mais de 9.5",
          "confidence": 72,
          "reasoning": "Time A média 5.2 escanteios/jogo, Time B 4.8. H2H mostra média de 10.5"
        },
        {
          "market": "Escanteios HT",
          "prediction": "Mais de 4.5",
          "confidence": 68,
          "reasoning": "Ambos times são agressivos no início"
        },
        {
          "market": "Gols FT",
          "prediction": "Mais de 2.5",
          "confidence": 70,
          "reasoning": "Média combinada de 3.2 gols nos últimos 5 jogos"
        },
        {
          "market": "Gols HT",
          "prediction": "Mais de 0.5",
          "confidence": 82,
          "reasoning": "85% dos jogos de ambos têm gol no 1º tempo"
        },
        {
          "market": "Resultado HT",
          "prediction": "Time A ou Empate",
          "confidence": 75,
          "reasoning": "Time A não perde em casa no 1º tempo há 8 jogos"
        },
        {
          "market": "Handicap Europeu",
          "prediction": "Time A -1",
          "confidence": 55,
          "reasoning": "Favorito mas margem apertada"
        }
      ],
      "predictedScore": {
        "home": 2,
        "away": 1,
        "confidence": 65,
        "reasoning": "Baseado no H2H (3 dos últimos 5 terminaram 2-1), escalação completa do mandante, e momento superior. Time A marca média 1.8 em casa, Time B sofre 1.3 fora."
      }
    }
  ],
  "overallRisk": "low|medium|high",
  "summary": "Avaliação geral do bilhete considerando todos os mercados analisados",
  "recommendations": [
    "Recomendação 1 baseada na análise completa",
    "Recomendação 2",
    "Recomendação 3"
  ]
}

## IMPORTANTE
- Seja específico com estatísticas (use números, percentuais, médias)
- Considere fator casa/fora
- Analise lesões e suspensões conhecidas
- Avalie a importância do jogo para cada equipe
- Use seu conhecimento de futebol para prever padrões táticos`
          },
          {
            role: "user",
            content: `Analise estas apostas como um SCOUT PROFISSIONAL, avaliando TODOS os mercados (escanteios HT/FT, gols todas linhas, resultado HT, handicap europeu) e forneça uma PREVISÃO DE PLACAR EXATO para cada partida:\n\n${JSON.stringify(extractedData.bets, null, 2)}\n\nOdds totais: ${extractedData.totalOdds}\n\nRetorne apenas JSON válido.`
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
