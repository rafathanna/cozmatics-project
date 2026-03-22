"use client";
import React from "react";
import styles from "./Brands.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const brands = [
    { name: "Olea", logo: "OLEA" },
    { name: "Lumish", logo: "LUMISH" },
    { name: "Aura", logo: "AURA" },
    { name: "Cozmatics", logo: "COZMATICS" },
    { name: "Pure", logo: "PURE" },
    { name: "Velvet", logo: "VELVET" }
];

const Brands = () => {
    const { language } = useLanguage();
    const t = translations[language]?.home?.brands || translations.en.home.brands;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{t.title}</h2>
                    <p>{t.desc}</p>
                </div>
                <div className={styles.brandsTrack}>
                    <div className={styles.brandsList}>
                        {brands.concat(brands).map((brand, index) => (
                            <div key={index} className={styles.brandItem}>
                                <span className={styles.brandLogo}>{brand.logo}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Brands;
