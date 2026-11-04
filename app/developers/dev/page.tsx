"use client";

import { useRouter } from "next/navigation";
import AppCardItem from "@/app/components/AppCardItem";
import { App } from "@/app/types";

// Dados mockados estáticos para preencher os cards do desenvolvedor
const DEVELOPER_APPS: Partial<App>[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: "Nome do Aplicativo",
  developer: "Dev Name",
  small_description: "Descrição curta sobre o aplicativo em questão",
  rating: 4.5,
  pricing: "Free",
  icon: "",
}));

export default function DeveloperDetailPage() {
  const router = useRouter();

  return (
    <main className="container py-4" style={{ maxWidth: "1000px" }}>
      {/* Cabeçalho do Desenvolvedor */}
      <div className="d-flex align-items-center gap-3 my-4">
        {/* Botão de Voltar */}
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-link text-dark p-0 me-2"
          aria-label="Voltar"
        >
          <i className="bi bi-arrow-left fs-3"></i>
        </button>

        {/* Ícone / Avatar do Desenvolvedor */}
        <div
          className="bg-secondary rounded-4 flex-shrink-0"
          style={{ width: "90px", height: "90px" }}
        ></div>

        {/* Nome do Desenvolvedor */}
        <h1 className="fw-normal mb-0" style={{ fontSize: "2.2rem" }}>
          Dev Name
        </h1>
      </div>

      {/* Seção de Apps do Desenvolvedor */}
      <section className="mt-5 text-center">
        {/* Badge "Apps" */}
        <div className="mb-4">
          <span
            className="badge rounded-pill px-4 py-2 text-white"
            style={{
              backgroundColor: "#e58a43",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Apps
          </span>
        </div>

        {/* Grid de Cards de Aplicativos */}
        <div className="row g-4 text-start">
          {DEVELOPER_APPS.map((app, index) => (
            <div
              key={app.id ?? index}
              className="col-12 col-sm-6 col-lg-4"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/apps/app")}
            >
              <AppCardItem app={app} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}