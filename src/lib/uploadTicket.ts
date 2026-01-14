import { supabase } from "@/integrations/supabase/client";

export async function uploadTicketImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("bet-tickets")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }

  const { data: urlData } = supabase.storage
    .from("bet-tickets")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function createAnalysis(userId: string, imageUrl: string): Promise<string> {
  const { data, error } = await supabase
    .from("bet_analyses")
    .insert({
      user_id: userId,
      original_image_url: imageUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating analysis:", error);
    throw new Error("Failed to create analysis");
  }

  return data.id;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function analyzeTicket(
  imageBase64: string,
  analysisId: string,
  authToken: string
): Promise<any> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ticket`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ imageBase64, analysisId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Analysis failed");
  }

  return response.json();
}
