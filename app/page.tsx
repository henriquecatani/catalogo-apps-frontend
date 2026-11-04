import AppCardItem from "@/app/components/AppCardItem";

export default function HomePage() {
  return (
    <>
      <section className="py-4 text-center">
        <h3 className="fw-bold">Produtos em destaque</h3>
      </section>
      <section className="pb-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AppCardItem />
            </div>
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AppCardItem />
            </div>
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AppCardItem />
            </div>
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <AppCardItem />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
