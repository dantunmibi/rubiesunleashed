/**
 * ================================================================
 * EMAIL SERVICE - Gmail SMTP (Memory-Optimized)
 * ================================================================
 */

import nodemailer from "nodemailer";

// ✅ FIX: Lazy transporter initialization
let transporter = null;

function getTransporter() {
  if (!transporter) {
    console.log("📧 Initializing email transporter...");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD?.replace(/\s/g, ""),
      },
      pool: true, // ✅ Enable connection pooling
      maxConnections: 5, // ✅ Limit concurrent connections
      maxMessages: 100, // ✅ Reuse connections
      rateDelta: 1000, // ✅ 1 second between batches
      rateLimit: 5, // ✅ Max 5 emails per rateDelta
    });
  }
  return transporter;
}

/**
 * Send admin comment notification email
 */
export async function sendAdminCommentEmail({
  to,
  developerUsername,
  projectTitle,
  commentType,
  comment,
  adminUsername,
  createdAt,
}) {
  try {
    if (!to || !developerUsername || !projectTitle || !comment) {
      throw new Error("Missing required email fields");
    }

    const isModeration = commentType === "moderation";
    const subject = isModeration
      ? `⚠️ Moderation Notice - ${projectTitle}`
      : `💬 Admin Feedback - ${projectTitle}`;

    const greeting = `Hello ${developerUsername}`;
    const actionType = isModeration ? "a moderation notice" : "feedback";

    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : new Date().toLocaleString();

    const textContent = `${greeting},

The Rubies Unleashed admin team has left ${actionType} on your project "${projectTitle}":

────────────────────────────────
${comment}
────────────────────────────────

From: ${adminUsername}
Date: ${formattedDate}

View your project dashboard:
https://rubiesunleashed.app/${developerUsername}/dashboard

Best regards,
The Rubies Unleashed Team

────────────────────────────────
You received this email because you have a project on Rubies Unleashed.
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #161b2c; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(to right, transparent, ${
              isModeration ? "#f59e0b" : "#8b5cf6"
            }, transparent); height: 4px;"></td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #e2e8f0;">${greeting},</p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1;">
                The Rubies Unleashed admin team has left <strong style="color: #fff;">${actionType}</strong> on your project <strong style="color: #fff;">"${projectTitle}"</strong>:
              </p>
              <div style="background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
                  <span style="margin-right: 8px;">${
                    isModeration ? "⚠️" : "💬"
                  }</span>
                  Platform Team Message
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #fff;">${comment}</p>
              </div>
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; margin-top: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 12px; color: #64748b;">
                      From: <span style="color: #94a3b8; font-family: 'Courier New', monospace;">${adminUsername}</span>
                    </td>
                    <td align="right" style="font-size: 12px; color: #64748b;">${formattedDate}</td>
                  </tr>
                </table>
              </div>
              <div style="margin-top: 32px; text-align: center;">
                <a href="https://rubiesunleashed.app/${developerUsername}/dashboard" style="display: inline-block; background-color: ${
                  isModeration ? "#f59e0b" : "#8b5cf6"
                }; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                  View Dashboard
                </a>
              </div>
              <p style="margin: 32px 0 0 0; font-size: 14px; color: #cbd5e1;">Best regards,<br><strong style="color: #fff;">The Rubies Unleashed Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0; font-size: 11px; color: #64748b;">You received this email because you have a project on Rubies Unleashed.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email based on user's archetype
 */
export async function sendWelcomeEmail({ to, username, archetype }) {
  try {
    if (!to || !username || !archetype) {
      throw new Error("Missing required fields for welcome email");
    }

    const archetypeContent = {
      hunter: {
        icon: "🎮",
        color: "#E0115F",
        title: "Hunter",
        headline: "Your personalized game vault is ready!",
        features: [
          "Latest games first in your feed",
          "Curated action & shooter recommendations",
          "One-click wishlist management",
        ],
        ctaText: "Start Hunting",
        closing: "Happy gaming",
      },
      netrunner: {
        icon: "💻",
        color: "#06b6d4",
        title: "Netrunner",
        headline: "Your tech arsenal is online!",
        features: [
          "Tools and apps prioritized in your feed",
          "Developer utilities and software",
          "Cutting-edge digital innovations",
        ],
        ctaText: "Browse Tools",
        closing: "Stay sharp",
      },
      curator: {
        icon: "📚",
        color: "#f59e0b",
        title: "Curator",
        headline: "Your collection starts here!",
        features: [
          "Top-rated content first",
          "Hidden gems curated for quality",
          "Timeless classics and modern hits",
        ],
        ctaText: "Explore Curated Picks",
        closing: "Discover excellence",
      },
      phantom: {
        icon: "👤",
        color: "#8b5cf6",
        title: "Phantom",
        headline: "The underground awaits.",
        features: [
          "Randomized discovery feed",
          "Off-the-beaten-path content",
          "Mysterious selections you won't find elsewhere",
        ],
        ctaText: "Discover Hidden Gems",
        closing: "Stay elusive",
      },
    };

    const content =
      archetypeContent[archetype.toLowerCase()] || archetypeContent.hunter;
    const subject = `Welcome to Rubies Unleashed, ${content.title}! ${content.icon}`;

    // Simplified text version (keep existing)
    const textContent = `Hi ${username},

${content.headline}

As a ${content.title}, you'll get:
${content.features.map((f) => `• ${f}`).join("\n")}

Your dashboard awaits: https://rubiesunleashed.app/

${content.closing},
Rubies Unleashed Team`;

    // Minimal HTML (reduced size)
    const htmlContent = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#e2e8f0;padding:40px"><div style="max-width:600px;margin:0 auto;background:#161b2c;border:1px solid rgba(224,17,95,0.2);border-radius:16px;overflow:hidden"><div style="background:linear-gradient(to right,transparent,${
      content.color
    },transparent);height:4px"></div><div style="padding:40px"><div style="text-align:center;margin-bottom:32px"><div style="font-size:64px">${
      content.icon
    }</div><h1 style="color:#fff;text-transform:uppercase">Welcome, ${
      content.title
    }</h1></div><p>Hi <strong>${username}</strong>,</p><p style="font-size:18px;color:#fff">${
      content.headline
    }</p><div style="background:rgba(0,0,0,0.3);border-left:4px solid ${
      content.color
    };padding:20px;margin:24px 0">${content.features
      .map((f) => `<p style="margin:8px 0;color:#cbd5e1">✦ ${f}</p>`)
      .join(
        "",
      )}</div><div style="text-align:center;margin:32px 0"><a href="https://rubiesunleashed.app/" style="display:inline-block;background:${
      content.color
    };color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:bold;text-transform:uppercase">${
      content.ctaText
    }</a></div><p>${
      content.closing
    },<br><strong>Rubies Unleashed Team</strong></p>
<div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:24px">
  <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Follow Us</p>
  <table cellpadding="0" cellspacing="0">
    <tr><td style="padding:4px 0"><a href="https://twitter.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">𝕏</span><span style="color:#94a3b8;">twitter.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span></a></td></tr>
    <tr><td style="padding:4px 0"><a href="https://www.instagram.com/official_rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">📸</span><span style="color:#94a3b8;">instagram.com/</span><span style="color:#fff;font-weight:600;">official_rubiesunleashed</span></a></td></tr>
    <tr><td style="padding:4px 0"><a href="https://facebook.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">📘</span><span style="color:#94a3b8;">facebook.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span></a></td></tr>
    <tr><td style="padding:4px 0"><a href="https://discord.gg/zgCh55JfWF" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">💬</span><span style="color:#94a3b8;">discord.gg/</span><span style="color:#fff;font-weight:600;">zgCh55JfWF</span></a></td></tr>
  </table>
</div>
</div></div></body></html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Welcome email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Welcome email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send "Welcome to The Forge" email
 */
export async function sendForgeWelcomeEmail({
  to,
  username,
  projectTitle,
  projectId,
}) {
  try {
    if (!to || !username || !projectTitle || !projectId) {
      throw new Error("Missing required fields for forge welcome email");
    }

    const subject = "🏗️ Welcome to The Forge, Creator!";
    const projectUrl = `https://rubiesunleashed.app/${username}/dashboard/project/${projectId}`;

    const textContent = `Hi ${username},

You just took your first step as a creator on Rubies Unleashed!

Your project "${projectTitle}" is in draft mode.

As an Architect, you now have:
• Full publishing capabilities
• Project analytics dashboard
• Community reach tools

Manage your project: ${projectUrl}

Join our Discord to connect with other creators, get feedback, and stay updated:
https://discord.gg/zgCh55JfWF

Keep building,
Rubies Unleashed Team`;

    const htmlContent = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#e2e8f0;padding:40px"><div style="max-width:600px;margin:0 auto;background:#161b2c;border:1px solid rgba(16,185,129,0.2);border-radius:16px;overflow:hidden"><div style="background:linear-gradient(to right,transparent,#10b981,transparent);height:4px"></div><div style="padding:40px"><div style="text-align:center;margin-bottom:24px"><div style="font-size:64px">🏗️</div></div><h1 style="text-align:center;color:#fff;text-transform:uppercase">Welcome to The Forge</h1><p>Hi <strong>${username}</strong>,</p><p>You just took your first step as a creator on Rubies Unleashed!</p><p>Your project <strong>"${projectTitle}"</strong> is in draft mode.</p><div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);padding:24px;margin:24px 0;border-radius:12px"><p style="font-size:12px;font-weight:bold;color:#10b981;text-transform:uppercase">As an Architect, you now have:</p><p>✦ Full publishing capabilities</p><p>✦ Project analytics dashboard</p><p>✦ Community reach tools</p></div><div style="text-align:center;margin:32px 0"><a href="${projectUrl}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:bold;text-transform:uppercase">Manage Your Project</a></div><div style="background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.3);border-radius:12px;padding:20px;margin:24px 0">
  <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5865F2;">
    💬 Join the Creator Community
  </p>
  <p style="margin:0 0 12px 0;font-size:13px;color:#cbd5e1;line-height:1.6;">
    Join our Discord to connect with other creators, get feedback, and stay updated.
  </p>
  <a href="https://discord.gg/zgCh55JfWF" style="display:inline-block;background:#5865F2;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
    Join Discord
  </a>
</div>
<div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:8px">
  <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Follow Us</p>
  <table cellpadding="0" cellspacing="0">
    <tr><td style="padding:4px 0"><a href="https://twitter.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">𝕏</span><span style="color:#94a3b8;">twitter.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span></a></td></tr>
    <tr><td style="padding:4px 0"><a href="https://www.instagram.com/official_rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">📸</span><span style="color:#94a3b8;">instagram.com/</span><span style="color:#fff;font-weight:600;">official_rubiesunleashed</span></a></td></tr>
    <tr><td style="padding:4px 0"><a href="https://facebook.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:12px;"><span style="display:inline-block;width:20px;">📘</span><span style="color:#94a3b8;">facebook.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span></a></td></tr>
  </table>
</div>
<p>Keep building,<br><strong>Rubies Unleashed Team</strong></p></div></div></body></html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Forge welcome email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Forge welcome email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send project published email
 */
export async function sendProjectPublishedEmail({
  to,
  username,
  projectTitle,
  projectSlug,
}) {
  try {
    if (!to || !username || !projectTitle || !projectSlug) {
      throw new Error("Missing required fields for project published email");
    }

    const subject = `🚀 "${projectTitle}" is Live on Rubies Unleashed!`;
    const publicUrl = `https://rubiesunleashed.app/view/${projectSlug}`;
    const dashboardUrl = `https://rubiesunleashed.app/${username}/dashboard`;

    const textContent = `Congrats ${username}!

"${projectTitle}" is now live and discoverable by users worldwide.

📱 Public Page: ${publicUrl}
📊 Dashboard: ${dashboardUrl}

Your project may also be featured on our socials:
• Twitter/X: https://twitter.com/rubiesunleashed
• Instagram: https://www.instagram.com/official_rubiesunleashed
• Facebook: https://facebook.com/rubiesunleashed
• Discord: https://discord.gg/zgCh55JfWF

Keep the momentum going - create more!

Join our Discord to connect with other creators, get feedback, and stay updated:
https://discord.gg/zgCh55JfWF

Celebrate your launch,
Rubies Unleashed Team`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0b0f19;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#161b2c;border:1px solid rgba(224,17,95,0.2);border-radius:16px;overflow:hidden;">
          
          <!-- Top Bar -->
          <tr>
            <td style="background:linear-gradient(to right,transparent,#E0115F,transparent);height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:64px;line-height:1;">🚀</div>
              </div>

              <!-- Heading -->
              <h1 style="margin:0 0 8px 0;text-align:center;color:#fff;font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;">
                Your Project is Live!
              </h1>
              <p style="margin:0 0 24px 0;text-align:center;font-size:18px;color:#E0115F;font-weight:700;">
                "${projectTitle}"
              </p>

              <!-- Intro -->
              <p style="margin:0 0 24px 0;font-size:15px;color:#cbd5e1;text-align:center;line-height:1.6;">
                Congrats <strong style="color:#fff;">${username}</strong>!<br>
                Your project is now discoverable by users worldwide.
              </p>

              <!-- Links Block -->
              <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin:0 0 24px 0;">
                <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">
                  📱 Your Public Page
                </p>
                <a href="${publicUrl}" style="color:#E0115F;font-size:13px;word-break:break-all;text-decoration:none;">${publicUrl}</a>

                <p style="margin:20px 0 6px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">
                  📊 Your Dashboard
                </p>
                <a href="${dashboardUrl}" style="color:#E0115F;font-size:13px;word-break:break-all;text-decoration:none;">${dashboardUrl}</a>
              </div>

              <!-- Socials Block -->
              <div style="background:rgba(224,17,95,0.05);border:1px solid rgba(224,17,95,0.15);border-radius:12px;padding:24px;margin:0 0 32px 0;">
                <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#E0115F;">
                  📣 We May Feature You On Our Socials
                </p>
                <p style="margin:0 0 16px 0;font-size:13px;color:#cbd5e1;line-height:1.6;">
                  Your project is now live on Rubies Unleashed. Keep an eye on our channels — new launches may get a spotlight.
                </p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="https://twitter.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:13px;">
                        <span style="display:inline-block;width:20px;">𝕏</span>
                        <span style="color:#94a3b8;">twitter.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="https://www.instagram.com/official_rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:13px;">
                        <span style="display:inline-block;width:20px;">📸</span>
                        <span style="color:#94a3b8;">instagram.com/</span><span style="color:#fff;font-weight:600;">official_rubiesunleashed</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="https://facebook.com/rubiesunleashed" style="text-decoration:none;color:#e2e8f0;font-size:13px;">
                        <span style="display:inline-block;width:20px;">📘</span>
                        <span style="color:#94a3b8;">facebook.com/</span><span style="color:#fff;font-weight:600;">rubiesunleashed</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="https://discord.gg/zgCh55JfWF" style="text-decoration:none;color:#e2e8f0;font-size:13px;">
                        <span style="display:inline-block;width:20px;">💬</span>
                        <span style="color:#94a3b8;">discord.gg/</span><span style="color:#fff;font-weight:600;">zgCh55JfWF</span>
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Discord Prompt -->
              <div style="background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.3);border-radius:12px;padding:20px;margin:0 0 24px 0;">
                <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5865F2;">
                  💬 Join the Creator Community
                </p>
                <p style="margin:0 0 12px 0;font-size:13px;color:#cbd5e1;line-height:1.6;">
                  Join our Discord to connect with other creators, get feedback, and stay updated.
                </p>
                <a href="https://discord.gg/zgCh55JfWF" style="display:inline-block;background:#5865F2;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
                  Join Discord
                </a>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:0 0 32px 0;">
                <a href="${publicUrl}" style="display:inline-block;background:#E0115F;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;box-shadow:0 4px 20px rgba(224,17,95,0.3);">
                  View Your Project
                </a>
              </div>

              <!-- Sign off -->
              <p style="margin:0;font-size:14px;color:#cbd5e1;text-align:center;">
                Celebrate your launch,<br>
                <strong style="color:#fff;">Rubies Unleashed Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:#64748b;">
                You received this email because you published a project on Rubies Unleashed.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Project published email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Project published email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send archetype initialization reminder email
 */
export async function sendArchetypeReminderEmail({ to, username }) {
  try {
    if (!to || !username) {
      throw new Error("Missing required fields for archetype reminder email");
    }

    const subject = "🎭 Complete Your Rubies Unleashed Profile";
    const initializeUrl = "https://rubiesunleashed.app/initialize";

    const textContent = `Hi ${username},

Welcome to Rubies Unleashed! 

We noticed you haven't selected your archetype yet. Your archetype personalizes your entire experience - from your dashboard feed to content recommendations.

Choose from 4 unique classes:
• 🎮 Hunter - Latest games first, action-focused
• 💻 Netrunner - Tools and apps prioritized
• 📚 Curator - Quality-first, hidden gems
• 👤 Phantom - Randomized underground content

This only takes 30 seconds and unlocks your personalized dashboard.

Complete your profile: ${initializeUrl}

Your journey awaits,
Rubies Unleashed Team

────────────────────────────────
You can complete this anytime at: ${initializeUrl}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #161b2c; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(to right, #E0115F, #8b5cf6, #06b6d4, #f59e0b); height: 4px;"></td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 64px; line-height: 1;">🎭</div>
              </div>
              
              <h1 style="margin: 0 0 16px 0; text-align: center; color: #fff; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">
                Complete Account Setup
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #e2e8f0;">Hi <strong style="color: #fff;">${username}</strong>,</p>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Welcome to Rubies Unleashed! We noticed you haven't selected your <strong style="color: #fff;">archetype</strong> yet.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Your archetype personalizes your entire experience, from your dashboard feed to content recommendations.
              </p>
              
              <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; text-align: center;">
                  Choose Your Path
                </p>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="font-size: 20px; width: 40px;">🎮</td>
                    <td>
                      <strong style="color: #E0115F; font-size: 14px;">Hunter</strong>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Latest games first, action-focused</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 20px;">💻</td>
                    <td>
                      <strong style="color: #06b6d4; font-size: 14px;">Netrunner</strong>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Tools and apps prioritized</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 20px;">📚</td>
                    <td>
                      <strong style="color: #f59e0b; font-size: 14px;">Curator</strong>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Quality-first, hidden gems</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 20px;">👤</td>
                    <td>
                      <strong style="color: #8b5cf6; font-size: 14px;">Phantom</strong>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Randomized underground content</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #94a3b8; text-align: center;">
                This only takes <strong style="color: #fff;">30 seconds</strong> and unlocks your personalized dashboard.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${initializeUrl}" style="display: inline-block; background: linear-gradient(135deg, #E0115F, #8b5cf6); color: #fff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(224, 17, 95, 0.3);">
                  Choose Your Archetype
                </a>
              </div>
              
              <p style="margin: 32px 0 0 0; font-size: 14px; color: #cbd5e1; text-align: center;">
                Your journey awaits,<br>
                <strong style="color: #fff;">Rubies Unleashed Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: rgba(0, 0, 0, 0.3); padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">
  You can complete this anytime at: <a href="${initializeUrl}" style="color: #8b5cf6; text-decoration: none;">${initializeUrl}</a>
</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="padding:3px 8px"><a href="https://twitter.com/rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">𝕏 Twitter</a></td>
    <td style="padding:3px 8px;color:#374151">•</td>
    <td style="padding:3px 8px"><a href="https://www.instagram.com/official_rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">📸 Instagram</a></td>
    <td style="padding:3px 8px;color:#374151">•</td>
    <td style="padding:3px 8px"><a href="https://facebook.com/rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">📘 Facebook</a></td>
    <td style="padding:3px 8px;color:#374151">•</td>
    <td style="padding:3px 8px"><a href="https://discord.gg/zgCh55JfWF" style="text-decoration:none;color:#64748b;font-size:11px;">💬 Discord</a></td>
  </tr>
</table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Archetype reminder email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Archetype reminder email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send draft project reminder email to Architects
 * Triggered by cron job for projects stuck in draft status
 */
export async function sendDraftReminderEmail({
  to,
  username,
  projectTitle,
  projectId,
  daysSinceCreated,
}) {
  try {
    if (!to || !username || !projectTitle || !projectId) {
      throw new Error("Missing required fields for draft reminder email");
    }

    const subject = `🏗️ Your draft is waiting for you.`;
    const editUrl = `https://rubiesunleashed.app/${username}/dashboard/project/${projectId}/edit`;
    const dashboardUrl = `https://rubiesunleashed.app/${username}/dashboard`;

    const daysLabel =
      daysSinceCreated === 1
        ? "yesterday"
        : daysSinceCreated
          ? `${daysSinceCreated} days ago`
          : "a while ago";

    // ─────────────────────────────────────────
    // PLAIN TEXT
    // ─────────────────────────────────────────
    const textContent = `Hi ${username},

"${projectTitle}" is still sitting in draft.

You started it ${daysLabel} — it deserves to be seen.

Publishing takes less than a minute:
→ Open your project: ${editUrl}
→ Review your details
→ Hit Publish

Your dashboard: ${dashboardUrl}

If you need help or feedback before launching, the creator community on Discord is the place:
https://discord.gg/zgCh55JfWF

Keep building,
Rubies Unleashed Team

────────────────────────────────
You received this because you have an unpublished draft on Rubies Unleashed.
To stop these reminders, publish or delete your draft.`;

    // ─────────────────────────────────────────
    // HTML
    // ─────────────────────────────────────────
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0b0f19;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#161b2c;border:1px solid rgba(16,185,129,0.2);border-radius:16px;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(to right,transparent,#10b981,transparent);height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:56px;line-height:1;">🏗️</div>
              </div>

              <!-- Heading -->
              <h1 style="margin:0 0 8px 0;text-align:center;color:#fff;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;">
                Still In Draft
              </h1>
              <p style="margin:0 0 32px 0;text-align:center;font-size:15px;color:#10b981;font-weight:700;">
                "${projectTitle}"
              </p>

              <!-- Intro -->
              <p style="margin:0 0 12px 0;font-size:15px;color:#e2e8f0;">
                Hi <strong style="color:#fff;">${username}</strong>,
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;color:#cbd5e1;line-height:1.7;">
                You started <strong style="color:#fff;">"${projectTitle}"</strong> ${daysLabel}. 
                It's been sitting in draft ever since — unseen, undiscovered.
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;color:#cbd5e1;line-height:1.7;">
                Publishing takes less than a minute. When you're ready, it's a single click away.
              </p>

              <!-- Steps block -->
              <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:12px;padding:24px;margin:0 0 32px 0;">
                <p style="margin:0 0 16px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#10b981;">
                  Three Steps to Live
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;vertical-align:top;">
                      <span style="display:inline-block;width:24px;height:24px;background:#10b981;color:#000;border-radius:50%;font-size:11px;font-weight:900;text-align:center;line-height:24px;margin-right:12px;">1</span>
                      <span style="font-size:13px;color:#e2e8f0;">Open your project and review your details</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;vertical-align:top;">
                      <span style="display:inline-block;width:24px;height:24px;background:#10b981;color:#000;border-radius:50%;font-size:11px;font-weight:900;text-align:center;line-height:24px;margin-right:12px;">2</span>
                      <span style="font-size:13px;color:#e2e8f0;">Add a cover image if you haven't already</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;vertical-align:top;">
                      <span style="display:inline-block;width:24px;height:24px;background:#10b981;color:#000;border-radius:50%;font-size:11px;font-weight:900;text-align:center;line-height:24px;margin-right:12px;">3</span>
                      <span style="font-size:13px;color:#e2e8f0;">Hit <strong style="color:#10b981;">Publish</strong> — your project goes live instantly</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Draft info block -->
              <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:0 0 32px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Project</p>
                      <p style="margin:0;font-size:14px;color:#fff;font-weight:600;">${projectTitle}</p>
                    </td>
                    <td align="right">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Status</p>
                      <span style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:4px 10px;border-radius:20px;">
                        Draft
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:16px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">Edit Link</p>
                      <a href="${editUrl}" style="color:#10b981;font-size:12px;word-break:break-all;text-decoration:none;">${editUrl}</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Primary CTA -->
              <div style="text-align:center;margin:0 0 32px 0;">
                <a href="${editUrl}" style="display:inline-block;background:#10b981;color:#000;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;box-shadow:0 4px 20px rgba(16,185,129,0.25);">
                  Finish &amp; Publish
                </a>
              </div>

              <!-- Secondary link -->
              <p style="margin:0 0 32px 0;text-align:center;font-size:12px;color:#64748b;">
                Not ready yet? <a href="${dashboardUrl}" style="color:#94a3b8;text-decoration:none;">View all your projects →</a>
              </p>

              <!-- Discord block -->
              <div style="background:rgba(88,101,242,0.08);border:1px solid rgba(88,101,242,0.25);border-radius:12px;padding:20px;margin:0 0 32px 0;">
                <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5865F2;">
                  💬 Not Sure Where to Start?
                </p>
                <p style="margin:0 0 14px 0;font-size:13px;color:#cbd5e1;line-height:1.6;">
                  Get feedback on your draft from other creators before you publish. The community is active and welcoming.
                </p>
                <a href="https://discord.gg/zgCh55JfWF" style="display:inline-block;background:#5865F2;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
                  Join Discord
                </a>
              </div>

              <!-- Sign off -->
              <p style="margin:0;font-size:14px;color:#cbd5e1;">
                Keep building,<br>
                <strong style="color:#fff;">Rubies Unleashed Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0 0 10px 0;font-size:11px;color:#64748b;">
                You received this because you have an unpublished draft on Rubies Unleashed.<br>
                To stop these reminders, publish or delete your draft.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:3px 8px;"><a href="https://twitter.com/rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">𝕏 Twitter</a></td>
                  <td style="padding:3px 8px;color:#374151;">•</td>
                  <td style="padding:3px 8px;"><a href="https://www.instagram.com/official_rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">📸 Instagram</a></td>
                  <td style="padding:3px 8px;color:#374151;">•</td>
                  <td style="padding:3px 8px;"><a href="https://facebook.com/rubiesunleashed" style="text-decoration:none;color:#64748b;font-size:11px;">📘 Facebook</a></td>
                  <td style="padding:3px 8px;color:#374151;">•</td>
                  <td style="padding:3px 8px;"><a href="https://discord.gg/zgCh55JfWF" style="text-decoration:none;color:#64748b;font-size:11px;">💬 Discord</a></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Draft reminder email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Draft reminder email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password changed confirmation email
 * Triggered after successful password reset on /reset-password
 */
export async function sendPasswordChangedEmail({ to, username }) {
  try {
    if (!to || !username) {
      throw new Error("Missing required fields for password changed email");
    }

    const subject = "Your Rubies Unleashed Password Was Changed";
    const loginUrl = "https://rubiesunleashed.app/login";
    const contactUrl = "https://rubiesunleashed.app/contact";

    // ─────────────────────────────────────────
    // PLAIN TEXT
    // ─────────────────────────────────────────
    const textContent = `Hi ${username},

Your Rubies Unleashed password was successfully changed.

If you made this change, no further action is needed.

If you did NOT make this change, secure your account immediately:
${loginUrl}

Need help? Contact us at:
${contactUrl}

Rubies Unleashed Team
────────────────────────────────
You received this because a password change was made on your account.`;

    // ─────────────────────────────────────────
    // HTML
    // ─────────────────────────────────────────
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Rubies Unleashed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #020617;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #f8fafc;
    }

    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #020617;
      padding-bottom: 40px;
    }

    .content {
      width: 100%;
      max-width: 380px;
      margin: 0 auto;
      background-color: #0f172a;
      border-radius: 12px;
      border: 1px solid #1e293b;
    }

    .body-content {
      padding: 40px 32px 40px 32px;
      text-align: center;
    }

    h1 {
      font-size: 17px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: #ffffff;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 24px 0;
    }

    .security-note {
      font-size: 12px;
      color: #64748b;
      background: rgba(2, 6, 23, 0.4);
      padding: 14px;
      border-radius: 6px;
      border: 1px solid rgba(30, 41, 59, 0.5);
      line-height: 1.4;
      text-align: left;
    }

    .security-note strong {
      color: #94a3b8;
      display: block;
      margin-bottom: 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .divider {
      height: 1px;
      background-color: #1e293b;
      margin: 24px 0;
    }

    .btn {
      background-color: #E0115F;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(224, 17, 95, 0.3);
    }

    .footer {
      padding: 0 20px 40px 20px;
      text-align: center;
      font-size: 11px;
      color: #475569;
    }

    .footer a {
      color: #64748b;
      text-decoration: none;
      margin: 0 6px;
    }

    .confirm-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 6px;
      padding: 10px 16px;
      margin-bottom: 24px;
      font-size: 12px;
      color: #10b981;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media only screen and (max-width: 480px) {
      .content { width: 90%; margin-top: 40px; }
      .body-content { padding: 32px 20px 32px 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- TOP SPACER -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding: 80px 0 0 0; line-height: 1px; font-size: 1px;">&nbsp;</td>
      </tr>
    </table>

    <!-- Main Card -->
    <table class="content" role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td class="body-content">

          <!-- Confirmation badge -->
          <div class="confirm-badge">
            ✓ &nbsp;Password Successfully Changed
          </div>

          <h1>Password Updated</h1>

          <p>
            Hi <strong style="color: #fff;">${username}</strong>, your 
            <strong style="color: #fff;">Rubies Unleashed</strong> account 
            password was successfully changed.
          </p>

          <p>
            If you made this change, no further action is needed.
          </p>

          <!-- Security note -->
          <div class="security-note">
            <strong>⚠ Wasn't you?</strong>
            If you did not make this change, your account may be compromised. 
            Secure it immediately by logging in and updating your password.
          </div>

          <div class="divider"></div>

          <!-- CTA — only shown if they need to act -->
          <div style="padding-bottom: 24px;">
            <a href="${loginUrl}" class="btn">Go to Login</a>
          </div>

          <p style="font-size: 13px; margin-bottom: 0;">
            Need help? Visit our 
            <a href="${contactUrl}" style="color: #06b6d4; text-decoration: none; font-weight: 600;">
              Support Team
            </a>
          </p>

        </td>
      </tr>
    </table>

    <!-- Footer -->
    <table width="100%" role="presentation">
      <tr>
        <td class="footer">
          <p>&copy; 2026 Rubies Unleashed &bull; Where New Ideas Rise</p>
          <a href="https://rubiesunleashed.app/privacy">Privacy</a> &bull;
          <a href="https://rubiesunleashed.app/terms">Terms</a> &bull;
          <a href="https://rubiesunleashed.app/status">System Status</a>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;

    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Password changed email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Password changed email failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection() {
  try {
    await getTransporter().verify();
    console.log("✅ SMTP connection verified");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
}

/**
 * Close transporter (cleanup)
 */
export function closeTransporter() {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log("📧 Email transporter closed");
  }
}
