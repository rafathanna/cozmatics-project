"use client";
import React from "react";
import styles from "./ShopByConcern.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const concerns = [
    { id: 1, name: "Acne", bgColor: "#4ca5b3", image: "/images/concerns/acne.png" },
    { id: 2, name: "Dark Spots", bgColor: "#694632", image: "/images/concerns/dark_spots.png" },
    { id: 3, name: "Dryness", bgColor: "#c2996e", image: "/images/concerns/dryness.png" },
    { id: 4, name: "Redness", bgColor: "#bc3c59", image: "/images/concerns/redness.png" },
    { id: 5, name: "Stretch Marks", bgColor: "#8c6295", image: "/images/concerns/stretch_marks.jpg" },
    { id: 6, name: "Hair Loss", bgColor: "#0b3b3e", image: "/images/concerns/hair_loss.jfif" }
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
                <div className={styles.grid}>
                    {concerns.map((concern) => {
                        const concernKey = Object.keys(t).find(key => t[key].toLowerCase() === concern.name.toLowerCase() || key.toLowerCase() === concern.name.replace(/\s+/g, '').toLowerCase());
                        const translatedName = t[concernKey] || concern.name;

                        return (
                            <div key={concern.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    <img 
                                        src={concern.image} 
                                        alt={translatedName} 
                                        className={styles.image}
                                        loading="lazy"
                                    />
                                </div>
                                <div 
                                    className={styles.banner} 
                                    style={{ backgroundColor: concern.bgColor }}
                                >
                                    {translatedName}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ShopByConcern;
