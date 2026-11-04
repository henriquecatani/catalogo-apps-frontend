"use client";

import { useRouter } from "next/navigation";

export default function AppStaticPage() {
  const router = useRouter();

  // Dados mockados fixos para servir de base estática
  const app = {
    name: "App Name",
    developer: "Developer Name",
    small_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mattis tristique erat.",
    rating: 4.5,
    pricing: "Free",
    link: "#",
    icon: "",
  };

  const reviews = [
    {
      id: 1,
      title: "Muito bom o aplicativo",
      author: "Anonymous",
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus, quam sit amet mollis bibendum, nibh nunc vehicula massa, vel molestie ante risus nec nulla. Fusce fermentum mi turpis.",
      rating: 5,
    },
    {
      id: 2,
      title: "Aplicativo muito bom",
      author: "username",
      comment:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus, quam sit amet mollis bibendum, nibh nunc vehicula massa.",
      rating: 5,
    },
  ];

  const renderStars = (rating: number = 5) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i key={i} className={`bi bi-star-fill text-warning me-1`}></i>
      );
    }
    return stars;
  };

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
        <div
          className="bg-secondary rounded-4 flex-shrink-0"
          style={{ width: "90px", height: "90px" }}
        ></div>

        {/* Título, Desenvolvedor e Botão Website */}
        <div className="flex-grow-1">
          <h1 className="fw-normal mb-0" style={{ fontSize: "2rem" }}>
            {app.name}
          </h1>
          <p className="text-success mb-2" style={{ fontSize: "0.95rem" }}>
            {app.developer}
          </p>
          <p
            className="text-secondary mb-3"
            style={{ fontSize: "0.9rem", maxWidth: "450px" }}
          >
            {app.small_description}
          </p>

          <a
            href={app.link}
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
            {app.rating.toFixed(1)}
          </div>
          <div>{renderStars(app.rating)}</div>
          <span
            className="text-secondary d-block mt-1 mb-3"
            style={{ fontSize: "0.75rem" }}
          >
            1,5 mil avaliações
          </span>

          <span
            className="badge rounded-pill px-3 py-2 fw-normal"
            style={{ backgroundColor: "#1e8238", fontSize: "0.85rem" }}
          >
            {app.pricing}
          </span>
        </div>
      </div>

      {/* Card Principal com Descrição Detalhada e Captura de Tela */}
      <section className="bg-white rounded-3 shadow-sm p-4 p-md-5 my-5">
        <p className="text-secondary lh-base mb-4" style={{ fontSize: "0.95rem" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam rhoncus,
          quam sit amet mollis bibendum, nibh nunc vehicula massa, vel molestie
          ante risus nec nulla. Fusce fermentum mi turpis. Maecenas interdum et
          mauris nec maximus. Orci varius natoque penatibus et magnis dis
          parturient montes, nascetur ridiculus mus. Curabitur vel diam in massa
          malesuada aliquet. Phasellus ut leo id urna lacinia lacinia. Cras
          vitae vulputate massa, quis blandit velit. Nullam efficitur bibendum
          elit, at fringilla velit ullamcorper nec. Donec porta lobortis
          placerat. Fusce at justo ut arcu posuere malesuada sed ut nibh. Nam in
          eros sed nibh vulputate tempor sit amet a ipsum.
        </p>

        {/* Imagem / Print do App */}
        <div className="text-center my-4">
          <div
            className="d-inline-block border rounded p-1 bg-light w-100"
            style={{ maxWidth: "600px" }}
          >
            <div
              className="bg-white border rounded d-flex align-items-center justify-content-center text-secondary"
              style={{ height: "250px" }}
            >
              [Screenshot do Aplicativo]
            </div>
          </div>
        </div>

        <p className="text-secondary lh-base mt-4 mb-0" style={{ fontSize: "0.95rem" }}>
          Fusce quis dui ac purus tincidunt fermentum. Sed fringilla finibus
          erat non placerat. Suspendisse semper quis sem sit amet pulvinar. Cras
          at placerat metus, quis lobortis metus. Phasellus eleifend ante quis
          ante feugiat pharetra. Morbi at volutpat ante. Aliquam lobortis sed
          magna in pretium. Morbi feugiat lorem mattis, porta tortor ac, rhoncus
          diam. Mauris fermentum ipsum id diam placerat feugiat eu id est.
          Praesent consectetur placerat quam, eget pharetra orci ullamcorper
          vitae. In ut faucibus nunc. Duis nec faucibus metus, sit amet lacinia
          nisl.
        </p>
      </section>

      {/* Seção de Reviews / Avaliações */}
      <section className="mt-5">
        <span
          className="badge rounded-pill px-4 py-2 mb-4"
          style={{
            backgroundColor: "#e58a43",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Reviews
        </span>

        <div className="d-flex flex-column gap-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-4 p-4 shadow-sm position-relative"
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>
                  {rev.title}
                </h5>
                <span className="text-secondary" style={{ fontSize: "0.85rem" }}>
                  {rev.author}
                </span>
              </div>

              <p className="text-secondary mb-3" style={{ fontSize: "0.9rem" }}>
                {rev.comment}
              </p>

              <div className="text-end">{renderStars(rev.rating)}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}