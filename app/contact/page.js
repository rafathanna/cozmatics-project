"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Contact.module.css";

const ContactPage = () => {
    const { language } = useLanguage();
    const t = translations[language]?.contact || translations.en.contact;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (err) {
                console.error("Error fetching contact settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await addDoc(collection(db, "requests"), {
                ...formData,
                status: "New",
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
        } catch (err) {
            console.error("Error submitting contact form:", err);
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.contactWrapper}>
            <header className={styles.header}>
                <div className="container">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>
            </header>

            <section className={styles.contactBody}>
                <div className="container">
                    <div className={styles.grid}>
                        {/* Info Side */}
                        <div className={styles.infoSide}>
                            <div className={styles.infoCard}>
                                <h2>{t.infoTitle}</h2>
                                <p>{t.infoDesc}</p>

                                <div className={styles.infoList}>
                                    <div className={styles.item}>
                                        <div className={styles.iconCircle}>
                                            <Mail size={20} />
                                        </div>
                                        <span>{settings?.contactEmail || "hello@cozmatics.com"}</span>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.iconCircle}>
                                            <Phone size={20} />
                                        </div>
                                        <span>{settings?.phoneNumber || "+20 123 456 7890"}</span>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.iconCircle}>
                                            <MapPin size={20} />
                                        </div>
                                        <span>{settings?.address || "123 Beauty Avenue, Cairo, Egypt"}</span>
                                    </div>
                                </div>

                                <div className={styles.socials}>
                                    {settings?.facebook && (
                                        <a href={`https://facebook.com/${settings.facebook}`} target="_blank" rel="noopener noreferrer" className={styles.socialCircle}>
                                            <Facebook size={18} />
                                        </a>
                                    )}
                                    {settings?.instagram && (
                                        <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.socialCircle}>
                                            <Instagram size={18} />
                                        </a>
                                    )}
                                    {!settings?.facebook && !settings?.instagram && (
                                        <>
                                            <a href="#" className={styles.socialCircle}><Facebook size={18} /></a>
                                            <a href="#" className={styles.socialCircle}><Instagram size={18} /></a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className={styles.formSide}>
                            {success ? (
                                <div className={styles.successMessage}>
                                    <CheckCircle size={60} color="#4caf50" />
                                    <h3>{t.form.successTitle}</h3>
                                    <p>{t.form.successDesc}</p>
                                    <button onClick={() => setSuccess(false)} className={styles.resetBtn}>
                                        {t.form.sendAnother}
                                    </button>
                                </div>
                            ) : (
                                <form className={styles.form} onSubmit={handleSubmit}>
                                    {error && <div className={styles.error}>{error}</div>}

                                    <div className={styles.inputGroup}>
                                        <label>{t.form.name}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder={t.form.placeholderName}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>{t.form.email}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder={t.form.placeholderEmail}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>{t.form.subject}</label>
                                        <select name="subject" value={formData.subject} onChange={handleChange}>
                                            <option value="General Inquiry">{t.form.subjects.inquiry}</option>
                                            <option value="Order Support">{t.form.subjects.support}</option>
                                            <option value="Wholesale">{t.form.subjects.wholesale}</option>
                                            <option value="Feedback">{t.form.subjects.feedback}</option>
                                        </select>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>{t.form.message}</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder={t.form.placeholderMessage}
                                            rows="5"
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                                        {loading ? <Loader2 className={styles.spin} /> : <><Send size={18} /> {t.form.send}</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
