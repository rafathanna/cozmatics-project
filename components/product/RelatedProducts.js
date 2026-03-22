"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import ProductCard from './ProductCard';
import styles from './RelatedProducts.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/config/translations';

const RelatedProducts = ({ currentProductId, category }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language, isMounted } = useLanguage();

    // Dynamic Translation
    const relatedText = isMounted && language === 'ar' ? "قد يعجبك أيضاً" : "You May Also Like";

    useEffect(() => {
        const fetchRelated = async () => {
            if (!category) return;

            try {
                // Fetch products in the same category, limit to 5
                const productsRef = collection(db, "products");
                const q = query(
                    productsRef,
                    where("category", "==", category),
                    limit(5)
                );

                const querySnapshot = await getDocs(q);
                let products = [];

                querySnapshot.forEach((doc) => {
                    if (doc.id !== currentProductId) {
                        products.push({ id: doc.id, ...doc.data() });
                    }
                });

                // Only keep up to 4 to form a nice grid
                setRelatedProducts(products.slice(0, 4));
            } catch (error) {
                console.error("Error fetching related products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [category, currentProductId]);

    if (loading || relatedProducts.length === 0) return null;

    return (
        <section className={styles.relatedSection}>
            <div className={`container`}>
                <h2 className={styles.title}>{relatedText}</h2>
                <div className={styles.grid}>
                    {relatedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedProducts;
