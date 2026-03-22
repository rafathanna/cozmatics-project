"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { translations } from "@/config/translations";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [brandName, setBrandName] = useState("COZMATICS");
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { user, userData } = useAuth();
    const { language, toggleLanguage, isMounted } = useLanguage();
    const router = useRouter();

    const t = translations[language]?.nav || translations.en.nav;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().storeName) {
                    setBrandName(docSnap.data().storeName);
                }
            } catch (error) {
                console.error("Error fetching brand name:", error);
            }
        };
        fetchSettings();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
            <div className={`container ${styles.navContainer}`}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.logo}>
                        {brandName}
                    </Link>
                </div>

                <div className={styles.navCenter}>
                    <Link href="/" className={styles.navLink}>{t.home}</Link>
                    <Link href="/shop" className={styles.navLink}>{t.shop}</Link>
                    {user && (
                        <Link href={userData?.role === 'admin' ? '/admin' : '/dashboard'} className={styles.navLink}>
                            {t.dashboard}
                        </Link>
                    )}
                    <Link href="/about" className={styles.navLink}>{t.about}</Link>
                    <Link href="/contact" className={styles.navLink}>{t.contact}</Link>
                </div>

                <div className={styles.navRight}>
                    {isMounted && (
                        <button className={styles.langBtn} onClick={toggleLanguage} aria-label="Toggle Language">
                            {language === 'en' ? 'AR' : 'EN'}
                        </button>
                    )}
                    <button className={styles.iconButton} onClick={() => setIsSearchOpen(true)}>
                        <Search size={20} />
                    </button>
                    <Link href={user ? (userData?.role === 'admin' ? '/admin' : '/dashboard') : '/login'} className={styles.iconButton}><User size={20} /></Link>
                    <Link href="/wishlist" className={styles.iconButton}>
                        <div className={styles.cartIconWrapper}>
                            <Heart size={20} />
                            {wishlistCount > 0 && <span className={styles.wishlistCount}>{wishlistCount}</span>}
                        </div>
                    </Link>
                    <Link href="/cart" className={styles.iconButton}>
                        <div className={styles.cartIconWrapper}>
                            <ShoppingBag size={20} />
                            {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
                        </div>
                    </Link>
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ""}`}>
                <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>{t.shopAll}</Link>
                <Link href="/category/skincare" onClick={() => setIsMobileMenuOpen(false)}>{t.skinCare}</Link>
                <Link href="/category/haircare" onClick={() => setIsMobileMenuOpen(false)}>{t.hairCare}</Link>
                <Link href="/category/bodycare" onClick={() => setIsMobileMenuOpen(false)}>{t.bodyCare}</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>{t.ourStory}</Link>
            </div>

            {/* Search Overlay */}
            <div className={`${styles.searchOverlay} ${isSearchOpen ? styles.active : ""}`}>
                <button className={styles.closeSearch} onClick={() => setIsSearchOpen(false)}>
                    <X size={32} />
                </button>
                <div className="container">
                    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                        <Search size={32} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
