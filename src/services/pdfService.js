import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Função para carregar o template HTML de um arquivo externo
async function carregarTemplate() {
    const response = await fetch("/templates/pdfTemplate.html");
    return await response.text();
}

const pdfService = {
    async gerarPDF(user) {
        // Carrega o template HTML
        let template = await carregarTemplate();

        // Substitui placeholders do template pelos valores do usuário
        template = template.replace(/\${user\["([^"]+)"\]}/g, (match, p1) => user[p1] || "");

        // Cria um container temporário para o template HTML
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "-9999px";
        container.style.width = "794px";
        container.style.height = "1123px";
        container.style.backgroundColor = "#fff"; // Fundo branco para o PDF
        container.innerHTML = template;
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "pt", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

            pdf.addImage(
                imgData,
                "PNG",
                0,
                0,
                imgWidth * ratio,
                imgHeight * ratio
            );
            pdf.save(`${user["Nome Completo"] || "ficha"}.pdf`);
        } finally {
            document.body.removeChild(container);
        }
    },
};

export default pdfService;
