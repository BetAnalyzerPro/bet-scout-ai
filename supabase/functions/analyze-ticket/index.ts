import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Allowed origins for CORS - restrict to known app domains
const ALLOWED_ORIGINS = [
  'https://bet-analizer.lovable.app',
  'https://betanalizer.lovable.app',
  'https://id-preview--1276217c-d812-4009-acc0-0ce5863e12a4.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

// Also allow lovableproject.com preview domains
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow all lovableproject.com preview origins
  if (origin.endsWith('.lovableproject.com')) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// Security constants
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_REQUESTS_PER_WINDOW = 20; // Extra protection beyond plan limits

// Helper to extract IP from request
function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('cf-connecting-ip') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Helper to get user agent
function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}

// Validate base64 image
function validateImageData(imageBase64: string): { valid: boolean; error?: string; mimeType?: string } {
  // Check if it's a data URL or raw base64
  let mimeType = 'image/jpeg';
  let base64Data = imageBase64;
  
  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) {
      return { valid: false, error: 'Invalid data URL format' };
    }
    mimeType = match[1];
    base64Data = match[2];
  }
  
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `Invalid image type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
  }
  
  // Calculate approximate size (base64 is ~1.37x original size)
  const approximateBytes = (base64Data.length * 3) / 4;
  if (approximateBytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE_MB}MB` };
  }
  
  return { valid: true, mimeType };
}

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
  footyStatsData?: any;
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
    apiConsensus?: string;
  };
}

interface FootyStatsMatch {
  homeTeam: string;
  awayTeam: string;
  homeGoals?: number;
  awayGoals?: number;
  homeCorners?: number;
  awayCorners?: number;
  stats?: any;
}

