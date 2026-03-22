import React from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { language } = useLanguage();
    const isFavorited = isInWishlist(product?.id);

    // Mock product data for safety if not provided
    const item = product || {
        id: 1,
        name: "Vitamin C Radiance Serum",
        brand: "Cozmatics",
        price: 450,
        oldPrice: 600,
        image: "/images/prod-1.webp",
        badges: ["Best Seller"]
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {item.badges && item.badges.map(badge => {
                    let translatedBadge = badge;
                    if (language === 'ar') {
                        if (badge === 'Best Seller') translatedBadge = 'الأكثر مبيعاً';
                        if (badge === 'New') translatedBadge = 'جديد';
                        if (badge === 'Pure') translatedBadge = 'طبيعي';
                    }
                    return <span key={badge} className={styles.badge}>{translatedBadge}</span>
                })}

                <img
                    src={item.image || "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=60&w=500"}
                    alt={item.name}
                    className={styles.productImg}
                />

                <div className={styles.actions}>
                    <button
                        className={`${styles.actionBtn} ${isFavorited ? styles.activeWishlist : ""}`}
                        onClick={() => toggleWishlist(item)}
                    >
                        <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                    </button>
                    <button className={styles.actionBtn}><Eye size={18} /></button>
                    <button
                        className={styles.actionBtn}
                        onClick={() => addToCart(item)}
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>

            <div className={styles.info}>
                <span className={styles.brand}>{item.brand}</span>
                <Link href={`/product/${item.id}`} className={styles.name}>{item.name}</Link>

                {item.numReviews > 0 && (
                    <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < Math.round(item.avgRating || 0) ? "#ffb800" : "none"}
                                color={i < Math.round(item.avgRating || 0) ? "#ffb800" : "#ccc"}
                            />
                        ))}
                        <span>({item.numReviews})</span>
                    </div>
                )}

                <div className={styles.priceRow}>
                    <span className={styles.price}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.price}</span>
                    {item.oldPrice && <span className={styles.oldPrice}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.oldPrice}</span>}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
