import { RTIApplication, FirstAppealApplication } from '../types/rti';
import { generateRtiReceiptPdf } from './pdfGenerator';

/**
 * Robust cross-browser and iframe-safe receipt printing utility
 */
export function printReceipt(target: RTIApplication | FirstAppealApplication): void {
  if (!target) return;

  const isAppeal = 'appealRegistrationNumber' in target;
  const regNo = isAppeal
    ? (target as FirstAppealApplication).appealRegistrationNumber
    : (target as RTIApplication).registrationNumber;
  const auth = target.authority;
  const applicant = target.applicant;
  const filedFormatted = new Date(target.filedOn).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const rtiApp = !isAppeal ? (target as RTIApplication) : null;
  const feeText = isAppeal
    ? '₹0.00 (Statutory Exemption under Section 19(1))'
    : rtiApp?.isBplExempt
    ? '₹0.00 (BPL Fee Waiver under Proviso to Sec 7(5))'
    : `₹${rtiApp?.applicationFee || 10}.00 (PAID)`;

  const payRef = !isAppeal
    ? rtiApp?.paymentRef || 'TXN-' + Math.floor(Math.random() * 899999 + 100000)
    : 'NOT APPLICABLE';
  const payMode = !isAppeal
    ? rtiApp?.paymentMethod || 'Online Payment Gateway (Bharatkosh / Netbanking / UPI)'
    : 'Statutory Free Remedy';

  const queryText = isAppeal
    ? `[Ground: ${(target as FirstAppealApplication).groundLabel || 'Unspecified'}]\n\n${(target as FirstAppealApplication).appealText}`
    : rtiApp?.requestText || 'No query specified';

  const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>RTI Online Receipt - ${regNo}</title>
  <style>
    @page {
      margin: 12mm;
      size: A4 portrait;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1B1E22;
      background: #FFFFFF;
      margin: 0;
      padding: 16px;
      font-size: 12px;
      line-height: 1.45;
    }
    .header {
      background-color: #1B4B8F !important;
      color: #FFFFFF !important;
      padding: 14px 18px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 16px;
    }
    .header h1 {
      margin: 0 0 2px 0;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header h2 {
      margin: 0 0 2px 0;
      font-size: 13px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 10px;
      opacity: 0.92;
    }
    .reg-box {
      background: #EEF3FA !important;
      border: 1.5px solid #1B4B8F;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .reg-title {
      font-size: 10px;
      font-weight: 700;
      color: #1B4B8F;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .reg-number {
      font-family: "Courier New", Courier, monospace;
      font-size: 18px;
      font-weight: 700;
      color: #1B4B8F;
      letter-spacing: 0.5px;
    }
    .timestamp {
      text-align: right;
      font-size: 10px;
      color: #575D65;
    }
    .timestamp b {
      color: #1B1E22;
      display: block;
      font-size: 11px;
    }
    .section {
      margin-bottom: 14px;
      border: 1px solid #E2DDD5;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .section-title {
      background: #F6F4EF !important;
      color: #1B4B8F;
      font-weight: 700;
      font-size: 11px;
      padding: 6px 12px;
      border-bottom: 1px solid #E2DDD5;
      text-transform: uppercase;
    }
    .section-body {
      padding: 10px 12px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    .label {
      font-size: 10px;
      color: #575D65;
      margin-bottom: 1px;
    }
    .val {
      font-weight: 600;
      font-size: 11.5px;
      color: #1B1E22;
      word-break: break-word;
    }
    .query-box {
      background: #FAF9F5 !important;
      border: 1px solid #E2DDD5;
      padding: 8px 10px;
      border-radius: 4px;
      font-family: "Courier New", Courier, monospace;
      font-size: 10.5px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.4;
    }
    .statutory-box {
      background: #EAF6EE !important;
      border: 1px solid #1E7A46;
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 14px;
      font-size: 10px;
      color: #11502C;
      page-break-inside: avoid;
    }
    .statutory-box h4 {
      margin: 0 0 4px 0;
      font-size: 11px;
      font-weight: 700;
      color: #11502C;
    }
    .statutory-box ul {
      margin: 0;
      padding-left: 16px;
    }
    .statutory-box li {
      margin-bottom: 2px;
    }
    .digital-hash {
      margin-top: 6px;
      font-weight: 700;
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GOVERNMENT OF INDIA / भारत सरकार</h1>
    <h2>RTI ONLINE PORTAL — CENTRAL CITIZEN REGISTRY</h2>
    <p>${
      isAppeal
        ? 'STATUTORY FIRST APPEAL ACKNOWLEDGMENT · SECTION 19(1) RTI ACT 2005'
        : 'STATUTORY RTI APPLICATION ACKNOWLEDGMENT RECEIPT · SECTION 6(1) RTI ACT 2005'
    }</p>
  </div>

  <div class="reg-box">
    <div>
      <div class="reg-title">${isAppeal ? 'Appeal Registration Number' : 'RTI Registration Number'}</div>
      <div class="reg-number">${regNo}</div>
    </div>
    <div class="timestamp">
      Filing Timestamp:
      <b>${filedFormatted}</b>
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. Public Authority & Officer Details</div>
    <div class="section-body grid-2">
      <div>
        <div class="label">Ministry / Department</div>
        <div class="val">${auth?.ministry || 'Government of India'}</div>
      </div>
      <div>
        <div class="label">Public Authority Name</div>
        <div class="val">${auth?.name || 'Central Public Authority'}</div>
      </div>
      <div>
        <div class="label">Designated CPIO</div>
        <div class="val">${auth?.cpioName || 'Central Public Information Officer'} (${auth?.cpioDesignation || 'CPIO'})</div>
      </div>
      <div>
        <div class="label">Authority Code / SLA</div>
        <div class="val">${auth?.code || 'CPA'} · Standard 30 Days SLA</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Applicant Particulars</div>
    <div class="section-body grid-2">
      <div>
        <div class="label">Name of Citizen</div>
        <div class="val">${applicant?.fullName || 'Citizen'}</div>
      </div>
      <div>
        <div class="label">Gender / Citizenship</div>
        <div class="val">${applicant?.gender || 'Citizen'} · Indian</div>
      </div>
      <div>
        <div class="label">Email Address</div>
        <div class="val">${applicant?.email || 'N/A'}</div>
      </div>
      <div>
        <div class="label">Mobile Number</div>
        <div class="val">${applicant?.mobile || 'N/A'}</div>
      </div>
      <div style="grid-column: span 2;">
        <div class="label">Postal Address</div>
        <div class="val">${applicant?.addressLine1 || ''}${applicant?.addressLine2 ? ', ' + applicant.addressLine2 : ''}, ${applicant?.city || ''}, ${applicant?.state || ''} - ${applicant?.pincode || ''}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">3. Statutory Fee & Gateway Settlement</div>
    <div class="section-body grid-2">
      <div>
        <div class="label">Application Fee Status</div>
        <div class="val">${feeText}</div>
      </div>
      <div>
        <div class="label">Transaction / Order Reference</div>
        <div class="val">${payRef}</div>
      </div>
      <div>
        <div class="label">Settlement Channel</div>
        <div class="val">${payMode}</div>
      </div>
      <div>
        <div class="label">Statutory Remedy Provision</div>
        <div class="val">${isAppeal ? 'Section 19(1) of RTI Act 2005' : 'Section 6(1) of RTI Act 2005'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">${isAppeal ? '4. Grounds & Facts of First Appeal' : '4. Particulars of Information Sought (Section 6(1))'}</div>
    <div class="section-body">
      <div class="query-box">${escapeHtml(queryText)}</div>
    </div>
  </div>

  <div class="statutory-box">
    <h4>STATUTORY DIRECTIVES & CITIZEN REMEDIES:</h4>
    <ul>
      <li>As per Section 7(1) of RTI Act 2005, the CPIO shall provide information or reject the request within thirty (30) days from receipt.</li>
      <li>If you do not receive a decision within 30 days or are aggrieved, you may file a First Appeal under Section 19(1).</li>
      <li>This is an electronically generated statutory acknowledgment and does not require a physical signature.</li>
    </ul>
    <div class="digital-hash">
      Digital Verification Hash: RTI-${regNo.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}
    </div>
  </div>
</body>
</html>`;

  // Strategy 1: Hidden Iframe Print (cleanest, prints only the receipt without UI navbar/buttons)
  try {
    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('aria-hidden', 'true');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(receiptHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print failed, attempting window.print fallback:', iframeErr);
          window.focus();
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 3000);
        }
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('Print iframe creation error:', err);
  }

  // Strategy 2: Window Print Fallback
  try {
    window.focus();
    window.print();
  } catch (winPrintErr) {
    console.warn('window.print() failed, auto-generating PDF:', winPrintErr);
    generateRtiReceiptPdf(target);
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
