"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineCar,
  AiOutlineSafetyCertificate,
  AiOutlineFileText,
  AiOutlineTool,
  AiOutlineCustomerService,
  AiOutlineInfoCircle,
  AiOutlineDashboard,
  AiOutlineThunderbolt,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  formatMonthly,
  estimateMonthly,
  terms,
  distances,
  vehicles,
  type Vehicle,
  type Term,
  type Distance,
} from "./content";
import { VehicleCard } from "./components/vehicle-card";
import styles from "./vehicle-detail-page.module.css";

interface VehicleDetailPageProps {
  vehicle: Vehicle;
}

export function VehicleDetailPage({ vehicle }: VehicleDetailPageProps) {
  // Estado da galeria
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Estado do simulador do veículo
  const [selectedMonths, setSelectedMonths] = useState<Term>(24);
  const [selectedKm, setSelectedKm] = useState<Distance>(2000);

  // Estado do formulário de proposta
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    mensagem: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Cálculo da estimativa para o veículo selecionado
  const currentMonthly = estimateMonthly({
    basePrice: vehicle.price,
    months: selectedMonths,
    km: selectedKm,
  });

  const activeImage = vehicle.gallery[activeImageIndex] ?? {
    url: vehicle.image,
    caption: `${vehicle.brand} ${vehicle.model}`,
  };

  const relatedVehicles = vehicles
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.container}>
      {/* Navegação Breadcrumb */}
      <nav aria-label="Navegação estrutural" className={styles.breadcrumbs}>
        <Link href="/" className={styles.breadLink}>
          Início
        </Link>
        <span className={styles.breadDivider}>/</span>
        <Link href="/veiculos" className={styles.breadLink}>
          Veículos
        </Link>
        <span className={styles.breadDivider}>/</span>
        <span className={styles.breadCurrent}>{vehicle.model}</span>
      </nav>

      <div className={styles.backWrap}>
        <Link href="/veiculos" className={styles.backButton}>
          <AiOutlineArrowLeft className={styles.backIcon} />
          Voltar para todos os veículos
        </Link>
      </div>

      {/* Topo do Veículo */}
      <div className={styles.topHeader}>
        <div className={styles.brandCategory}>
          <span className={styles.brandName}>{vehicle.brand}</span>
          <span className={styles.categoryBadge}>{vehicle.category}</span>
        </div>
        <h1 className={styles.vehicleTitle}>{vehicle.model}</h1>
        <p className={styles.vehicleSummary}>{vehicle.description}</p>
      </div>

      {/* Seção Principal: Galeria de Imagens + Resumo do Plano */}
      <div className={styles.mainGrid}>
        {/* Galeria de Imagens */}
        <div className={styles.galleryColumn}>
          <div className={styles.featuredImageWrap}>
            <Image
              src={activeImage.url}
              alt={activeImage.caption}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 65vw"
              className={styles.featuredImage}
            />
            <div className={styles.imageCaptionBar}>
              <span>{activeImage.caption}</span>
              <span className={styles.imageCounter}>
                {activeImageIndex + 1} de {vehicle.gallery.length}
              </span>
            </div>
          </div>

          {/* Miniaturas da Galeria */}
          <div
            className={styles.thumbnailsRow}
            role="tablist"
            aria-label="Fotos do veículo"
          >
            {vehicle.gallery.map((img, idx) => {
              const isActive = idx === activeImageIndex;
              return (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Visualizar foto ${idx + 1}: ${img.caption}`}
                  className={`${styles.thumbButton} ${isActive ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image
                    src={img.url}
                    alt={img.caption}
                    fill
                    sizes="120px"
                    className={styles.thumbImage}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Lateral de Simulação Rápida */}
        <div className={styles.quickSummaryColumn}>
          <div className={styles.pricingCard}>
            <span className={styles.pricingKicker}>Assinatura Mensal</span>
            <div className={styles.priceHighlight}>
              <strong>
                {currentMonthly ? formatMonthly(currentMonthly) : "—"}
              </strong>
              <span>/mês*</span>
            </div>
            <p className={styles.pricingSub}>
              Simulação estimada com base em {selectedMonths} meses e{" "}
              {selectedKm.toLocaleString("pt-BR")} km/mês.
            </p>

            <div className={styles.simOptions}>
              <div className={styles.simGroup}>
                <span className={styles.simLabel}>Prazo contratual:</span>
                <div className={styles.simPills}>
                  {terms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className={`${styles.simPill} ${term === selectedMonths ? styles.simPillActive : ""}`}
                      onClick={() => setSelectedMonths(term)}
                    >
                      {term}m
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.simGroup}>
                <span className={styles.simLabel}>Franquia mensal:</span>
                <div className={styles.simPills}>
                  {distances.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      className={`${styles.simPill} ${dist === selectedKm ? styles.simPillActive : ""}`}
                      onClick={() => setSelectedKm(dist)}
                    >
                      {dist.toLocaleString("pt-BR")} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <a href="#proposta" className={styles.scrollFormButton}>
              Solicitar proposta deste modelo
            </a>

            <div className={styles.guaranteeList}>
              <div className={styles.guaranteeItem}>
                <AiOutlineCheck className={styles.guaranteeIcon} />
                <span>Zero custo de entrada ou financiamento</span>
              </div>
              <div className={styles.guaranteeItem}>
                <AiOutlineCheck className={styles.guaranteeIcon} />
                <span>IPVA, licenciamento e taxas inclusas</span>
              </div>
              <div className={styles.guaranteeItem}>
                <AiOutlineCheck className={styles.guaranteeIcon} />
                <span>Seguro total com assistência 24h</span>
              </div>
              <div className={styles.guaranteeItem}>
                <AiOutlineCheck className={styles.guaranteeIcon} />
                <span>Revisões preventivas em concessionárias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Técnicas e Equipamentos */}
      <div className={styles.infoSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Especificações</span>
          <h2 className={styles.subTitle}>Ficha Técnica e Dimensões</h2>
        </div>

        <div className={styles.specsGrid}>
          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineThunderbolt />
            </div>
            <div>
              <span className={styles.specLabel}>Motorização</span>
              <strong className={styles.specVal}>{vehicle.engine}</strong>
            </div>
          </div>

          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineDashboard />
            </div>
            <div>
              <span className={styles.specLabel}>Câmbio</span>
              <strong className={styles.specVal}>{vehicle.transmission}</strong>
            </div>
          </div>

          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineCar />
            </div>
            <div>
              <span className={styles.specLabel}>Combustível</span>
              <strong className={styles.specVal}>{vehicle.fuel}</strong>
            </div>
          </div>

          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineTool />
            </div>
            <div>
              <span className={styles.specLabel}>Porta-Malas / Caçamba</span>
              <strong className={styles.specVal}>{vehicle.trunk}</strong>
            </div>
          </div>

          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineCheckCircle />
            </div>
            <div>
              <span className={styles.specLabel}>Capacidade</span>
              <strong className={styles.specVal}>{vehicle.seats}</strong>
            </div>
          </div>

          <div className={styles.specBox}>
            <div className={styles.specIconWrap}>
              <AiOutlineSafetyCertificate />
            </div>
            <div>
              <span className={styles.specLabel}>Consumo Médio</span>
              <strong className={styles.specVal}>{vehicle.consumption}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Equipamentos e Destaques de Série */}
      <div className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Itens de Série</span>
          <h2 className={styles.subTitle}>
            Destaques de Tecnologia e Conforto
          </h2>
        </div>

        <div className={styles.featuresGrid}>
          {vehicle.features.map((feature) => (
            <div key={feature} className={styles.featureItem}>
              <AiOutlineCheckCircle className={styles.featureCheckIcon} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* O que está incluso na assinatura deste veículo */}
      <div className={styles.includedBanner}>
        <div className={styles.includedHeader}>
          <AiOutlineSafetyCertificate className={styles.shieldIcon} />
          <div>
            <h3 className={styles.includedTitle}>
              Tudo incluso no contrato do seu {vehicle.model}
            </h3>
            <p className={styles.includedText}>
              A mensalidade unifica todos os custos de propriedade do carro para
              que você dirija sem surpresas orçamentárias.
            </p>
          </div>
        </div>

        <div className={styles.includedGrid}>
          <div className={styles.incItem}>
            <AiOutlineFileText className={styles.incIcon} />
            <div>
              <strong>Documentação e Tributos</strong>
              <p>
                Emplacamento, licenciamento anual e IPVA totalmente quitados.
              </p>
            </div>
          </div>
          <div className={styles.incItem}>
            <AiOutlineTool className={styles.incIcon} />
            <div>
              <strong>Revisões Preventivas</strong>
              <p>
                Manutenções programadas do fabricante e troca de peças previstas
                em manual.
              </p>
            </div>
          </div>
          <div className={styles.incItem}>
            <AiOutlineSafetyCertificate className={styles.incIcon} />
            <div>
              <strong>Proteção Total</strong>
              <p>
                Cobertura completa contra roubo, furto, colisão e danos a
                terceiros.
              </p>
            </div>
          </div>
          <div className={styles.incItem}>
            <AiOutlineCustomerService className={styles.incIcon} />
            <div>
              <strong>Assistência 24 Horas</strong>
              <p>
                Reboque, socorro mecânico, chaveiro e suporte contínuo em todo o
                Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO APÓS AS INFORMAÇÕES DO VEÍCULO */}
      <section
        id="proposta"
        className={styles.formSection}
        aria-label="Formulário de solicitação de proposta"
      >
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <span className={styles.formEyebrow}>Atendimento Comercial</span>
            <h2 className={styles.formTitle}>
              Solicite sua proposta para o {vehicle.brand} {vehicle.model}
            </h2>
            <p className={styles.formSubtitle}>
              Preencha os dados abaixo para receber uma simulação formal com as
              condições personalizadas para a sua rotina.
            </p>
          </div>

          {submitted ? (
            <div className={styles.successBox}>
              <div className={styles.successIconWrap}>
                <AiOutlineCheckCircle className={styles.successIcon} />
              </div>
              <h3>Proposta demonstrativa enviada com sucesso!</h3>
              <p className={styles.successMsg}>
                Recebemos sua solicitação para o{" "}
                <strong>
                  {vehicle.brand} {vehicle.model}
                </strong>{" "}
                com plano de <strong>{selectedMonths} meses</strong> e franquia
                de <strong>{selectedKm.toLocaleString("pt-BR")} km/mês</strong>.
              </p>
              <div className={styles.demoNotice}>
                <AiOutlineInfoCircle className={styles.noticeIcon} />
                <span>
                  Ambiente de demonstração do frontend AsteHub Web. Nenhum dado
                  pessoal foi enviado a servidores externos. Em produção, este
                  formulário registraria automaticamente um Lead qualificado no
                  painel da locadora.
                </span>
              </div>
              <button
                type="button"
                className={styles.newSubmissionButton}
                onClick={() => setSubmitted(false)}
              >
                Nova simulação
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  Nome completo *
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    className={styles.input}
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                </label>

                <label className={styles.label}>
                  E-mail *
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    className={styles.input}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Telefone / WhatsApp *
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    className={styles.input}
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                </label>

                <label className={styles.label}>
                  Cidade / UF para retirada *
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo / SP"
                    className={styles.input}
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>
                  Prazo de contrato pretendido
                  <select
                    className={styles.select}
                    value={selectedMonths}
                    onChange={(e) =>
                      setSelectedMonths(Number(e.target.value) as Term)
                    }
                  >
                    {terms.map((t) => (
                      <option key={t} value={t}>
                        {t} meses
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.label}>
                  Franquia mensal pretendida
                  <select
                    className={styles.select}
                    value={selectedKm}
                    onChange={(e) =>
                      setSelectedKm(Number(e.target.value) as Distance)
                    }
                  >
                    {distances.map((d) => (
                      <option key={d} value={d}>
                        {d.toLocaleString("pt-BR")} km/mês
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.summaryBar}>
                <span className={styles.summaryBarLabel}>
                  Estimativa calculada:
                </span>
                <strong className={styles.summaryBarVal}>
                  {currentMonthly ? formatMonthly(currentMonthly) : "—"}/mês*
                </strong>
                <span className={styles.summaryBarNote}>
                  ({selectedMonths} meses · {selectedKm.toLocaleString("pt-BR")}{" "}
                  km/mês)
                </span>
              </div>

              <label className={styles.label}>
                Observações ou preferências adicionais (opcional)
                <textarea
                  rows={3}
                  placeholder="Ex: preferência de cor, data prevista para retirada do automóvel, etc."
                  className={styles.textarea}
                  value={formData.mensagem}
                  onChange={(e) =>
                    setFormData({ ...formData, mensagem: e.target.value })
                  }
                />
              </label>

              <div className={styles.formDisclaimer}>
                <AiOutlineInfoCircle className={styles.discIcon} />
                <span>
                  Ambiente de demonstração. Seus dados não serão repassados a
                  terceiros nem utilizados para cobrança.
                </span>
              </div>

              <button type="submit" className={styles.submitButton}>
                Enviar solicitação de proposta
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Outros veículos da frota */}
      {relatedVehicles.length > 0 && (
        <section
          className={styles.relatedSection}
          aria-label="Outros modelos disponíveis"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Explore Mais</span>
            <h2 className={styles.subTitle}>Outros veículos da nossa frota</h2>
          </div>

          <div className={styles.relatedGrid}>
            {relatedVehicles.map((relVehicle) => (
              <VehicleCard key={relVehicle.id} vehicle={relVehicle} />
            ))}
          </div>

          <div className={styles.viewAllWrap}>
            <Link href="/veiculos" className={styles.viewAllButton}>
              Ver todos os veículos disponíveis
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
