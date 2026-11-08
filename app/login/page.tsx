"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchAndSaveProfileByUserId,
  saveToken,
  saveUser,
} from "./auth_service";

const API_BASE = "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.message || "Credenciais inválidas. Verifique seu e-mail e senha.");
        setLoading(false);
        return;
      }

      if (data.access_token) {
        saveToken(data.access_token);
      }

      const userId = data?.user?.sub ?? data?.user?.id;
      if (data?.user) {
        saveUser({
          sub: userId,
          id: userId,
          email: data.user.email ?? email,
          name: data.user.name ?? "",
        });
      }

      if (userId !== undefined && userId !== null) {
        await fetchAndSaveProfileByUserId(userId, API_BASE);
      }

      router.replace("/");
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-4">
      <div className="mx-auto my-3" style={{ maxWidth: "460px" }}>
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
            Login
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white p-4 p-sm-5 shadow-sm">
          {/* Brand Logo */}
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <Image
              src="/logo2.svg"
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
            {/* E-mail */}
            <div className="mb-3">
              <label className="form-label fs-5 text-dark mb-1">
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
              <label className="form-label fs-5 text-dark mb-1">
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
              {loading ? "Entrando..." : "Login"}
            </button>

            {/* Register Link */}
            <div className="d-flex align-items-center justify-content-start gap-3 small">
              <span className="text-dark">Não tem uma conta?</span>
              <Link
                href="/register"
                className="text-decoration-none fw-normal"
                style={{ color: "#ff7a00", fontSize: "1rem" }}
              >
                Cadastrar-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
