"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../login/auth_service";

export default function RootLayout({ children }: LayoutProps<"/">) {

    const router = useRouter();
    const [autenticado, setAuthenticated] = useState(false);
    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }
        setAuthenticated(true);
    }, [router]);

    if (!autenticado) return null;

    return <>{children}</>;
}
