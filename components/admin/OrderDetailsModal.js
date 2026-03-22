"use client";
import React from "react";
import { X, Package, User, MapPin, CreditCard } from "lucide-react";
import styles from "./AdminModal.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus, onDelete }) => {
    const { language } = useLanguage();
    const t = translations[language]?.admin?.modals?.order || translations.en.admin.modals.order;
    const tc = translations[language]?.admin?.common || translations.en.admin.common;
    const to = translations[language]?.admin?.orders || translations.en.admin.orders;

    if (!isOpen || !order) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') + " " + date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <header className={styles.modalHeader}>
                    <div className={styles.headerTitle}>
                        <Package size={20} />
                        <h2>{t.title} #{order.id.slice(-6).toUpperCase()}</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
                </header>

                <div className={styles.modalBody}>
                    <div className={styles.detailsGrid}>
                        {/* Customer Information */}
                        <section className={styles.detailSection}>
                            <h3 className={styles.sectionTitle}><User size={16} /> {tc.customerInfo}</h3>
                            <div className={styles.infoRow}>
                                <span>{translations[language]?.checkout?.firstName || "Name"}:</span>
                                <strong>{order.customerName || "N/A"}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>{translations[language]?.checkout?.emailPlaceholder || "Email"}:</span>
                                <strong>{order.customerEmail}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>{translations[language]?.checkout?.phone || "Phone"}:</span>
                                <strong>{order.customerPhone || "N/A"}</strong>
                            </div>
                        </section>

                        {/* Shipping Details */}
                        <section className={styles.detailSection}>
                            <h3 className={styles.sectionTitle}><MapPin size={16} /> {tc.shippingAddress}</h3>
                            <p className={styles.addressText}>
                                {order.shippingAddress || (language === 'ar' ? "لم يتم تقديم عنوان." : "No address provided.")}
                            </p>
                        </section>

                        {/* Order Status & Payment */}
                        <section className={styles.detailSection}>
                            <h3 className={styles.sectionTitle}><CreditCard size={16} /> {tc.paymentStatus}</h3>
                            <div className={styles.infoRow}>
                                <span>{t.subtotal}:</span>
                                <strong className={styles.price}>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>{to.table.status}:</span>
                                <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase() || 'pending']}`}>
                                    {to.statuses[order.status?.toLowerCase() || 'pending']}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span>{translations[language]?.dashboard?.table?.date || "Date"}:</span>
                                <strong>{formatDate(order.createdAt)}</strong>
                            </div>
                        </section>
                    </div>

                    {/* Order Items */}
                    <section className={styles.itemsSection}>
                        <h3 className={styles.sectionTitle}>{tc.orderItems}</h3>
                        <div className={styles.itemsTable}>
                            <div className={styles.tableHeader}>
                                <span>{translations[language]?.dashboard?.table?.items || "Product"}</span>
                                <span>{t.qty}</span>
                                <span>{to.table.amount}</span>
                            </div>
                            {order.items?.map((item, idx) => (
                                <div key={idx} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                        <p>{item.name}</p>
                                        {item.selectedConcern && <small>{item.selectedConcern}</small>}
                                    </div>
                                    <div className={styles.itemQty}>x{item.quantity}</div>
                                    <div className={styles.itemPrice}>{language === 'ar' ? 'ج.م' : 'EGP'} {item.price?.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.orderTotal}>
                            <span>{t.total}:</span>
                            <strong>{language === 'ar' ? 'ج.م' : 'EGP'} {order.totalAmount?.toLocaleString()}</strong>
                        </div>
                    </section>
                </div>

                <footer className={styles.modalFooter}>
                    <div className={styles.footerActions}>
                        {(order.status === 'Pending' || !order.status) && (
                            <>
                                <button
                                    onClick={() => onUpdateStatus(order.id, 'Shipped')}
                                    className={styles.primaryBtn}
                                >
                                    {tc.acceptShip}
                                </button>
                                <button
                                    onClick={() => onUpdateStatus(order.id, 'Cancelled')}
                                    className={styles.dangerBtn}
                                >
                                    {tc.rejectOrder}
                                </button>
                            </>
                        )}
                        {order.status === 'Shipped' && (
                            <button
                                onClick={() => onUpdateStatus(order.id, 'Delivered')}
                                className={styles.primaryBtn}
                            >
                                {tc.markDelivered}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (window.confirm(tc.deleteOrderPermanent)) {
                                    onDelete(order.id);
                                }
                            }}
                            className={styles.deleteBtn}
                        >
                            {tc.deletePermanent}
                        </button>
                    </div>
                    <button onClick={onClose} className={styles.secondaryBtn}>{tc.close}</button>
                </footer>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
