"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./WhatsAppButton.module.css";

const WhatsAppButton = () => {
    const { language } = useLanguage();
    const t = translations[language]?.footer || translations.en.footer;
    const [phoneNumber, setPhoneNumber] = useState(
        SITE_CONFIG.whatsappNumber.replace(/\+/g, "").replace(/\s/g, "")
    );

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "global"), (doc) => {
            if (doc.exists() && doc.data().phoneNumber) {
                const num = doc.data().phoneNumber.replace(/\+/g, "").replace(/\s/g, "");
                setPhoneNumber(num);
            }
        });
        return () => unsub();
    }, []);

    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
            aria-label={language === 'ar' ? 'تحدث معنا على واتساب' : 'Chat on WhatsApp'}
        >
            <div className={styles.iconWrapper}>
                <MessageCircle size={32} fill="white" />
                <span className={styles.tooltip}>{language === 'ar' ? 'تحدث معنا' : 'Chat with us'}</span>
            </div>
            <div className={styles.pulse}></div>
        </a>
    );
};

export default WhatsAppButton;
