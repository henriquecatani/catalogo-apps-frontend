import Image from "next/image";
import styles from "../page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/hcatani.png"
          alt="Catani logo"
          width={100}
          height={100}
          priority
        />
        <div className={styles.intro}>
          <h1>
            Bem vindo ao site de {" "}
            <code className={styles.code}>avaliações de apps.</code>
          </h1>
          <p>
            Sou Henrique Catani, no {" "}
            <a
              href="https://github.com/henriquecatani"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>{" "}
            e no {" "}
            <a
                href="https://instagram.com/henriquecatani"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>{" "}
            .
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
