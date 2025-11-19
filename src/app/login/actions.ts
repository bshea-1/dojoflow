import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // In Server Actions used directly in 'action', we should ideally throw or handle state differently.
    // But for simple redirect flow, we can just redirect to login with error param
    // or return nothing if we want to handle it client side (but that requires useFormState).
    // For now, let's redirect with error query param to satisfy the void return type expectation of basic form actions
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/dashboard");
}
