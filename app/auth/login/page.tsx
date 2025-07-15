// next
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// utils
import { createClient } from "@/utils/supabase/server";
// actions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OAuthButtons } from "@/domains/auth/components/oauth-signin";
// constants
import { appDefaultUrl, loginErrorMessage } from "@/domains/auth/constant";

export default async function login(props: {
  searchParams: Promise<{ message: string }>;
}) {
  const searchParams = await props.searchParams;
  const cookieJar = await cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect(appDefaultUrl);
  }

  return (
    <section className="h-[calc(100vh-57px)] flex flex-1 flex-col justify-center items-center">
      <Card className="mx-auto min-w-96">
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {searchParams?.message && (
            <div className="text-destructive text-center text-sm mb-2">
              {searchParams.message || loginErrorMessage}
            </div>
          )}
          <OAuthButtons lastSignedInMethod={lastSignedInMethod} />
        </CardContent>
      </Card>
    </section>
  );
}
