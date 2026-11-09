"use client";

import {FormEvent, Suspense, useEffect, useState} from "react";
import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import DeveloperSelectMenu from "@/app/components/DeveloperSelectMenu";
import {getToken, isAuthenticated} from "@/app/login/auth_service";
import {App, Developer} from "@/app/types";
import {CATEGORIES} from "@/app/types/CATEGORIES";

const API_BASE = "http://localhost:3000";

const PRICING_OPTIONS = [
  { label: "Free (Grátis)", value: "free" },
  { label: "Paid (Pago)", value: "paid" },
  { label: "Freemium", value: "freemium" },
  { label: "FOSS", value: "foss" },
];

function CreateOrEditAppContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editAppId = searchParams.get("id") || searchParams.get("app_id");
  const isEditing = !!editAppId;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [link, setLink] = useState("");
  const [smallDescription, setSmallDescription] = useState("");
  const [markdownDescription, setMarkdownDescription] = useState("");
  const [category, setCategory] = useState("Browsers");
  const [pricing, setPricing] = useState("free");
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(
    null
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // precisa login
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  /// EDIÇÃO
  useEffect(() => {
    if (!editAppId) return;

    let isMounted = true;
    async function loadAppToEdit() {
      const urls = [
        `${API_BASE}/api/apps/${editAppId}`,
        `${API_BASE}/apps/${editAppId}`,
        `/api/apps/${editAppId}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data: App = await res.json();
          if (data && (data.name || data.id) && isMounted) {
            setName(data.name ?? "");
            setIcon(data.icon ?? "");
            setLink(data.link ?? "");
            setSmallDescription(
              data.smallDescription ?? data.small_description ?? ""
            );
            setMarkdownDescription(
              data.markdownDescription ?? data.markdown_description ?? ""
            );
            if (data.category) setCategory(data.category);
            if (data.pricing) setPricing(data.pricing);

            if (typeof data.developer === "object" && data.developer !== null) {
              setSelectedDeveloper(data.developer);
            } else if (data.developerId) {
              setSelectedDeveloper({
                id: data.developerId,
                name:
                  typeof data.developer === "string"
                    ? data.developer
                    : `Desenvolvedor #${data.developerId}`,
              });
            }
            return;
          }
        } catch {
        }
      }
    }

    void loadAppToEdit();
    return () => {
      isMounted = false;
    };
  }, [editAppId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedDeveloper?.id) {
      setError("Selecione ou cadastre um desenvolvedor para o aplicativo.");
      return;
    }

    setLoading(true);
    const token = getToken();

    const payload = {
      name: name.trim(),
      icon: icon.trim(),
      link: link.trim(),
      smallDescription: smallDescription.trim(),
      markdownDescription: markdownDescription.trim(),
      category,
      pricing,
      developerId: Number(selectedDeveloper.id),
    };

    try {
      if (isEditing && editAppId) {
        const res = await fetch(`${API_BASE}/api/apps/${editAppId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData?.message || "Não foi possível atualizar o aplicativo."
          );
          setLoading(false);
          return;
        }

        // reload
        router.push(`/apps/app?id=${editAppId}`);
      } else {
        const res = await fetch(`${API_BASE}/api/apps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            resData?.message || "Não foi possível cadastrar o aplicativo."
          );
          setLoading(false);
          return;
        }

        const createdId = resData?.data?.id ?? resData?.id;
        if (createdId) {
          router.push(`/apps/app?id=${createdId}`);
        } else {
          router.push("/apps");
        }
      }
    } catch {
      setError(
        "Erro ao conectar com o servidor. Verifique se a API está rodando."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-4" style={{ maxWidth: "820px" }}>
      {/* Cabeçalho */}
      <div className="position-relative d-flex align-items-center justify-content-center my-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-link text-dark p-0 position-absolute start-0"
          aria-label="Voltar"
        >
          <i className="bi bi-arrow-left fs-2"></i>
        </button>

        <h1
          className="font-hepta mb-0 text-center"
          style={{ fontSize: "2.4rem", fontWeight: 400 }}
        >
          {isEditing ? "Editar " : "Cadastrar "}
          <span
            style={{
              background: "linear-gradient(90deg, #ebd052 0%, #d87b33 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Aplicativo
          </span>
        </h1>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Seção Superior */}
        <div className="row g-3 align-items-stretch mb-3">
          {/* Esquerda: Imagem */}
          <div className="col-12 col-md-3 d-flex flex-column align-items-center justify-content-between">
            <div className="mb-2">
              {icon.trim() ? (
                <Image
                  src={icon.trim()}
                  alt={name || "Preview do ícone"}
                  width={135}
                  height={135}
                  className="rounded-4 border shadow-sm"
                  style={{
                    width: "135px",
                    height: "135px",
                    objectFit: "cover",
                  }}
                  unoptimized
                />
              ) : (
                <div
                  className="rounded-4"
                  style={{
                    width: "135px",
                    height: "135px",
                    backgroundColor: "#b0b4b8",
                  }}
                  aria-label="Preview de ícone vazio"
                />
              )}
            </div>

            <input
              type="url"
              className="form-control rounded-pill border-secondary px-3 py-2 bg-white w-100"
              placeholder="Image link"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          {/* Direita */}
          <div className="col-12 col-md-9 d-flex flex-column justify-content-between gap-3">
            <div className="row g-2">
              <div className="col-12 col-sm-8">
                <input
                  type="text"
                  className="form-control rounded-pill border-secondary px-3 py-2 bg-white"
                  placeholder="App name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 col-sm-4">
                <DeveloperSelectMenu
                  selectedDeveloper={selectedDeveloper}
                  onSelect={setSelectedDeveloper}
                />
              </div>
            </div>

            <div className="flex-grow-1 d-flex">
              <textarea
                className="form-control border-secondary p-3 bg-white w-100"
                style={{ borderRadius: "1.25rem", resize: "none" }}
                rows={3}
                placeholder="Descrição curta"
                value={smallDescription}
                onChange={(e) => setSmallDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Linha do Website Link + Categoria + Precificação */}
        <div className="row g-2 mb-4">
          <div className="col-12 col-md-6">
            <input
              type="url"
              className="form-control rounded-pill border-secondary px-3 py-2 bg-white"
              placeholder="Website Link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-pill border-secondary px-3 py-2 bg-white text-secondary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Categoria"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select rounded-pill border-secondary px-3 py-2 bg-white text-secondary"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              aria-label="Precificação"
            >
              {PRICING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* markdownDescription */}
        <div className="bg-white shadow-sm p-4 mb-4">
          <textarea
            className="form-control border-0 shadow-none p-0 bg-transparent"
            rows={12}
            placeholder="Digite a descrição do aplicativo aqui."
            value={markdownDescription}
            onChange={(e) => setMarkdownDescription(e.target.value)}
            required
          />
        </div>

        {/* Botão CRIAR / SALVAR */}
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            disabled={loading}
            className="btn rounded-pill px-5 py-2 fw-medium shadow-sm"
            style={{
              backgroundColor: "#8ce071",
              color: "#222222",
              fontSize: "1rem",
            }}
          >
            {loading ? "SALVANDO..." : isEditing ? "SALVAR" : "CRIAR"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function CreateAppPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center text-secondary">
          Carregando formulário...
        </div>
      }
    >
      <CreateOrEditAppContent />
    </Suspense>
  );
}
