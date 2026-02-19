import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Generates a professional financial report PDF.
 * @param {Object} reportData - The financial data (income, expenses, net, savings).
 * @param {Array} transactions - List of recent transactions (optional).
 * @param {HTMLElement} chartContainer - The DOM element containing the charts to capture.
 * @param {string} month - The reporting period (YYYY-MM).
 */
export const generatePDF = async (reportData, transactions, chartContainer, month) => {
    try {
        console.log("Initializing jsPDF...");
        const doc = new (jsPDF.jsPDF || jsPDF)();
        console.log("jsPDF initialized.");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        // --- Header ---
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("CashFlowly", margin, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("Financial Statement & Analysis", margin, 28);

        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFontSize(10);
        doc.text(`Generated: ${dateStr}`, pageWidth - margin, 20, { align: 'right' });
        doc.text(`Period: ${month}`, pageWidth - margin, 28, { align: 'right' });

        let yPos = 55;

        // --- Financial Summary Table ---
        console.log("Generating Summary Table...");
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Financial Summary", margin, yPos);
        yPos += 8;

        const summaryData = [
            ['Total Inflow', `Ksh ${(reportData.totalIncome || 0).toLocaleString()}`],
            ['Total Outflow', `Ksh ${(reportData.totalExpenses || 0).toLocaleString()}`],
            ['Net Cash Flow', `Ksh ${(reportData.netBalance || 0).toLocaleString()}`],
            ['Total Savings (Ziidi)', `Ksh ${(reportData.totalSavings || 0).toLocaleString()}`]
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Amount']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 11, cellPadding: 6 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { halign: 'right' }
            }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // --- Visual Analysis (Charts) ---
        // console.log("Chart Container:", chartContainer);
        if (chartContainer) {
            console.log("Capturing charts...");
            try {
                // Check if we need a new page
                if (yPos + 100 > pageHeight) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text("Visual Analysis", margin, yPos);
                yPos += 10;

                const canvas = await html2canvas(chartContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: true, // Enable html2canvas logs
                    backgroundColor: '#ffffff'
                });
                console.log("Charts captured.");

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 15;
            } catch (canvasErr) {
                console.error("Chart capture failed:", canvasErr);
                // Continue without charts
            }
        } else {
            console.warn("Chart container not found, skipping charts.");
        }

        // --- Detailed Statement (Transactions) ---
        if (transactions && transactions.length > 0) {
            console.log("Generating Transaction Table...");
            // Check if we need a new page
            if (yPos + 30 > pageHeight) {
                doc.addPage();
                yPos = 20;
            } else if (yPos > pageHeight - 50) { // Ensure header doesn't start at very bottom
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text("Detailed Statement", margin, yPos);
            yPos += 8;

            const tableBody = transactions.map(t => {
                const dateObj = new Date(t.date);
                // Check if it's exactly midnight UTC (implies date-only record)
                const isMidnight = dateObj.getUTCHours() === 0 &&
                    dateObj.getUTCMinutes() === 0 &&
                    dateObj.getUTCSeconds() === 0 &&
                    dateObj.getUTCMilliseconds() === 0;

                const dateStr = isMidnight
                    ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : dateObj.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                return [
                    dateStr,
                    t.title || t.description || t.category || '-',
                    t.type === 'income' ? 'Income' : (t.type === 'expense' ? 'Expense' : t.type.toUpperCase()),
                    t.category || '-',
                    `Ksh ${t.amount.toLocaleString()}`
                ];
            });

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Description', 'Type', 'Category', 'Amount']],
                body: tableBody,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // blue-600
                styles: { fontSize: 9, cellPadding: 4 },
                columnStyles: {
                    4: { halign: 'right', fontStyle: 'bold' }
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 4) {
                        const raw = data.cell.raw;
                        // Color coding for amount
                        const type = data.row.raw[2]; // 'Income' or 'Expense'
                        if (type === 'Income') {
                            data.cell.styles.textColor = [22, 163, 74]; // green-600
                        } else if (type === 'Expense') {
                            data.cell.styles.textColor = [220, 38, 38]; // red-600
                        }
                    }
                }
            });

            // Final Footer Line
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setDrawColor(203, 213, 225); // slate-300
            doc.line(margin, finalY, pageWidth - margin, finalY);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text("This is a system generated report from CashFlowly.", margin, finalY + 5);
        }

        console.log("Saving PDF...");
        doc.save(`CashFlowly_Report_${month}.pdf`);
        console.log("PDF Saved.");
        return true;
    } catch (error) {
        console.error("PDF Generation Error Stack:", error.stack);
        console.error("PDF Generation Error:", error);
        return false;
    }
};
