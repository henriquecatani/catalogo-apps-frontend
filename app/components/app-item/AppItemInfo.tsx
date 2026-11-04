import Link from "next/link";
export default function AppItemInfo() {
    return (
        <>
            <h5 className="card-title mb-1">
                <Link href={``} className="text-decoration-none">
                    LibreOffice
                </Link>
            </h5>
            <p className="card-text text-muted small mb-2">Suite Office completa, para todas suas necessidades profissionais.</p>
            <p className="fw-bold text-primary mb-0">FLOSS</p>
        </>
    );
}