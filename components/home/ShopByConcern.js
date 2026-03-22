"use client";
import React from "react";
import styles from "./ShopByConcern.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const concerns = [
    { id: 1, name: "Dark Spots" },
    { id: 2, name: "Acne" },
    { id: 3, name: "Redness" },
    { id: 4, name: "Dandruff" },
    { id: 5, name: "Split Ends" },
    { id: 6, name: "Hair Loss" }
];

const ShopByConcern = () => {
    const { language } = useLanguage();
    const t = translations[language]?.home?.concerns || translations.en.home.concerns;

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{t.title}</h2>
                    <p>{t.desc}</p>
                </div>
                <div className={styles.chipGrid}>
                    {concerns.map((concern) => {
                        const concernKey = Object.keys(t).find(key => t[key].toLowerCase() === concern.name.toLowerCase() || key.toLowerCase() === concern.name.replace(/\s+/g, '').toLowerCase());
                        const translatedName = t[concernKey] || concern.name;

                        return (
                            <button key={concern.id} className={styles.concernChip}>
                                {translatedName}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ShopByConcern;
