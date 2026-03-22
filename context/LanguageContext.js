"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedLang = localStorage.getItem('cozmatics_lang');
        if (storedLang) {
            setLanguage(storedLang);
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        localStorage.setItem('cozmatics_lang', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add a global class for styling specific language things if needed
        if (language === 'ar') {
            document.body.classList.add('rtl-ready');
        } else {
            document.body.classList.remove('rtl-ready');
        }
    }, [language, isMounted]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, isMounted }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
