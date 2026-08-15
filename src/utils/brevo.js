/**
 * Brevo (Sendinblue) Transactional Email Service Utility
 * For ADAGE'26 National Level Technical Symposium
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Read strictly from environment variables - NO hardcoded API keys in source code
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_BREVO_API_KEY || "";
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_BREVO_API_KEY || process.env.BREVO_API_KEY || "";
  }
  return "";
};

const getSenderEmail = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_BREVO_SENDER_EMAIL || "civiladagegce@gmail.com";
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_BREVO_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "civiladagegce@gmail.com";
  }
  return "civiladagegce@gmail.com";
};

/**
 * Builds a styled HTML email template for registration receipt & payment review
 */
export function generateRegistrationEmailHtml({
  id,
  name,
  college,
  department,
  email,
  phone,
  events = [],
  teamMembers = [],
  totalFee = 0,
  transactionId = ""
}) {
  const eventsListHtml = events.length > 0
    ? events.map(e => `<li style="margin-bottom: 6px; color: #EDEBE6; font-size: 14px;"><strong>•</strong> ${escapeHtml(e)}</li>`).join("")
    : `<li style="color: #999; font-size: 14px;">No events listed</li>`;

  const teamMembersHtml = teamMembers && teamMembers.length > 0
    ? teamMembers.map((m, idx) => `<li style="margin-bottom: 4px; color: #EDEBE6; font-size: 13px;">#${idx + 2}: ${escapeHtml(m)}</li>`).join("")
    : `<span style="color: #888; font-size: 13px; font-style: italic;">Individual Participant</span>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ADAGE'26 Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #EDEBE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #0D0D0D; border: 1px solid rgba(200, 146, 42, 0.3); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          
          <!-- Gold Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #996B15 0%, #C8922A 50%, #F5CE68 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center; background-color: #111111; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 11px; letter-spacing: 4px; color: #C8922A; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
                GOVERNMENT COLLEGE OF ENGINEERING
              </div>
              <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #EDEBE6; text-transform: uppercase;">
                ADAGE<span style="color: #C8922A;">'26</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #8E8E93; letter-spacing: 1.5px; text-transform: uppercase;">
                Department of Civil Engineering • Annual Technical Symposium
              </p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="padding: 24px 30px 16px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(200, 146, 42, 0.08); border: 1px solid rgba(200, 146, 42, 0.25); border-radius: 6px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #C8922A; text-transform: uppercase; margin-bottom: 6px;">
                      ● STATUS: REGISTRATION RECEIVED • PAYMENT UNDER REVIEW
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #D1D1D6;">
                      Hello <strong style="color: #EDEBE6;">${escapeHtml(name)}</strong>,<br>
                      Your registration for <strong>ADAGE'26</strong> has been received successfully! Your payment details (UTR: <span style="color: #C8922A; font-weight: 700;">${escapeHtml(transactionId)}</span>) are currently <strong>under review</strong> by our organizing committee. Once verified, you will be contacted soon with your confirmed pass.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registration ID Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #151515; border: 1px dashed rgba(200, 146, 42, 0.4); border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">REGISTRATION REF ID</span>
                    <strong style="font-size: 18px; color: #C8922A; font-family: monospace; letter-spacing: 2px;">${escapeHtml(id)}</strong>
                  </td>
                  <td width="50%" align="right" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">PAYMENT STATUS</span>
                    <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      Verification Pending
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Participant & Institution Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    01 // CANDIDATE & INSTITUTION DETAILS
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 4px 0; font-size: 12px; color: #888; width: 40%;">Candidate Name:</td>
                  <td style="padding: 10px 0 4px 0; font-size: 13px; color: #EDEBE6; font-weight: 600;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">College:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(college)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Department:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(department)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Email Address:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #C8922A;">${escapeHtml(email)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Contact Phone:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(phone)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registered Events -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    02 // REGISTERED COMPETITIONS
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <ul style="margin: 0; padding-left: 18px; list-style-type: none;">
                      ${eventsListHtml}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Team Members (If Any) -->
          ${teamMembers && teamMembers.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    03 // TEAM MEMBERS
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <ul style="margin: 0; padding-left: 18px; list-style-type: none;">
                      ${teamMembersHtml}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Payment Breakdown -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    04 // PAYMENT TRANSACTION RECORD
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 4px 0; font-size: 12px; color: #888;">Transaction UTR / Ref:</td>
                  <td style="padding: 10px 0 4px 0; font-size: 14px; font-family: monospace; color: #C8922A; font-weight: 700;">${escapeHtml(transactionId)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Total Amount:</td>
                  <td style="padding: 4px 0; font-size: 16px; color: #10B981; font-weight: 800;">₹${escapeHtml(String(totalFee))}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps & Verification Notice -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #141414; border-left: 3px solid #C8922A; padding: 16px; border-radius: 0 6px 6px 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #EDEBE6; text-transform: uppercase; letter-spacing: 1px;">What Happens Next?</h4>
                <p style="margin: 0; font-size: 12px; color: #A0A0A5; line-height: 1.5;">
                  1. Our organizing & finance committee will review your payment transaction against records.<br>
                  2. We will contact you soon with your verified entry confirmation.<br>
                  3. You can also check your live status anytime on the ADAGE'26 portal using your registered email (<span style="color: #C8922A;">${escapeHtml(email)}</span>).
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0A0A0A; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #777; letter-spacing: 1px;">
                ADAGE'26 ORGANIZING COMMITTEE • DEPARTMENT OF CIVIL ENGINEERING
              </p>
              <p style="margin: 0; font-size: 10px; color: #555;">
                Government College of Engineering • Contact: <a href="mailto:civilagegce@gmail.com" style="color: #C8922A; text-decoration: none;">civilagegce@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Escapes HTML characters to prevent XSS / broken markup in email body
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Builds a styled HTML email template for Payment Confirmed / Entry Pass Activated
 */
export function generatePaymentConfirmedEmailHtml({
  id,
  name,
  college,
  department,
  email,
  phone,
  events = [],
  teamMembers = [],
  totalFee = 0,
  transactionId = ""
}) {
  const eventsListHtml = events.length > 0
    ? events.map(e => `<li style="margin-bottom: 6px; color: #EDEBE6; font-size: 14px;"><strong>•</strong> ${escapeHtml(e)}</li>`).join("")
    : `<li style="color: #999; font-size: 14px;">No events listed</li>`;

  const teamMembersHtml = teamMembers && teamMembers.length > 0
    ? teamMembers.map((m, idx) => `<li style="margin-bottom: 4px; color: #EDEBE6; font-size: 13px;">#${idx + 2}: ${escapeHtml(m)}</li>`).join("")
    : `<span style="color: #888; font-size: 13px; font-style: italic;">Individual Participant</span>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - ADAGE'26</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #EDEBE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #0D0D0D; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          
          <!-- Green Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center; background-color: #111111; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 11px; letter-spacing: 4px; color: #10B981; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
                GOVERNMENT COLLEGE OF ENGINEERING
              </div>
              <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #EDEBE6; text-transform: uppercase;">
                ADAGE<span style="color: #C8922A;">'26</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #8E8E93; letter-spacing: 1.5px; text-transform: uppercase;">
                Department of Civil Engineering • Annual Technical Symposium
              </p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding: 24px 30px 16px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #10B981; text-transform: uppercase; margin-bottom: 6px;">
                      ✓ PAYMENT VERIFIED & ENTRY PASS ACTIVATED
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #D1D1D6;">
                      Dear <strong style="color: #EDEBE6;">${escapeHtml(name)}</strong>,<br>
                      Great news! Your payment of <strong style="color: #10B981;">₹${escapeHtml(String(totalFee))}</strong> (UTR: <span style="color: #C8922A; font-weight: 700;">${escapeHtml(transactionId)}</span>) has been officially <strong>verified and approved</strong> by the organizing committee. Your official entry pass for <strong>ADAGE'26</strong> is now active!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registration ID Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #151515; border: 1px dashed rgba(16, 185, 129, 0.4); border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">ENTRY PASS ID</span>
                    <strong style="font-size: 18px; color: #10B981; font-family: monospace; letter-spacing: 2px;">${escapeHtml(id)}</strong>
                  </td>
                  <td width="50%" align="right" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">STATUS</span>
                    <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      CONFIRMED (PAID)
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Participant & Institution Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    01 // PARTICIPANT DETAILS
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 4px 0; font-size: 12px; color: #888; width: 40%;">Candidate Name:</td>
                  <td style="padding: 10px 0 4px 0; font-size: 13px; color: #EDEBE6; font-weight: 600;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">College:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(college)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Department:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(department)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888;">Contact Phone:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #EDEBE6;">${escapeHtml(phone)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registered Events -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    02 // CONFIRMED COMPETITIONS
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <ul style="margin: 0; padding-left: 18px; list-style-type: none;">
                      ${eventsListHtml}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Team Members (If Any) -->
          ${teamMembers && teamMembers.length > 0 ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="font-size: 11px; letter-spacing: 2px; color: #C8922A; font-weight: 700; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    03 // TEAM MEMBERS
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <ul style="margin: 0; padding-left: 18px; list-style-type: none;">
                      ${teamMembersHtml}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Event Day Instructions Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #141414; border-left: 3px solid #10B981; padding: 16px; border-radius: 0 6px 6px 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #10B981; text-transform: uppercase; letter-spacing: 1px;">Event Day Information</h4>
                <p style="margin: 0; font-size: 12px; color: #A0A0A5; line-height: 1.6;">
                  📍 <strong>Venue:</strong> Department of Civil Engineering, Government College of Engineering, Erode<br>
                  ⏰ <strong>Reporting Time:</strong> 08:30 AM IST<br>
                  🎫 <strong>Entry Check-in:</strong> Please carry your College ID Card and keep your Reference ID (<strong style="color: #EDEBE6;">${escapeHtml(id)}</strong>) handy for on-spot check-in at the gate.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0A0A0A; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #777; letter-spacing: 1px;">
                ADAGE'26 ORGANIZING COMMITTEE • DEPARTMENT OF CIVIL ENGINEERING
              </p>
              <p style="margin: 0; font-size: 10px; color: #555;">
                Government College of Engineering • Contact: <a href="mailto:civiladagegce@gmail.com" style="color: #C8922A; text-decoration: none;">civiladagegce@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds a styled HTML email template for Payment Rejected / Verification Issue
 */
export function generatePaymentRejectedEmailHtml({
  id,
  name,
  college,
  department,
  email,
  phone,
  events = [],
  teamMembers = [],
  totalFee = 0,
  transactionId = ""
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verification Notice - ADAGE'26</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #EDEBE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" max-width="620" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #0D0D0D; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          
          <!-- Red Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #DC2626 0%, #EF4444 50%, #F87171 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; text-align: center; background-color: #111111; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 11px; letter-spacing: 4px; color: #EF4444; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
                GOVERNMENT COLLEGE OF ENGINEERING
              </div>
              <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #EDEBE6; text-transform: uppercase;">
                ADAGE<span style="color: #C8922A;">'26</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #8E8E93; letter-spacing: 1.5px; text-transform: uppercase;">
                Department of Civil Engineering • Annual Technical Symposium
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 24px 30px 16px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 18px 20px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #EF4444; text-transform: uppercase; margin-bottom: 6px;">
                      ✕ PAYMENT VERIFICATION UNSUCCESSFUL
                    </div>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #D1D1D6;">
                      Dear <strong style="color: #EDEBE6;">${escapeHtml(name)}</strong>,<br>
                      Our finance & organizing team was unable to verify the transaction for your registration with submitted UTR / Ref: <span style="color: #EF4444; font-weight: 700;">${escapeHtml(transactionId)}</span> (Amount: ₹${escapeHtml(String(totalFee))}).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Registration ID Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #151515; border: 1px dashed rgba(239, 68, 68, 0.4); border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">REGISTRATION REF ID</span>
                    <strong style="font-size: 18px; color: #EF4444; font-family: monospace; letter-spacing: 2px;">${escapeHtml(id)}</strong>
                  </td>
                  <td width="50%" align="right" style="vertical-align: middle;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; display: block; margin-bottom: 2px;">PAYMENT STATUS</span>
                    <span style="display: inline-block; background-color: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                      REJECTED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Steps Notice -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #141414; border-left: 3px solid #EF4444; padding: 18px; border-radius: 0 6px 6px 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #EF4444; text-transform: uppercase; letter-spacing: 1px;">What Should You Do?</h4>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #A0A0A5; line-height: 1.6;">
                  1. <strong>If you have already made the payment:</strong> Please email your payment screenshot and bank receipt along with your Registration ID (<strong style="color: #EDEBE6;">${escapeHtml(id)}</strong>) to <a href="mailto:civiladagegce@gmail.com" style="color: #C8922A; text-decoration: none; font-weight: 700;">civiladagegce@gmail.com</a> for manual verification.<br>
                  2. <strong>If the UTR number was entered incorrectly:</strong> Please reach out to our team to rectify your transaction details.<br>
                  3. <strong>If you need help:</strong> Contact our helpline or check the verification status page on the portal.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0A0A0A; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #777; letter-spacing: 1px;">
                ADAGE'26 ORGANIZING COMMITTEE • DEPARTMENT OF CIVIL ENGINEERING
              </p>
              <p style="margin: 0; font-size: 10px; color: #555;">
                Government College of Engineering • Contact: <a href="mailto:civiladagegce@gmail.com" style="color: #C8922A; text-decoration: none;">civiladagegce@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends registration confirmation email via Brevo REST API
 */
export async function sendRegistrationSuccessEmail(registrationData) {
  const apiKey = getApiKey();
  const senderEmail = getSenderEmail();

  if (!apiKey || !registrationData || !registrationData.email) {
    console.warn("Brevo API key or recipient email missing");
    return { success: false, error: "Missing API key or recipient email" };
  }

  const recipientEmail = registrationData.email.trim();
  const recipientName = registrationData.name ? registrationData.name.trim() : "Participant";
  const htmlContent = generateRegistrationEmailHtml(registrationData);

  const payload = {
    sender: {
      name: "ADAGE'26 - Civil Engineering Symposium",
      email: senderEmail
    },
    to: [
      {
        email: recipientEmail,
        name: recipientName
      }
    ],
    subject: `Registration Received - ADAGE'26 (Ref: ${registrationData.id || 'Pending'})`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Brevo API error on registration email:", result);
      return { success: false, error: result.message || "Failed to dispatch email" };
    }
    console.log("Brevo registration email sent! Message ID:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error("Error dispatching registration email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends payment confirmed email via Brevo REST API
 */
export async function sendPaymentConfirmedEmail(registrationData) {
  const apiKey = getApiKey();
  const senderEmail = getSenderEmail();

  if (!apiKey || !registrationData || !registrationData.email) {
    return { success: false, error: "Missing API key or recipient email" };
  }

  const recipientEmail = registrationData.email.trim();
  const recipientName = registrationData.name ? registrationData.name.trim() : "Participant";
  const htmlContent = generatePaymentConfirmedEmailHtml(registrationData);

  const payload = {
    sender: {
      name: "ADAGE'26 - Civil Engineering Symposium",
      email: senderEmail
    },
    to: [
      {
        email: recipientEmail,
        name: recipientName
      }
    ],
    subject: `Payment Confirmed & Entry Pass Activated - ADAGE'26 (Ref: ${registrationData.id || 'Confirmed'})`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Brevo API error on payment confirmed email:", result);
      return { success: false, error: result.message || "Failed to dispatch email" };
    }
    console.log("Brevo payment confirmed email sent! Message ID:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error("Error dispatching payment confirmed email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends payment rejected email via Brevo REST API
 */
export async function sendPaymentRejectedEmail(registrationData) {
  const apiKey = getApiKey();
  const senderEmail = getSenderEmail();

  if (!apiKey || !registrationData || !registrationData.email) {
    return { success: false, error: "Missing API key or recipient email" };
  }

  const recipientEmail = registrationData.email.trim();
  const recipientName = registrationData.name ? registrationData.name.trim() : "Participant";
  const htmlContent = generatePaymentRejectedEmailHtml(registrationData);

  const payload = {
    sender: {
      name: "ADAGE'26 - Civil Engineering Symposium",
      email: senderEmail
    },
    to: [
      {
        email: recipientEmail,
        name: recipientName
      }
    ],
    subject: `Payment Verification Notice - ADAGE'26 (Ref: ${registrationData.id || 'Notice'})`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Brevo API error on payment rejected email:", result);
      return { success: false, error: result.message || "Failed to dispatch email" };
    }
    console.log("Brevo payment rejected email sent! Message ID:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error("Error dispatching payment rejected email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to automatically dispatch the right email based on updated status
 */
export async function sendPaymentStatusEmail(registrationData, newStatus) {
  if (!registrationData) return { success: false, error: "No registration data" };

  const norm = String(newStatus).toUpperCase();
  if (norm.includes("CONFIRM")) {
    return sendPaymentConfirmedEmail(registrationData);
  } else if (norm.includes("REJECT")) {
    return sendPaymentRejectedEmail(registrationData);
  }

  return { success: false, error: "No email template required for status: " + newStatus };
}
