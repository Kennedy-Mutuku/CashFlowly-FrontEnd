/**
 * Parses M-PESA messages to extract transaction details.
 * Handles Received, Paid, and Sent formats.
 */
export const parseMpesaMessage = (message) => {
    if (!message) return null;

    const data = {
        amount: '',
        partner: '',
        date: new Date().toISOString().split('T')[0],
        type: 'income', // default
        title: ''
    };

    // Extract Amount (e.g., Ksh1,000.00 or Ksh 1,000.00)
    const amountMatch = message.match(/Ksh\s?([\d,]+\.?\d*)/i);
    if (amountMatch) {
        data.amount = amountMatch[1].replace(/,/g, '');
    }

    // Determine Type and Partner
    if (message.includes('received')) {
        data.type = 'income';
        // Extract partner from "received Ksh... from JOHN DOE"
        const partnerMatch = message.match(/from\s+(.+?)\s+on/i);
        data.partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown Source';
        data.title = `Received from ${data.partner}`;
    } else if (message.includes('paid to') || message.includes('sent to')) {
        data.type = 'expense';
        const partnerMatch = message.match(/(?:paid|sent)\s+to\s+(.+?)\s+on/i) || message.match(/(?:paid|sent)\s+to\s+(.+?)\./i);
        data.partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown recipient';
        data.title = `Paid to ${data.partner}`;
    } else if (message.includes('paid for')) {
        data.type = 'expense';
        const partnerMatch = message.match(/paid\s+for\s+(.+?)\s+on/i);
        data.partner = partnerMatch ? partnerMatch[1].trim() : 'Services';
        data.title = `Payment for ${data.partner}`;
    }

    // Extract Date (e.g., 2/10/26)
    const dateMatch = message.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (dateMatch) {
        const rawDate = dateMatch[1];
        // Convert DD/MM/YY to YYYY-MM-DD for input field
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            data.date = `${year}-${month}-${day}`;
        }
    }

    return data;
};
