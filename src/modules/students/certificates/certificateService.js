export const generateCertificate = (student, type) => {
    const base = {
        name: student.name || "Student Name",
        fatherName: student.fatherName || "Father Name",
        class: student.class || "",
        section: student.section || "",
        photo: student.photo || "",
        date: new Date().toLocaleDateString()
    };

    const templates = {

        // 🎓 ACADEMIC
        study: {
            title: "Certificate of Academic Excellence",
            theme: "academic",
            text: `This is to proudly certify that ${base.name}, a student of Class ${base.class}, has successfully completed the academic session with outstanding dedication, sincerity, and discipline.

${base.name} has consistently demonstrated a strong commitment towards learning, excellence in performance, and a positive attitude towards education.

Their hard work, determination, and focus truly reflect their potential for achieving great success in life.

We extend our heartfelt congratulations and wish them a bright, prosperous, and successful future ahead.`
        },

        // 🏅 SPORTS GENERAL
        sports: {
            title: "Certificate of Sports Excellence",
            theme: "sports",
            text: `This certificate is proudly awarded to ${base.name} for outstanding performance and active participation in sports activities.

${base.name} has shown exceptional energy, teamwork, discipline, and sportsmanship on the field.

Their dedication and competitive spirit are truly commendable and serve as an inspiration to others.

We congratulate them on their achievement and wish them continued success in sports and life.`
        },

        // 🏏 CRICKET
        cricket: {
            title: "Cricket Achievement Certificate",
            theme: "cricket",
            text: `This certificate is awarded to ${base.name} for excellent performance in cricket.

${base.name} has demonstrated outstanding batting, bowling, and fielding skills along with strong team coordination.

Their passion for the game and dedication towards practice have brought them well-deserved recognition.

We wish them great success and many more achievements in the field of cricket.`
        },

        // 🤼 KABADDI
        kabaddi: {
            title: "Kabaddi Championship Certificate",
            theme: "kabaddi",
            text: `This certificate is proudly awarded to ${base.name} for exceptional performance in Kabaddi.

${base.name} has displayed remarkable strength, agility, presence of mind, and team spirit during the competition.

Their fearless participation and determination make them a true champion.

We congratulate them and wish them continued success in sports.`
        },

        // 🎭 CULTURAL
        cultural: {
            title: "Certificate of Cultural Excellence",
            theme: "cultural",
            text: `This is to certify that ${base.name} has actively participated in cultural activities and showcased outstanding talent and creativity.

Their enthusiasm, confidence, and artistic expression have added great value to the school environment.

${base.name}'s contribution reflects creativity, passion, and dedication.

We wish them success in all future cultural and creative endeavors.`
        },

        // 🎨 DRAWING
        drawing: {
            title: "Drawing Competition Certificate",
            theme: "drawing",
            text: `This certificate is awarded to ${base.name} for outstanding creativity and performance in drawing competition.

${base.name} has demonstrated exceptional imagination, artistic skills, and originality.

Their work reflects creativity, dedication, and passion for art.

We congratulate them and wish them success in all artistic pursuits.`
        },

        // 📜 CHARACTER
        character: {
            title: "Character Certificate",
            theme: "formal",
            text: `This is to certify that ${base.name}, S/o ${base.fatherName}, has been a student of this institution.

During their academic tenure, they have displayed excellent moral character, discipline, honesty, and respect towards teachers and fellow students.

Their behavior has always been exemplary and worthy of appreciation.

We wish them a successful and respectable future ahead.`
        },

        // 🏆 ATTENDANCE
        attendance: {
            title: "Best Attendance Award",
            theme: "academic",
            text: `This certificate is awarded to ${base.name} for maintaining excellent attendance throughout the academic session.

Their punctuality, regularity, and dedication towards studies reflect a strong sense of responsibility.

${base.name}'s commitment to education is truly commendable.

We congratulate them and encourage them to maintain this excellence in the future.`
        },

        // 🥇 GOLD MEDAL
        medal: {
            title: "Gold Medal of Excellence",
            theme: "medal",
            text: `This prestigious Gold Medal is awarded to ${base.name} for achieving outstanding excellence and top performance.

${base.name}'s dedication, hard work, and determination have set an example of excellence.

This achievement reflects their ability to strive for the best and achieve greatness.

We extend our warm congratulations and wish them continued success in all future endeavors.`
        },

        // 🎂 BIRTHDAY
        birthday: {
            title: "Happy Birthday",
            theme: "birthday",
            text: `🎉 Warmest Birthday Wishes to ${base.name}! 🎉

May your special day be filled with happiness, joy, and wonderful moments.

May you continue to grow, learn, and achieve great success in life.

Keep smiling, keep shining, and keep making everyone proud.

Wishing you a fantastic year ahead full of success and happiness!`
        }

    };

    const selected = templates[type] || templates.study;

    return {
        ...base,
        ...selected
    };
};