import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineCar,
  AiOutlinePhone,
  AiOutlineClockCircle,
  AiOutlineInstagram,
  AiOutlineLinkedin,
  AiOutlineYoutube,
} from "react-icons/ai";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topGrid}>
          {/* Coluna 1: Marca e resumo */}
          <div className={styles.brandCol}>
            <Link href="/#assinatura" className={styles.brandLink}>
              <Image
                src="/logo-white.png"
                alt="AsteHub"
                width={154}
                height={42}
                className={styles.brandLogo}
              />
            </Link>
            <p className={styles.brandDesc}>
              Soluções inteligentes em locação de veículos por assinatura
              mensal. Mais liberdade para dirigir, zero burocracia de
              financiamento e custos previsíveis reunidos em um único contrato.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="#demo-social"
                className={styles.socialIcon}
                aria-label="Instagram (Demonstração)"
                title="Instagram (Demonstração)"
              >
                <AiOutlineInstagram />
              </a>
              <a
                href="#demo-social"
                className={styles.socialIcon}
                aria-label="LinkedIn (Demonstração)"
                title="LinkedIn (Demonstração)"
              >
                <AiOutlineLinkedin />
              </a>
              <a
                href="#demo-social"
                className={styles.socialIcon}
                aria-label="YouTube (Demonstração)"
                title="YouTube (Demonstração)"
              >
                <AiOutlineYoutube />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Navegação</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/#assinatura">Assinatura</Link>
              </li>
              <li>
                <Link href="/#veiculos">Frota de Veículos</Link>
              </li>
              <li>
                <Link href="/#como-funciona">Como Funciona</Link>
              </li>
              <li>
                <Link href="/#calculadora">Calculadora de Planos</Link>
              </li>
              <li>
                <Link href="/#sobre">Sobre a Empresa</Link>
              </li>
              <li>
                <Link href="/#faq">Dúvidas Frequentes (FAQ)</Link>
              </li>
              <li>
                <Link href="/veiculos">Catálogo Completo</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Benefícios */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Incluso no Plano</h4>
            <ul className={styles.linksList}>
              <li>
                <span className={styles.serviceItem}>
                  Manutenção preventiva
                </span>
              </li>
              <li>
                <span className={styles.serviceItem}>
                  IPVA e licenciamento anual
                </span>
              </li>
              <li>
                <span className={styles.serviceItem}>
                  Seguro e proteção veicular
                </span>
              </li>
              <li>
                <span className={styles.serviceItem}>
                  Assistência emergencial 24h
                </span>
              </li>
              <li>
                <span className={styles.serviceItem}>
                  Gestão e documentação
                </span>
              </li>
              <li>
                <span className={styles.serviceItem}>
                  Vistoria de entrega e devolução
                </span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Atendimento */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Atendimento Comercial</h4>
            <p className={styles.contactIntro}>
              Fale com a nossa equipe para tirar dúvidas ou receber uma
              simulação personalizada.
            </p>
            <div className={styles.contactItem}>
              <AiOutlinePhone className={styles.contactIcon} />
              <div>
                <strong>Central de Atendimento</strong>
                <span>Atendimento demonstrativo via website</span>
              </div>
            </div>
            <div className={styles.contactItem}>
              <AiOutlineClockCircle className={styles.contactIcon} />
              <div>
                <strong>Horário de Funcionamento</strong>
                <span>Segunda a Sexta, das 08h às 18h</span>
              </div>
            </div>
            <div className={styles.demoBadge}>
              <AiOutlineCar className={styles.badgeIcon} />
              <span>Ambiente demonstrativo do frontend</span>
            </div>
          </div>
        </div>

        {/* Linha divisória e Copyright */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <p>© {currentYear} AsteHub. Todos os direitos reservados.</p>
            <p className={styles.legalNotice}>
              Os valores e condições exibidos são simulações ilustrativas e não
              constituem oferta contratual vinculante.
            </p>
          </div>
          <div className={styles.techCredit}>
            <span>Tecnologia</span>
            <strong>AsteHub</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
