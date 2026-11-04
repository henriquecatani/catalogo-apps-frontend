import AppItemInfo from "./AppItemInfo";
import AppItemActions from "./AppItemActions";
import Image from "next/image";
export default function AppItemCard() {
    return (
        <div className="card h-100 shadow-sm">
            <Image
                src="/libreoffice.jpg" alt="LibreOffice logo" /*className="card-img-top"*/
                height={300}
                width={300}
            />
            <div className="card-body d-flex flex-column">
                <AppItemInfo />
                <div className="mt-auto d-flex justify-content-end">
                    <AppItemActions />
                </div>
            </div>
        </div>
    );
}