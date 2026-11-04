"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isAuthenticated } from "../login/auth_service";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [autenticado, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const isAppsActive = pathname?.startsWith("/apps");
  const isDevsActive = pathname?.startsWith("/developers");

  return (
    <header className="py-3 px-4">
      <div className="container-fluid d-flex align-items-center justify-content-between position-relative">
        {/* Brand Logo & Name */}
        <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
          <Image
            src="/logo.png"
            alt="Butiápps Logo"
            width={36}
            height={36}
            unoptimized
          />
          <span
            className="font-hepta"
            style={{ fontSize: "1.5rem", fontWeight: 400 }}
          >
            Butiápps
          </span>
        </Link>

        {/* Center Navigation Pill */}
        <nav className="bg-white rounded-pill shadow-sm p-1 d-flex align-items-center gap-4 position-absolute top-50 start-50 translate-middle"
          style={{ border: "1px solid #e5e5e5" }}
        >
          <Link
            href="/apps"
            className="text-dark text-decoration-none fw-normal rounded-pill px-4 py-1"
            style={{
              fontSize: "1rem",
              backgroundColor: isAppsActive ? "#9be382" : "transparent",
            }}
          >
            Aplicativos
          </Link>
          <Link
            href="/developers"
            className="text-dark text-decoration-none fw-normal rounded-pill px-4 py-1"
            style={{
              fontSize: "1rem",
              backgroundColor: isDevsActive ? "#9be382" : "transparent",
            }}
          >
            Desenvolvedores
          </Link>
        </nav>

        {/* Right User Profile / Login Button */}
        <div>
          <Link
            href={autenticado ? "/admin" : "/login"}
            className="d-flex align-items-center justify-content-center rounded-circle text-decoration-none shadow-sm"
            style={{
              width: "42px",
              height: "42px",
              backgroundColor: "#a3e496",
              color: "#ffffff",
            }}
            title={autenticado ? "Painel" : "Entrar"}
          >
            <i className="bi bi-person fs-4"></i>
          </Link>
        </div>
      </div>
    </header>
  );
}
