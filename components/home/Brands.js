"use client";
import React from "react";
import styles from "./Brands.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const brands = [
    { name: "CeraVe", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=cerave.com" },
    { name: "Cetaphil", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=cetaphil.com" },
    { name: "La Roche-Posay", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=laroche-posay.us" },
    { name: "Vichy", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=vichyusa.com" },
    { name: "Eucerin", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=eucerinus.com" },
    { name: "Neutrogena", logo: "https://www.google.com/s2/favicons?sz=256&domain_url=neutrogena.com" }
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
                                <img src={brand.logo} alt={brand.name} className={styles.brandImage} loading="lazy" />
                                <span className={styles.brandName}>{brand.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Brands;
