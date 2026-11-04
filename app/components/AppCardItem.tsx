import Link from "next/link";
import Image from "next/image";
import { App } from "@/app/types";

export interface AppCardItemProps {
  app?: Partial<App>;
  id?: string | number;
  name?: string;
  icon?: string;
  developerName?: string;
  small_description?: string;
  rating?: number;
  pricing?: string;
  link?: string;
}

export default function AppCardItem({
  app,
  id,
  name,
  icon,
  developerName,
  small_description,
  rating,
  pricing,
  link,
}: AppCardItemProps) {
  const appId = id ?? app?.id;
  const appName = name ?? app?.name ?? "Nome do Aplicativo";
  const appIcon = icon ?? app?.icon;
  const devName = developerName ?? app?.developer?.name ?? "Desenvolvedor";
  const description =
    small_description ??
    app?.small_description ??
    "Descrição curta sobre o aplicativo";
  const appRating = rating ?? app?.rating ?? 4.5;
  const appPricing = pricing ?? app?.pricing ?? "Free";
  const appLink = link ?? app?.link ?? (appId ? `/apps/${appId}` : "#");

  return (
    <div
      className="card h-100 border bg-white p-3 p-sm-4 text-decoration-none shadow-sm d-flex flex-column"
      style={{
        borderRadius: "2rem",
        transition: "box-shadow 0.2s ease",
      }}
    >
      <Link href={appLink} className="text-decoration-none text-dark d-flex flex-column h-100">
        {/* App Icon */}
        <div className="d-flex justify-content-center mb-3">
          {appIcon ? (
            <Image
              src={appIcon}
              alt={`${appName} icon`}
              width={220}
              height={220}
              className="img-fluid"
              style={{
                width: "100%",
                maxWidth: "220px",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: "1.5rem",
              }}
              unoptimized
            />
          ) : (
            <div
              className="w-100"
              style={{
                maxWidth: "220px",
                aspectRatio: "1 / 1",
                backgroundColor: "#b0b4b8",
                borderRadius: "1.5rem",
              }}
              aria-label="App icon placeholder"
            />
          )}
        </div>

        {/* App Name */}
        <h5
          className="fw-semibold text-center mb-1 text-dark"
          style={{ fontSize: "1.25rem" }}
        >
          {appName}
        </h5>

        {/* Developer Name */}
        <p className="text-secondary text-center small mb-2">{devName}</p>

        {/* Short Description (2 lines clamp) */}
        <p
          className="text-secondary text-center small mb-3 flex-grow-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.4",
            minHeight: "2.8em",
          }}
        >
          {description}
        </p>

        {/* Bottom Row: Rating and Pricing */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
          {/* Rating */}
          <div className="d-flex align-items-center gap-1">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#e6ce4d"
              stroke="#d4b728"
              strokeWidth="0.8"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="fw-medium text-secondary" style={{ fontSize: "1rem" }}>
              {typeof appRating === "number" ? appRating.toFixed(1) : appRating}
            </span>
          </div>

          {/* Pricing Badge */}
          <span
            className="badge rounded-pill px-4 py-2 fw-medium"
            style={{
              backgroundColor: "#357521",
              color: "#000000",
              fontSize: "0.95rem",
            }}
          >
            {appPricing}
          </span>
        </div>
      </Link>
    </div>
  );
}
