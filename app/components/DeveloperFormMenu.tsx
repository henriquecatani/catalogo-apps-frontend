"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { getToken } from "@/app/login/auth_service";
import { Developer } from "@/app/types";

const API_BASE = "http://localhost:3000";

export interface DeveloperFormMenuProps {
  initialDeveloper?: Developer | null;
  initialName?: string;
  onSaved: (developer: Developer) => void;
  onCancel: () => void;
}

export default function DeveloperFormMenu({
  initialDeveloper,
  initialName = "",
  onSaved,
  onCancel,
}: DeveloperFormMenuProps) {
  const isEditing = !!initialDeveloper?.id;

  const [name, setName] = useState<string>(
    initialDeveloper?.name ?? initialName
  );
  const [icon, setIcon] = useState<string>(initialDeveloper?.icon ?? "");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setName(initialDeveloper?.name ?? initialName);
    setIcon(initialDeveloper?.icon ?? "");
    setError("");
  }, [initialDeveloper, initialName]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome do desenvolvedor.");
      return;
    }

    setError("");
    setLoading(true);
    const token = getToken();

    try {
      if (isEditing && initialDeveloper?.id) {
        const res = await fetch(
          `${API_BASE}/api/developers/${initialDeveloper.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: name.trim(),
              icon: icon.trim(),
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData?.message || "Não foi possível atualizar o desenvolvedor."
          );
          setLoading(false);
          return;
        }

        // reload
        onSaved({
          ...initialDeveloper,
          name: name.trim(),
          icon: icon.trim(),
        });
      } else {
        const res = await fetch(`${API_BASE}/api/developers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            icon: icon.trim(),
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            resData?.message || "Não foi possível cadastrar o desenvolvedor."
          );
          setLoading(false);
          return;
        }

        const createdDev: Developer = resData?.data ?? {
          id: resData?.id ?? Date.now(),
          name: name.trim(),
          icon: icon.trim(),
        };

        onSaved(createdDev);
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border rounded-4 p-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-dark">
          {isEditing ? "Editar Desenvolvedor" : "Cadastrar Desenvolvedor"}
        </h6>
        <button
          type="button"
          className="btn-close small"
          onClick={onCancel}
          aria-label="Fechar"
        />
      </div>

      {error && (
        <div className="alert alert-danger py-1 px-2 small mb-2" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex align-items-center gap-3 mb-3">
        {icon.trim() ? (
          <Image
            src={icon.trim()}
            alt={name || "Ícone do desenvolvedor"}
            width={52}
            height={52}
            className="rounded-3 flex-shrink-0 border"
            style={{ width: "52px", height: "52px", objectFit: "cover" }}
            unoptimized
          />
        ) : (
          <div
            className="rounded-3 flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              backgroundColor: "#b0b4b8",
            }}
          />
        )}

        <div className="flex-grow-1">
          <input
            type="text"
            className="form-control form-control-sm rounded-pill border-secondary mb-2 px-3"
            placeholder="Nome do Desenvolvedor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="url"
            className="form-control form-control-sm rounded-pill border-secondary px-3"
            placeholder="URL do Avatar / Ícone"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          disabled={loading}
          className="btn btn-sm rounded-pill px-3 fw-medium"
          style={{ backgroundColor: "#8ce071", color: "#222222" }}
        >
          {loading ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar"}
        </button>
      </div>
    </div>
  );
}
