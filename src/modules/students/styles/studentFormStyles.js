export const pageStyle = {
    minHeight: "100vh",
    padding: "20px",
    background:
        "linear-gradient(135deg,#0f172a,#1e293b,#312e81)",
    color: "#fff"
};

export const topBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "15px",
    flexWrap: "wrap"
};

export const topButton = (bg) => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)"
});

export const pageTitle = {
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "0.5px"
};

export const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px"
};

export const grid3 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "18px"
};

export const grid2 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "20px"
};

export const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    backdropFilter: "blur(8px)"
};

export const selectStyle = {
    ...inputStyle,
    cursor: "pointer"
};

export const textarea = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical"
};

export const sectionCard = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "25px",
    marginBottom: "24px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.22)"
};

export const sectionHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
};

export const sectionTitle = {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "18px"
};

export const sectionSubTitle = {
    fontSize: "14px",
    opacity: 0.8
};

export const label = {
    fontSize: "13px",
    marginBottom: "6px",
    display: "block",
    opacity: 0.85
};

export const fieldGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
};

export const checkboxRow = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "15px",
    fontWeight: "500"
};

export const summaryCard = {
    background:
        "linear-gradient(135deg,rgba(59,130,246,0.22),rgba(124,58,237,0.22))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "22px",
    marginBottom: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)"
};

export const feeBadge = {
    background:
        "linear-gradient(135deg,#22c55e,#16a34a)",
    padding: "10px 18px",
    borderRadius: "14px",
    fontWeight: "700",
    color: "#fff",
    display: "inline-block",
    minWidth: "90px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.22)"
};

export const actionBar = {
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "wrap",
    marginTop: "30px",
    paddingBottom: "40px"
};

export const actionButton = (bg) => ({
    background: bg,
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
});

/* OPTIONAL OLD EXPORTS SAFE */

export const topBar = topBarStyle;
export const button = topButton;
export const badge = feeBadge;
export const grid = grid4;
export const leftPanel = {};
export const layoutGrid = grid2;
export const divider = {};
export const statRow = {};
export const statLabel = {};
export const statValue = {};
export const totalCard = summaryCard;
export const totalLabel = {};
export const totalValue = {};
export const summarySidebar = {};
export const summaryTitle = {};
export const pageSubTitle = {};