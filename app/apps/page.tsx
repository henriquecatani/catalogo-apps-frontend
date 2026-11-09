"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppCardItem from "@/app/components/AppCardItem";
import { App, PaginatedResponse } from "@/app/types";
import {CATEGORIES} from "@/app/types/CATEGORIES";

const API_BASE = "http://localhost:3000";
const ITEMS_PER_PAGE = 9;

const PRICING_OPTIONS = [
  { label: "Grátis", value: "free" },
  { label: "Pago", value: "paid" },
  { label: "Freemium", value: "freemium" },
  { label: "FOSS", value: "foss" },
];

const FALLBACK_APPS: Partial<App>[] = Array.from(
  { length: 18 },
  (_, i) => ({
    id: i + 1,
    name: i === 0 ? "Nome do Aplicativo" : `Nome do Aplicativo ${i + 1}`,
    developer: "Desenvolvedor",
    smallDescription: "Descrição curta sobre o aplicativo",
    rating: Number((4.5 - (i % 5) * 0.2).toFixed(1)),
    pricing: i % 4 === 0 ? "free" : i % 4 === 1 ? "paid" : i % 4 === 2 ? "freemium" : "foss",
    category: CATEGORIES[i % CATEGORIES.length].value,
    icon: "",
  })
);

function AppsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [selectedPricing, setSelectedPricing] = useState<string | null>(
    searchParams.get("pricing")
  );
  const [orderBy, setOrderBy] = useState<"rating" | "name">(
    searchParams.get("sortBy") === "alphabetical" ? "name" : "rating"
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1
  );

  const [apps, setApps] = useState<Partial<App>[]>(FALLBACK_APPS.slice(0, ITEMS_PER_PAGE));
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedPricing) params.set("pricing", selectedPricing);
    if (searchQuery) params.set("search", searchQuery);
    if (orderBy === "name") {
      params.set("sortBy", "alphabetical");
    }
    params.set("page", String(page));
    params.set("limit", String(ITEMS_PER_PAGE));

    const queryString = params.toString();
    router.replace(`/apps?${queryString}`, { scroll: false });

    async function loadApps() {
      const urls = [
        `${API_BASE}/api/apps?${queryString}`,
        `/api/apps?${queryString}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json: PaginatedResponse<Partial<App>> & {
            items?: Partial<App>[];
            totalPages?: number;
          } = await res.json();

          const items: Partial<App>[] = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.items)
            ? json.items
            : [];

          const metaTotalPages =
            json?.meta?.totalPages ??
            json?.totalPages ??
            Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

          setApps(items);
          setTotalPages(Math.max(1, metaTotalPages));
          if (typeof json?.meta?.total === "number") {
            setTotalItems(json.meta.total);
          }
          return;
        } catch {
          // Try next URL
        }
      }

      // Offline fallback filtering, sorting, and pagination
      let filtered = [...FALLBACK_APPS];
      if (selectedCategory) {
        filtered = filtered.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      if (selectedPricing) {
        filtered = filtered.filter(
          (item) =>
            item.pricing?.toLowerCase() === selectedPricing.toLowerCase()
        );
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name?.toLowerCase().includes(q) ||
            (item.smallDescription ?? item.small_description)?.toLowerCase().includes(q)
        );
      }

      const sorted = sortItems(filtered, orderBy);
      const calculatedPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
      setTotalPages(calculatedPages);
      setTotalItems(sorted.length);
      const start = (page - 1) * ITEMS_PER_PAGE;
      setApps(sorted.slice(start, start + ITEMS_PER_PAGE));
    }

    void loadApps();
  }, [selectedCategory, selectedPricing, searchQuery, orderBy, page, router]);

  function sortItems(items: Partial<App>[], order: "name" | "rating") {
    return [...items].sort((a, b) => {
      if (order === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  }

  function toggleCategory(catValue: string) {
    setPage(1);
    setSelectedCategory((prev) => (prev === catValue ? null : catValue));
  }

  function togglePricing(priceValue: string) {
    setPage(1);
    setSelectedPricing((prev) => (prev === priceValue ? null : priceValue));
  }

  function toggleOrder() {
    setPage(1);
    setOrderBy((prev) => (prev === "rating" ? "name" : "rating"));
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
            Aplicativos
          </span>
        </h1>

        {/* Search Bar + Order Toggle */}
        <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-grow-1"
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

          <button
            type="button"
            onClick={toggleOrder}
            className="btn bg-white rounded-pill shadow-sm px-4 py-2 d-flex align-items-center gap-2"
            style={{ border: "1px solid #e5e5e5" }}
            title="Alternar ordenação entre Nota e Ordem Alfabética"
          >
            <i className="bi bi-arrow-down"></i>
            <span>
              Ordenar ({orderBy === "name" ? "Nome" : "Nota"})
            </span>
          </button>
        </div>
      </section>

      {/* Main Layout: Sidebar Filters + 9 Cards Grid */}
      <section className="row mt-5 g-4">
        {/* Left Sidebar Filters */}
        <aside className="col-12 col-md-3 col-lg-2">
          {/* Botão Criar Aplicativo */}
          <button
            type="button"
            onClick={() => router.push("/apps/create")}
            className="btn rounded-pill w-100 py-2 mb-3 fw-medium shadow-sm"
            style={{
              backgroundColor: "#8ce071",
              color: "#222222",
              fontSize: "0.9rem",
            }}
          >
            + Cadastrar App
          </button>

          {/* Categorias */}
          <div className="bg-white border mb-4">
            <div className="px-3 py-2 border-bottom fw-normal text-dark">
              Categorias
            </div>
            <ul className="list-group list-group-flush">
              {CATEGORIES.map((category) => {
                const isSelected =
                  selectedCategory?.toLowerCase() === category.value.toLowerCase();
                return (
                  <li
                    key={category.value}
                    className="list-group-item px-3 py-1 d-flex align-items-center gap-2"
                    style={{ cursor: "pointer", fontSize: "0.85rem" }}
                    onClick={() => toggleCategory(category.value)}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span className="text-secondary">{category.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Precificação */}
          <div className="bg-white border">
            <div className="px-3 py-2 border-bottom fw-normal text-dark">
              Precificação
            </div>
            <ul className="list-group list-group-flush">
              {PRICING_OPTIONS.map((option) => {
                const isSelected =
                  selectedPricing?.toLowerCase() === option.value.toLowerCase();
                return (
                  <li
                    key={option.value}
                    className="list-group-item px-3 py-1 d-flex align-items-center gap-2"
                    style={{ cursor: "pointer", fontSize: "0.85rem" }}
                    onClick={() => togglePricing(option.value)}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span className="text-secondary">{option.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Right 9 App Cards Grid */}
        <div className="col-12 col-md-9 col-lg-10">
          {totalItems !== null && (
            <div className="mb-3 text-secondary small">
              Total encontrado: {totalItems} {totalItems === 1 ? "aplicativo" : "aplicativos"}
            </div>
          )}

          <div className="row g-4">
            {apps.slice(0, ITEMS_PER_PAGE).map((app, index) => (
              <div key={app.id ?? index} className="col-12 col-sm-6 col-lg-4">
                <AppCardItem app={app} />
              </div>
            ))}

            {apps.length === 0 && (
              <div className="col-12 text-center text-secondary py-5">
                Nenhum aplicativo encontrado para os filtros selecionados.
              </div>
            )}
          </div>

          {/* Pagination Controls based on meta.totalPages */}
          <nav aria-label="Paginação de aplicativos" className="mt-5 d-flex justify-content-center">
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
        </div>
      </section>
    </main>
  );
}

export default function AppsPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Carregando...</div>}>
      <AppsListContent />
    </Suspense>
  );
}
