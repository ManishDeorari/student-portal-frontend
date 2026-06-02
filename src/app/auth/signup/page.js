"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login?view=SIGNUP");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Redirecting to the merged login/signup portal...
    </div>
  );
}
