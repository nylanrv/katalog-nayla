import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase untuk server memakai SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (katalog dan detail produk) di sisi server.
 */
export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const buatClientServer = createClient;

