"use client";
import React from "react";
import styles from "./CategoryBlocks.module.css";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const categories = [
    { id: 1, name: "Skin Care", path: "/category/skincare", color: "#f9e5d8", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800" },
    { id: 2, name: "Body Care", path: "/category/bodycare", color: "#f0f0f0", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
    { id: 3, name: "Hair Care", path: "/category/haircare", color: "#e8ede7", image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=800" },
    { id: 4, name: "Kids", path: "/category/kids", color: "#fdf8e1", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800" }
];

const CategoryBlocks = () => {
    const { language } = useLanguage();
    const t = translations[language]?.home?.categories || translations.en.home.categories;

    return (
        <section className={`${styles.section} animate-fade-in`}>
            <div className="container">
                <div className={styles.header}>
                    <h2>{t.title}</h2>
                    <p>{t.desc}</p>
                </div>
                <div className={styles.grid}>
                    {categories.map((cat, index) => (
                        <Link
                            href={cat.path}
                            key={cat.id}
                            className={styles.categoryItem}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={styles.imageWrapper}>
                                <img src={cat.image} alt={cat.name} className={styles.catImg} />
                                <div className={styles.overlay}></div>
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.catName}>
                                    {cat.id === 1 ? t.skinCare : cat.id === 2 ? t.bodyCare : cat.id === 3 ? t.hairCare : t.kids}
                                </h3>
                                <span className={styles.exploreBtn}>{t.explore} <ChevronRight size={14} /></span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryBlocks;
