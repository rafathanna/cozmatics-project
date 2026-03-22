"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
    const { language } = useLanguage();
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");
    const shouldHideLayout = isAdminPage || isAuthPage;

    return (
        <div className={styles.layoutWrapper} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {!shouldHideLayout && <Navbar />}
            <main className={styles.mainContent}>
                {children}
            </main>
            {!shouldHideLayout && <Footer />}
            {!shouldHideLayout && <WhatsAppButton />}
        </div>
    );
};

export default Layout;
