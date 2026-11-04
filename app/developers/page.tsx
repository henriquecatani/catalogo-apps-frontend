"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Developer } from "@/app/types";

const API_BASE = "http://localhost:3000";
const ITEMS_PER_PAGE = 9;

const FALLBACK_DEVS: Developer[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: i === 1 ? "Nome do Desenvolvedor" : "Nome do Desenvolvedor",
  icon: "",
  app_count: i === 1 ? 2 : 5,
}));

function DevelopersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1
  );

  const [devs, setDevs] = useState<Developer[]>(FALLBACK_DEVS.slice(0, ITEMS_PER_PAGE));
  const [totalPages, setTotalPages] = useState<number>(2);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(page));
    params.set("limit", String(ITEMS_PER_PAGE));

    const queryString = params.toString();
    router.replace(`/developers?${queryString}`, { scroll: false });

    async function loadDevs() {
      try {
        const res = await fetch(`${API_BASE}/api/developers?${queryString}`);
        if (!res.ok) throw new Error("API_BASE failed");
        const data = await res.json();
        const items: Developer[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (items.length > 0) {
          setDevs(items.slice(0, ITEMS_PER_PAGE));
          setTotalPages(
            data?.totalPages ??
              (items.length > ITEMS_PER_PAGE
                ? Math.ceil(items.length / ITEMS_PER_PAGE)
                : Math.max(page, 1))
          );
          return;
        }
      } catch {
        try {
          const res = await fetch(`/api/developers?${queryString}`);
          if (res.ok) {
            const data = await res.json();
            const items: Developer[] = Array.isArray(data)
              ? data
              : Array.isArray(data?.items)
              ? data.items
              : [];
            if (items.length > 0) {
              setDevs(items.slice(0, ITEMS_PER_PAGE));
              return;
            }
          }
        } catch {
          // Fallback to offline mock data
        }
      }

      // Offline fallback filtering & pagination
      let filtered = [...FALLBACK_DEVS];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((dev) =>
          dev.name?.toLowerCase().includes(q)
        );
      }

      if (filtered.length === 0) {
        filtered = [...FALLBACK_DEVS];
      }

      const calculatedPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setTotalPages(calculatedPages);
      const start = (page - 1) * ITEMS_PER_PAGE;
      setDevs(filtered.slice(start, start + ITEMS_PER_PAGE));
    }

    void loadDevs();
  }, [searchQuery, page, router]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  }

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  return (
    <main className="container py-4">
      {/* Page Title */}
      <section className="text-center my-4">
        <h1
          className="font-hepta mb-4"
          style={{ fontSize: "2.5rem", fontWeight: 400 }}
        >
          Pesquisar{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ebd052 0%, #d87b33 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Desenvolvedores
          </span>
        </h1>

        {/* Search Box */}
        <div className="d-flex align-items-center justify-content-center">
          <form
            onSubmit={handleSearchSubmit}
            className="w-100"
            style={{ maxWidth: "560px" }}
          >
            <div
              className="input-group bg-white rounded-pill shadow-sm px-3 py-1 align-items-center"
              style={{ border: "2px solid #9be382" }}
            >
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none"
                placeholder="Pesquisa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn border-0 bg-transparent text-dark"
                aria-label="Pesquisar"
              >
                <i className="bi bi-arrow-right fs-5"></i>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Developers List */}
      <section className="mx-auto mt-5" style={{ maxWidth: "860px" }}>
        <div className="d-flex flex-column gap-3">
          {devs.map((dev, index) => {
            const count = dev.app_count ?? dev.apps?.length ?? 0;
            const appLabel = count === 1 ? "1 app" : `${count} apps`;

            return (
              <Link
                key={dev.id ?? index}
                href={dev.id ? `/developers/${dev.id}` : "#"}
                className="bg-white rounded-4 shadow-sm px-4 py-3 d-flex align-items-center justify-content-between text-decoration-none text-dark transition-all"
                style={{
                  border: "1px solid #f0f0f0",
                }}
              >
                {/* Left: Icon & Name */}
                <div className="d-flex align-items-center gap-4">
                  {dev.icon ? (
                    <Image
                      src={dev.icon}
                      alt={dev.name}
                      width={56}
                      height={56}
                      className="rounded-3"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        backgroundColor: "#b0b4b8",
                        borderRadius: "1rem",
                        flexShrink: 0,
                      }}
                      aria-label="Developer icon placeholder"
                    />
                  )}
                  <span className="fw-medium text-dark" style={{ fontSize: "1.1rem" }}>
                    {dev.name}
                  </span>
                </div>

                {/* Right: Apps Count */}
                <span className="text-secondary" style={{ fontSize: "1rem" }}>
                  {appLabel}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="Paginação de desenvolvedores" className="mt-5 d-flex justify-content-center">
            <ul className="pagination">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
              </li>
              {pageNumbers.map((num) => (
                <li
                  key={num}
                  className={`page-item ${page === num ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima
                </button>
              </li>
            </ul>
          </nav>
        )}
      </section>
    </main>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Carregando...</div>}>
      <DevelopersListContent />
    </Suspense>
  );
}
