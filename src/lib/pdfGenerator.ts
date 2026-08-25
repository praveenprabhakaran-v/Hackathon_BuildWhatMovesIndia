import jsPDF from 'jspdf';
import { RTIApplication, FirstAppealApplication } from '../types/rti';

export function generateRtiReceiptPdf(app: RTIApplication | FirstAppealApplication) {
  const isAppeal = 'appealRegistrationNumber' in app;
  const regNo = isAppeal ? (app as FirstAppealApplication).appealRegistrationNumber : (app as RTIApplication).registrationNumber;
  const auth = app.authority;
  const applicant = app.applicant;
  const filedDate = new Date(app.filedOn).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Header Banner Background
  doc.setFillColor(27, 75, 143); // #1B4B8F Ashoka Blue
  doc.rect(margin, y, contentWidth, 22, 'F');

  // Emblem / Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GOVERNMENT OF INDIA / भारत सरकार', pageWidth / 2, y + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.text('RTI ONLINE PORTAL — CENTRAL CITIZEN REGISTRY', pageWidth / 2, y + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    isAppeal
      ? 'STATUTORY FIRST APPEAL ACKNOWLEDGMENT · SECTION 19(1) RTI ACT 2005'
      : 'STATUTORY RTI APPLICATION ACKNOWLEDGMENT RECEIPT · SECTION 6(1) RTI ACT 2005',
    pageWidth / 2,
    y + 18,
    { align: 'center' }
  );

  y += 28;

  // Key Registration Box
  doc.setFillColor(238, 243, 250); // #EEF3FA
  doc.setDrawColor(27, 75, 143);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setTextColor(27, 75, 143);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(isAppeal ? 'APPEAL REGISTRATION NUMBER:' : 'RTI REGISTRATION NUMBER:', margin + 4, y + 6);
  doc.setFontSize(13);
  doc.text(regNo, margin + 4, y + 13);

  doc.setTextColor(87, 93, 101);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Filing Timestamp:', pageWidth - margin - 4, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 30, 34);
  doc.text(filedDate, pageWidth - margin - 4, y + 12, { align: 'right' });

  y += 24;

  // Helper row drawer
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(246, 244, 239);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(27, 75, 143);
    doc.text(title.toUpperCase(), margin + 3, y + 4.2);
    y += 8;
  };

  const drawRow = (label1: string, val1: string, label2?: string, val2?: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(87, 93, 101);
    doc.text(label1, margin + 2, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 30, 34);
    const splitVal1 = doc.splitTextToSize(val1, label2 ? 75 : contentWidth - 4);
    doc.text(splitVal1, margin + 2, y + 4);

    if (label2 && val2) {
      const col2X = margin + (contentWidth / 2) + 2;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(87, 93, 101);
      doc.text(label2, col2X, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 30, 34);
      const splitVal2 = doc.splitTextToSize(val2, (contentWidth / 2) - 4);
      doc.text(splitVal2, col2X, y + 4);
    }

    const rowHeight = Math.max(splitVal1.length * 3.8, label2 && val2 ? 7.5 : 7.5) + 3;
    y += rowHeight;
  };

  // Section 1: Public Authority & Nodal Officer
  drawSectionHeader('1. Public Authority & Officer Details');
  drawRow('Ministry / Department:', auth.ministry || 'Government of India', 'Public Authority Name:', auth.name);
  drawRow('Designated CPIO:', `${auth.cpioName} (${auth.cpioDesignation || 'CPIO'})`, 'Authority Code / SLA:', `${auth.code} · Standard 30 Days SLA`);
  drawRow('First Appellate Authority (FAA):', `${auth.faaName} (${auth.faaDesignation || 'Appellate Authority'})`, 'Official Portal Ref:', 'https://rtionline.gov.in');

  y += 2;

  // Section 2: Applicant & Contact Particulars
  drawSectionHeader('2. Applicant Particulars');
  drawRow('Name of Citizen:', applicant.fullName, 'Gender / Citizenship:', `${applicant.gender || 'Indian Citizen'} · Indian`);
  drawRow('Email Address:', applicant.email, 'Mobile Number:', applicant.mobile);
  drawRow(
    'Postal Address:',
    `${applicant.addressLine1}${applicant.addressLine2 ? ', ' + applicant.addressLine2 : ''}, ${applicant.city || ''}, ${applicant.state || ''} - ${applicant.pincode || ''}`,
    'BPL Status:',
    !isAppeal && (app as RTIApplication).isBplExempt ? 'YES (Statutory Fee Exempt)' : 'NO'
  );

  y += 2;

  // Section 3: Fee & Payment Record
  drawSectionHeader('3. Statutory Fee & Gateway Settlement');
  const rtiApp = app as RTIApplication;
  const feeText = isAppeal
    ? '₹0.00 (Statutory Exemption under Section 19(1))'
    : rtiApp.isBplExempt
    ? '₹0.00 (BPL Fee Waiver under Proviso to Sec 7(5))'
    : `₹${rtiApp.applicationFee || 10}.00 (PAID)`;

  const payRef = !isAppeal ? rtiApp.paymentRef || 'TXN-MOCK-' + Math.floor(Math.random() * 899999 + 100000) : 'NOT APPLICABLE';
  const payMode = !isAppeal ? rtiApp.paymentMethod || 'Online Payment Gateway' : 'Statutory Free Remedy';

  drawRow('Application Fee Status:', feeText, 'Transaction / Order Ref:', payRef);
  drawRow('Settlement Channel:', payMode, 'Statutory Provision:', isAppeal ? 'Section 19(1) of RTI Act 2005' : 'Section 6(1) of RTI Act 2005');

  y += 2;

  // Section 4: Information Query / Ground of Appeal
  drawSectionHeader(isAppeal ? '4. Grounds & Facts of First Appeal' : '4. Particulars of Information Sought (Section 6(1))');

  const queryText = isAppeal
    ? `[Ground: ${(app as FirstAppealApplication).groundLabel || 'Unspecified'}]\n\n${(app as FirstAppealApplication).appealText}`
    : (app as RTIApplication).requestText || 'No query specified';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);

  // Background box for query text
  const splitQuery = doc.splitTextToSize(queryText, contentWidth - 8);
  const queryBoxHeight = Math.min(splitQuery.length * 3.8 + 6, 45);

  doc.setFillColor(250, 249, 246);
  doc.setDrawColor(226, 221, 213);
  doc.roundedRect(margin, y, contentWidth, queryBoxHeight, 1.5, 1.5, 'FD');

  doc.text(splitQuery.slice(0, 11), margin + 4, y + 4.5);
  y += queryBoxHeight + 5;

  // Section 5: Statutory Instructions & Security Verification Seal
  doc.setFillColor(234, 246, 238); // #EAF6EE
  doc.setDrawColor(30, 122, 70);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(17, 80, 44);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STATUTORY DIRECTIVES & CITIZEN REMEDIES:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 70, 40);
  doc.text(
    '1. As per Section 7(1) of RTI Act 2005, the CPIO shall provide information or reject within thirty (30) days from receipt.',
    margin + 4,
    y + 9.5
  );
  doc.text(
    '2. If you do not receive a decision within 30 days or are aggrieved, you may file a First Appeal under Section 19(1).',
    margin + 4,
    y + 13.5
  );
  doc.text(
    '3. This is an electronically generated statutory acknowledgment and does not require physical signature.',
    margin + 4,
    y + 17.5
  );
  doc.setFont('helvetica', 'bold');
  doc.text(`Digital Verification Hash: RTI-${regNo.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`, margin + 4, y + 21.5);

  // Download the PDF file
  const fileName = isAppeal ? `First_Appeal_Receipt_${regNo.replace(/\//g, '_')}.pdf` : `RTI_Receipt_${regNo.replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
}
