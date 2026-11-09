"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DeveloperFormMenu from "./DeveloperFormMenu";
import { Developer, PaginatedResponse } from "@/app/types";

const API_BASE = "http://localhost:3000";

export interface DeveloperSelectMenuProps {
  selectedDeveloper: Developer | null;
  onSelect: (developer: Developer) => void;
}

export default function DeveloperSelectMenu({
  selectedDeveloper,
  onSelect,
}: DeveloperSelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    async function loadDevelopers() {
      setLoading(true);
      const query = search.trim()
        ? `page=1&limit=50&search=${encodeURIComponent(search.trim())}`
        : `page=1&limit=50`;
      const urls = [
        `${API_BASE}/api/developers?${query}`,
        `/api/developers?${query}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json: PaginatedResponse<Developer> & { items?: Developer[] } =
            await res.json();
          const list: Developer[] = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.items)
            ? json.items
            : [];

          if (isMounted) {
            setDevelopers(list);
            setLoading(false);
          }
          return;
        } catch {
        }
      }

      if (isMounted) {
        setDevelopers([]);
        setLoading(false);
      }
    }

    void loadDevelopers();
    return () => {
      isMounted = false;
    };
  }, [open, search]);

  const filteredDevelopers = developers.filter((dev) =>
    dev.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  function handleSelectDev(dev: Developer) {
    onSelect(dev);
    setShowCreateForm(false);
    setOpen(false);
  }

  return (
    <div className="position-relative">
      {/* Botão de Seleção */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setShowCreateForm(false);
        }}
        className="btn bg-white rounded-pill border border-secondary px-3 py-2 w-100 d-flex align-items-center justify-content-between text-secondary"
        style={{ minWidth: "170px" }}
      >
        <span className="text-truncate me-2" style={{ color: selectedDeveloper ? "#212529" : "#6c757d" }}>
          {selectedDeveloper ? selectedDeveloper.name : "Desenvolvedor"}
        </span>
        <span className="small">v</span>
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white border rounded-4 shadow p-3"
          style={{
            width: "320px",
            zIndex: 1050,
          }}
        >
          {showCreateForm ? (
            <DeveloperFormMenu
              initialName={search.trim()}
              onSaved={(newDev) => {
                setDevelopers((prev) => [newDev, ...prev]);
                handleSelectDev(newDev);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          ) : (
            <>
              {/* Pesquisa */}
              <div className="input-group input-group-sm mb-2">
                <input
                  type="text"
                  className="form-control rounded-pill border-secondary px-3"
                  placeholder="Pesquisar desenvolvedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Lista de Resultados */}
              <div
                className="overflow-y-auto"
                style={{ maxHeight: "220px" }}
              >
                {loading ? (
                  <div className="text-center text-secondary small py-3">
                    Buscando desenvolvedores...
                  </div>
                ) : filteredDevelopers.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {filteredDevelopers.map((dev) => (
                      <li
                        key={dev.id}
                        onClick={() => handleSelectDev(dev)}
                        className="list-group-item list-group-item-action d-flex align-items-center gap-2 px-2 py-2 border-0 rounded-3"
                        style={{ cursor: "pointer" }}
                      >
                        {dev.icon ? (
                          <Image
                            src={dev.icon}
                            alt={dev.name}
                            width={28}
                            height={28}
                            className="rounded-2 flex-shrink-0"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <div
                            className="rounded-2 flex-shrink-0"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: "#b0b4b8",
                            }}
                          />
                        )}
                        <span className="small text-dark fw-medium text-truncate">
                          {dev.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-secondary small mb-2">
                      Nenhum desenvolvedor encontrado.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(true)}
                      className="btn btn-sm rounded-pill px-4 fw-medium"
                      style={{ backgroundColor: "#8ce071", color: "#222222" }}
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
