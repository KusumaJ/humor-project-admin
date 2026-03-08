// lib/pipelineApi.ts

import { createClient } from "@/utils/supabase/client";

const API_BASE_URL = "https://api.almostcrackd.ai";

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session) {
    throw new Error("User not authenticated.");
  }
  return data.session.access_token;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  cdnUrl: string;
}

export async function generatePresignedUrl(
  contentType: string,
): Promise<PresignedUrlResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate presigned URL.");
  }

  return response.json();
}

export async function uploadImageBytes(
  presignedUrl: string,
  contentType: string,
  file: Blob,
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image bytes.");
  }
}

interface RegisterImageResponse {
  imageId: string;
  now: number;
}

export async function registerImageUrl(
  cdnUrl: string,
  isCommonUse: boolean = false,
): Promise<RegisterImageResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register image URL.");
  }

  return response.json();
}

export async function generateCaptions(imageId: string): Promise<any[]> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate captions.");
  }

  return response.json();
}

export async function processImageAndGenerateCaptions(
  file: File,
): Promise<any[]> {
  try {
    // Step 1: Generate a presigned upload URL
    const { presignedUrl, cdnUrl } = await generatePresignedUrl(file.type);
    console.log("Generated Presigned URL:", presignedUrl);
    console.log("CDN URL:", cdnUrl);

    // Step 2: Upload image bytes to that presigned URL
    await uploadImageBytes(presignedUrl, file.type, file);
    console.log("Image bytes uploaded successfully.");

    // Step 3: Register the uploaded image URL with the pipeline
    const { imageId } = await registerImageUrl(cdnUrl);
    console.log("Image registered with ID:", imageId);

    // Step 4: Generate captions from the registered image
    const captions = await generateCaptions(imageId);
    console.log("Captions generated:", captions);

    return captions;
  } catch (error: any) {
    console.error("Error in image processing pipeline:", error.message);
    throw error;
  }
}
