"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, CreditCard, Truck, CheckCircle2, QrCode } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import styles from "./Checkout.module.css";
import { db } from "@/firebase/config";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user, userData } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.checkout || translations.en.checkout;
    const cartT = translations[language]?.cart || translations.en.cart;

    const [step, setStep] = useState(1); // 1: Info, 2: Payment/Confirm
    const [settings, setSettings] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        phone: ""
    });

    // Prefill user data if logged in
    useEffect(() => {
        if (userData || user) {
            setFormData(prev => ({
                ...prev,
                email: user?.email || prev.email,
                firstName: userData?.name?.split(' ')[0] || prev.firstName,
                lastName: userData?.name?.split(' ').slice(1).join(' ') || prev.lastName,
                phone: userData?.phone || prev.phone,
                address: userData?.address || prev.address,
            }));
        }
    }, [user, userData]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (err) {
                console.error("Error fetching checkout settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleWhatsAppOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 1. Save to Firestore for Admin Dashboard
            await addDoc(collection(db, "orders"), {
                customerName: `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Guest",
                customerEmail: formData.email || "N/A",
                customerPhone: formData.phone || "N/A",
                shippingAddress: `${formData.address || ""}, ${formData.city || ""}`.trim() || "No Address",
                userId: user ? user.uid : "guest",
                items: cart.map(item => ({
                    id: item.id || Date.now().toString(),
                    name: item.name || "Unknown Product",
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    brand: item.brand || "Cozmatics"
                })),
                totalAmount: cartTotal || 0,
                status: "Pending",
                createdAt: serverTimestamp()
            });

            // 2. Prepare WhatsApp message
            const orderDetails = cart.map(item => `- ${item.name} (${item.quantity}x) - ${language === 'ar' ? 'ج.م' : 'EGP'} ${item.price * item.quantity}`).join("%0A");
            const customerInfo = `*Customer:* ${formData.firstName} ${formData.lastName}%0A*Phone:* ${formData.phone}%0A*Address:* ${formData.address}, ${formData.city}`;
            const total = `*Total:* ${language === 'ar' ? 'ج.م' : 'EGP'} ${cartTotal}`;

            const message = `*New Order - Cozmatics*%0A%0A${orderDetails}%0A%0A${total}%0A%0A${customerInfo}`;

            // Use dynamically fetched number or fallback to SITE_CONFIG
            let phone = settings?.phoneNumber || SITE_CONFIG.whatsappNumber;

            // Advanced cleaning for WhatsApp API
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '20' + cleanPhone.substring(1);
            }

            const waLink = `https://wa.me/${cleanPhone}?text=${message}`;

            // 3. Complete process
            window.open(waLink, '_blank');
            setStep(3);
            clearCart();
        } catch (error) {
            console.error("Error saving order:", error);
            alert("Failed to save order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 3) {
        return (
            <div className={styles.successWrapper}>
                <div className="container">
                    <CheckCircle2 size={80} color="#2ecc71" strokeWidth={1} />
                    <h1>{t.successTitle}</h1>
                    <p>{t.successDesc}</p>
                    <button className={styles.homeBtn} onClick={() => window.location.href = "/"}>{t.backToHome}</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.checkoutWrapper}>
            <div className="container">
                <h1 className={styles.pageTitle}>{t.completeOrderTitle}</h1>

                <div className={styles.checkoutGrid}>
                    <div className={styles.formSide}>
                        <div className={styles.stepsNav}>
                            <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ""}`}>{t.step1}</div>
                            <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ""}`}>{t.step2}</div>
                        </div>

                        {step === 1 && (
                            <form className={styles.form} onSubmit={handleInfoSubmit}>
                                <div className={styles.sectionHeader}>
                                    <h3>{t.contactInfo}</h3>
                                    {!user && <span className={styles.guestBadge}>{t.guestCheckout}</span>}
                                </div>
                                <input
                                    type="email"
                                    placeholder={t.emailPlaceholder}
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {!user && (
                                    <p className={styles.loginPrompt}>
                                        {t.loginPrompt} <a href="/login" className={styles.loginLink}>{t.loginLink}</a>
                                    </p>
                                )}

                                <h3 className={styles.sectionMargin}>{t.shippingAddress}</h3>
                                <div className={styles.row}>
                                    <input type="text" placeholder={t.firstName} value={formData.firstName} required onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                    <input type="text" placeholder={t.lastName} value={formData.lastName} required onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>
                                <input type="text" placeholder={t.address} value={formData.address} required onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                <div className={styles.row}>
                                    <input type="text" placeholder={t.city} value={formData.city} required onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    <input type="text" placeholder={t.postalCode} />
                                </div>
                                <input type="tel" placeholder={t.phone} value={formData.phone} required onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                                <button type="submit" className={styles.nextBtn}>
                                    {t.reviewOrder} <Truck size={18} />
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <div className={styles.paymentSection}>
                                <h3>{t.paymentMethods}</h3>
                                <div className={styles.walletInfo}>
                                    {SITE_CONFIG.wallets.map((wallet, idx) => (
                                        <div key={idx} className={styles.walletCard}>
                                            <QrCode size={20} />
                                            <div>
                                                <strong>{wallet.name}:</strong> {wallet.number || wallet.id}
                                            </div>
                                        </div>
                                    ))}
                                    <div className={styles.paymentNote}>
                                        {t.paymentNote.replace("{total}", cartTotal)}
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button type="button" onClick={() => setStep(1)} className={styles.backLink}>{t.editInfo}</button>
                                    <button onClick={handleWhatsAppOrder} className={styles.waBtn} disabled={isSubmitting}>
                                        {isSubmitting ? t.sending : t.sendOrder} <MessageSquare size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className={styles.summarySide}>
                        <div className={styles.orderSummary}>
                            <h4>{t.yourOrder}</h4>
                            {cart.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.itemThumb}></div>
                                    <div className={styles.itemInfo}>
                                        <p>{item.name} x {item.quantity}</p>
                                        <span>{language === 'ar' ? 'ج.م' : 'EGP'} {item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                            <div className={styles.totals}>
                                <div className={styles.line}><span>{cartT.subtotal}</span><span>{language === 'ar' ? 'ج.م' : 'EGP'} {cartTotal}</span></div>
                                <div className={styles.line}><span>{cartT.shipping}</span><span>{cartT.free}</span></div>
                                <div className={`${styles.line} ${styles.total}`}><span>{cartT.total}</span><span>{language === 'ar' ? 'ج.م' : 'EGP'} {cartTotal}</span></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
