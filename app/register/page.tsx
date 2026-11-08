"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveProfile,
  saveToken,
  saveUser,
} from "../login/auth_service";

const API_BASE = "http://localhost:3000";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userResponse = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          email,
          passwordHash: password,
        }),
      });

      const userData = await userResponse.json().catch(() => ({}));
      if (!userResponse.ok) {
        setError(
          userData?.message ||
            "Não foi possível cadastrar o usuário. Verifique os dados informados."
        );
        setLoading(false);
        return;
      }

      const token: string = userData.access_token;
      const userId: number = userData?.user?.sub ?? userData?.user?.id;

      if (token) {
        saveToken(token);
      }

      saveUser({
        sub: userId,
        id: userId,
        name: userData?.user?.name ?? username,
        email: userData?.user?.email ?? email,
      });

      if (userId !== undefined && userId !== null) {
        const formattedBirthDate = birthDate
          ? new Date(`${birthDate}T00:00:00Z`).toISOString()
          : undefined;

        const profileResponse = await fetch(`${API_BASE}/api/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(userId),
            fullName: fullName || username,
            birthDate: formattedBirthDate,
            avatarUrl: avatarUrl || "",
          }),
        });

        const profileResult = await profileResponse.json().catch(() => ({}));
        if (!profileResponse.ok) {
          setError(
            profileResult?.message ||
              "Usuário criado, mas houve um erro ao criar o perfil."
          );
          setLoading(false);
          return;
        }

        const createdProfile = profileResult?.data ?? {
          id: profileResult?.id,
          userId: Number(userId),
          fullName: fullName || username,
          birthDate: formattedBirthDate,
          avatarUrl: avatarUrl || "",
        };

        saveProfile(createdProfile);
      }

      router.replace("/");
    } catch {
      setError(
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setLoading(false);
    }
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
            Cadastro
          </h1>
        </div>

        {/* Register Card */}
        <div className="bg-white p-4 p-sm-5 shadow-sm">
          {/* Brand Logo */}
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Butiápps Logo"
              width={48}
              height={48}
              unoptimized
            />
            <span
              className="font-hepta text-dark"
              style={{ fontSize: "1.6rem", fontWeight: 400 }}
            >
              Butiápps
            </span>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={submitForm}>
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
            <div className="mb-3">
              <label className="form-label fs-6 text-dark mb-1">
                Senha:
              </label>
              <div className="d-flex align-items-center rounded-pill border border-dark px-3 py-1 bg-white">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="form-control border-0 bg-transparent shadow-none p-1"
                  placeholder="••••••••"
                  required
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

            <hr className="my-4 text-secondary" />

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
            <div className="mb-4">
              <label className="form-label fs-6 text-dark mb-1">
                Data de Nascimento:
              </label>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                type="date"
                className="form-control rounded-pill border-dark px-3 py-2 shadow-none"
                required
              />
            </div>

            {/* Terms Disclaimer */}
            <p className="small text-dark mb-4" style={{ lineHeight: "1.4" }}>
              Ao confirmar você concordará com os{" "}
              <span style={{ color: "#d9823b" }}>Termos de Uso</span> e{" "}
              <span style={{ color: "#d9823b" }}>Política de Privacidade</span>.
            </p>

            {/* Submit Button */}
            <button
              className="btn rounded-pill w-100 py-2 mb-4 fw-normal"
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#8ce071",
                color: "#333333",
                fontSize: "1.15rem",
              }}
            >
              {loading ? "Cadastrando..." : "Cadastrar-se"}
            </button>

            {/* Login Link */}
            <div className="d-flex align-items-center justify-content-start gap-3 small">
              <span className="text-dark">Já tem uma conta?</span>
              <Link
                href="/login"
                className="text-decoration-none fw-normal"
                style={{ color: "#ff7a00", fontSize: "1rem" }}
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
