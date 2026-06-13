import { jsPDF } from 'jspdf';
import { User, NewLoanForm } from '../types';

interface PDFGeneratorParams {
  user: User;
  form: NewLoanForm;
  emi: number;
  total: number;
  applicationId: string;
  categoryBangla: string;
  dateString: string;
}

const toBanglaDigits = (num: number | string) => {
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (x) => banglaNumbers[parseInt(x)]);
};

const formatBDT = (amount: number) => {
  return `৳ ${Math.round(amount).toLocaleString('bn-BD')}`;
};

export function generateLoanPDF({
  user,
  form,
  emi,
  total,
  applicationId,
  categoryBangla,
  dateString,
}: PDFGeneratorParams) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1150;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 800, 1150);

  // Background secure watermark text / lines
  ctx.strokeStyle = '#f8f4eb';
  ctx.lineWidth = 1;
  for (let i = 40; i < 760; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i, 1110);
    ctx.stroke();
  }
  for (let j = 40; j < 1110; j += 40) {
    ctx.beginPath();
    ctx.moveTo(40, j);
    ctx.lineTo(760, j);
    ctx.stroke();
  }

  // 2. Draw Elegant Gold Borders
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 740, 1090); // Outer gold frame

  ctx.strokeStyle = '#e2d5bd';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 728, 1078); // Inner thin border

  // 3. Header Logo & Title
  // Gold badge element
  ctx.fillStyle = '#c5a059';
  ctx.beginPath();
  ctx.arc(400, 85, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "SolaimanLipi", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('D', 400, 93);

  // Main Branch Name
  ctx.fillStyle = '#111113';
  ctx.font = 'bold 25px "SolaimanLipi", "Inter", Arial, sans-serif';
  ctx.fillText('ডিগআউট মাইক্রোফিন্যান্স', 400, 140);

  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 11px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('DIGOUT MICROFINANCE APP INC.', 400, 160);

  // Divider Line
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 180);
  ctx.lineTo(720, 180);
  ctx.stroke();

  // Subtitle banner representation
  ctx.fillStyle = '#111113';
  ctx.font = 'bold 16px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('ঋণ আবেদন বিবরণী ও রসিদ', 400, 208);
  
  ctx.fillStyle = '#71717a';
  ctx.font = 'italic 11px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('Loan Application Summary & Official Receipt', 400, 224);

  // 4. Receipt Metadata Info Banner (Application ID, Date, Status)
  ctx.fillStyle = '#fcfaf6';
  ctx.fillRect(80, 245, 640, 55);
  ctx.strokeStyle = '#e2d5bd';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 245, 640, 55);

  // Label values for info banner
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillStyle = '#71717a';
  ctx.fillText('আবেদন আইডি (Application ID)', 95, 265);
  ctx.fillText('আবেদনের তারিখ ও সময় (Date)', 330, 265);
  ctx.fillText('অবস্থা (Status)', 570, 265);

  ctx.font = 'bold 13px "SolaimanLipi", "Inter", monospace, sans-serif';
  ctx.fillStyle = '#111113';
  ctx.fillText(applicationId, 95, 285);
  ctx.fillText(toBanglaDigits(dateString), 330, 285);

  ctx.fillStyle = '#059669'; // Emerald text for pending verification status
  ctx.font = 'bold 12px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('যাচাইকরণাধীন', 570, 285);

  // 5. Section 1: Customer Information
  ctx.fillStyle = '#111113';
  ctx.font = 'bold 14px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('১. গ্রাহকের বিবরণী (Customer Details)', 80, 335);

  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 342);
  ctx.lineTo(720, 342);
  ctx.stroke();

  // Customer grid helper drawing
  const drawGridRow = (label1: string, value1: string, label2: string, value2: string, startY: number) => {
    ctx.textAlign = 'left';
    
    // Label 1
    ctx.fillStyle = '#71717a';
    ctx.font = '11px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(label1, 95, startY);
    
    // Value 1
    ctx.fillStyle = '#111113';
    ctx.font = 'bold 12px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(value1, 95, startY + 18);

    // Label 2
    ctx.fillStyle = '#71717a';
    ctx.font = '11px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(label2, 420, startY);
    
    // Value 2
    ctx.fillStyle = '#111113';
    ctx.font = 'bold 12px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(value2, 420, startY + 18);

    // Minor separating dashed line
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(80, startY + 30);
    ctx.lineTo(720, startY + 30);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
  };

  drawGridRow('গ্রাহকের নাম (Applicant Name)', user.name, 'হিসাব নম্বর (Account Number)', user.accountNo, 365);
  drawGridRow('মোবাইল নম্বর (Mobile Number)', toBanglaDigits(user.phone), 'জাতীয় পরিচয়পত্র (NID Status)', 'সংযুক্ত ও যাচাইকৃত (NID Provided)', 415);

  // 6. Section 2: Loan Calculations Grid
  ctx.fillStyle = '#111113';
  ctx.font = 'bold 14px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('২. ঋণের হিসাব বিবরণী (Loan Scheme Calculations)', 80, 485);

  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 492);
  ctx.lineTo(720, 492);
  ctx.stroke();

  // Create a clean styled data box
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(80, 505, 640, 160);
  ctx.strokeStyle = '#f4f4f5';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 505, 640, 160);

  // Draw table row lists
  const drawRowItem = (title: string, value: string, isTotal: boolean, startY: number) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = isTotal ? '#111113' : '#3f3f46';
    ctx.font = isTotal ? 'bold 12px "SolaimanLipi", "Inter", sans-serif' : '12px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(title, 100, startY);

    ctx.textAlign = 'right';
    ctx.fillStyle = isTotal ? '#a48043' : '#111113';
    ctx.font = isTotal ? 'bold 14px "SolaimanLipi", "Inter", sans-serif' : 'bold 12px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(value, 700, startY);

    // Separator line
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, startY + 8);
    ctx.lineTo(700, startY + 8);
    ctx.stroke();
  };

  drawRowItem('নির্বাচিত ঋণের শ্রেণী (Selected Category)', categoryBangla, false, 530);
  drawRowItem('ঋণের প্রধান মূলধন (Principal Amount)', toBanglaDigits(formatBDT(form.amount)), false, 560);
  drawRowItem('ঋণের মেয়াদ (Loan Term Months)', `${toBanglaDigits(form.months)} মাস (${toBanglaDigits(form.interestRate)}% বার্ষিক আনুপাতিক হার)`, false, 590);
  drawRowItem('মাসিক কিস্তির পরিমাণ (Monthly Proposed EMI)', toBanglaDigits(formatBDT(emi)), false, 620);
  drawRowItem('মোট পরিশোধযোগ্য পরিমাণ (Cumulative Total Repayable)', toBanglaDigits(formatBDT(total)), true, 650);

  // 7. Section 3: Verified Attached Documents Check lists
  ctx.fillStyle = '#111113';
  ctx.font = 'bold 14px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('৩. সংযুক্ত প্রমাণপত্রসমূহ (Submitted Testimonial Audits)', 80, 700);

  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 707);
  ctx.lineTo(720, 707);
  ctx.stroke();

  // Checked item box
  const drawDocumentItem = (docName: string, statusText: string, iconColor: string, x: number, y: number) => {
    // Audit box
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(x, y, 310, 42);
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 310, 42);

    // Check circular representation
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.arc(x + 22, y + 21, 8, 0, Math.PI * 2);
    ctx.fill();

    // Check symbol mark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓', x + 22, y + 24);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#111113';
    ctx.font = 'bold 11px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(docName, x + 40, y + 17);

    ctx.fillStyle = '#71717a';
    ctx.font = '9.5px "SolaimanLipi", "Inter", sans-serif';
    ctx.fillText(statusText, x + 40, y + 31);
  };

  const getAddressProofLabel = (type: string) => {
    switch (type) {
      case 'electricity': return 'ঠিকানার প্রমাণ (বিদ্যুৎ বিল)';
      case 'gas': return 'ঠিকানার প্রমাণ (গ্যাস বিল)';
      case 'water': return 'ঠিকানার প্রমাণ (পানির বিল)';
      case 'internet': return 'ঠিকানার প্রমাণ (ইন্টারনেট বিল)';
      case 'rent': return 'ঠিকানার প্রমাণ (ভাড়া চুক্তি)';
      default: return 'ঠিকানার প্রমাণপত্র';
    }
  };

  drawDocumentItem('জাতীয় পরিচয়পত্র ১ম অংশ (NID Front Page)', 'সফলভাবে স্ক্যান সম্পন্ন ও আপলোডকৃত', '#059669', 80, 725);
  drawDocumentItem('জাতীয় পরিচয়পত্র ২য় অংশ (NID Back Page)', 'সফলভাবে স্ক্যান সম্পন্ন ও আপলোডকৃত', '#059669', 410, 725);
  
  drawDocumentItem('গ্রাহকের বায়োমেট্রিক সেলফি (Selfie Bio)', 'লাইভ ফেস ম্যাচ সম্পন্ন হয়েছে', '#059669', 80, 775);
  drawDocumentItem(getAddressProofLabel(form.addressProofType), 'আবাসিক ঠিকানা যাচাইয়ের ফাইল সংযুক্ত', '#059669', 410, 775);
  
  // Income proof conditional check
  const incomeLabel = form.incomeProof ? 'অফিসিয়াল আয়ের প্রমাণ (Proof of Income)' : 'আয়ের ঘোষণা (Declared Monthly Income)';
  const incomeDesc = form.incomeProof ? 'কর্মস্থল বা ব্যক্তিগত ট্যাক্স বিবরণী সংযুক্ত' : 'আবেদনকারী কর্তৃক স্বঘোষিত বিবরণী';
  drawDocumentItem(incomeLabel, incomeDesc, '#059669', 80, 825);

  // Draw simulated security verification stamp
  const stampX = 410;
  const stampY = 825;
  ctx.fillStyle = '#f0fdf4';
  ctx.fillRect(stampX, stampY, 310, 42);
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1;
  ctx.strokeRect(stampX, stampY, 310, 42);

  ctx.fillStyle = '#15803d';
  ctx.font = 'bold 10px "SolaimanLipi", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ডিজিটাল সিকিউরিটি ইনস্পেকশন পাসড ও ভেরিফাইড', stampX + 15, stampY + 18);
  ctx.font = '9px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('DIGOUT DIGI-STAMP: #VERIFIED-SECURE-ID', stampX + 15, stampY + 31);

  // 8. Bottom Barcode simulation to look completely administrative
  ctx.fillStyle = '#000000';
  let barcodeX = 540;
  const barcodeY = 910;
  const barcodeHeight = 35;
  const barcodeValues = [2, 1, 3, 1, 4, 2, 1, 3, 2, 2, 1, 4, 1, 2, 3, 1, 2, 2, 4, 1, 1, 3, 2, 1, 3, 1, 4, 2];
  for (let i = 0; i < barcodeValues.length; i++) {
    const barWidth = barcodeValues[i] * 1.5;
    if (i % 2 === 0) {
      ctx.fillRect(barcodeX, barcodeY, barWidth, barcodeHeight);
    }
    barcodeX += barWidth;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#71717a';
  ctx.font = '8px "SolaimanLipi", "Inter", monospace, sans-serif';
  ctx.fillText(`*${applicationId}*`, 600, 955);

  // 9. Terms & Certifications
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3f3f46';
  ctx.font = 'bold 10px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('ঘোষণা ও শর্তসমূহ:', 80, 905);

  ctx.fillStyle = '#71717a';
  ctx.font = '8.5px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('১. আবেদনকারী নিশ্চিত করছেন যে প্রদানকৃত সমস্ত তথ্য সঠিক এবং মিথ্যা বা ভুল বিবরণী আইনি দায়ী সৃষ্টি করবে।', 80, 920);
  ctx.fillText('২. এই ডিজিটাল বিবরণীটি সম্পূর্ণ কম্পিউটার প্রসেসড, তাই এতে কোনো হাতে লেখা স্বাক্ষরের প্রয়োজন বা আবশ্যকতা নেই।', 80, 935);
  ctx.fillText('৩. এই ঋণের জন্য চূড়ান্ত অনুমোদন ও বিতরণ ডিগআউট যাচাইকারী কমিটির মূল্যায়নের পর সম্পাদন করা হবে।', 80, 950);

  // Foot page stamp
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 985);
  ctx.lineTo(720, 985);
  ctx.stroke();

  // Logo Watermark
  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 15px "SolaimanLipi", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DIGOUT MICROFINANCE', 80, 1010);

  ctx.fillStyle = '#71717a';
  ctx.font = '9px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('সাপোর্ট সেন্টার: support@digout-app.com | ফোন: ১৬২৪৭', 80, 1025);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#a48043';
  ctx.font = 'bold 10px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('ডিজিটাল সিকিউরিটি ওয়াটারমার্ক জেনারেটেড', 720, 1010);
  
  ctx.fillStyle = '#71717a';
  ctx.font = '9px "SolaimanLipi", "Inter", sans-serif';
  ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সমবায় ব্যাংক নিয়মানুযায়ী সংবিধিবদ্ধ', 720, 1025);

  // Convert canvas to image and export PDF
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [800, 1150],
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, 800, 1150);
  pdf.save(`Digout_Loan_Receipt_${applicationId}.pdf`);
}
