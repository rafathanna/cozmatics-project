"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./About.module.css";

// Metadata removed for client component compatibility, or moved to a layout if needed

const AboutPage = () => {
    const { language } = useLanguage();
    const t = translations[language]?.about || translations.en.about;

    return (
        <div className={styles.aboutWrapper}>
            <header className={styles.hero}>
                <div className="container">
                    <span className={styles.tagline}>{t.tagline}</span>
                    <h1>{t.title.split('{br}').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i === 0 && <br />}
                        </React.Fragment>
                    ))}</h1>
                </div>
            </header>

            <section className={styles.storySection}>
                <div className="container">
                    <div className={styles.storyGrid}>
                        <div className={styles.imageSide}>
                            <div className={styles.imageFrame}>
                                <img
                                    src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1200"
                                    alt="Cozmatics Story"
                                    className={styles.storyImg}
                                />
                            </div>
                        </div>
                        <div className={styles.textSide}>
                            <h2>{t.philosophyTitle}</h2>
                            <p>{t.philosophyDesc}</p>
                            <div className={styles.values}>
                                <div className={styles.valueItem}>
                                    <strong>{t.values.organic}</strong>
                                    <span>{t.values.organicDesc}</span>
                                </div>
                                <div className={styles.valueItem}>
                                    <strong>{t.values.crueltyFree}</strong>
                                    <span>{t.values.crueltyFreeDesc}</span>
                                </div>
                                <div className={styles.valueItem}>
                                    <strong>{t.values.science}</strong>
                                    <span>{t.values.scienceDesc}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.mission}>
                <div className="container">
                    <div className={styles.missionContent}>
                        <h3>{t.mission}</h3>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
