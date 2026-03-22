"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Auth.module.css";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const LoginPage = () => {
    const { language } = useLanguage();
    const t = translations[language]?.auth || translations.en.auth;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const userCredential = await login(email, password);
            const user = userCredential.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().role === 'admin') {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(t.errorLogin);
            setLoading(false);
        }
    };

    return (
        <div className={styles.authWrapper}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>COZMATICS</Link>
                    <h1>{t.signIn}</h1>
                    <p>{t.tagline}</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>{t.email}</label>
                        <Mail size={18} className={styles.icon} />
                        <input
                            type="email"
                            placeholder={t.placeholderEmail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>{t.password}</label>
                        <Lock size={18} className={styles.icon} />
                        <input
                            type="password"
                            placeholder={t.placeholderPassword}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <Loader2 className={styles.spin} size={20} /> : <>{t.loginBtn} <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    {t.newToBrand} <Link href="/register">{t.linkToRegister}</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
