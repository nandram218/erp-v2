export const appStyles = {

    // 🌌 PREMIUM LIGHT-DARK BACKGROUND (not dull)
    page: {
        background: "linear-gradient(135deg, #1e293b, #334155, #475569)",
        color: "#f1f5f9",
        minHeight: "100vh",
        padding: 20
    },

    // 🧊 GLASS CARD WITH GOLDEN EDGE
    card: {
        background: "rgba(51, 65, 85, 0.65)",
        padding: 18,
        marginTop: 15,
        borderRadius: 16,
        border: "1px solid rgba(255, 215, 0, 0.35)",
        boxShadow: `
            0 0 12px rgba(255,215,0,0.2),
            inset 0 0 10px rgba(255,255,255,0.05),
            0 10px 30px rgba(0,0,0,0.5)
        `,
        backdropFilter: "blur(10px)"
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    row: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14
    },

    imageRow: {
        display: "flex",
        gap: 20,
        marginTop: 10
    },

    cardTitle: {
        marginBottom: 12,
        color: "#fde68a",
        fontWeight: "600"
    },

    listRow: {
        display: "flex",
        alignItems: "center",
        background: "rgba(30,41,59,0.8)",
        padding: 10,
        marginTop: 6,
        borderRadius: 10
    },

    actionBox: {
        display: "flex",
        gap: 10
    },

    preview: {
        width: 80,
        height: 80,
        objectFit: "cover",
        marginTop: 5,
        borderRadius: 8
    },

    selectorCard: {
        background: "rgba(51,65,85,0.7)",
        padding: 15,
        marginTop: 15,
        borderRadius: 14,
        border: "1px solid rgba(255,215,0,0.25)"
    },

    select: {
        padding: 10,
        marginLeft: 10,
        borderRadius: 10,
        border: "none"
    },

    actions: {
        marginTop: 20,
        display: "flex",
        gap: 12
    },

    // 🔥 CURVED 3D BASE BUTTON
    btnBase: {
        padding: "10px 16px",
        color: "#fff",
        border: "none",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "all 0.2s ease",
        boxShadow: `
            6px 6px 12px rgba(0,0,0,0.6),
            -3px -3px 6px rgba(255,255,255,0.05)
        `
    },

    // 🎨 CURVED NEUMORPHIC BUTTONS
    btn: {
        background: "linear-gradient(145deg, #64748b, #475569)"
    },

    btnGreen: {
        background: "linear-gradient(145deg, #22c55e, #166534)"
    },

    btnBlue: {
        background: "linear-gradient(145deg, #60a5fa, #1d4ed8)"
    },

    btnRed: {
        background: "linear-gradient(145deg, #f87171, #991b1b)"
    },

    // 💥 PRESS EFFECT (REAL 3D)
    btnActive: {
        transform: "translateY(4px)",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.5)"
    },

    // ✨ GOLDEN GLOW BUTTON (special)
    goldBtn: {
        background: "linear-gradient(145deg, #facc15, #ca8a04)",
        color: "#1e293b",
        boxShadow: `
            0 0 10px rgba(255,215,0,0.6),
            4px 4px 10px rgba(0,0,0,0.5)
        `
    },

    backBtn: {
        background: "linear-gradient(145deg, #94a3b8, #475569)"
    },

    dashBtn: {
        background: "linear-gradient(145deg, #60a5fa, #1e40af)"
    }
};
