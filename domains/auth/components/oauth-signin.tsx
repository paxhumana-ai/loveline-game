"use client";

import { Button } from "@/components/ui/button";
import { Provider } from "@supabase/supabase-js";
import { oAuthSignIn } from "@/domains/auth/actions";
import { useSearchParams } from "next/navigation";

import type { JSX } from "react";

function GoogleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_911_2406)">
        <path
          d="M23.9866 12.2242C23.9866 11.2409 23.9049 10.5234 23.7282 9.7793H12.2383V14.2173H18.9826C18.8467 15.3202 18.1124 16.9811 16.4807 18.0972L16.4578 18.2458L20.0907 20.996L20.3424 21.0205C22.654 18.9344 23.9866 15.8649 23.9866 12.2242Z"
          fill="#4285F4"
        />
        <path
          d="M12.2391 23.9178C15.5433 23.9178 18.3171 22.8548 20.3432 21.0211L16.4815 18.0978C15.4481 18.8021 14.0611 19.2937 12.2391 19.2937C9.00291 19.2937 6.25622 17.2076 5.27711 14.3242L5.13359 14.3361L1.35604 17.193L1.30664 17.3272C3.31906 21.2337 7.45273 23.9178 12.2391 23.9178Z"
          fill="#34A853"
        />
        <path
          d="M5.27775 14.3238C5.0194 13.5797 4.86989 12.7824 4.86989 11.9586C4.86989 11.1347 5.0194 10.3375 5.26416 9.59342L5.25732 9.43494L1.43243 6.53223L1.30729 6.59039C0.477873 8.21149 0.00195312 10.0319 0.00195312 11.9586C0.00195312 13.8853 0.477873 15.7056 1.30729 17.3267L5.27775 14.3238Z"
          fill="#FBBC05"
        />
        <path
          d="M12.2391 4.62403C14.5371 4.62403 16.0871 5.59402 16.971 6.40461L20.4248 3.10928C18.3036 1.1826 15.5433 0 12.2391 0C7.45273 0 3.31906 2.68406 1.30664 6.59057L5.26351 9.59359C6.25622 6.7102 9.00291 4.62403 12.2391 4.62403Z"
          fill="#EB4335"
        />
      </g>
      <defs>
        <clipPath id="clip0_911_2406">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

type OAuthProvider = {
  name: Provider;
  displayName: string;
  icon?: JSX.Element;
};

export function OAuthButtons({
  lastSignedInMethod,
  isRegister,
}: {
  lastSignedInMethod?: string;
  isRegister?: boolean;
}) {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: "google",
      displayName: "구글",
      icon: <GoogleIcon />,
    },
  ];
  const searchParams = useSearchParams();
  const enrollmentCode = searchParams.get("enrollment_code");

  return (
    <>
      {oAuthProviders.map((provider) => (
        <Button
          key={provider.name}
          className="relative w-full flex items-center justify-center gap-2"
          variant="outline"
          onClick={async () => {
            await oAuthSignIn(provider.name, enrollmentCode);
          }}
        >
          {provider.icon}
          {provider.displayName} 계정으로 {isRegister ? "회원가입" : "로그인"}
          {lastSignedInMethod === "google" && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full whitespace-nowrap ml-8 bg-accent px-4 py-1 rounded-md text-xs text-foreground/80">
              <div className="absolute -left-5 top-0 border-background border-[12px] border-r-accent" />
              최근 로그인
            </div>
          )}
        </Button>
      ))}
    </>
  );
}
