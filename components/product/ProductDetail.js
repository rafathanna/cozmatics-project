"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { Star, Truck, ShieldCheck, RefreshCw, Minus, Plus, MessageCircle, Send, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import RelatedProducts from "./RelatedProducts";
import styles from "./ProductDetail.module.css";

const ProductDetail = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.product || translations.en.product;

    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submitting, setSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const item = product || {
        id: "default",
        name: "Product Not Found",
        brand: "Cozmatics",
        price: 0,
        description: "Please select a valid product.",
        image: ""
    };

    useEffect(() => {
        if (!item.id || item.id === "default") return;

        const q = query(
            collection(db, "reviews"),
            where("productId", "==", item.id),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReviews(reviewsData);
        }, (error) => {
            console.error("Error fetching reviews:", error);
        });

        return () => unsubscribe();
    }, [item.id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const handleAdd = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(item);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to leave a review");
            return;
        }
        if (!newReview.comment.trim()) return;

        setSubmitting(true);
        try {
            // 1. Add the review
            await addDoc(collection(db, "reviews"), {
                productId: item.id,
                userId: user.uid,
                userName: user.displayName || user.email.split('@')[0],
                rating: newReview.rating,
                comment: newReview.comment,
                createdAt: serverTimestamp()
            });

            // Note: Product aggregate rating update removed as regular users 
            // do not have write access to the products collection.
            // This should ideally be handled via a Firebase Cloud Function.

            setNewReview({ rating: 5, comment: "" });
            setShowReviewForm(false);
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, size = 16, interactive = false) => {
        return [...Array(5)].map((_, i) => {
            const isFilled = i < rating;
            return (
                <Star
                    key={i}
                    size={size}
                    fill={isFilled ? "#ffb800" : "none"}
                    color={isFilled ? "#ffb800" : "#ccc"}
                    style={{ cursor: interactive ? 'pointer' : 'default' }}
                    onClick={() => interactive && setNewReview({ ...newReview, rating: i + 1 })}
                />
            );
        });
    };

    return (
        <div className={styles.detailWrapper}>
            <div className={`container ${styles.grid}`}>
                {/* Image Gallery Placeholder */}
                <div className={styles.gallery}>
                    <div className={styles.mainImagePlaceholder}>
                        {/* Product Image */}
                    </div>
                    <div className={styles.thumbnails}>
                        <div className={styles.thumb}></div>
                        <div className={styles.thumb}></div>
                        <div className={styles.thumb}></div>
                    </div>
                </div>

                {/* Product Info */}
                <div className={styles.infoSide}>
                    <span className={styles.brand}>{item.brand}</span>
                    <h1 className={styles.name}>{item.name}</h1>
                    <div className={styles.rating}>
                        {renderStars(Math.round(averageRating))}
                        <span>({reviews.length} {language === 'ar' ? 'تقييم' : 'Reviews'})</span>
                    </div>

                    <div className={styles.priceRow}>
                        <span className={styles.price}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.price}</span>
                        {item.oldPrice && <span className={styles.oldPrice}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.oldPrice}</span>}
                    </div>

                    <p className={styles.description}>{item.description}</p>

                    {item.instructions && (
                        <div className={styles.instructionsBox}>
                            <h4>{t.howToUse}</h4>
                            <p>{item.instructions}</p>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <div className={styles.qtySelector}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
                        </div>
                        <button className={styles.addBtn} onClick={handleAdd}>{t.addToCart}</button>
                    </div>

                    <div className={styles.perks}>
                        <div className={styles.perk}>
                            <Truck size={20} />
                            <span>{t.fastShipping}</span>
                        </div>
                        <div className={styles.perk}>
                            <ShieldCheck size={20} />
                            <span>{t.organicSafe}</span>
                        </div>
                        <div className={styles.perk}>
                            <RefreshCw size={20} />
                            <span>{t.returnPolicy}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className={`container ${styles.reviewsSection}`}>
                <div className={styles.reviewsHeader}>
                    <h2>{t.reviewsTitle}</h2>
                    <div className={styles.avgStats}>
                        <div className={styles.avgNumber}>{averageRating}</div>
                        <div className={styles.avgStars}>
                            {renderStars(Math.round(averageRating), 20)}
                            <p>{t.basedOn.replace("{count}", reviews.length)}</p>
                        </div>
                        <button className={styles.writeBtn} onClick={() => setShowReviewForm(!showReviewForm)}>
                            {showReviewForm ? t.cancelReview : t.writeReview}
                        </button>
                    </div>
                </div>

                {showReviewForm && (
                    <div className={styles.reviewFormCard}>
                        <h3>{t.shareExperience}</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className={styles.starSelect}>
                                <label>{t.yourRating}</label>
                                <div className={styles.starsRow}>
                                    {renderStars(newReview.rating, 24, true)}
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t.yourReview}</label>
                                <textarea
                                    placeholder={t.reviewPlaceholder}
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    required
                                    rows="4"
                                />
                            </div>
                            <button type="submit" className={styles.submitReviewBtn} disabled={submitting}>
                                {submitting ? (language === 'ar' ? 'جاري النشر...' : 'Submitting...') : t.postReview}
                            </button>
                        </form>
                    </div>
                )}

                <div className={styles.reviewsList}>
                    {reviews.map(review => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewUser}>
                                <div className={styles.userIcon}><User size={20} /></div>
                                <div>
                                    <p className={styles.userName}>{review.userName}</p>
                                    <p className={styles.reviewDate}>
                                        {review.createdAt?.toDate
                                            ? review.createdAt.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                                            : (language === 'ar' ? 'الآن' : 'Just now')}
                                    </p>
                                </div>
                            </div>
                            <div className={styles.reviewContent}>
                                <div className={styles.reviewStars}>
                                    {renderStars(review.rating, 14)}
                                </div>
                                <p className={styles.reviewComment}>{review.comment}</p>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className={styles.emptyReviews}>
                            <MessageCircle size={40} />
                            <p>{t.noReviews}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products Section */}
            <RelatedProducts currentProductId={item.id} category={item.category} />
        </div>
    );
};

export default ProductDetail;
