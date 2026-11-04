import Link from "next/link";
export default function AppItemActions() {
    return (
        <div className="d-flex gap-3">
            <Link href={``} className="btn btn-sm btn-outline-secondary">
                Ver detalhes
            </Link>
            <button className="btn btn-sm btn-dark">
                Favoritar
            </button>
        </div>
    );
}
