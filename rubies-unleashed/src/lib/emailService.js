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
        ""
      )}</div><div style="text-align:center;margin:32px 0"><a href="https://rubiesunleashed.app/" style="display:inline-block;background:${
      content.color
    };color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:bold;text-transform:uppercase">${
      content.ctaText
    }</a></div><p>${
      content.closing
    },<br><strong>Rubies Unleashed Team</strong></p></div></div></body></html>`;

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

Keep building,
Rubies Unleashed Team`;

    const htmlContent = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#e2e8f0;padding:40px"><div style="max-width:600px;margin:0 auto;background:#161b2c;border:1px solid rgba(16,185,129,0.2);border-radius:16px;overflow:hidden"><div style="background:linear-gradient(to right,transparent,#10b981,transparent);height:4px"></div><div style="padding:40px"><div style="text-align:center;margin-bottom:24px"><div style="font-size:64px">🏗️</div></div><h1 style="text-align:center;color:#fff;text-transform:uppercase">Welcome to The Forge</h1><p>Hi <strong>${username}</strong>,</p><p>You just took your first step as a creator on Rubies Unleashed!</p><p>Your project <strong>"${projectTitle}"</strong> is in draft mode.</p><div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);padding:24px;margin:24px 0;border-radius:12px"><p style="font-size:12px;font-weight:bold;color:#10b981;text-transform:uppercase">As an Architect, you now have:</p><p>✦ Full publishing capabilities</p><p>✦ Project analytics dashboard</p><p>✦ Community reach tools</p></div><div style="text-align:center;margin:32px 0"><a href="${projectUrl}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:bold;text-transform:uppercase">Manage Your Project</a></div><p>Keep building,<br><strong>Rubies Unleashed Team</strong></p></div></div></body></html>`;

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

Your project is now discoverable by users worldwide.

📱 Public Page: ${publicUrl}
📊 Dashboard: ${dashboardUrl}

Keep the momentum going - create more!

Celebrate your launch,
Rubies Unleashed Team`;

    const htmlContent = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0b0f19;color:#e2e8f0;padding:40px"><div style="max-width:600px;margin:0 auto;background:#161b2c;border:1px solid rgba(224,17,95,0.2);border-radius:16px;overflow:hidden"><div style="background:linear-gradient(to right,transparent,#E0115F,transparent);height:4px"></div><div style="padding:40px"><div style="text-align:center;margin-bottom:24px"><div style="font-size:64px">🚀</div></div><h1 style="text-align:center;color:#fff">Your Project is Live!</h1><p style="text-align:center;font-size:18px;color:#E0115F;font-weight:600">"${projectTitle}"</p><p style="text-align:center">Congrats <strong>${username}</strong>!<br>Your project is now discoverable by users worldwide.</p><div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin:24px 0"><p style="font-size:12px;font-weight:bold;color:#94a3b8;text-transform:uppercase">📱 Share Your Creation</p><a href="${publicUrl}" style="color:#E0115F;word-break:break-all">${publicUrl}</a><p style="font-size:12px;font-weight:bold;color:#94a3b8;text-transform:uppercase;margin-top:20px">📊 Track Performance</p><a href="${dashboardUrl}" style="color:#E0115F;word-break:break-all">${dashboardUrl}</a></div><p style="text-align:center">Keep the momentum going - create more!</p><div style="text-align:center;margin:32px 0"><a href="${publicUrl}" style="display:inline-block;background:#E0115F;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:bold;text-transform:uppercase">View Your Project</a></div><p style="text-align:center">Celebrate your launch,<br><strong>Rubies Unleashed Team</strong></p></div></div></body></html>`;

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
                Complete Your Profile
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #e2e8f0;">Hi <strong style="color: #fff;">${username}</strong>,</p>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Welcome to Rubies Unleashed! We noticed you haven't selected your <strong style="color: #fff;">archetype</strong> yet.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                Your archetype personalizes your entire experience - from your dashboard feed to content recommendations.
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
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                You can complete this anytime at: <a href="${initializeUrl}" style="color: #8b5cf6; text-decoration: none;">${initializeUrl}</a>
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

    console.log("✅ Archetype reminder email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Archetype reminder email failed:", error);
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
