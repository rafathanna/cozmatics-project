"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./Loading.module.css";

const Loading = ({ fullPage = false }) => {
    return (
        <div className={`${styles.loadingWrapper} ${fullPage ? styles.fullPage : ""}`}>
            <div className={styles.spinnerContainer}>
                <Loader2 className={styles.spinner} size={40} />
                <p className={styles.text}>Loading beauty essentials...</p>
            </div>
        </div>
    );
};

export default Loading;
