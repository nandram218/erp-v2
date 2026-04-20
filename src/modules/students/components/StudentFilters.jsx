import React from "react";

const StudentFilters = ({
    search, setSearch,
    selectedClass, setSelectedClass,
    selectedCategory, setSelectedCategory,
    selectedRTE, setSelectedRTE,
    students
}) => {

    const classOptions = [...new Set(students.map(s => s.class))];

    return (
        <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "15px",
            flexWrap: "wrap"
        }}>

            <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">All Class</option>
                {classOptions.map(c => <option key={c}>{c}</option>)}
            </select>

            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Category</option>
                <option>GEN</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
            </select>

            <select value={selectedRTE} onChange={(e) => setSelectedRTE(e.target.value)}>
                <option value="">RTE</option>
                <option>RTE</option>
                <option>NON-RTE</option>
            </select>

        </div>
    );
};

export default StudentFilters;