// Function to fetch data from FootyStats API
async function fetchFootyStatsData(homeTeam: string, awayTeam: string): Promise<any> {
  const FOOTYSTATS_API_KEY = Deno.env.get("FOOTYSTATS_API_KEY");
  if (!FOOTYSTATS_API_KEY) {
    console.log("FootyStats API key not configured, skipping...");
    return null;
  }

  try {
    // Search for teams and get their stats
    const searchUrl = `https://api.football-data-api.com/league-teams?key=${FOOTYSTATS_API_KEY}&include=stats`;
    
    console.log(`Fetching FootyStats data for ${homeTeam} vs ${awayTeam}...`);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error("FootyStats API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    // Try to find matching teams in the response
    const homeStats = findTeamStats(data, homeTeam);
    const awayStats = findTeamStats(data, awayTeam);

    return {
      homeTeamStats: homeStats,
      awayTeamStats: awayStats,
      source: "FootyStats"
    };
  } catch (error) {
    console.error("Error fetching FootyStats data:", error);
    return null;
  }
}

// Helper function to find team stats in FootyStats response
function findTeamStats(data: any, teamName: string): any {
  if (!data || !data.data) return null;
  
  const normalizedName = teamName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const team of data.data) {
    const apiTeamName = (team.name || team.cleanName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (apiTeamName.includes(normalizedName) || normalizedName.includes(apiTeamName)) {
      return team;
    }
  }
  
  return null;
}

// Fetch learning feedback to improve analysis - ONLY for the authenticated user
async function fetchLearningContext(supabase: any, userId: string): Promise<string> {
  try {
    // SECURITY: Always filter by user_id to prevent cross-user data exposure
    const { data: feedbacks, error } = await supabase
      .from("learning_feedback")
      .select("result, extracted_data, match_info, notes")
      .eq("user_id", userId) // Only fetch current user's feedback
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !feedbacks || feedbacks.length === 0) {
      return "";
    }

    const greenCount = feedbacks.filter((f: any) => f.result === "green").length;
    const redCount = feedbacks.filter((f: any) => f.result === "red").length;
    
    return `
## DADOS DE APRENDIZADO (baseado em ${feedbacks.length} apostas anteriores suas)
- Taxa de acerto histórica: ${((greenCount / feedbacks.length) * 100).toFixed(1)}%
- Greens: ${greenCount} | Reds: ${redCount}

Use estes dados para calibrar suas previsões. Considere padrões de mercados que mais acertam e erram.
`;
  } catch (error) {
    console.error("Error fetching learning context:", error);
    return "";
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Check IP-based rate limit first (before auth)
    const { data: ipRateLimitOk } = await supabase.rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_action: 'analysis',
      p_max_count: MAX_REQUESTS_PER_WINDOW,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });

    if (!ipRateLimitOk) {
      console.log(`IP rate limit exceeded: ${clientIP}`);
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'rate_limit_exceeded',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'ip_rate_limit' },
        p_severity: 'warn'
      });
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'invalid_token',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'missing_auth_header' },
        p_severity: 'warn'
      });
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'invalid_token',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { error: userError?.message },
        p_severity: 'warn'
      });
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Validate plan limits using secure DB function
    const { data: planValidation, error: planError } = await supabase.rpc('validate_plan_limit', {
      p_user_id: user.id,
      p_action: 'analysis'
    });

    if (planError || !planValidation?.allowed) {
      const errorMessage = planValidation?.error || 'Plan validation failed';
      console.log(`Plan limit exceeded for user ${user.id}: ${errorMessage}`);
      
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'plan_limit_exceeded',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { limit: planValidation?.limit, used: planValidation?.used },
        p_severity: 'info'
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Limite diário de análises atingido. Faça upgrade do seu plano para mais análises.",
          limit: planValidation?.limit,
          used: planValidation?.used
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check if plan is active (for paid plans)
    const { data: isPlanActive } = await supabase.rpc('is_plan_active', {
      p_user_id: user.id
    });

    if (!isPlanActive) {
      console.log(`Inactive plan for user ${user.id}`);
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'unauthorized_access',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: 'plan_expired' },
        p_severity: 'warn'
      });
      return new Response(
        JSON.stringify({ error: "Seu plano expirou. Por favor, renove para continuar." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, analysisId } = requestBody;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Validate image data (size, type)
    const imageValidation = validateImageData(imageBase64);
    if (!imageValidation.valid) {
      console.log(`Image validation failed: ${imageValidation.error}`);
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'upload_rejected',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_metadata: { reason: imageValidation.error },
        p_severity: 'warn'
      });
      return new Response(
        JSON.stringify({ error: imageValidation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Validate analysis ID belongs to user (if provided)
    if (analysisId) {
      const { data: analysisOwner, error: ownerError } = await supabase
        .from("bet_analyses")
        .select("user_id")
        .eq("id", analysisId)
        .single();

      if (ownerError || !analysisOwner || analysisOwner.user_id !== user.id) {
        console.log(`IDOR attempt: User ${user.id} tried to access analysis ${analysisId}`);
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'unauthorized_access',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_metadata: { analysisId, reason: 'idor_attempt' },
          p_severity: 'error'
        });
        return new Response(
          JSON.stringify({ error: "Invalid analysis ID" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store profile for later use
    const profile = planValidation;

    // Update analysis status to processing
    if (analysisId) {
      await supabase
        .from("bet_analyses")
        .update({ status: "processing" })
        .eq("id", analysisId);
    }

    // Fetch learning context in parallel - ONLY for the authenticated user
    const learningContextPromise = fetchLearningContext(supabase, user.id);

    console.log("Starting OCR extraction with Lovable AI...");

    // Step 1: Extract bet data from image using vision model
    const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
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
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (extractionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Fetch FootyStats data for each bet in parallel
    console.log("Fetching FootyStats data for all matches...");
    const footyStatsPromises = extractedData.bets.map(bet => 
      fetchFootyStatsData(bet.homeTeam, bet.awayTeam)
    );
    const footyStatsResults = await Promise.all(footyStatsPromises);
    
    // Get learning context
    const learningContext = await learningContextPromise;

    // Build context string with FootyStats data
    let footyStatsContext = "";
    footyStatsResults.forEach((result, index) => {
      if (result) {
        const bet = extractedData.bets[index];
        footyStatsContext += `\n### Dados FootyStats para ${bet.homeTeam} vs ${bet.awayTeam}:\n`;
        if (result.homeTeamStats) {
          footyStatsContext += `- ${bet.homeTeam}: ${JSON.stringify(result.homeTeamStats, null, 2)}\n`;
        }
        if (result.awayTeamStats) {
          footyStatsContext += `- ${bet.awayTeam}: ${JSON.stringify(result.awayTeamStats, null, 2)}\n`;
        }
      }
    });

    // Step 2: Analyze each bet for risk with comprehensive scout analysis
    console.log("Starting comprehensive scout analysis with dual API data...");

    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é um SCOUT PROFISSIONAL de apostas esportivas com acesso a dados estatísticos de MÚLTIPLAS FONTES (FootyStats e API Futebol). Sua análise deve considerar dados de ambas as fontes para chegar a conclusões mais precisas. RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.

${learningContext}

## ANÁLISE COM CONSENSO DE APIS

Você receberá dados de diferentes fontes estatísticas. Analise criticamente cada fonte e:
1. Compare os dados das diferentes APIs
2. Identifique convergências (onde ambas concordam = maior confiança)
3. Identifique divergências (onde discordam = cautela extra)
4. Chegue a uma conclusão baseada no consenso dos dados

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
- CONSENSO ENTRE AS FONTES DE DADOS

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
        }
      ],
      "predictedScore": {
        "home": 2,
        "away": 1,
        "confidence": 65,
        "reasoning": "Baseado no H2H (3 dos últimos 5 terminaram 2-1), escalação completa do mandante, e momento superior."
      }
    }
  ],
  "overallRisk": "low|medium|high",
  "summary": "Avaliação geral do bilhete considerando todos os mercados analisados",
  "recommendations": [
    "Recomendação 1 baseada na análise completa",
    "Recomendação 2",
    "Recomendação 3"
  ],
  "apiConsensus": "Resumo do consenso entre FootyStats e API Futebol - onde ambas concordam e onde divergem"
}

## IMPORTANTE
- Seja específico com estatísticas (use números, percentuais, médias)
- Considere fator casa/fora
- Analise lesões e suspensões conhecidas
- Avalie a importância do jogo para cada equipe
- Use seu conhecimento de futebol para prever padrões táticos
- DESTAQUE onde as APIs concordam (maior confiança) e onde divergem (mais cautela)`
          },
          {
            role: "user",
            content: `Analise estas apostas como um SCOUT PROFISSIONAL, usando dados de MÚLTIPLAS FONTES para chegar ao melhor consenso.

## APOSTAS DO BILHETE:
${JSON.stringify(extractedData.bets, null, 2)}

Odds totais: ${extractedData.totalOdds}

${footyStatsContext ? `## DADOS DA FOOTYSTATS API:${footyStatsContext}` : ""}

Analise TODOS os mercados (escanteios HT/FT, gols todas linhas, resultado HT, handicap europeu) e forneça uma PREVISÃO DE PLACAR EXATO para cada partida, considerando o consenso entre as fontes de dados.

Retorne apenas JSON válido.`
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
    
    console.log("Analysis response:", analysisContent.substring(0, 500) + "...");

    // Parse analysis
    let analysis: AnalysisResult["analysis"];
    try {
      let cleanJson = analysisContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```$/, "");
      }
      
      // Try to find JSON object in the response if it starts with text
      if (!cleanJson.startsWith("{") && !cleanJson.startsWith("[")) {
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanJson = jsonMatch[0];
        } else {
          throw new Error("No JSON object found in response");
        }
      }
      
      // Handle truncated JSON - try to fix common issues
      if (!cleanJson.endsWith("}") && !cleanJson.endsWith("]")) {
        // Find the last complete object/array
        let lastValidEnd = cleanJson.lastIndexOf("}");
        if (lastValidEnd > 0) {
          // Count braces to try to close properly
          let openBraces = (cleanJson.substring(0, lastValidEnd + 1).match(/\{/g) || []).length;
          let closeBraces = (cleanJson.substring(0, lastValidEnd + 1).match(/\}/g) || []).length;
          
          // Add missing closing braces
          while (closeBraces < openBraces) {
            cleanJson = cleanJson.substring(0, lastValidEnd + 1) + "}";
            lastValidEnd++;
            closeBraces++;
          }
          cleanJson = cleanJson.substring(0, lastValidEnd + 1);
        }
      }
      
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse analysis:", e);
      console.log("Raw content that failed to parse:", analysisContent.substring(0, 200));
      
      // Provide fallback analysis with more helpful information
      analysis = {
        bets: extractedData.bets.map(bet => ({
          ...bet,
          risk: "medium" as const,
          confidence: 50,
          reasoning: "A IA retornou uma análise, mas houve um erro ao processar o formato. Por favor, tente novamente.",
        })),
        overallRisk: "medium",
        summary: "Análise parcialmente processada. A IA gerou conteúdo, mas ocorreu um erro de formato. Tente enviar o bilhete novamente.",
        recommendations: [
          "Tente enviar o bilhete novamente",
          "Certifique-se de que a imagem está nítida e bem iluminada",
          "Se o problema persistir, entre em contato com o suporte"
        ],
      };
    }

    // Attach FootyStats data to each analyzed bet
    if (analysis.bets) {
      analysis.bets = analysis.bets.map((bet, index) => ({
        ...bet,
        footyStatsData: footyStatsResults[index] || null
      }));
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

    // Update user's daily analysis count using secure function
    await supabase.rpc('increment_analysis_count', {
      p_user_id: user.id
    });

    console.log("Analysis complete with dual API data!");

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-ticket:", error);
    
    // Log critical errors
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_event_type: 'suspicious_activity',
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      p_severity: 'error'
    });
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
