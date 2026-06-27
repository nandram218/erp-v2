/**
 * CLASS SUBJECT SERVICE
 * Phase 3.1 D - Service Unification Layer (Tenant Context Integration)
 * Phase 3.1 D Safe Mode - STRICT SaaS Enforcement
 * ⚠️ PRODUCTION MODE: Direct access to this service is BLOCKED
 * Use ServiceRegistry.getService("classSubject") instead
 */

import {
    getTenantStorage,
    setTenantStorage,
    STORAGE_KEYS,
} from "../../services/storageService";
import { withTenantContext, getTenantContextForStorage } from "../../services/tenantContextService";
import { blockDirectServiceAccess } from "../../core/serviceRegistry";

// Phase 3.1 D Safe Mode: Block direct access in production mode
blockDirectServiceAccess("classSubjectService");

const STORAGE_KEY = STORAGE_KEYS.ERP_CLASSES;

// 🔥 ORDINAL HELPER
const getOrdinal = (n) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
};

export const classSubjectService = {

    saveClasses: (data) => {
        // Phase 3.1 D: Add tenant context to saved classes
        const tenantAwareData = data.map(cls => withTenantContext(cls));
        const tenantContext = getTenantContextForStorage();
        setTenantStorage(STORAGE_KEY, tenantAwareData, tenantContext);
    },

    // ✅ GET CLASSES (WITH DUPLICATE FIX)
    getClasses: () => {
        const tenantContext = getTenantContextForStorage();
        const data = getTenantStorage(STORAGE_KEY, tenantContext, []);

        const formatted = data.map(c => {
            if (c.stream) {
                return `${c.className} (${c.stream})`;
            }
            return c.className;
        });

        // 🔥 REMOVE DUPLICATES
        const unique = [...new Set(formatted)];

        return unique.map(cls => ({
            className: cls
        }));
    },

    // ✅ SUBJECT AUTO LOAD
    getSubjectsByClass: (className) => {

        // 🔥 AGRICULTURE STREAM SUBJECTS
        if (className.includes("Agriculture")) {
            return [
                "Crop Production",
                "Soil Science",
                "Horticulture",
                "Agricultural Engineering",
                "Animal Husbandry"
            ];
        }

        // 🔹 DEFAULT SUBJECTS (बाकी classes के लिए)
        return [
            "Hindi",
            "English",
            "Mathematics",
            "Science",
            "Social Science"
        ];
    },

    generateClasses: (config) => {

        let classes = [];

        const sections =
            config.sectionCount === 1
                ? [""]
                : Array.from({ length: config.sectionCount }, (_, i) =>
                    String.fromCharCode(65 + i)
                );

        // 🔹 PRE PRIMARY
        if (config.levels.prePrimary) {

            if (config.useNursery) {
                ["Nursery", "LKG", "UKG"].forEach(cls => {
                    sections.forEach(sec => {
                        classes.push({ className: cls, section: sec });
                    });
                });
            }

            if (config.usePP) {
                ["PP3", "PP4", "PP5"].forEach(cls => {
                    sections.forEach(sec => {
                        classes.push({ className: cls, section: sec });
                    });
                });
            }
        }

        // 🔹 PRIMARY (1–5)
        if (config.levels.primary) {
            for (let i = 1; i <= 5; i++) {
                sections.forEach(sec => {
                    classes.push({ className: getOrdinal(i), section: sec });
                });
            }
        }

        // 🔹 UPPER PRIMARY (6–8)
        if (config.levels.upperPrimary) {
            for (let i = 6; i <= 8; i++) {
                sections.forEach(sec => {
                    classes.push({ className: getOrdinal(i), section: sec });
                });
            }
        }

        // 🔹 SECONDARY (9–10)
        if (config.levels.secondary) {
            for (let i = 9; i <= 10; i++) {
                sections.forEach(sec => {
                    classes.push({ className: getOrdinal(i), section: sec });
                });
            }
        }

        // 🔹 SR SECONDARY (11–12 + STREAMS)
        if (config.levels.srSecondary) {
            [11, 12].forEach(cls => {
                config.streams.forEach(stream => {
                    sections.forEach(sec => {
                        classes.push({
                            className: getOrdinal(cls),
                            stream,
                            section: sec
                        });
                    });
                });
            });
        }

        // Phase 3.1 D: Add tenant context to generated classes
        return classes.map(cls => withTenantContext(cls));
    }
};