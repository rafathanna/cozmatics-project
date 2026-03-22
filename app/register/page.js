"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "../login/Auth.module.css";

const RegisterPage = () => {
    const { language } = useLanguage();
    const t = translations[language]?.auth || translations.en.auth;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 6) {
            setError(language === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' : "Password should be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await signup(email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user',
                createdAt: serverTimestamp()
            });

            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Register error:", err);
            setError(t.errorRegister);
            setLoading(false);
        }
    };

    return (
        <div className={styles.authWrapper}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <Link href="/" className={styles.brand}>COZMATICS</Link>
                    <h1>{t.signUp}</h1>
                    <p>{t.tagline}</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>{t.name}</label>
                        <User size={18} className={styles.icon} />
                        <input
                            type="text"
                            placeholder={t.placeholderName}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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
                        {loading ? <Loader2 className={styles.spin} size={20} /> : <>{t.registerBtn} <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    {t.alreadyHaveAccount} <Link href="/login">{t.linkToLogin}</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
