"use client";
import React from "react";
import { X, MessageSquare, User, Mail, Calendar, CheckCircle, Info } from "lucide-react";
import styles from "./AdminModal.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const RequestDetailsModal = ({ isOpen, onClose, request, onStatusUpdate, onDelete }) => {
    const { language } = useLanguage();
    const t = translations[language]?.admin?.modals?.request || translations.en.admin.modals.request;
    const tc = translations[language]?.admin?.common || translations.en.admin.common;

    if (!isOpen || !request) return null;

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
                        <MessageSquare size={20} />
                        <h2>{t.title}</h2>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
                </header>

                <div className={styles.modalBody}>
                    <section className={styles.detailSection}>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoLabel}><User size={16} /> {t.from}:</div>
                            <div className={styles.infoValue}>{request.customerName || tc.unknownCustomer}</div>
                        </div>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoLabel}><Mail size={16} /> {translations[language]?.auth?.email || "Email"}:</div>
                            <div className={styles.infoValue}>{request.email || tc.noEmail}</div>
                        </div>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoLabel}><Calendar size={16} /> {t.date}:</div>
                            <div className={styles.infoValue}>{formatDate(request.createdAt)}</div>
                        </div>
                        <div className={styles.infoBlock}>
                            <div className={styles.infoLabel}><Info size={16} /> {t.subject}:</div>
                            <div className={styles.infoValue}><strong>{request.subject || tc.noSubject}</strong></div>
                        </div>
                    </section>

                    <section className={styles.messageSection}>
                        <h3 className={styles.sectionTitle}>{t.message}</h3>
                        <div className={styles.messageContent}>
                            {request.message}
                        </div>
                    </section>

                    <section className={styles.statusSection}>
                        <h3 className={styles.sectionTitle}>{tc.internalActions}</h3>
                        <div className={styles.statusActions}>
                            <p>{tc.currentStatus}: <span className={`${styles.statusBadge} ${styles[request.status?.toLowerCase() || 'pending']}`}>{request.status === 'Resolved' ? tc.resolved : (request.status || 'New')}</span></p>
                            {request.status !== 'Resolved' && (
                                <button
                                    onClick={() => onStatusUpdate(request.id, 'Resolved')}
                                    className={styles.primaryBtn}
                                    style={{ marginTop: '1rem', width: 'auto' }}
                                >
                                    <CheckCircle size={18} /> {tc.markResolved}
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                <footer className={styles.modalFooter}>
                    <button
                        onClick={() => {
                            if (window.confirm(tc.confirmDelete)) {
                                onDelete(request.id);
                            }
                        }}
                        className={styles.deleteBtn}
                    >
                        {tc.deletePermanent}
                    </button>
                    <button onClick={onClose} className={styles.secondaryBtn}>{tc.close}</button>
                </footer>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
