"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Upload, ImageIcon, Trash2 } from "lucide-react";
import { db, storage } from "@/firebase/config";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import styles from "./ProductModal.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/config/translations";

const ProductModal = ({ isOpen, onClose, product, onSuccess, onDelete }) => {
    const { language } = useLanguage();
    const t = translations[language]?.admin?.modals?.product || translations.en.admin.modals.product;
    const tc = translations[language]?.admin?.common || translations.en.admin.common;

    const [formData, setFormData] = useState({
        name: "",
        brand: "Cozmatics",
        price: "",
        stock: "",
        category: "Skincare",
        description: "",
        instructions: "",
        image: "",
        isFeatured: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Image upload state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                brand: product.brand || "Cozmatics",
                price: product.price || "",
                stock: product.stock || "",
                category: product.category || "Skincare",
                description: product.description || "",
                instructions: product.instructions || "",
                image: product.image || "",
                isFeatured: product.isFeatured || false
            });
            setImagePreview(product.image || null);
        } else {
            setFormData({
                name: "",
                brand: "Cozmatics",
                price: "",
                stock: "",
                category: "Skincare",
                description: "",
                instructions: "",
                image: "",
                isFeatured: false
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setUploadProgress(0);
        setErrors({});
    }, [product, isOpen]);

    const validate = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = language === 'ar' ? "الاسم مطلوب" : "Name is required";
        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            newErrors.price = language === 'ar' ? "السعر الصحيح مطلوب" : "Valid price is required";
        }
        if (formData.stock === "" || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
            newErrors.stock = language === 'ar' ? "الكمية الصحيحة مطلوبة" : "Valid stock is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Image handling ---
    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert(language === 'ar' ? "يرجى اختيار ملف صورة (JPG, PNG, WebP)." : "Please select an image file (JPG, PNG, WebP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert(language === 'ar' ? "يجب أن تكون الصورة أصغر من 5 ميجابايت." : "Image must be smaller than 5MB.");
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadImage = (file) => {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
            const storageRef = ref(storage, `products/${timestamp}_${safeName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            let imageUrl = formData.image;

            // Upload new image if selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const data = {
                ...formData,
                image: imageUrl,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                updatedAt: serverTimestamp()
            };

            if (product?.id) {
                const docRef = doc(db, "products", product.id);
                await updateDoc(docRef, data);
            } else {
                await addDoc(collection(db, "products"), {
                    ...data,
                    createdAt: serverTimestamp()
                });
            }
            onSuccess();
            alert(product?.id ? t.successUpdate : t.successAdd);
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            alert(`${t.errorSave}: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                <h2>{product ? t.edit : t.add}</h2>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>{t.name}</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder={language === 'ar' ? "مثال: سيروم النضارة" : "e.g. Radiance Serum"}
                            className={errors.name ? styles.errorInput : ""}
                        />
                        {errors.name && <small className={styles.errorText}>{errors.name}</small>}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t.price} ({language === 'ar' ? 'ج.م' : 'EGP'})</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className={errors.price ? styles.errorInput : ""}
                            />
                            {errors.price && <small className={styles.errorText}>{errors.price}</small>}
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t.stock}</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                className={errors.stock ? styles.errorInput : ""}
                            />
                            {errors.stock && <small className={styles.errorText}>{errors.stock}</small>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t.category}</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="Skincare">{translations[language]?.nav?.skinCare || "Skincare"}</option>
                                <option value="Haircare">{translations[language]?.nav?.hairCare || "Haircare"}</option>
                                <option value="Bodycare">{translations[language]?.nav?.bodyCare || "Bodycare"}</option>
                                <option value="Kids">{translations[language]?.home?.categories?.kids || "Kids"}</option>
                                <option value="Fragrance">{language === 'ar' ? 'عطور' : "Fragrance"}</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t.brand}</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Image Upload Zone */}
                    <div className={styles.formGroup}>
                        <label>{t.image}</label>
                        {imagePreview ? (
                            <div className={styles.previewContainer}>
                                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                                <div className={styles.previewOverlay}>
                                    <button type="button" onClick={handleBrowseClick} className={styles.replaceBtn}>
                                        <Upload size={16} /> {t.replace}
                                    </button>
                                    <button type="button" onClick={removeImage} className={styles.removeBtn}>
                                        <Trash2 size={16} /> {t.remove}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleBrowseClick}
                            >
                                <ImageIcon size={36} className={styles.dropIcon} />
                                <p className={styles.dropText} dangerouslySetInnerHTML={{ __html: t.dragDrop }}></p>
                                <small className={styles.dropHint}>{t.maxSize}</small>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className={styles.hiddenInput}
                        />
                    </div>

                    {/* Upload Progress */}
                    {loading && uploadProgress > 0 && uploadProgress < 100 && (
                        <div className={styles.progressWrapper}>
                            <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
                            <span className={styles.progressText}>{uploadProgress}%</span>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>{t.description}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t.instructions}</label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows="3"
                            placeholder={language === 'ar' ? "مثال: يوضع 2-3 قطرات صباحاً ومساءً..." : "e.g. Apply 2-3 drops morning and night..."}
                        ></textarea>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            name="isFeatured"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                        />
                        <label htmlFor="isFeatured">{t.featured}</label>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading && <Loader2 className={styles.spinner} size={18} />}
                        {loading ? (uploadProgress > 0 ? t.uploading : t.saving) : (product ? t.update : t.create)}
                    </button>

                    {product?.id && !loading && (
                        <button
                            type="button"
                            className={styles.modalDeleteBtn}
                            onClick={() => {
                                if (window.confirm(t.deletePrompt)) {
                                    onDelete(product.id);
                                }
                            }}
                        >
                            <Trash2 size={18} /> {tc.deletePermanent}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
