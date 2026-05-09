import { supabase } from "./supabase";

export async function uploadPhoto(path: string, file: File) {
  return supabase.storage.from("photos").upload(path, file);
}

export async function getPhotoUrl(path: string) {
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}

export async function deletePhoto(path: string) {
  return supabase.storage.from("photos").remove([path]);
}
