"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Cart.module.css";

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { language } = useLanguage();
    const t = translations[language]?.cart || translations.en.cart;

    if (cart.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <div className="container">
                    <ShoppingBag size={60} strokeWidth={1} />
                    <h1>{t.empty}</h1>
                    <p>{t.emptyDesc}</p>
                    <Link href="/shop" className={styles.shopBtn}>{t.startShopping}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartWrapper}>
            <div className="container">
                <h1 className={styles.pageTitle}>{t.title}</h1>

                <div className={styles.cartGrid}>
                    {/* Items List */}
                    <div className={styles.itemsSide}>
                        {cart.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}></div>
                                <div className={styles.itemInfo}>
                                    <Link href={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                                    <span className={styles.itemBrand}>{item.brand}</span>
                                    <div className={styles.mobilePrice}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.price}</div>
                                </div>
                                <div className={styles.itemQty}>
                                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                </div>
                                <div className={styles.itemPrice}>
                                    {language === 'ar' ? 'ج.م' : 'EGP'} {item.price * item.quantity}
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Checkout Summary */}
                    <aside className={styles.summarySide}>
                        <div className={styles.summaryCard}>
                            <h3>{t.orderSummary}</h3>
                            <div className={styles.summaryLine}>
                                <span>{t.subtotal}</span>
                                <span>{language === 'ar' ? 'ج.م' : 'EGP'} {cartTotal}</span>
                            </div>
                            <div className={styles.summaryLine}>
                                <span>{t.shipping}</span>
                                <span className={styles.free}>{t.free}</span>
                            </div>
                            <div className={`${styles.summaryLine} ${styles.totalLine}`}>
                                <span>{t.total}</span>
                                <span>{language === 'ar' ? 'ج.م' : 'EGP'} {cartTotal}</span>
                            </div>
                            <Link href="/checkout" className={styles.checkoutBtn}>
                                {t.checkout} <ArrowRight size={18} />
                            </Link>
                            <p className={styles.secureNote}>{t.secureNote}</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
