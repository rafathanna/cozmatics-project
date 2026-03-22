"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "../product/ProductCard";
import styles from "./FeaturedProducts.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const products = [
    { id: 1, name: "Radiance Serum", brand: "Olea", price: 350, oldPrice: 500, badges: ["Best Seller"], image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
    { id: 2, name: "Hydrating Cream", brand: "Lumish", price: 280, oldPrice: 400, badges: ["New"], image: "https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&q=80&w=800" },
    { id: 3, name: "Gentle Cleanser", brand: "Aura", price: 450, oldPrice: 600, badges: [], image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" },
    { id: 4, name: "Detox Barrier Mask", brand: "Olea", price: 520, oldPrice: 700, badges: ["Pure"], image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" },
    { id: 5, name: "Premium Body Polish", brand: "Lumish", price: 390, oldPrice: 450, badges: [], image: "https://images.unsplash.com/photo-1556229167-7319130fb59b?auto=format&fit=crop&q=80&w=800" }
];

const FeaturedProducts = () => {
    const { language } = useLanguage();
    const t = translations[language]?.home?.featured || translations.en.home.featured;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps'
    });

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <h2>{t.title}</h2>
                        <p>{t.desc}</p>
                    </div>
                    <div className={styles.navBtns}>
                        <button onClick={scrollPrev}><ChevronLeft size={20} /></button>
                        <button onClick={scrollNext}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className={styles.embla} ref={emblaRef}>
                    <div className={styles.emblaContainer}>
                        {products.map((prod) => (
                            <div className={styles.emblaSlide} key={prod.id}>
                                <ProductCard product={prod} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
