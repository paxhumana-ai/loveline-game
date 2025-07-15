// OAuth login callback route for Supabase
// next
import { NextResponse } from "next/server";
// utils
import { createClient } from "@/utils/supabase/server";
// constants
import {
  appDefaultUrl,
  loginErrorMessage,
  loginUrl,
  onBoardingUrl,
} from "@/domains/auth/constant";
import { getURL } from "@/utils/helper";
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? onBoardingUrl;

  console.log("next", next);

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      // if the user doesn't have profile data yet, send them to the onboarding page
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sessionData.user.id);

      if (profiles?.length === 0) {
        const {} = await supabase
          .from("profiles")
          .insert([
            {
              user_id: sessionData.user.id,
              email: sessionData.user.email!,
              name: sessionData.user.user_metadata.full_name,
              avatar_url: sessionData.user.user_metadata.avatar_url,
            },
          ])
          .select();
      }

      const redirectUrl = getURL(next);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    getURL(`${loginUrl}?message=${encodeURIComponent(loginErrorMessage)}`)
  );
}
