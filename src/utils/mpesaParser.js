/**
 * Parses M-PESA messages to extract transaction details.
 * Handles Received, Paid, and Sent formats.
 */
export const parseMpesaMessage = (message) => {
    if (!message) return null;

    const data = {
        amount: '',
        partner: '',
        date: new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }),
        type: 'income', // default
        title: '',
        paymentMethod: 'M-PESA',
        transactionId: '',
        time: ''
    };

    // Extract Transaction ID (usually at the start, e.g., RJL1234567)
    const txMatch = message.match(/^([A-Z\d]{10,})/);
    if (txMatch) {
        data.transactionId = txMatch[1];
    }

    // Extract Time (e.g., 8:44 AM or 20:44)
    const timeMatch = message.match(/(\d{1,2}:\d{2})\s?(AM|PM)?/i);
    if (timeMatch) {
        let timeStr = timeMatch[1];
        let meridian = timeMatch[2];
        let [hours, minutes] = timeStr.split(':');

        if (meridian) {
            meridian = meridian.toUpperCase();
            if (meridian === 'PM' && hours !== '12') {
                hours = (parseInt(hours) + 12).toString();
            } else if (meridian === 'AM' && hours === '12') {
                hours = '00';
            }
        }
        data.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    // Extract Amount (e.g., Ksh1,000.00 or Ksh 1,000.00)
    const amountMatch = message.match(/Ksh\s?([\d,]+\.?\d*)/i);
    if (amountMatch) {
        data.amount = amountMatch[1].replace(/,/g, '');
    }

    // Determine Type and Partner
    if (message.toLowerCase().includes('received')) {
        data.type = 'income';
        // Extract partner from "received Ksh... from JOHN DOE"
        const partnerMatch = message.match(/from\s+(.+?)\s+on/i) || message.match(/from\s+(.+?)\./i);
        data.partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown Source';
        data.title = `Received from ${data.partner}`;
    } else if (message.toLowerCase().includes('paid to') || message.toLowerCase().includes('sent to')) {
        const partnerMatch = message.match(/(?:paid|sent)\s+to\s+(.+?)\s+on/i) || message.match(/(?:paid|sent)\s+to\s+(.+?)\./i);
        const partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown recipient';

        data.partner = partner;
        if (partner.toLowerCase().includes('zidi')) {
            data.type = 'savings';
            data.title = `Saved to Zidi`;
        } else {
            data.type = 'expense';
            data.title = `Paid to ${partner}`;
        }
    } else if (message.toLowerCase().includes('paid for')) {
        const partnerMatch = message.match(/paid\s+for\s+(.+?)\s+on/i) || message.match(/paid\s+for\s+(.+?)\./i);
        const partner = partnerMatch ? partnerMatch[1].trim() : 'Services';
        data.partner = partner;

        if (partner.toLowerCase().includes('zidi')) {
            data.type = 'savings';
            data.title = `Saved to Zidi`;
        } else {
            data.type = 'expense';
            data.title = `Payment for ${partner}`;
        }
    }

    // Extract Date (e.g., 11/2/26 or 2026-02-11)
    // Kenyan M-PESA: DD/MM/YY
    const dateMatch = message.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (dateMatch) {
        const rawDate = dateMatch[1];
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = `20${year}`;

            // Backend usually expects YYYY-MM-DD
            data.date = `${year}-${month}-${day}`;
        }
    }

    return data;
};
