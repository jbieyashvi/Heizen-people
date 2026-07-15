"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Client-side redirect so the root exports to a static index.html on GitHub
// Pages (a server redirect() cannot be statically served).
export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/support");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Link href="/support" className="text-sm font-medium text-heizen-700 underline">
        Continue to Support Center
      </Link>
    </div>
  );
}
