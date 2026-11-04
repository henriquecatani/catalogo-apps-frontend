"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppCardItem from "@/app/components/AppCardItem";
import { App } from "@/app/types";

const API_BASE = "http://localhost:3000";

const FALLBACK_APPS: Partial<App>[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "Nome do Aplicativo",
  developer: "Desenvolvedor",
  small_description: "Descrição curta sobre o aplicativo em questão",
  rating: 4.5,
  pricing: "Free",
  icon: "",
}));

async function fetchAppsList(endpoint: string): Promise<Partial<App>[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error("Failed to fetch from API_BASE");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.slice(0, 10);
    }
  } catch {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.slice(0, 10);
        }
      }
    } catch {
      // Fallback to prototype placeholders when API is offline
    }
  }
  return FALLBACK_APPS;
}

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [trendingApps, setTrendingApps] = useState<Partial<App>[]>(FALLBACK_APPS);
  const [browserApps, setBrowserApps] = useState<Partial<App>[]>(FALLBACK_APPS);
  const [textEditorApps, setTextEditorApps] = useState<Partial<App>[]>(FALLBACK_APPS);

  useEffect(() => {
    fetchAppsList("/api/apps/trending").then(setTrendingApps);
    fetchAppsList("/api/apps?category=browser").then(setBrowserApps);
    fetchAppsList("/api/apps?category=text-editor").then(setTextEditorApps);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      router.push(`/apps?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/apps");
    }
  }

  return (
    <main className="container py-5">
      {/* Hero Section */}
      <section className="text-center my-5 py-3">
        <h1
          className="font-hepta mb-4"
          style={{ fontSize: "2.5rem", fontWeight: 400 }}
        >
          Encontre e avalie{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ebd052 0%, #d87b33 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            aplicativos
          </span>
        </h1>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mb-3"
          style={{ maxWidth: "640px" }}
        >
          <div
            className="input-group bg-white rounded-pill shadow-sm px-3 py-1 align-items-center"
            style={{ border: "2px solid #a8d796" }}
          >
            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Pesquisa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="btn border-0 bg-transparent text-secondary"
              aria-label="Pesquisar"
            >
              <i className="bi bi-search fs-5"></i>
            </button>
          </div>
        </form>

        {/* Explore Badges */}
        <div className="d-flex align-items-center justify-content-center gap-3 mt-3 flex-wrap">
          <span className="fs-5 text-dark">ou explore:</span>
          <Link
            href="/apps"
            className="badge rounded-pill text-dark text-decoration-none fw-medium px-4 py-2 shadow-sm"
            style={{ backgroundColor: "#b5e6a2", fontSize: "1rem" }}
          >
            Aplicativos
          </Link>
          <Link
            href="/developers"
            className="badge rounded-pill text-dark text-decoration-none fw-medium px-4 py-2 shadow-sm"
            style={{ backgroundColor: "#f6cfa0", fontSize: "1rem" }}
          >
            Desenvolvedores
          </Link>
        </div>
      </section>

      {/* Trending Apps Side-Scrolling List */}
      <section className="mb-5">
        <h3 className="fw-normal mb-3">Trending Apps:</h3>
        <div className="d-flex flex-nowrap overflow-x-auto gap-4 pb-3">
          {trendingApps.map((app, index) => (
            <div
              key={app.id ?? index}
              style={{ minWidth: "260px", maxWidth: "260px", flex: "0 0 auto" }}
            >
              <AppCardItem app={app} />
            </div>
          ))}
        </div>
      </section>

      {/* Browsers Side-Scrolling List */}
      <section className="mb-5">
        <h3 className="fw-normal mb-3">Browsers:</h3>
        <div className="d-flex flex-nowrap overflow-x-auto gap-4 pb-3">
          {browserApps.map((app, index) => (
            <div
              key={app.id ?? index}
              style={{ minWidth: "260px", maxWidth: "260px", flex: "0 0 auto" }}
            >
              <AppCardItem app={app} />
            </div>
          ))}
        </div>
      </section>

      {/* Text Editors Side-Scrolling List */}
      <section className="mb-5">
        <h3 className="fw-normal mb-3">Text Editors:</h3>
        <div className="d-flex flex-nowrap overflow-x-auto gap-4 pb-3">
          {textEditorApps.map((app, index) => (
            <div
              key={app.id ?? index}
              style={{ minWidth: "260px", maxWidth: "260px", flex: "0 0 auto" }}
            >
              <AppCardItem app={app} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
