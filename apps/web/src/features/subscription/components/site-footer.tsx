import Image from "next/image";
import Link from "next/link";
import { AiOutlinePhone } from "react-icons/ai";
import styles from "./site-footer.module.css";
import type { PublicSite } from "../public-site-api";

export function SiteFooter({ site }: { site: PublicSite }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topGrid}>
          {/* Coluna 1: Marca e resumo */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLink}>
              {site.logoUrl ? (
                <Image
                  src={site.logoUrl}
                  alt={site.publicName}
                  width={154}
                  height={42}
                  className={styles.brandLogo}
                  unoptimized
                />
              ) : (
                <span className={styles.brandName}>{site.publicName}</span>
              )}
            </Link>
            <p className={styles.brandDesc}>
              {site.description ??
                `Conheça os veículos e unidades da ${site.publicName}.`}
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Navegação</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/">Início</Link>
              </li>
              <li>
                <Link href="/#veiculos">Frota de Veículos</Link>
              </li>
              <li>
                <Link href="/#unidades">Unidades</Link>
              </li>
              <li>
                <Link href="/veiculos">Catálogo</Link>
              </li>
              <li>
                <Link href="/#veiculos">Veículos</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Benefícios */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Sobre a locadora</h4>
            <ul className={styles.linksList}>
              <li>
                <span className={styles.serviceItem}>{site.publicName}</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Atendimento */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Atendimento Comercial</h4>
            <p className={styles.contactIntro}>
              Fale com a equipe da locadora para mais informações.
            </p>
            {site.phone && (
              <div className={styles.contactItem}>
                <AiOutlinePhone className={styles.contactIcon} />
                <div>
                  <strong>Central de Atendimento</strong>
                  <span>{site.phone}</span>
                </div>
              </div>
            )}
            {/* <div className={styles.demoBadge}>
              <AiOutlineCar className={styles.badgeIcon} />
              <span>Ambiente demonstrativo do frontend</span>
            </div> */}
          </div>
        </div>

        {/* Linha divisória e Copyright */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} {site.publicName}. Todos os direitos reservados.
            </p>
            <p className={styles.legalNotice}>
              Consulte a locadora para confirmar disponibilidade e condições.
            </p>
          </div>
          {/* <div className={styles.techCredit}>
            <span>Tecnologia</span>
            <strong>AsteHub</strong>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
