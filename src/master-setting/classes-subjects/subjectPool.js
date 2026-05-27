export const SUBJECT_POOL = (board, medium) => {

    const lang1 = medium === "Hindi" ? "Hindi" : "English";
    const lang2 = medium === "Hindi" ? "English" : "Hindi";

    return {

        // 🔹 PRE PRIMARY
        "Nursery": {
            scholastic: [lang1 + " Oral", "Rhymes", "Number Work", "Activity"],
            coScholastic: ["Drawing", "Music", "Play"]
        },
        "LKG": {
            scholastic: [lang1, lang2, "Maths", "Rhymes"],
            coScholastic: ["Drawing", "Music", "Activity"]
        },
        "UKG": {
            scholastic: [lang1, lang2, "Maths", "EVS"],
            coScholastic: ["Drawing", "Music", "PT"]
        },
        "PP3": {
            scholastic: [lang1, lang2, "Maths", "Rhymes"],
            coScholastic: ["Drawing", "Music", "Activity"]
        },

        "PP4": {
            scholastic: [lang1, lang2, "Maths", "EVS"],
            coScholastic: ["Drawing", "Music", "PT"]
        },

        "PP5": {
            scholastic: [lang1, lang2, "Maths", "EVS"],
            coScholastic: ["Drawing", "Music", "PT"]
        },
        // 🔹 PRIMARY
        "1st": {
            scholastic: [lang1, lang2, "Maths", "EVS", "Computer"],
            coScholastic: ["GK", "Drawing", "Music", "PT"]
        },
        "2nd": {
            scholastic: [lang1, lang2, "Maths", "EVS", "Computer"],
            coScholastic: ["GK", "Drawing", "Music", "PT"]
        },
        "3rd": {
            scholastic: [lang1, lang2, "Maths", "EVS", "Computer"],
            coScholastic: ["GK", "Drawing", "Music", "PT"]
        },
        "4th": {
            scholastic: [lang1, lang2, "Maths", "EVS", "Computer"],
            coScholastic: ["GK", "Drawing", "Music", "PT"]
        },
        "5th": {
            scholastic: [lang1, lang2, "Maths", "EVS", "Computer"],
            coScholastic: ["GK", "Drawing", "Music", "PT"]
        },

        // 🔹 UPPER PRIMARY
        "6th": {
            scholastic: [lang1, lang2, "Maths", "Science", "Social Science", "Sanskrit", "Computer"],
            coScholastic: ["GK", "Art", "PT"]
        },
        "7th": {
            scholastic: [lang1, lang2, "Maths", "Science", "Social Science", "Sanskrit", "Computer"],
            coScholastic: ["GK", "Art", "PT"]
        },
        "8th": {
            scholastic: [lang1, lang2, "Maths", "Science", "Social Science", "Sanskrit", "Computer"],
            coScholastic: ["GK", "Art", "PT"]
        },

        // 🔹 SECONDARY
        "9th": {
            scholastic: [lang1, lang2, "Maths", "Science", "Social Science", "IT"],
            coScholastic: ["Physical Education", "Art", "Work Education"]
        },
        "10th": {
            scholastic: [lang1, lang2, "Maths", "Science", "Social Science", "IT"],
            coScholastic: ["Physical Education", "Art", "Work Education"]
        },

        // 🔹 SR SECONDARY STREAMS
        "11th-Science": {
            scholastic: ["Physics", "Chemistry", "Maths", "Biology", lang1, "Computer Science"],
            coScholastic: ["Physical Education"]
        },
        "12th-Science": {
            scholastic: ["Physics", "Chemistry", "Maths", "Biology", lang1, "Computer Science"],
            coScholastic: ["Physical Education"]
        },

        "11th-Commerce": {
            scholastic: ["Accountancy", "Business Studies", "Economics", lang1, "Maths"],
            coScholastic: ["Physical Education"]
        },
        "12th-Commerce": {
            scholastic: ["Accountancy", "Business Studies", "Economics", lang1, "Maths"],
            coScholastic: ["Physical Education"]
        },

        "11th-Arts": {
            scholastic: ["History", "Geography", "Political Science", "Sociology", lang1],
            coScholastic: ["Physical Education"]
        },
        "12th-Arts": {
            scholastic: ["History", "Geography", "Political Science", "Sociology", lang1],
            coScholastic: ["Physical Education"]
        },
        "11th-Agriculture": {
            scholastic: [
                "Crop Production",
                "Soil Science",
                "Horticulture",
                "Agricultural Engineering",
                "Animal Husbandry",
                lang1
            ],
            coScholastic: ["Physical Education"]
        },

        "12th-Agriculture": {
            scholastic: [
                "Crop Production",
                "Soil Science",
                "Horticulture",
                "Agricultural Engineering",
                "Animal Husbandry",
                lang1
            ],
            coScholastic: ["Physical Education"]
        }
    };

};