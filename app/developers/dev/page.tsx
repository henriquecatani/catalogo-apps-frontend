"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import AppCardItem from "@/app/components/AppCardItem";
import { Developer, App } from "@/app/types";

const API_BASE = "http://localhost:3000";

// Dados mockados estáticos para fallback offline
const DEFAULT_APPS: Partial<App>[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: "Nome do Aplicativo",
  developer: "Dev Name",
  small_description: "Descrição curta sobre o aplicativo em questão",
  rating: 4.5,
  pricing: "Free",
  icon: "",
}));

const DEFAULT_DEV: Developer = {
  id: 1,
  name: "Dev Name",
  icon: "",
  apps: DEFAULT_APPS as App[],
};

function DeveloperDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const devId =
    (params?.id as string) ||
    (params?.dev_id as string) ||
    searchParams.get("id") ||
    searchParams.get("dev_id") ||
    "1";

  const [developer, setDeveloper] = useState<Developer>(DEFAULT_DEV);
  const [loading, setLoading] = useState(true);

  // Requisição GET para /developers/{dev_id}
  useEffect(() => {
    let isMounted = true;
    async function loadDeveloper() {
      setLoading(true);
      const endpoints = [
        `${API_BASE}/api/developers/${devId}`,
        `${API_BASE}/developers/${devId}`,
        `/api/developers/${devId}`,
        `/developers/${devId}`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data && (data.name || data.id)) {
              if (isMounted) {
                setDeveloper(data);
                setLoading(false);
              }
              return;
            }
          }
        } catch {
          // Tenta próximo endpoint
        }
      }

      if (isMounted) {
        setDeveloper({
          ...DEFAULT_DEV,
          id: devId,
        });
        setLoading(false);
      }
    }

    void loadDeveloper();
    return () => {
      isMounted = false;
    };
  }, [devId]);

  const appsList = developer.apps ?? [];

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
        {developer.icon ? (
          <Image
            src={developer.icon}
            alt={developer.name || "Developer icon"}
            width={90}
            height={90}
            className="rounded-4 flex-shrink-0"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <div
            className="rounded-4 flex-shrink-0"
            style={{
              width: "90px",
              height: "90px",
              backgroundColor: "#b0b4b8",
            }}
            aria-label="Developer icon placeholder"
          />
        )}

        {/* Nome do Desenvolvedor */}
        <h1 className="fw-normal mb-0" style={{ fontSize: "2.2rem" }}>
          {developer.name}
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
          {appsList.map((app, index) => (
            <div
              key={app.id ?? index}
              className="col-12 col-sm-6 col-lg-4"
            >
              <AppCardItem
                app={{
                  ...app,
                  developer: app.developer ?? developer.name,
                }}
              />
            </div>
          ))}

          {appsList.length === 0 && !loading && (
            <div className="col-12 text-center text-secondary py-5">
              Nenhum aplicativo cadastrado para este desenvolvedor.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function DeveloperDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-secondary">
          Carregando desenvolvedor...
        </div>
      }
    >
      <DeveloperDetailContent />
    </Suspense>
  );
}
