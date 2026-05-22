import React from "react";

import * as styles from "../styles/studentFormStyles";

const SummarySidebar = ({
    form = {},
}) => {

    return (
        <div style={styles.summarySidebar}>

            <h2 style={styles.summaryTitle}>
                Admission Summary
            </h2>

            <div style={styles.summaryCard}>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Student
                    </span>

                    <span style={styles.statValue}>
                        {form.name || "-"}
                    </span>
                </div>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Class
                    </span>

                    <span style={styles.statValue}>
                        {form.class || "-"}
                    </span>
                </div>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Father
                    </span>

                    <span style={styles.statValue}>
                        {form.fatherName || "-"}
                    </span>
                </div>

            </div>

            <div style={styles.summaryCard}>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Tuition
                    </span>

                    <span style={styles.statValue}>
                        ₹{form.tuitionFee || 0}
                    </span>
                </div>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Transport
                    </span>

                    <span style={styles.statValue}>
                        ₹{form.transportFee || 0}
                    </span>
                </div>

                <div style={styles.statRow}>
                    <span style={styles.statLabel}>
                        Hostel
                    </span>

                    <span style={styles.statValue}>
                        ₹{form.hostelFee || 0}
                    </span>
                </div>

            </div>

            <div style={styles.totalCard}>

                <div style={styles.totalLabel}>
                    Total Fees
                </div>

                <div style={styles.totalValue}>
                    ₹{form.totalFee || 0}
                </div>

            </div>

        </div>
    );
};

export default SummarySidebar;