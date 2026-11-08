"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  clearToken,
  fetchAndSaveProfileByUserId,
  getProfile,
  getToken,
  getUser,
  isAuthenticated,
  saveProfile,
  saveUser,
} from "../login/auth_service";

const API_BASE = "http://localhost:3000";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<number | null>(null);
  const [profileId, setProfileId] = useState<number | undefined>(undefined);

  // Dados do Usuário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dados do Perfil
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const storedUser = getUser();
    const storedProfile = getProfile();

    const uId = storedUser?.sub ?? storedUser?.id ?? storedProfile?.userId ?? null;
    setUserId(uId !== null ? Number(uId) : null);

    if (storedUser) {
      setUsername(storedUser.name ?? "");
      setEmail(storedUser.email ?? "");
    }

    if (storedProfile) {
      setProfileId(storedProfile.id);
      setFullName(storedProfile.fullName ?? "");
      setAvatarUrl(storedProfile.avatarUrl ?? "");
      setBirthDate(
        storedProfile.birthDate
          ? String(storedProfile.birthDate).split("T")[0]
          : ""
      );
    }

    if (uId !== null) {
      fetchAndSaveProfileByUserId(uId, API_BASE).then((freshProfile) => {
        if (freshProfile) {
          setProfileId(freshProfile.id);
          setFullName(freshProfile.fullName ?? "");
          setAvatarUrl(freshProfile.avatarUrl ?? "");
          setBirthDate(
            freshProfile.birthDate
              ? String(freshProfile.birthDate).split("T")[0]
              : ""
          );
        }
      });
    }
  }, [router]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = getToken();

    try {
      // atualizar username e email precisa senha
      if (userId !== null && password.trim().length > 0) {
        const userRes = await fetch(`${API_BASE}/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: username,
            email,
            passwordHash: password,
          }),
        });

        if (!userRes.ok) {
          const errData = await userRes.json().catch(() => ({}));
          setError(
            errData?.message || "Não foi possível atualizar os dados do usuário."
          );
          setLoading(false);
          return;
        }
      }

      if (userId !== null) {
        saveUser({
          sub: userId,
          id: userId,
          name: username,
          email,
        });
      }

      const formattedBirthDate = birthDate
        ? new Date(`${birthDate}T00:00:00Z`).toISOString()
        : undefined;

      if (profileId) {
        const profRes = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            birthDate: formattedBirthDate,
            avatarUrl: avatarUrl || "",
          }),
        });

        if (!profRes.ok) {
          const errData = await profRes.json().catch(() => ({}));
          setError(errData?.message || "Não foi possível atualizar o perfil.");
          setLoading(false);
          return;
        }

        saveProfile({
          id: profileId,
          userId: userId ?? 0,
          fullName,
          birthDate: formattedBirthDate,
          avatarUrl: avatarUrl || "",
        });
      } else if (userId !== null) {
        // POST caso não possua perfil
        const profRes = await fetch(`${API_BASE}/api/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(userId),
            fullName,
            birthDate: formattedBirthDate,
            avatarUrl: avatarUrl || "",
          }),
        });

        const profData = await profRes.json().catch(() => ({}));
        if (!profRes.ok) {
          setError(profData?.message || "Não foi possível salvar o perfil.");
          setLoading(false);
          return;
        }

        const created = profData?.data ?? {
          id: profData?.id,
          userId: Number(userId),
          fullName,
          birthDate: formattedBirthDate,
          avatarUrl: avatarUrl || "",
        };
        setProfileId(created.id);
        saveProfile(created);
      }

      setSuccess("Informações atualizadas com sucesso!");
      setPassword("");
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <main className="container py-4">
      <div className="mx-auto my-3" style={{ maxWidth: "480px" }}>
        {/* Header Row: Back Button & Title */}
        <div className="position-relative d-flex align-items-center justify-content-center mb-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-link text-dark p-0 position-absolute start-0"
            aria-label="Voltar"
          >
            <i className="bi bi-arrow-left fs-2"></i>
          </button>
          <h1 className="fw-bold mb-0 text-dark" style={{ fontSize: "2rem" }}>
            Meu Perfil
          </h1>
        </div>

        {/* Profile Edit Card */}
        <div className="bg-white p-4 p-sm-5 shadow-sm">
          {/* Avatar Preview & Brand */}
          <div className="d-flex flex-column align-items-center justify-content-center mb-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName || "Avatar"}
                width={80}
                height={80}
                className="rounded-circle mb-2 shadow-sm"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2 shadow-sm"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#a3e496",
                  color: "#ffffff",
                }}
              >
                <i className="bi bi-person fs-1"></i>
              </div>
            )}
            <span
              className="font-hepta text-dark"
              style={{ fontSize: "1.25rem", fontWeight: 400 }}
            >
              {fullName || username || "Butiápps"}
            </span>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 small" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                Nome Completo:
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
                placeholder="Seu Nome Completo"
                required
              />
            </div>

            {/* Avatar URL */}
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                URL do Avatar:
              </label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                type="url"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
                placeholder="https://exemplo.com/avatar.png"
              />
            </div>

            {/* Birth Date */}
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                Data de Nascimento:
              </label>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                type="date"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
              />
            </div>

            <hr className="my-4 text-secondary" />

            {/* Username */}
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                Nome de usuário:
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
                placeholder="seu_usuario"
                required
              />
            </div>

            {/* E-mail */}
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                E-mail:
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
                placeholder="nome@exemplo.com"
                required
              />
            </div>

            {/* Senha */}
            <div className="mb-4">
              <label className="form-label fs-6 text-dark mb-1">
                Senha (em caso de alteração de E-mail ou Nome de Usuário):
              </label>
              <div className="d-flex align-items-center rounded-pill border border-dark px-3 py-1 bg-white">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="form-control border-0 bg-transparent shadow-none p-1"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="btn border-0 bg-transparent p-0 ms-2 text-dark"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? (
                    <i className="bi bi-eye-slash fs-4" />
                  ) : (
                    <i className="bi bi-eye fs-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              className="btn rounded-pill w-100 py-2 mb-3 fw-normal"
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#8ce071",
                color: "#333333",
                fontSize: "1.1rem",
              }}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-danger rounded-pill w-100 py-2 fw-normal"
              style={{ fontSize: "1.05rem" }}
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
