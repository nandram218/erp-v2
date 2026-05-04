import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async (element) => {
    if (!element) return;

    try {
        // 🔥 CLONE NODE (NO UI REPAINT)
        const clone = element.cloneNode(true);

        clone.style.position = "fixed";
        clone.style.top = "-9999px";
        clone.style.left = "-9999px";
        clone.style.width = "900px";
        clone.style.background = "#fff";

        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("certificate.pdf");

    } catch (err) {
        console.error(err);
    }
};