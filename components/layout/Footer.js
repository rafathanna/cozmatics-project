"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Footer.module.css";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const Footer = () => {
    const { language } = useLanguage();
    const t = translations[language]?.footer || translations.en.footer;
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching footer settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerGrid}`}>
                <div className={styles.footerSection}>
                    <h3 className={styles.brandLogo}>{settings?.storeName || "COZMATICS"}</h3>
                    <p className={styles.footerDesc}>
                        {settings?.announcement || t.desc}
                    </p>
                    <div className={styles.socials}>
                        {settings?.instagram && (
                            <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer">
                                <Instagram size={20} />
                            </a>
                        )}
                        {settings?.facebook && (
                            <a href={`https://facebook.com/${settings.facebook}`} target="_blank" rel="noopener noreferrer">
                                <Facebook size={20} />
                            </a>
                        )}
                        <a href="#"><Twitter size={20} /></a>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h4>{t.shop}</h4>
                    <ul>
                        <li><Link href="/category/skincare">{t.links.skincare}</Link></li>
                        <li><Link href="/category/bodycare">{t.links.bodycare}</Link></li>
                        <li><Link href="/category/haircare">{t.links.haircare}</Link></li>
                        <li><Link href="/category/kids">{t.links.kids}</Link></li>
                    </ul>
                </div>

                <div className={styles.footerSection}>
                    <h4>{t.support}</h4>
                    <ul>
                        <li><Link href="/faq">{t.links.faq}</Link></li>
                        <li><Link href="/shipping">{t.links.shipping}</Link></li>
                        <li><Link href="/contact">{t.links.contact}</Link></li>
                        <li><Link href="/privacy">{t.links.privacy}</Link></li>
                    </ul>
                </div>

                <div className={styles.footerSection}>
                    <h4>{t.newsletter}</h4>
                    <p>{t.newsletterDesc}</p>
                    <form className={styles.newsletterForm}>
                        <input type="email" placeholder={t.emailPlaceholder} required />
                        <button type="submit"><Mail size={18} /></button>
                    </form>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Cozmatics. {t.rights}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
