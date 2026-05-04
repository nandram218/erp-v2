import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async (element) => {
    if (!element) {
        console.error("PDF Error: Element not found");
        return;
    }

    try {
        // Capture HTML as canvas
        const canvas = await html2canvas(element, {
            scale: 2,           // high quality
            useCORS: true,      // images load properly
            backgroundColor: null
        });

        const imgData = canvas.toDataURL("image/png");

        // A4 size (mm)
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = 210;
        const pageHeight = 297;

        // Maintain aspect ratio
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;

        // Add image
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        // अगर content बड़ा है तो multi-page support
        if (imgHeight > pageHeight) {
            let heightLeft = imgHeight - pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
        }

        pdf.save("certificate.pdf");

    } catch (error) {
        console.error("PDF Generation Error:", error);
    }
};