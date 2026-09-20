export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
];

export function formatIndianCurrency(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return showSymbol ? '₹' + formatted : formatted;
}

const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function convertGroup(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' HUNDRED ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

export function numberToIndianWords(amount: number): string {
  if (!amount || amount === 0) return 'ZERO RUPEES ONLY';

  const parts = Math.abs(amount).toFixed(2).split('.');
  let num = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  if (num === 0 && paise === 0) return 'ZERO RUPEES ONLY';

  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  if (crore > 0) {
    result += convertGroup(crore) + ' CRORE ';
  }

  const lakh = Math.floor(num / 100000);
  num %= 100000;
  if (lakh > 0) {
    result += convertGroup(lakh) + ' LAKH ';
  }

  const thousand = Math.floor(num / 1000);
  num %= 1000;
  if (thousand > 0) {
    result += convertGroup(thousand) + ' THOUSAND ';
  }

  const hundred = Math.floor(num / 100);
  num %= 100;
  if (hundred > 0) {
    result += convertGroup(hundred) + ' HUNDRED ';
  }

  if (num > 0) {
    result += convertGroup(num) + ' ';
  }

  result = result.trim() + ' RUPEES';

  if (paise > 0) {
    result += ' AND ' + convertGroup(paise) + ' PAISE';
  }

  result += ' ONLY';
  return result.replace(/\s+/g, ' ').toUpperCase();
}

export function generateUpiUrl(upiId: string, accountName: string, amount: number, invoiceNumber: string): string {
  const cleanUpi = (upiId || '').trim();
  const cleanName = encodeURIComponent(accountName || '');
  const cleanAmount = (amount || 0).toFixed(2);
  const cleanNote = encodeURIComponent('Payment for Inv #' + invoiceNumber);

  return 'upi://pay?pa=' + cleanUpi + '&pn=' + cleanName + '&am=' + cleanAmount + '&cu=INR&tn=' + cleanNote;
}

export function generateWhatsAppReminder(params: {
  customerName: string;
  businessName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  companyName: string;
  upiId?: string;
  phone?: string;
  lang?: 'hi' | 'en';
}): { message: string; url: string } {
  const { customerName, invoiceNumber, amount, dueDate, companyName, upiId, phone, lang = 'hi' } = params;
  const formattedAmount = formatIndianCurrency(amount);

  let message = '';
  if (lang === 'hi') {
    message = '🙏 नमस्ते ' + customerName + ',\n\n' +
      'आपके नाम पर *' + companyName + '* का बिल नंबर *#' + invoiceNumber + '* बाकी है।\n' +
      '💰 *कुल बकाया राशि:* ' + formattedAmount + '\n' +
      '📅 *अंतिम भुगतान तिथि (Due Date):* ' + dueDate + '\n\n' +
      (upiId ? '📲 UPI द्वारा सीधे भुगतान करने के लिए ID:\n*' + upiId + '*\n\n' : '') +
      'कृपया नियत समय पर भुगतान करें। धन्यवाद! ✨\n*' + companyName + '*';
  } else {
    message = 'Dear ' + customerName + ',\n\n' +
      'This is a gentle reminder regarding invoice *#' + invoiceNumber + '* from *' + companyName + '*.\n' +
      '💰 *Outstanding Amount:* ' + formattedAmount + '\n' +
      '📅 *Due Date:* ' + dueDate + '\n\n' +
      (upiId ? '📲 Pay instantly via UPI ID:\n*' + upiId + '*\n\n' : '') +
      'Please clear the balance at your earliest convenience.\nThank you! 🙏\n*' + companyName + '*';
  }

  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const url = 'https://wa.me/' + formattedPhone + '?text=' + encodeURIComponent(message);

  return { message, url };
}