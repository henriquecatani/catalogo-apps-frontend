"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { App, PaginatedResponse, Review } from "@/app/types";

const API_BASE = "http://localhost:3000";
const REVIEW_LIMIT = 10;

const DEFAULT_APP: App = {
  id: 1,
  name: "App Name",
  developer: "Developer Name",
  smallDescription:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mattis tristique erat.",
  markdownDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus, quam sit amet mollis bibendum, nibh nunc vehicula massa, vel molestie ante risus nec nulla. Fusce fermentum mi turpis. Maecenas interdum et mauris nec maximus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur vel diam in massa malesuada aliquet. Phasellus ut leo id urna lacinia lacinia. Cras vitae vulputate massa, quis blandit velit. Nullam efficitur bibendum elit, at fringilla velit ullamcorper nec. Donec porta lobortis placerat. Fusce at justo ut arcu posuere malesuada sed ut nibh. Nam in eros sed nibh vulputate tempor sit amet a ipsum.

Fusce quis dui ac purus tincidunt fermentum. Sed fringilla finibus erat non placerat. Suspendisse semper quis sem sit amet pulvinar. Cras at placerat metus, quis lobortis metus. Phasellus eleifend ante quis ante feugiat pharetra. Morbi at volutpat ante. Aliquam lobortis sed magna in pretium. Morbi feugiat lorem mattis, porta tortor ac, rhoncus diam. Mauris fermentum ipsum id diam placerat feugiat eu id est. Praesent consectetur placerat quam, eget pharetra orci ullamcorper vitae. In ut faucibus nunc. Duis nec faucibus metus, sit amet lacinia nisl.`,
  rating: 4.5,
  pricing: "free",
  link: "#",
  icon: "",
};

function AppDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const appId =
    (params?.id as string) ||
    (params?.app_id as string) ||
    searchParams.get("id") ||
    searchParams.get("app_id") ||
    "1";

  const [app, setApp] = useState<App>(DEFAULT_APP);
  const [, setLoadingApp] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number | null>(null);

  // Fetch App Data from /api/apps/{app_id}
  useEffect(() => {
    let isMounted = true;
    async function loadApp() {
      setLoadingApp(true);
      const endpoints = [
        `${API_BASE}/api/apps/${appId}`,
        `${API_BASE}/apps/${appId}`,
        `/api/apps/${appId}`,
        `/apps/${appId}`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data: App = await res.json();
            if (data && (data.name || data.id)) {
              if (isMounted) {
                setApp(data);
                setLoadingApp(false);
              }
              return;
            }
          }
        } catch {
          // Attempt next endpoint
        }
      }

      if (isMounted) {
        setApp({
          ...DEFAULT_APP,
          id: appId,
        });
        setLoadingApp(false);
      }
    }

    void loadApp();
    return () => {
      isMounted = false;
    };
  }, [appId]);

  // Fetch Reviews Data from /api/apps/{app_id}/reviews?page=1&limit=10
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setLoadingReviews(true);
      const queryString = `page=${reviewPage}&limit=${REVIEW_LIMIT}`;
      const endpoints = [
        `${API_BASE}/api/apps/${appId}/reviews?${queryString}`,
        `${API_BASE}/apps/${appId}/reviews?${queryString}`,
        `/api/apps/${appId}/reviews?${queryString}`,
        `/apps/${appId}/reviews?${queryString}`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const json: PaginatedResponse<Review> & {
              items?: Review[];
              reviews?: Review[];
              total?: number;
              totalCount?: number;
              totalPages?: number;
            } = await res.json();

            const items: Review[] = Array.isArray(json)
              ? json
              : Array.isArray(json?.data)
              ? json.data
              : Array.isArray(json?.items)
              ? json.items
              : Array.isArray(json?.reviews)
              ? json.reviews
              : [];

            if (isMounted) {
              setReviews(items);
              const total =
                json?.meta?.total ??
                json?.total ??
                json?.totalCount ??
                items.length;
              setTotalReviewsCount(total);

              const metaTotalPages =
                json?.meta?.totalPages ??
                json?.totalPages ??
                Math.max(1, Math.ceil(total / REVIEW_LIMIT));
              setTotalReviewPages(Math.max(1, metaTotalPages));
              setLoadingReviews(false);
            }
            return;
          }
        } catch {
          // Attempt next endpoint
        }
      }

      if (isMounted) {
        // Fallback reviews when offline
        const fallbackReviews: Review[] = [
          {
            id: (reviewPage - 1) * 10 + 1,
            name: "Muito bom o aplicativo",
            markdownText:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus, quam sit amet mollis bibendum, nibh nunc vehicula massa, vel molestie ante risus nec nulla. Fusce fermentum mi turpis.",
            rating: 5,
            user: { id: 1, name: "Anonymous" },
          },
          {
            id: (reviewPage - 1) * 10 + 2,
            name: "Aplicativo muito bom",
            markdownText:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus, quam sit amet mollis bibendum, nibh nunc vehicula massa.",
            rating: 4,
            user: { id: 2, name: "username" },
          },
        ];
        setReviews(fallbackReviews);
        setTotalReviewPages(3);
        setTotalReviewsCount(25);
        setLoadingReviews(false);
      }
    }

    void loadReviews();
    return () => {
      isMounted = false;
    };
  }, [appId, reviewPage]);

  const renderStars = (rating: number = 5) => {
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${
            i <= rounded ? "bi-star-fill" : "bi-star"
          } text-warning me-1`}
        ></i>
      );
    }
    return stars;
  };

  const devId =
    typeof app.developer === "object" && app.developer !== null
      ? app.developer.id
      : app.developerId;

  const devName =
    typeof app.developer === "object" && app.developer !== null
      ? app.developer.name
      : typeof app.developer === "string"
      ? app.developer
      : "Developer Name";

  const shortDescription =
    app.smallDescription ?? app.small_description ?? "";

  // Use markdownDescription (or markdown_description) rendered in plain text
  const longDescription =
    app.markdownDescription ||
    app.markdown_description ||
    (app as unknown as { markdown_desctiption?: string }).markdown_desctiption ||
    shortDescription ||
    "";

  return (
    <main className="container py-4" style={{ maxWidth: "900px" }}>
      {/* Cabeçalho superior do App */}
      <div className="d-flex align-items-start gap-3 my-4">
        {/* Botão de Voltar */}
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-link text-dark p-0 me-2"
          aria-label="Voltar"
        >
          <i className="bi bi-arrow-left fs-3"></i>
        </button>

        {/* Ícone / Logo do App */}
        {app.icon ? (
          <Image
            src={app.icon}
            alt={app.name || "App icon"}
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
            aria-label="App icon placeholder"
          />
        )}

        {/* Título, Desenvolvedor e Botão Website */}
        <div className="flex-grow-1">
          <h1 className="fw-normal mb-0" style={{ fontSize: "2rem" }}>
            {app.name}
          </h1>
          <p className="text-success mb-2" style={{ fontSize: "0.95rem" }}>
            {devId ? (
              <Link
                href={`/developers/dev?id=${devId}`}
                className="text-success text-decoration-none"
              >
                {devName}
              </Link>
            ) : (
              devName
            )}
          </p>
          <p
            className="text-secondary mb-3"
            style={{ fontSize: "0.9rem", maxWidth: "450px" }}
          >
            {shortDescription}
          </p>

          <a
            href={app.link && app.link !== "#" ? app.link : "#"}
            target={app.link && app.link !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="btn rounded-pill px-4 py-2 fw-medium shadow-sm"
            style={{
              backgroundColor: "#e3e150",
              color: "#fff",
              border: "none",
            }}
          >
            Ir para o Website
          </a>
        </div>

        {/* Avaliação e Badge de Precificação */}
        <div className="text-end d-flex flex-column align-items-end">
          <div className="display-6 fw-bold text-dark me-1">
            {(app.rating ?? 0).toFixed(1)}
          </div>
          <div>{renderStars(app.rating ?? 0)}</div>
          <span
            className="text-secondary d-block mt-1 mb-3"
            style={{ fontSize: "0.75rem" }}
          >
            {totalReviewsCount !== null
              ? `${totalReviewsCount.toLocaleString()} ${
                  totalReviewsCount === 1 ? "avaliação" : "avaliações"
                }`
              : "0 avaliações"}
          </span>

          <span
            className="badge rounded-pill px-3 py-2 fw-normal"
            style={{ backgroundColor: "#1e8238", fontSize: "0.85rem" }}
          >
            {app.pricing || "free"}
          </span>
        </div>
      </div>

      {/* Card Principal com Descrição Detalhada em Plain Text */}
      <section className="bg-white rounded-3 shadow-sm p-4 p-md-5 my-5">
        <p
          className="text-secondary lh-base mb-0"
          style={{ fontSize: "0.95rem", whiteSpace: "pre-line" }}
        >
          {longDescription}
        </p>
      </section>

      {/* Seção de Reviews / Avaliações */}
      <section className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <span
            className="badge rounded-pill px-4 py-2"
            style={{
              backgroundColor: "#e58a43",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Reviews
          </span>
          {loadingReviews && (
            <span className="text-muted small">Carregando avaliações...</span>
          )}
        </div>

        <div className="d-flex flex-column gap-3">
          {reviews.map((rev) => {
            const title =
              rev.name ||
              (rev as unknown as { title?: string }).title ||
              "Avaliação";
            const author =
              rev.user?.name ||
              (rev as unknown as { author?: string }).author ||
              "Usuário";
            const comment =
              rev.markdownText ||
              rev.markdown_text ||
              (rev as unknown as { comment?: string }).comment ||
              "";
            const rating = rev.rating ?? 5;

            return (
              <div
                key={rev.id}
                className="bg-white rounded-4 p-4 shadow-sm position-relative"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5
                    className="fw-bold mb-0 text-dark"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {title}
                  </h5>
                  <span
                    className="text-secondary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {author}
                  </span>
                </div>

                <p
                  className="text-secondary mb-3"
                  style={{ fontSize: "0.9rem", whiteSpace: "pre-line" }}
                >
                  {comment}
                </p>

                <div className="text-end">{renderStars(rating)}</div>
              </div>
            );
          })}

          {reviews.length === 0 && !loadingReviews && (
            <div className="bg-white rounded-4 p-4 text-center text-secondary">
              Nenhuma avaliação cadastrada ainda.
            </div>
          )}
        </div>

        {/* Controle de Páginas para as Reviews com metadados*/}
        <nav
          aria-label="Paginação de avaliações"
          className="mt-4 d-flex justify-content-center"
        >
          <ul className="pagination">
            <li className={`page-item ${reviewPage <= 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                disabled={reviewPage <= 1}
              >
                Anterior
              </button>
            </li>
            {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item ${
                    reviewPage === pageNum ? "active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setReviewPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              )
            )}
            <li
              className={`page-item ${
                reviewPage >= totalReviewPages ? "disabled" : ""
              }`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() =>
                  setReviewPage((p) => Math.min(totalReviewPages, p + 1))
                }
                disabled={reviewPage >= totalReviewPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      </section>
    </main>
  );
}

export default function AppDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-secondary">
          Carregando aplicativo...
        </div>
      }
    >
      <AppDetailContent />
    </Suspense>
  );
}
