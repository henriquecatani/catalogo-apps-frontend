"use client";

import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="container py-5 text-center">
      <div className="bg-white p-5 rounded-4 shadow-sm mx-auto" style={{ maxWidth: "540px" }}>
        <h2 className="h4 mb-3">Sem acesso.</h2>
        <p className="text-secondary mb-4">
          Você não tem permissões administrativas.
        </p>
        <Link
          href="/"
          className="btn rounded-pill px-4 py-2"
          style={{ backgroundColor: "#8ce071", color: "#333333" }}
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </main>
  );
}
