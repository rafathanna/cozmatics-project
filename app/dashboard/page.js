"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/config";
import { collection, query, where, orderBy, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, Package, Settings, LogOut, Clock, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";
import styles from "./Dashboard.module.css";

const UserDashboard = () => {
    const { user, userData, logout, loading: authLoading } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.dashboard || translations.en.dashboard;
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profileName, setProfileName] = useState(userData?.name || "");
    const [profilePhone, setProfilePhone] = useState(userData?.phone || "");
    const [profileAddress, setProfileAddress] = useState(userData?.address || "");

    useEffect(() => {
        if (user) {
            fetchUserOrders();
            if (userData) {
                setProfileName(userData.name || "");
                setProfilePhone(userData.phone || "");
                setProfileAddress(userData.address || "");
            }
        }
    }, [user, userData]);

    const fetchUserOrders = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "orders"),
                where("customerEmail", "==", user.email)
            );
            const querySnapshot = await getDocs(q);
            const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Sort in-memory to avoid composite index requirement
            const sortedOrders = allOrders.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });

            setOrders(sortedOrders);
        } catch (error) {
            console.error("Error fetching user orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: profileName,
                phone: profilePhone,
                address: profileAddress,
                updatedAt: serverTimestamp()
            });
            alert(t.settings.success);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(t.settings.error);
        } finally {
            setUpdating(false);
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spin} />
                <p>{t.loading}</p>
            </div>
        );
    }

    const renderProfile = () => (
        <>
            <section className={styles.stats}>
                <div className={styles.statCard}>
                    <h4>{t.stats.activeOrders}</h4>
                    <span>{orders.filter(o => o.status === 'Pending' || o.status === 'Shipped').length}</span>
                </div>
                <div className={styles.statCard}>
                    <h4>{t.stats.totalSpent}</h4>
                    <span>{language === 'ar' ? 'ج.م' : 'EGP'} {orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}</span>
                </div>
                <div className={styles.statCard}>
                    <h4>{t.stats.memberPoints}</h4>
                    <span>150</span>
                </div>
            </section>

            <section className={styles.recentOrders}>
                <div className={styles.sectionHeader}>
                    <h3>{t.recentOrders}</h3>
                    <button onClick={() => setActiveTab('orders')} className={styles.linkBtn}>{t.viewAll}</button>
                </div>
                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package size={40} strokeWidth={1} />
                        <p>{t.emptyOrders}</p>
                        <button onClick={() => window.location.href = "/shop"}>{t.shopNow}</button>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t.table.id}</th>
                                    <th>{t.table.date}</th>
                                    <th>{t.table.amount}</th>
                                    <th>{t.table.status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 3).map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id.slice(-6).toUpperCase()}</td>
                                        <td>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                        <td>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                                {t.status[order.status?.toLowerCase() || 'pending']}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );

    const renderOrders = () => (
        <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h3>{t.tabs.orders}</h3>
                <p>{t.tagline}</p>
            </div>
            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={40} strokeWidth={1} />
                    <p>{t.emptyOrders}</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.table.id}</th>
                                <th>{t.table.date}</th>
                                <th>{t.table.items}</th>
                                <th>{t.table.total}</th>
                                <th>{t.table.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id.slice(-8).toUpperCase()}</td>
                                    <td>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                    <td>{order.items?.length || 0} {language === 'ar' ? 'منتجات' : 'items'}</td>
                                    <td>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                            {t.status[order.status?.toLowerCase() || 'pending']}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );

    const renderHistory = () => (
        <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h3>{t.tabs.history}</h3>
                <p>{t.tagline}</p>
            </div>
            {orders.filter(o => o.status === 'Delivered').length === 0 ? (
                <div className={styles.emptyState}>
                    <Clock size={40} strokeWidth={1} />
                    <p>{t.emptyDeliveredOrders}</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.table.id}</th>
                                <th>{t.table.date}</th>
                                <th>{t.table.total}</th>
                                <th>{t.table.rating}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.filter(o => o.status === 'Delivered').map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id.slice(-6).toUpperCase()}</td>
                                    <td>{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                                    <td>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</td>
                                    <td>{language === 'ar' ? 'قريباً' : 'Coming Soon'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );


    const renderSettings = () => (
        <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
                <h3>{t.settings.title}</h3>
                <p>{t.settings.desc}</p>
            </div>
            <form onSubmit={handleUpdateProfile} className={styles.settingsForm}>
                <div className={styles.inputGroup}>
                    <label>{t.settings.fullName}</label>
                    <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder={t.settings.fullName}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>{t.settings.phone}</label>
                    <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder={t.settings.phone}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>{t.settings.address}</label>
                    <textarea
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder={t.settings.address}
                        rows="3"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>{t.settings.email}</label>
                    <input type="email" value={user.email} disabled />
                    <small>{t.settings.emailNote}</small>
                </div>
                <div className={styles.formFooter}>
                    <button type="submit" className={styles.submitBtn} disabled={updating}>
                        {updating ? t.settings.saving : t.settings.save}
                    </button>
                </div>
            </form>
        </section>
    );

    return (
        <div className={styles.dashWrapper}>
            <div className="container">
                <div className={styles.dashGrid}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>{userData?.name?.[0] || user.email[0].toUpperCase()}</div>
                            <h3>{userData?.name || (language === 'ar' ? 'اسم المستخدم' : 'User Name')}</h3>
                            <p>{user.email}</p>
                            <span className={styles.roleTag}>{language === 'ar' ? 'حساب عميل' : 'Customer Account'}</span>
                        </div>
                        <nav className={styles.nav}>
                            <button
                                className={activeTab === 'profile' ? styles.active : ''}
                                onClick={() => setActiveTab('profile')}
                            >
                                <User size={18} /> {t.tabs.profile}
                            </button>
                            <button
                                className={activeTab === 'orders' ? styles.active : ''}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={18} /> {t.tabs.orders}
                            </button>
                            <button
                                className={activeTab === 'history' ? styles.active : ''}
                                onClick={() => setActiveTab('history')}
                            >
                                <Clock size={18} /> {t.tabs.history}
                            </button>
                            <button
                                className={activeTab === 'settings' ? styles.active : ''}
                                onClick={() => setActiveTab('settings')}
                            >
                                <Settings size={18} /> {t.tabs.settings}
                            </button>
                            <button onClick={logout} className={styles.logoutBtn}><LogOut size={18} /> {t.tabs.logout}</button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className={styles.content}>
                        <header className={styles.header}>
                            <h1>{t.welcome.replace('{name}', userData?.name?.split(' ')[0] || user.email.split('@')[0])}</h1>
                            <p>{t.tagline}</p>
                        </header>

                        {loading ? (
                            <div className={styles.loadingState}>
                                <Loader2 className={styles.spin} />
                                <p>{t.loading}</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'profile' && renderProfile()}
                                {activeTab === 'orders' && renderOrders()}
                                {activeTab === 'history' && renderHistory()}
                                {activeTab === 'settings' && renderSettings()}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
