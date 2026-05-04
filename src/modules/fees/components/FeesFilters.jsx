import React from "react";

export default function FeesFilters({
    search,
    setSearch,
    classFilter,
    setClassFilter,
    statusFilter,
    setStatusFilter,
    students
}) {

    const classes = [...new Set(students.map(s => s.className))];

    return (
        <div style={styles.container}>

            {/* 🔍 SEARCH */}
            <input
                placeholder="🔍 Search by Name / Father / Mobile"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.input}
            />

            {/* 🎓 CLASS FILTER */}
            <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                style={styles.select}
            >
                <option value="all">All Classes</option>
                {classes.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                ))}
            </select>

            {/* 📊 STATUS FILTER */}
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
            >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="due">Due</option>
            </select>

        </div>
    );
}

const styles = {

    container: {
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap",
        background: "#1e293b",
        padding: 12,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
    },

    input: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        border: "none",
        outline: "none"
    },

    select: {
        padding: 10,
        borderRadius: 8,
        border: "none",
        cursor: "pointer"
    }
};