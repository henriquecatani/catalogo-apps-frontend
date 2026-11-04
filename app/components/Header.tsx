"use client";

import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "../login/auth_service";
import { useEffect, useState } from "react";

export default function Header() {
  const [autenticado, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

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
            <span className="font-hepta" style={{ fontSize: "1.5rem", fontWeight: 400 }}>
        Butiápps
      </span>
          </Link>

          {/* Center Navigation Pill - Centered Absolutely */}
          <nav
              className="bg-white rounded-pill shadow-sm px-4 py-2 d-flex align-items-center gap-4 position-absolute top-50 start-50 translate-middle"
              style={{ border: "1px solid #e5e5e5" }}
          >
            <Link href="/apps" className="text-dark text-decoration-none fw-normal" style={{ fontSize: "1rem" }}>
              Aplicativos
            </Link>
            <Link href="/developers" className="text-dark text-decoration-none fw-normal" style={{ fontSize: "1rem" }}>
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
