"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  const router = useRouter();

  // Refresh the router cache so that proxy re-checks the session on auth pages
  useEffect(() => {
    router.refresh();
  }, [router]);

  return children;
}
