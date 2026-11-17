"use client";

import Link from "next/link";
import { useEffect, useState, useRef, type TouchEvent } from "react";
import {
  AiOutlineCar,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineArrowRight,
} from "react-icons/ai";
import type { PublicVehicle } from "../public-site-api";
import { PublicVehicleCard } from "../vehicle-card";
import { QuoteTrigger } from "./quote-trigger";
import styles from "./vehicle-slider.module.css";

function pageSizeFor(width: number) {
  if (width < 768) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 3;
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

export function VehicleSlider({ vehicles }: { vehicles: PublicVehicle[] }) {
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setPageSize(pageSizeFor(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const pages = chunk(vehicles, pageSize);
  const safePage = Math.min(page, Math.max(pages.length - 1, 0));

  function go(delta: number) {
    if (pages.length === 0) {
      return;
    }
    setPage((current) => (current + delta + pages.length) % pages.length);
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        go(1);
      } else {
        go(-1);
      }
    }
    touchStartX.current = null;
  }

  return (
    <section
      id="veiculos"
      className={styles.section}
      aria-label="Vitrine de veículos por assinatura"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Frota Disponível</span>
            <h2 className={styles.title}>
              Encontre o carro ideal para sua rotina
            </h2>
            <p className={styles.subtitle}>
              Explore opções para diferentes estilos de vida e necessidades.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className={styles.navControls}>
              <button
                type="button"
                className={styles.arrow}
                aria-label="Ver veículos anteriores"
                onClick={() => go(-1)}
              >
                <AiOutlineLeft />
              </button>

              <span className={styles.counter}>
                {safePage + 1} / {pages.length}
              </span>

              <button
                type="button"
                className={styles.arrow}
                aria-label="Ver próximos veículos"
                onClick={() => go(1)}
              >
                <AiOutlineRight />
              </button>
            </div>
          )}
        </div>

        {vehicles.length > 0 ? (
          <div
            className={styles.viewport}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={styles.track}
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {pages.map((group, groupIndex) => (
                <div
                  key={`page-${groupIndex}`}
                  className={styles.slide}
                  style={{
                    gridTemplateColumns: `repeat(${pageSize}, 1fr)`,
                  }}
                >
                  {group.map((vehicle) => (
                    <div key={vehicle.id} className={styles.cardWrapper}>
                      <PublicVehicleCard vehicle={vehicle} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <AiOutlineCar aria-hidden="true" className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              Nenhum veículo publicado no momento.
            </p>
          </div>
        )}

        <div className={styles.footerAction}>
          <Link href="/veiculos" className={styles.catalogButton}>
            Conferir todos os veículos
            <AiOutlineArrowRight className={styles.arrowIcon} />
          </Link>
          <p className={styles.note}>
            Consulte disponibilidade e condições diretamente com a locadora.
          </p>
        </div>
      </div>
    </section>
  );
}
