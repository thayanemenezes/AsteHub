"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, type TouchEvent } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import type { Banner } from "../content";
import { QuoteTrigger } from "./quote-trigger";
import styles from "./banner-carousel.module.css";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || banners.length < 2) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [banners.length, paused]);

  function go(step: number) {
    setIndex((current) => (current + step + banners.length) % banners.length);
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX.current - touchEndX;

    // Minimum swipe threshold
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        go(1); // Swipe left -> next
      } else {   
        go(-1); // Swipe right -> prev
      }
    }
    touchStartX.current = null;
  }

  const current = banners[index];  

  return (
    <section
      id="assinatura"
      className={styles.wrap}
      aria-roledescription="carrossel"
      aria-label="Banners principais da assinatura"
    >
      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, bannerIndex) => (
          <div
            key={banner.id}
            className={`${styles.slide} ${bannerIndex === index ? styles.slideActive : ""}`}
            aria-hidden={bannerIndex !== index}
          >
            <Image
              src={banner.image}
              alt=""
              fill
              priority={bannerIndex === 0}
              sizes="90vw"
              className={styles.photo}
            />
          </div>
        ))}

        <div className={styles.shade} />  

        {current && (
          <div className={styles.copy}>
            <span className={styles.kicker}>{current.kicker}</span>
            <h1 className={styles.title}>{current.title}</h1>
            <p className={styles.text}>{current.text}</p>

            <div className={styles.ctaWrap}>
              {current.ctaAction === "quote" ? (
                <QuoteTrigger className={styles.actionButton}>
                  {current.ctaText ?? "Solicitar orçamento"}
                </QuoteTrigger>
              ) : current.ctaAction === "calculator" ? (
                <Link href="#calculadora" className={styles.actionButton}>
                  {current.ctaText ?? "Simular plano"}
                </Link>
              ) : (
                <Link href="#veiculos" className={styles.actionButton}>
                  {current.ctaText ?? "Ver veículos"}
                </Link>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          aria-label="Banner anterior"
          onClick={() => go(-1)}
        >
          <AiOutlineLeft />
        </button>

        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          aria-label="Próximo banner"
          onClick={() => go(1)}
        >
          <AiOutlineRight />
        </button>

        <div
          className={styles.dots}
          role="tablist"
          aria-label="Indicadores dos slides"
        >
          {banners.map((banner, bannerIndex) => (
            <button
              key={banner.id}
              type="button"
              role="tab"
              className={`${styles.dot} ${bannerIndex === index ? styles.dotActive : ""}`}
              aria-label={`Mostrar slide ${bannerIndex + 1}: ${banner.title}`}
              aria-selected={bannerIndex === index}
              onClick={() => setIndex(bannerIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
