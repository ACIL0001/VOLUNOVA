import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { logAuditEvent } from './auditLogger';

export interface MissionEmailParams {
  to: string;
  volunteerName: string;
  missionTitle: string;
  roleName: string;
  orgName?: string;
  venue: string;
  date?: Date | string;
  hours?: number;
  applicationId?: string;
}

let resendClient: Resend | null = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'mock_resend_key') {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Nodemailer Transporter Setup
let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Graceful Local Test Transporter (Ethereal test account)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EmailService] Initialized Ethereal Test Account: ${testAccount.user}`);
  } catch (err) {
    // Fallback JSON transporter (console output)
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

/**
 * Generate a high-end, responsive HTML confirmation email
 */
function generateConfirmationHtml(params: MissionEmailParams): string {
  const qrCode = `VOL-${params.applicationId?.slice(-6).toUpperCase() || 'DZ-2026'}`;
  const formattedDate = params.date
    ? new Date(params.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Samedi prochain à 08h30';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOLUNOVA — Confirmation de Mission</title>
</head>
<body style="margin:0;padding:0;background-color:#060a12;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#060a12;padding:30px 10px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background:#0c1633;border:1px solid #1e3a8a;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Gradient Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#0284c7 100%);padding:30px 24px;text-align:center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#070b16;padding:10px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);margin-bottom:12px;">
                      <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:2px;">VOLUNOVA</span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Félicitations, ${params.volunteerName} ! 🎉</h1>
                    <p style="margin:6px 0 0 0;color:#bae6fd;font-size:14px;">Votre inscription sur le terrain est officiellement confirmée.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#cbd5e1;">
                L'organisation <strong style="color:#ffffff;">${params.orgName || 'Partenaire VOLUNOVA'}</strong> compte sur votre présence. Vos compétences ont été sélectionnées par notre algorithme de correspondance instantané.
              </p>

              <!-- Mission Pass Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#070e24;border:1px solid #1e2b4d;border-radius:16px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Passeport de Mission Terrain</div>
                    <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:14px;">${params.missionTitle}</div>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.8;">
                      <tr>
                        <td width="35%" style="color:#94a3b8;">🎯 Rôle assigné :</td>
                        <td style="color:#38bdf8;font-weight:700;">${params.roleName}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;">📍 Lieu de ralliement :</td>
                        <td style="color:#ffffff;font-weight:600;">${params.venue}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;">🗓️ Horaire :</td>
                        <td style="color:#ffffff;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="color:#94a3b8;">⏱️ Impact certifié :</td>
                        <td style="color:#10b981;font-weight:700;">+${params.hours || 4} heures ajoutées à votre Passeport</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- QR Check-in Code Simulation -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#050914;border:1px dashed #2563eb;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <span style="font-size:12px;color:#94a3b8;font-weight:600;display:block;margin-bottom:6px;">CODE DE POINTAGE PRÉSENTIEL</span>
                    <span style="font-size:22px;font-family:monospace;font-weight:900;color:#38bdf8;letter-spacing:4px;background:#0c1735;padding:6px 16px;border-radius:8px;border:1px solid #38bdf8;">${qrCode}</span>
                    <span style="font-size:11px;color:#64748b;display:block;margin-top:8px;">Présentez ce code ou l'application mobile aux coordinateurs sur le terrain.</span>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="text-align:center;margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000/demo" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;box-shadow:0 6px 20px rgba(37,99,235,0.4);">
                      Accéder à la Salle des Opérations
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Arabic Greeting & Support -->
              <div style="direction:rtl;text-align:right;border-top:1px solid #1e2b4d;padding-top:16px;margin-top:16px;">
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                  نشكرك على روح المبادرة والتضامن المجتمعي. حضورك يصنع الفارق الحقيقي في الميدان!
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#070b18;padding:16px 24px;text-align:center;border-top:1px solid #15223e;">
              <p style="margin:0;color:#64748b;font-size:11px;">
                © 2026 VOLUNOVA (تكاتف الذكي) — Plateforme Nationale du Bénévolat Propulsée par l'IA.
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
 * Dispatch confirmation email to volunteer upon RSVP
 */
export async function sendMissionAcceptedEmail(params: MissionEmailParams): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  try {
    const htmlContent = generateConfirmationHtml(params);
    const subject = `🎉 Mission confirmée : ${params.missionTitle} (${params.roleName}) — VOLUNOVA`;

    // 1. Try Resend if configured
    if (resendClient) {
      try {
        const res = await resendClient.emails.send({
          from: process.env.EMAIL_FROM || 'VOLUNOVA <onboarding@resend.dev>',
          to: params.to,
          subject,
          html: htmlContent,
        });

        console.log(`[EmailService] Dispatched via Resend: ID ${res.data?.id}`);
        await logAuditEvent('email.sent_resend', params.applicationId || 'unknown', {
          to: params.to,
          mission: params.missionTitle,
        });

        return { success: true, messageId: res.data?.id };
      } catch (resendErr: any) {
        console.warn('[EmailService] Resend failed, falling back to Nodemailer:', resendErr.message);
      }
    }

    // 2. Send via Nodemailer (SMTP or Ethereal test)
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"VOLUNOVA تكاتف" <noreply@volunova.dz>',
      to: params.to,
      subject,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[EmailService] Dispatched via Nodemailer: Message ID ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] 🔗 Live Ethereal Email Preview URL: ${previewUrl}`);
    }

    await logAuditEvent('email.sent_nodemailer', params.applicationId || 'unknown', {
      to: params.to,
      mission: params.missionTitle,
      previewUrl,
    });

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error: any) {
    console.error('[EmailService] Failed to dispatch email:', error.message);
    return { success: false };
  }
}
