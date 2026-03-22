"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useSearchParams } from "next/navigation";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import styles from "./CategoryPage.module.css";
import { ChevronDown, Filter, X, Loader2, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const CategoryPage = ({ categoryName }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const queryQ = searchParams ? searchParams.get("q") : null;
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [activeSkinType, setActiveSkinType] = useState(null);
    const [activeConcern, setActiveConcern] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const { language } = useLanguage();
    const t = translations[language]?.shop || translations.en.shop;
    const commonT = translations[language]?.home || translations.en.home;

    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '');

    // Filter Configurations based on User Images
    const filterConfig = {
        skincare: {
            subcategories: [
                { id: 'cleansers', name: language === 'ar' ? 'منظفات' : 'Cleansers', hasSkinTypes: true },
                { id: 'moisturisers', name: language === 'ar' ? 'مرطبات' : 'Moisturisers', hasSkinTypes: true },
                { id: 'sunscreens', name: language === 'ar' ? 'واقي شمس' : 'Sunscreens', hasSkinTypes: true },
                { id: 'serums', name: language === 'ar' ? 'سيروم' : 'Serums' },
                { id: 'eyecare', name: language === 'ar' ? 'عناية بالعين' : 'Eye care' },
                { id: 'exfoliating', name: language === 'ar' ? 'مقشر' : 'Exfoliating' },
                { id: 'whitening', name: language === 'ar' ? 'تفتيح' : 'Whitening' },
                { id: 'toners', name: language === 'ar' ? 'تونر' : 'Toners' },
            ],
            concerns: [
                { id: 'darkspots', name: commonT.concerns.darkSpots },
                { id: 'acne', name: commonT.concerns.acne },
                { id: 'redness', name: commonT.concerns.redness },
            ]
        },
        bodycare: {
            subcategories: [
                { id: 'handcare', name: language === 'ar' ? 'عناية باليدين' : 'Hand care' },
                { id: 'bodyscrub', name: language === 'ar' ? 'مقشر للجسم' : 'Body scrub' },
                { id: 'bodylotions', name: language === 'ar' ? 'لوشن للجسم' : 'Body lotions' },
                { id: 'bodysplash', name: language === 'ar' ? 'بادي سبلاش' : 'Body splash' },
                { id: 'oralcare', name: language === 'ar' ? 'عناية بالفم' : 'Oral care' },
                { id: 'showergel', name: language === 'ar' ? 'شاور جيل' : 'Shower gel' },
                { id: 'sprayrollon', name: language === 'ar' ? 'مزيل عرق' : 'Sprays / Roll on' },
                { id: 'whitening', name: language === 'ar' ? 'تفتيح' : 'Whitening' },
                { id: 'footcare', name: language === 'ar' ? 'عناية بالقدم' : 'Foot care' },
                { id: 'sensitivearea', name: language === 'ar' ? 'مناطق حساسة' : 'Sensitive area' },
            ],
            concerns: []
        },
        haircare: {
            subcategories: [
                { id: 'shampoo', name: language === 'ar' ? 'شامبو' : 'Shampoo' },
                { id: 'conditioner', name: language === 'ar' ? 'بلسم' : 'Conditioner' },
                { id: 'hairmask', name: language === 'ar' ? 'ماسك للشعر' : 'Hair Mask' },
                { id: 'hairoil', name: language === 'ar' ? 'زيت للشعر' : 'Hair Oil' },
                { id: 'style-treatment', name: language === 'ar' ? 'تصفيف وعلاج' : 'Style & Treatment' },
            ],
            concerns: [
                { id: 'dandruff', name: commonT.concerns.dandruff },
                { id: 'splitends', name: commonT.concerns.splitEnds },
                { id: 'hairloss', name: commonT.concerns.hairLoss },
            ]
        },
        kids: {
            subcategories: [
                { id: 'skincare', name: language === 'ar' ? 'عناية ببشرة الأطفال' : 'Kids Skin Care' },
                { id: 'haircare', name: language === 'ar' ? 'عناية بشعر الأطفال' : 'Kids Hair Care' },
                { id: 'bodycare', name: language === 'ar' ? 'عناية بجسم الأطفال' : 'Kids Body Care' },
            ],
            concerns: []
        }
    };

    const currentFilters = filterConfig[categoryId] || { subcategories: [], concerns: [] };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let q = collection(db, "products");

                if (categoryName !== "shop") {
                    const normalizedCat = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
                    q = query(q, where("category", "==", normalizedCat));
                }

                const querySnapshot = await getDocs(q);
                const prods = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(prods);
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        // Reset local filters when changing main category
        setActiveSubcategory(null);
        setActiveSkinType(null);
        setActiveConcern(null);
        setMinPrice("");
        setMaxPrice("");
        setSortBy("newest");

        if (queryQ) {
            setSearchQuery(queryQ);
        } else {
            setSearchQuery("");
        }
    }, [categoryName, queryQ]);

    const filteredProducts = products.filter(p => {
        const subMatch = !activeSubcategory || p.subcategory === activeSubcategory;
        const skinMatch = !activeSkinType || p.skinType === activeSkinType;
        const concernMatch = !activeConcern || p.concern === activeConcern;

        const searchMatch = !searchQuery ||
            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

        const minMatch = !minPrice || p.price >= parseFloat(minPrice);
        const maxMatch = !maxPrice || p.price <= parseFloat(maxPrice);

        return subMatch && skinMatch && concernMatch && searchMatch && minMatch && maxMatch;
    }).sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        // default "newest" implies highest ID or timestamp, we can just fallback to standard
        return 0;
    });

    const toggleSubcategory = (subId) => {
        if (activeSubcategory === subId) {
            setActiveSubcategory(null);
            setActiveSkinType(null);
        } else {
            setActiveSubcategory(subId);
            setActiveSkinType(null);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <div className="container">
                    <h1>
                        {categoryName === "shop"
                            ? t.title
                            : language === 'ar'
                                ? (commonT.categories[categoryId] || categoryName)
                                : categoryName.replace(/-/g, ' ')}
                    </h1>
                    <p>{categoryName === "shop" ? t.subtitle : language === 'ar' ? commonT.categories.desc : `Carefully selected products for your ${categoryName.replace(/-/g, ' ')} routine.`}</p>
                </div>
            </header>

            <div className={`container ${styles.mainGrid}`}>
                {/* Sidebar Filters */}
                <aside className={`${styles.sidebar} ${showMobileFilters ? styles.active : ""}`}>
                    <div className={styles.sidebarHeader}>
                        <h3>{language === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
                        <button onClick={() => setShowMobileFilters(false)} className={styles.closeBtn}><X size={20} /></button>
                    </div>

                    {/* Search Bar */}
                    <div className={styles.filterSection}>
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Subcategories */}
                    <div className={styles.filterSection}>
                        <div className={styles.sectionHeader}>
                            <h4>{commonT.categories.title}</h4>
                            {activeSubcategory && (
                                <button className={styles.clearBtn} onClick={() => { setActiveSubcategory(null); setActiveSkinType(null); }}>
                                    {language === 'ar' ? 'مسح' : 'Clear'}
                                </button>
                            )}
                        </div>
                        <div className={styles.categoryList}>
                            {currentFilters.subcategories.map(sub => (
                                <div key={sub.id} className={styles.categoryItem}>
                                    <button
                                        className={`${styles.categoryLink} ${activeSubcategory === sub.id ? styles.activeCategory : ""}`}
                                        onClick={() => toggleSubcategory(sub.id)}
                                    >
                                        <ChevronRight size={14} className={activeSubcategory === sub.id ? styles.rotated : ""} />
                                        {sub.name}
                                    </button>

                                    {sub.hasSkinTypes && activeSubcategory === sub.id && (
                                        <div className={styles.subItems}>
                                            <button
                                                className={`${styles.subLink} ${activeSkinType === 'dry-normal' ? styles.activeSub : ""}`}
                                                onClick={() => setActiveSkinType(activeSkinType === 'dry-normal' ? null : 'dry-normal')}
                                            >
                                                {language === 'ar' ? 'للبشرة الجافة إلى العادية' : 'Dry to normal skin'}
                                            </button>
                                            <button
                                                className={`${styles.subLink} ${activeSkinType === 'mixed-oily' ? styles.activeSub : ""}`}
                                                onClick={() => setActiveSkinType(activeSkinType === 'mixed-oily' ? null : 'mixed-oily')}
                                            >
                                                {language === 'ar' ? 'للبشرة المختلطة إلى الدهنية' : 'Mixed to oily skin'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Concerns - Bubble style for Skincare */}
                    {currentFilters.concerns.length > 0 && (
                        <div className={styles.filterSection}>
                            <div className={styles.sectionHeader}>
                                <h4>{commonT.concerns.title}</h4>
                                {activeConcern && (
                                    <button className={styles.clearBtn} onClick={() => setActiveConcern(null)}>
                                        {language === 'ar' ? 'مسح' : 'Clear'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.chipGrid}>
                                {currentFilters.concerns.map(c => (
                                    <button
                                        key={c.id}
                                        className={`${styles.chip} ${activeConcern === c.id ? styles.activeChip : ""}`}
                                        onClick={() => setActiveConcern(activeConcern === c.id ? null : c.id)}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.filterSection}>
                        <h4>{language === 'ar' ? 'نطاق السعر' : 'Price Range'}</h4>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                placeholder={language === 'ar' ? 'أقل' : 'Min'}
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder={language === 'ar' ? 'أقصى' : 'Max'}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </aside>

                {/* Product Listing */}
                <main className={styles.listingArea}>
                    <div className={styles.listingBar}>
                        <p>{filteredProducts.length} {language === 'ar' ? 'منتج' : 'Results'}</p>
                        <div className={styles.controls}>
                            <button className={styles.mobileFilterBtn} onClick={() => setShowMobileFilters(true)}>
                                <Filter size={18} /> {language === 'ar' ? 'فلاتر' : 'Filters'}
                            </button>
                            <div className={styles.sort}>
                                <select
                                    className={styles.sortSelect}
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</option>
                                    <option value="price-low">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                                    <option value="price-high">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingArea}>
                            <Loader2 className={styles.spinner} />
                            <p>{language === 'ar' ? 'جاري تحميل منتجاتك...' : 'Discovering your beauty essentials...'}</p>
                        </div>
                    ) : (
                        <div className="grid-auto">
                            {filteredProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className={styles.noResults}>
                                    <p>{t.noResults}</p>
                                    <button onClick={() => { setActiveSubcategory(null); setActiveSkinType(null); setActiveConcern(null); }}>
                                        {language === 'ar' ? 'مسح الفلاتر' : 'Clear all filters'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CategoryPage;
