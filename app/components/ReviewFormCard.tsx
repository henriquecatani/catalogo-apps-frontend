"use client";

import { FormEvent, useEffect, useState } from "react";
import { getToken } from "@/app/login/auth_service";
import { Review } from "@/app/types";

const API_BASE = "http://localhost:3000";

export interface ReviewFormCardProps {
  appId: string | number;
  userId: number;
  initialReview?: Review | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewFormCard({
  appId,
  userId,
  initialReview,
  onSuccess,
  onCancel,
}: ReviewFormCardProps) {
  const isEditing = !!initialReview?.id;

  const [rating, setRating] = useState<number>(initialReview?.rating ?? 5);
  const [title, setTitle] = useState<string>(initialReview?.name ?? "");
  const [markdownText, setMarkdownText] = useState<string>(
    initialReview?.markdownText ?? initialReview?.markdown_text ?? ""
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setRating(initialReview?.rating ?? 5);
    setTitle(initialReview?.name ?? "");
    setMarkdownText(
      initialReview?.markdownText ?? initialReview?.markdown_text ?? ""
    );
    setError("");
  }, [initialReview]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = getToken();

    try {
      if (isEditing && initialReview?.id) {
        // PUT http://localhost:3000/api/reviews/:reviewId
        const res = await fetch(`${API_BASE}/api/reviews/${initialReview.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: title,
            rating: Number(rating),
            markdownText,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData?.message || "Não foi possível atualizar a avaliação."
          );
          setLoading(false);
          return;
        }
      } else {
        // POST http://localhost:3000/api/apps/:appId/reviews
        const res = await fetch(`${API_BASE}/api/apps/${appId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(userId),
            name: title,
            markdownText,
            rating: Number(rating),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData?.message || "Não foi possível publicar a avaliação."
          );
          setLoading(false);
          return;
        }
      }

      onSuccess();
    } catch {
      setError("Erro ao conectar com o servidor. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialReview?.id) return;
    setError("");
    setLoading(true);

    const token = getToken();

    try {
      const res = await fetch(`${API_BASE}/api/reviews/${initialReview.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(
          errData?.message || "Não foi possível excluir a avaliação."
        );
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Erro ao conectar com o servidor. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-white border-0 rounded-4 p-4 shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-dark">
          {isEditing ? "Editar Avaliação" : "Avaliar Aplicativo"}
        </h5>
        <button
          type="button"
          className="btn-close"
          aria-label="Fechar"
          onClick={onCancel}
        />
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 5 Clicáveis Estrelas para Nota */}
        <div className="mb-3">
          <label className="form-label d-block text-secondary small mb-1">
            Sua nota:
          </label>
          <div className="d-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                className="btn border-0 p-0 me-1 bg-transparent shadow-none"
                aria-label={`Nota ${starValue} de 5`}
              >
                <i
                  className={`bi ${
                    starValue <= rating ? "bi-star-fill" : "bi-star"
                  } text-warning fs-4`}
                />
              </button>
            ))}
            <span className="ms-2 text-secondary small fw-medium">
              {rating.toFixed(1)} / 5.0
            </span>
          </div>
        </div>

        {/* Input de Título */}
        <div className="mb-3">
          <label className="form-label text-secondary small mb-1">
            Título da avaliação:
          </label>
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="Ex: Muito bom o App"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Input / Textarea da Review */}
        <div className="mb-3">
          <label className="form-label text-secondary small mb-1">
            Comentário:
          </label>
          <textarea
            className="form-control rounded-3"
            rows={3}
            placeholder="Conte sua experiência com o aplicativo..."
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
            required
          />
        </div>

        {/* Botões de Ação */}
        <div className="d-flex justify-content-end gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="btn btn-outline-danger rounded-pill px-4"
              disabled={loading}
            >
              Excluir
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline-secondary rounded-pill px-4"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn rounded-pill px-4 fw-medium"
            style={{
              backgroundColor: "#8ce071",
              color: "#222222",
            }}
          >
            {loading
              ? "Salvando..."
              : isEditing
              ? "Salvar Alterações"
              : "Publicar Avaliação"}
          </button>
        </div>
      </form>
    </div>
  );
}
