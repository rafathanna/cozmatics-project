"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { auth, db, storage } from "@/firebase/config";
import {
    setDoc,
    getDoc,
    doc,
    serverTimestamp,
    onSnapshot,
    query,
    collection,
    orderBy,
    getDocs,
    updateDoc,
    deleteDoc,
    addDoc,
    where
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import {
    Users,
    ShoppingBag,
    TrendingUp,
    Plus,
    Edit,
    Trash,
    Search,
    Loader2,
    LayoutDashboard,
    Package,
    ClipboardList,
    MessageSquare,
    Settings,
    ChevronRight,
    AlertTriangle,
    Eye,
    Clock,
    Bell,
    LogOut,
    Home,
    Menu,
    X
} from "lucide-react";
import styles from "./Admin.module.css";
import ProductModal from "@/components/admin/ProductModal";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import RequestDetailsModal from "@/components/admin/RequestDetailsModal";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const AdminDashboard = () => {
    const { user, userData, loading: authLoading, logout } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.admin || translations.en.admin;
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [requests, setRequests] = useState([]);
    const [settings, setSettings] = useState({
        storeName: "Cozmatics",
        announcement: "Welcome to our new store!",
        contactEmail: "contact@cozmatics.com",
        phoneNumber: "+20 123 456 7890",
        address: "New Cairo, Egypt",
        facebook: "cozmatics.eg",
        instagram: "cozmatics.eg",
        shippingFee: 50,
        freeShippingThreshold: 500
    });

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Coupon form state
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount: 0,
        isActive: true
    });
    const [couponLoading, setCouponLoading] = useState(false);

    // Modals state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalSales: 0,
        totalOrders: 0,
        lowStockCount: 0,
        pendingOrders: 0
    });

    // 1. Redirect logic in useEffect
    useEffect(() => {
        if (!authLoading) {
            if (!user || userData?.role !== 'admin') {
                router.push("/login");
            }
        }
    }, [user, userData, authLoading, router]);

    // 2. Data fetching logic
    useEffect(() => {
        if (user && userData?.role === 'admin') {
            fetchAllData();

            // Real-time listener for NEW orders - ignore initial load
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            let isFirstSnapshot = true;

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (isFirstSnapshot) {
                    isFirstSnapshot = false;
                    return;
                }

                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const newOrder = { id: change.doc.id, ...change.doc.data() };
                        addNotification(`${language === 'ar' ? 'طلب جديد:' : 'New Order:'} #${newOrder.id.slice(-6).toUpperCase()}`);
                        fetchOrders(); // Refresh table
                        fetchStats();
                    }
                });
            });

            return () => unsubscribe();
        }
    }, [user, userData]);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [{ id, msg }, ...prev]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProducts(),
                fetchStats(),
                fetchOrders(),
                fetchCoupons(),
                fetchRequests(),
                fetchSettings()
            ]);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            const ordersSnap = await getDocs(collection(db, "orders"));
            const productsSnap = await getDocs(collection(db, "products"));

            let totalSales = 0;
            let pendingOrders = 0;
            ordersSnap.forEach(doc => {
                const data = doc.data();
                totalSales += data.totalAmount || 0;
                if (data.status === 'Pending' || !data.status) pendingOrders++;
            });

            let lowStockCount = 0;
            productsSnap.forEach(doc => {
                const data = doc.data();
                if (data.stock <= 5) lowStockCount++;
            });

            setStats({
                totalCustomers: usersSnap.size,
                totalOrders: ordersSnap.size,
                totalSales,
                lowStockCount,
                pendingOrders
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setRequests(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setCoupons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching coupons:", error);
        }
    };

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, "settings", "global");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            fetchStats(); // Update pending count
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to delete this order permanently?")) {
            try {
                await deleteDoc(doc(db, "orders", orderId));
                setOrders(orders.filter(o => o.id !== orderId));
                setStats(prev => ({
                    ...prev,
                    totalOrders: prev.totalOrders - 1
                }));
                fetchStats(); // Recalculate everything
                if (selectedOrder?.id === orderId) setSelectedOrder(null);
            } catch (error) {
                console.error("Error deleting order:", error);
            }
        }
    };

    const handleUpdateReqStatus = async (reqId, newStatus) => {
        try {
            await updateDoc(doc(db, "requests", reqId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
            setRequests(requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
            setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };

    const handleDeleteRequest = async (reqId) => {
        try {
            await deleteDoc(doc(db, "requests", reqId));
            setRequests(requests.filter(r => r.id !== reqId));
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "settings", "global"), {
                ...settings,
                updatedAt: serverTimestamp()
            });
            alert(t.settings.success);
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            // Find the product to check if it has a Storage image
            const productToDelete = products.find(p => p.id === productId);
            if (productToDelete?.image && productToDelete.image.includes("firebasestorage.googleapis.com")) {
                try {
                    const imageRef = ref(storage, productToDelete.image);
                    await deleteObject(imageRef);
                } catch (storageErr) {
                    console.warn("Could not delete image from storage:", storageErr);
                }
            }
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
            fetchStats();
            setIsProductModalOpen(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;

        setCouponLoading(true);
        try {
            const couponData = {
                ...newCoupon,
                code: newCoupon.code.toUpperCase().trim(),
                createdAt: serverTimestamp(),
                usageCount: 0
            };
            await setDoc(doc(db, "coupons", couponData.code), couponData);
            setNewCoupon({ code: "", discount: 0, isActive: true });
            fetchCoupons();
        } catch (error) {
            console.error("Error creating coupon:", error);
        } finally {
            setCouponLoading(false);
        }
    };

    const toggleCouponStatus = async (couponId, currentStatus) => {
        try {
            await updateDoc(doc(db, "coupons", couponId), {
                isActive: !currentStatus
            });
            setCoupons(coupons.map(c => c.id === couponId ? { ...c, isActive: !currentStatus } : c));
        } catch (error) {
            console.error("Error updating coupon:", error);
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (window.confirm("Delete this coupon?")) {
            try {
                await deleteDoc(doc(db, "coupons", couponId));
                setCoupons(coupons.filter(c => c.id !== couponId));
            } catch (error) {
                console.error("Error deleting coupon:", error);
            }
        }
    };


    if (authLoading || !user || userData?.role !== 'admin') {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={48} />
                <p>{t.verifying}</p>
            </div>
        );
    }

    const renderSidebar = () => (
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.openSidebar : ''}`}>
            <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
            </button>
            <div className={styles.sidebarHeader}>
                <div className={styles.sidebarLogo}>COZMATICS</div>
                <span className={styles.sidebarTag}>Admin Panel</span>
            </div>

            <nav className={styles.sidebarNav}>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'overview' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                >
                    <LayoutDashboard size={20} />
                    {t.tabs.overview}
                </button>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'products' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
                >
                    <Package size={20} />
                    {t.tabs.inventory}
                </button>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'orders' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                >
                    <ShoppingBag size={20} />
                    {t.tabs.orders}
                </button>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'coupons' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('coupons'); setIsSidebarOpen(false); }}
                >
                    <Plus size={20} />
                    {t.tabs.coupons}
                </button>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'requests' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }}
                >
                    <MessageSquare size={20} />
                    {t.tabs.requests}
                </button>
                <button
                    className={`${styles.sidebarItem} ${activeTab === 'settings' ? styles.activeSidebarItem : ''}`}
                    onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                >
                    <Settings size={20} />
                    {t.tabs.settings}
                </button>

                <div className={styles.sidebarDivider} />

                <button
                    className={styles.sidebarItem}
                    onClick={() => router.push('/')}
                >
                    <Home size={20} />
                    {t.tabs.viewShop}
                </button>
            </nav>

            <div className={styles.sidebarFooter}>
                <button onClick={logout} className={styles.logoutBtn}>
                    <LogOut size={18} />
                    {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
            </div>
        </aside>
    );

    const renderOverview = () => {
        // Calculate monthly revenue data
        const last6Months = [...Array(6)].map((_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' });
        }).reverse();

        const revenueData = last6Months.map(month => {
            const amount = orders.reduce((sum, order) => {
                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                const orderMonth = orderDate.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' });
                return orderMonth === month ? sum + (order.totalAmount || 0) : sum;
            }, 0);
            return { month, amount };
        });

        const maxAmount = Math.max(...revenueData.map(d => d.amount), 1000);

        // Calculate top products
        const productSales = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 1);
            });
        });
        const topProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return (
            <div className={styles.analyticsGrid}>
                <section className={styles.metrics}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}><Users size={20} /></div>
                            <span className={`${styles.trend} ${styles.up}`}>+12%</span>
                        </div>
                        <div className={styles.metricInfo}>
                            <p>{t.overview.totalCustomers}</p>
                            <div className={styles.metricValue}>{stats.totalCustomers}</div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}><TrendingUp size={20} /></div>
                            <span className={`${styles.trend} ${styles.up}`}>+8%</span>
                        </div>
                        <div className={styles.metricInfo}>
                            <p>{t.overview.totalRevenue}</p>
                            <div className={styles.metricValue}>
                                <small style={{ fontSize: '1rem', fontWeight: 600 }}>{language === 'ar' ? 'ج.م' : 'EGP'}</small>
                                {stats.totalSales.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}><ShoppingBag size={20} /></div>
                            <span className={`${styles.trend} ${stats.pendingOrders > 0 ? styles.down : styles.up}`}>
                                {stats.pendingOrders > 0 ? `-${stats.pendingOrders}` : '+100%'}
                            </span>
                        </div>
                        <div className={styles.metricInfo}>
                            <p>{t.overview.totalOrders}</p>
                            <div className={styles.metricValue}>{stats.totalOrders}</div>
                        </div>
                    </div>
                </section>

                <div className={styles.chartsRow}>
                    <div className={styles.chartCard}>
                        <h3>{t.overview.revenueTrend}</h3>
                        <div className={styles.barChart}>
                            {revenueData.map((d, i) => (
                                <div key={i} className={styles.barWrapper}>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${(d.amount / maxAmount) * 100}%` }}
                                    >
                                        <span className={styles.barTooltip}>{language === 'ar' ? 'ج.م' : 'EGP'} {d.amount.toLocaleString()}</span>
                                    </div>
                                    <span className={styles.barLabel}>{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <h3>{t.overview.topSelling}</h3>
                        <div className={styles.topProductsList}>
                            {topProducts.map(([name, qty], i) => (
                                <div key={i} className={styles.topProdItem}>
                                    <span className={styles.rank}>{i + 1}</span>
                                    <p className={styles.prodName}>{name}</p>
                                    <span className={styles.qtyBadge}>{qty} {t.overview.sold}</span>
                                </div>
                            ))}
                            {topProducts.length === 0 && <p className={styles.empty}>{t.overview.noSales}</p>}
                        </div>
                    </div>
                </div>

                <div className={styles.quickInsights}>
                    <div className={`${styles.insightCard} ${stats.lowStockCount > 0 ? styles.warning : styles.info}`} onClick={() => setActiveTab('products')}>
                        <AlertTriangle size={20} />
                        <div>
                            <strong>{stats.lowStockCount} {t.overview.lowStock}</strong>
                            <p>{language === 'ar' ? 'منتجات تحتاج إلى إعادة تعبئة' : 'Products need restocking'}</p>
                        </div>
                    </div>
                    <div className={`${styles.insightCard} ${stats.pendingOrders > 0 ? styles.warning : styles.info}`} onClick={() => setActiveTab('orders')}>
                        <Clock size={20} />
                        <div>
                            <strong>{stats.pendingOrders} {t.overview.pendingOrders}</strong>
                            <p>{language === 'ar' ? 'طلبات بانتظار الشحن' : 'Orders waiting to be shipped'}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h3>{t.overview.recentOrders}</h3>
                        <button onClick={() => setActiveTab("orders")} className={styles.textBtn}>
                            {t.overview.viewAll} <ChevronRight size={16} />
                        </button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.orders.table.id}</th>
                                <th>{t.orders.table.amount}</th>
                                <th>{t.orders.table.status}</th>
                                <th>{t.orders.table.details}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</td>
                                    <td style={{ fontWeight: 600 }}>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                            {t.orders.statuses[order.status?.toLowerCase() || 'pending']}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => setSelectedOrder(order)} className={styles.iconAction}><Eye size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderProducts = () => {
        const filtered = products.filter(p => {
            const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        return (
            <div>
                <div className={styles.pageHeader}>
                    <div className={styles.headerTitle}>
                        <h1>{t.inventory.title}</h1>
                        <p>{products.length} {language === 'ar' ? 'منتج متوفر' : 'Products available'}</p>
                    </div>
                    <div className={styles.headerActions}>
                        <div className={styles.searchBox}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder={t.inventory.search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className={styles.filterSelect}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">{t.inventory.allCategories}</option>
                            <option value="Skincare">{translations[language]?.footer?.links.skincare || "Skincare"}</option>
                            <option value="Haircare">{translations[language]?.footer?.links.haircare || "Haircare"}</option>
                            <option value="Bodycare">{translations[language]?.footer?.links.bodycare || "Bodycare"}</option>
                            <option value="Fragrance">{language === 'ar' ? 'عطور' : "Fragrance"}</option>
                        </select>
                        <button className={styles.addBtn} onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }}>
                            <Plus size={20} /> {t.inventory.addProduct}
                        </button>
                    </div>
                </div>

                <section className={styles.tableSection}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}></th>
                                <th>{t.inventory.table.name}</th>
                                <th>{t.inventory.table.price}</th>
                                <th>{t.inventory.table.stock}</th>
                                <th>{t.inventory.table.featured}</th>
                                <th>{t.inventory.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className={styles.prodThumb}>
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} />
                                            ) : (
                                                <span className={styles.noThumb}>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ fontWeight: 700 }}>{language === 'ar' ? 'ج.م' : 'EGP'} {p.price?.toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '6px',
                                            background: p.stock <= 5 ? '#fee2e2' : '#f1f5f9',
                                            color: p.stock <= 5 ? '#991b1b' : '#334155',
                                            fontWeight: 700
                                        }}>{p.stock}</span>
                                    </td>
                                    <td>{p.isFeatured ? '🌟' : '—'}</td>
                                    <td className={styles.actions}>
                                        <button onClick={() => { setSelectedProduct(p); setIsProductModalOpen(true); }} className={styles.iconAction}><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className={styles.iconAction} style={{ color: '#f43f5e' }}><Trash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        );
    };

    const renderOrders = () => (
        <div>
            <div className={styles.pageHeader}>
                <div className={styles.headerTitle}>
                    <h1>{t.orders.title}</h1>
                    <p>{orders.length} {language === 'ar' ? 'إجمالي الطلبات' : 'Total orders'}</p>
                </div>
            </div>

            <section className={styles.tableSection}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t.orders.table.id}</th>
                            <th>{t.orders.table.customer}</th>
                            <th>{t.orders.table.amount}</th>
                            <th>{t.orders.table.status}</th>
                            <th>{t.orders.table.update}</th>
                            <th>{t.orders.table.details}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 700 }}>#{order.id.slice(-8).toUpperCase()}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <strong style={{ color: '#0f172a' }}>{order.customerName}</strong>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerEmail}</span>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                        {t.orders.statuses[order.status?.toLowerCase() || 'pending']}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        className={styles.filterSelect}
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        value={order.status || 'Pending'}
                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    >
                                        <option value="Pending">{t.orders.statuses.pending}</option>
                                        <option value="Shipped">{t.orders.statuses.shipped}</option>
                                        <option value="Delivered">{t.orders.statuses.delivered}</option>
                                        <option value="Cancelled">{t.orders.statuses.cancelled}</option>
                                    </select>
                                </td>
                                <td>
                                    <button onClick={() => setSelectedOrder(order)} className={styles.iconAction}><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );

    const renderRequests = () => (
        <div>
            <div className={styles.pageHeader}>
                <div className={styles.headerTitle}>
                    <h1>{t.requests.title}</h1>
                    <p>{requests.length} {language === 'ar' ? 'رسائل مرسلة' : 'Messages sent'}</p>
                </div>
            </div>
            <section className={styles.tableSection}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t.requests.table.customer}</th>
                            <th>{t.requests.table.subject}</th>
                            <th>{t.requests.table.status}</th>
                            <th>{t.requests.table.view}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td style={{ fontWeight: 600 }}>{req.customerName || req.email}</td>
                                <td>{req.subject}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[req.status?.toLowerCase() || 'pending']}`}>
                                        {req.status === 'Resolved' ? (language === 'ar' ? 'محلول' : 'Resolved') : (req.status || 'New')}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => setSelectedRequest(req)} className={styles.iconAction}><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );

    const renderCoupons = () => (
        <section className={styles.couponsArea}>
            <div className={styles.pageHeader}>
                <div className={styles.headerTitle}>
                    <h1>{t.coupons.title}</h1>
                    <p>{coupons.length} {language === 'ar' ? 'كوبونات فعالة' : 'Active coupons'}</p>
                </div>
            </div>
            <div className={styles.couponGrid}>
                <div className={styles.settingsSection}>
                    <h3>{t.coupons.createNew}</h3>
                    <form onSubmit={handleCreateCoupon}>
                        <div className={styles.controls}>
                            <div className={styles.searchBox} style={{ width: 'auto', flex: 1 }}>
                                <input
                                    type="text"
                                    placeholder={t.coupons.code}
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.searchBox} style={{ width: '150px' }}>
                                <input
                                    type="number"
                                    placeholder={t.coupons.discount}
                                    value={newCoupon.discount || ""}
                                    onChange={e => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.addBtn} disabled={couponLoading}>
                                {couponLoading ? <Loader2 className={styles.spinner} size={18} /> : t.coupons.create}
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.tableSection}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.coupons.table.code}</th>
                                <th>{t.coupons.table.discount}</th>
                                <th>{t.coupons.table.status}</th>
                                <th>{t.coupons.table.usage}</th>
                                <th>{t.coupons.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td className={styles.code}><strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '1.1rem' }}>{c.code}</strong></td>
                                    <td style={{ fontWeight: 700 }}>{c.discount}{language === 'ar' ? '٪ خصم' : '% OFF'}</td>
                                    <td>
                                        <button
                                            onClick={() => toggleCouponStatus(c.id, c.isActive)}
                                            className={`${styles.status} ${c.isActive ? styles.delivered : styles.cancelled}`}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                        >
                                            {c.isActive ? t.coupons.activeStatus : t.coupons.inactiveStatus}
                                        </button>
                                    </td>
                                    <td>{c.usageCount || 0} {t.coupons.times}</td>
                                    <td>
                                        <button onClick={() => handleDeleteCoupon(c.id)} className={styles.iconAction} style={{ color: '#f43f5e' }}><Trash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const renderSettings = () => (
        <form className={styles.settingsForm} onSubmit={handleSaveSettings}>
            <div className={styles.pageHeader}>
                <div className={styles.headerTitle}>
                    <h1>{t.settings.title}</h1>
                    <p>{language === 'ar' ? 'تخصيص إعدادات المتجر' : 'Customize store settings'}</p>
                </div>
                <button type="submit" className={styles.addBtn}>{t.settings.save}</button>
            </div>

            <div className={styles.settingsSection}>
                <h3>{t.settings.identity}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className={styles.formGroup}>
                        <label>{t.settings.storeName}</label>
                        <input type="text" className={styles.filterSelect} style={{ width: '100%' }} value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t.settings.supportEmail}</label>
                        <input type="email" className={styles.filterSelect} style={{ width: '100%' }} value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>{t.settings.announcement}</label>
                    <textarea
                        className={styles.filterSelect}
                        style={{ width: '100%', height: '100px', resize: 'none' }}
                        rows="2"
                        value={settings.announcement}
                        onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                    />
                </div>
            </div>

            <div className={styles.settingsSection}>
                <h3>{t.settings.contact}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className={styles.formGroup}>
                        <label>{t.settings.phone}</label>
                        <input type="text" className={styles.filterSelect} style={{ width: '100%' }} value={settings.phoneNumber} onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t.settings.address}</label>
                        <input type="text" className={styles.filterSelect} style={{ width: '100%' }} value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                    </div>
                </div>
            </div>

            <div className={styles.settingsSection}>
                <h3>{t.settings.shipping}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className={styles.formGroup}>
                        <label>{t.settings.shippingFee}</label>
                        <input type="number" className={styles.filterSelect} style={{ width: '100%' }} value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: Number(e.target.value) })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t.settings.threshold}</label>
                        <input type="number" className={styles.filterSelect} style={{ width: '100%' }} value={settings.freeShippingThreshold} onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} />
                    </div>
                </div>
            </div>

            <div className={styles.settingsSection}>
                <h3>{t.settings.social}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className={styles.formGroup}>
                        <label>{t.settings.facebook}</label>
                        <input type="text" className={styles.filterSelect} style={{ width: '100%' }} value={settings.facebook} onChange={e => setSettings({ ...settings, facebook: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t.settings.instagram}</label>
                        <input type="text" className={styles.filterSelect} style={{ width: '100%' }} value={settings.instagram} onChange={e => setSettings({ ...settings, instagram: e.target.value })} />
                    </div>
                </div>
            </div>
        </form>
    );

    return (
        <div className={styles.sidebarWrapper} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.adminWrapper}>
                {renderSidebar()}

                <main className={styles.mainLayout}>
                    {/* Mobile Navigation */}
                    <div className={styles.mobileNav}>
                        <div className={styles.mobileNavTitle}>
                            {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                        </div>
                        <button className={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>

                    {/* Sidebar Overlay */}
                    <div 
                        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.open : ''}`} 
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Toast Notifications */}
                    <div className={styles.toastContainer}>
                        {notifications.map(n => (
                            <div key={n.id} className={styles.toast}>
                                <Bell size={18} />
                                <span>{n.msg}</span>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 className={styles.spinner} size={32} />
                            <p>{language === 'ar' ? 'جاري الاتصال...' : 'Connecting...'}</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'products' && renderProducts()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'coupons' && renderCoupons()}
                            {activeTab === 'requests' && renderRequests()}
                            {activeTab === 'settings' && renderSettings()}
                        </>
                    )}
                </main>

                <ProductModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    product={selectedProduct}
                    onSuccess={() => {
                        fetchProducts();
                        fetchStats();
                        addNotification(selectedProduct ? (language === 'ar' ? "تم تحديث المنتج" : "Product updated") : (language === 'ar' ? "تم إضافة منتج جديد" : "New product added"));
                    }}
                    onDelete={handleDeleteProduct}
                />
                <OrderDetailsModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onDelete={handleDeleteOrder}
                />
                <RequestDetailsModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    request={selectedRequest}
                    onStatusUpdate={handleUpdateReqStatus}
                    onDelete={handleDeleteRequest}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;

