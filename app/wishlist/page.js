"use client";
import React from "react";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Wishlist.module.css";

const WishlistPage = () => {
    const { wishlist } = useWishlist();
    const { language } = useLanguage();
    const t = translations[language]?.wishlist || translations.en.wishlist;

    return (
        <div className={styles.wishlistWrapper}>
            <div className="container">
                {wishlist.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Heart size={64} strokeWidth={1} className={styles.emptyIcon} />
                        <h2>{t.emptyTitle}</h2>
                        <p>{t.emptyDesc}</p>
                        <Link href="/shop" className={styles.shopBtn}>
                            {t.discover}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.pageHeader}>
                            <h1>{t.title}</h1>
                            <p>{t.subtitle
                                .replace('{count}', wishlist.length)
                                .replace('{plural}', wishlist.length !== 1 ? 's' : '')}
                            </p>
                        </div>
                        <div className={styles.grid}>
                            {wishlist.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
