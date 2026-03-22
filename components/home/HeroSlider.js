"use client";
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./HeroSlider.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const slides = [
    {
        id: 1,
        title: "Organic Beauty For Every Body",
        subtitle: "New Collection",
        description: "Discover our latest skincare innovations crafted with natural ingredients and advanced science.",
        cta: "Shop Skincare",
        color: "#f9f5f0", // Cream
        image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&q=80&w=2000"
    },
    {
        id: 2,
        title: "Eco-Friendly Body Care",
        subtitle: "Seasonal Essentials",
        description: "Experience the ultimate in skin and body care with our curated collection of luxury beauty products.",
        cta: "Shop Body",
        color: "#e8ede7", // Sage Green
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=2000"
    }
];

const HeroSlider = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const { language } = useLanguage();
    const t = translations[language]?.home?.hero || translations.en.home.hero;

    // Auto-sliding logic
    React.useEffect(() => {
        if (!emblaApi) return;

        const intervalId = setInterval(() => {
            emblaApi.scrollNext();
        }, 5000); // Slide every 5 seconds

        return () => clearInterval(intervalId);
    }, [emblaApi]);

    const translatedSlides = slides.map(slide => ({
        ...slide,
        title: slide.id === 1 ? t.title1 : t.title2,
        subtitle: slide.id === 1 ? t.subtitle1 : t.subtitle2,
        description: slide.id === 1 ? t.desc1 : t.desc2,
        cta: slide.id === 1 ? t.cta1 : t.cta2
    }));

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className={styles.embla} ref={emblaRef}>
            <div className={styles.emblaContainer}>
                {translatedSlides.map((slide) => (
                    <div
                        className={styles.emblaSlide}
                        key={slide.id}
                        style={{ backgroundColor: slide.color }}
                    >
                        <div className={`container ${styles.slideContent}`}>
                            <div className={styles.textSide}>
                                <span className="animate-fade-in">{slide.subtitle}</span>
                                <h1 className="animate-fade-in">{slide.title}</h1>
                                <p className="animate-fade-in">{slide.description}</p>
                                <button className={styles.primaryBtn}>{slide.cta}</button>
                            </div>
                            <div className={styles.imageSide}>
                                <div className={styles.imageContainer}>
                                    <img src={slide.image} alt={slide.title} className={styles.heroImg} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className={styles.prev} onClick={scrollPrev}>
                <ChevronLeft size={30} strokeWidth={1} />
            </button>
            <button className={styles.next} onClick={scrollNext}>
                <ChevronRight size={30} strokeWidth={1} />
            </button>
        </div>
    );
};

export default HeroSlider;
