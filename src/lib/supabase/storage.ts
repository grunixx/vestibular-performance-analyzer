import { getSupabaseClient } from "@/lib/supabase/client";

const DRAFT_BUCKET = "drafts";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, content] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadSketchToStorage(params: {
  userId: string;
  attemptId: string;
  questionId: string;
  imageDataUrl: string;
}): Promise<{ storagePath: string; publicUrl?: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const storagePath = `${params.userId}/${params.attemptId}/${params.questionId}.png`;
  const payload = dataUrlToBlob(params.imageDataUrl);

  const { error } = await supabase.storage
    .from(DRAFT_BUCKET)
    .upload(storagePath, payload, {
      contentType: "image/png",
      upsert: true
    });

  if (error) return null;

  const { data } = supabase.storage.from(DRAFT_BUCKET).getPublicUrl(storagePath);
  return {
    storagePath,
    publicUrl: data.publicUrl
  };
}
