"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Server action untuk proses login admin.
 */
export async function masuk(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;
  const email = form?.get?.("email")?.toString().trim();
  const password = form?.get?.("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "Email atau password salah. Silakan periksa kembali." };
    }
  } catch (err) {
    return { error: err.message || "Gagal menghubungi layanan login." };
  }

  redirect("/admin");
}

/**
 * Server action untuk mengakhiri sesi admin (logout).
 */
export async function keluar() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika tidak ada sesi aktif
  }

  redirect("/admin/login");
}

/**
 * Server action untuk mengganti password admin yang sedang login.
 */
export async function gantiPassword(prevState, formData) {
  const form = formData instanceof FormData ? formData : prevState;
  const passwordBaru = form?.get?.("password_baru")?.toString() || "";
  const konfirmasiPassword = form?.get?.("konfirmasi_password")?.toString() || "";

  // 1. Validasi login admin di server
  let supabase;
  try {
    supabase = await createSessionClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Anda belum login atau sesi telah berakhir. Silakan login kembali." };
    }
  } catch (err) {
    return { error: err.message || "Gagal memverifikasi sesi admin." };
  }

  // 2. Validasi di server: minimal 8 karakter dan harus sama dengan konfirmasi
  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  // 3. Perbarui password memakai Supabase Auth
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat mengganti password." };
  }
}

export const login = masuk;
export const logout = keluar;
export const changePassword = gantiPassword;
