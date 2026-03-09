import { createAdminClient } from "@/lib/supabase-server";
import { sendArchetypeReminderEmail } from "@/lib/emailService";

/**
 * ================================================================
 * CRON JOB: Send Archetype Initialization Reminders
 * ================================================================
 * Schedule: Weekly (Mondays 10 AM UTC)
 * Target: Users who signed up 24+ hours ago without archetype
 * Limit: Max 2 reminders per user
 * ================================================================
 */

export async function GET(request) {
  try {
    // 🔍 DEBUG: Log all headers
    console.log("📋 All headers received:");
    for (const [key, value] of request.headers.entries()) {
      console.log(`  ${key}: ${value.substring(0, 20)}...`);
    }
    
    // 🔐 Security: Verify cron authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    console.log("🔍 Auth values:");
    console.log("  authHeader:", authHeader);
    console.log("  cronSecret exists:", !!cronSecret);

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron attempt");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting archetype reminder cron job...");

    const supabase = createAdminClient();

    // 📊 Query: Find users needing reminders
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: incompleteProfiles, error } = await supabase
      .from("profiles")
      .select("id, username, created_at, archetype_reminder_count")
      .is("archetype", null) // No archetype selected
      .lt("created_at", twentyFourHoursAgo) // Created 24+ hours ago
      .lt("archetype_reminder_count", 2) // Less than 2 reminders sent
      .limit(50); // Process in batches

    if (error) {
      console.error("❌ Database query failed:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      console.log("✅ No incomplete profiles found");
      return Response.json({ 
        success: true, 
        message: "No reminders to send",
        count: 0 
      });
    }

    console.log(`📧 Found ${incompleteProfiles.length} users to remind`);

    // 📧 Fetch email addresses from auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Failed to fetch auth users:", authError);
      return Response.json({ error: authError.message }, { status: 500 });
    }

    // 🔗 Match profiles with email addresses
    const usersWithEmails = incompleteProfiles
      .map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        return authUser ? { ...profile, email: authUser.email } : null;
      })
      .filter(Boolean); // Remove null entries

    console.log(`📬 Matched ${usersWithEmails.length} users with emails`);

    // 📨 Send reminder emails
    const results = [];
    
    for (const user of usersWithEmails) {
      try {
        // Send email
        const emailResult = await sendArchetypeReminderEmail({
          to: user.email,
          username: user.username,
        });

        if (emailResult.success) {
          // Increment reminder count
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ 
              archetype_reminder_count: user.archetype_reminder_count + 1 
            })
            .eq("id", user.id);

          if (updateError) {
            console.error(`❌ Failed to update count for ${user.username}:`, updateError);
            results.push({
              username: user.username,
              email: user.email,
              emailSent: true,
              countUpdated: false,
              error: updateError.message,
            });
          } else {
            console.log(`✅ Sent reminder to ${user.username} (count: ${user.archetype_reminder_count + 1})`);
            results.push({
              username: user.username,
              email: user.email,
              emailSent: true,
              countUpdated: true,
              newCount: user.archetype_reminder_count + 1,
            });
          }
        } else {
          console.error(`❌ Failed to send email to ${user.username}`);
          results.push({
            username: user.username,
            email: user.email,
            emailSent: false,
            error: emailResult.error,
          });
        }

        // ⏱️ Rate limiting: Wait 200ms between emails
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error processing ${user.username}:`, error);
        results.push({
          username: user.username,
          email: user.email,
          emailSent: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.emailSent && r.countUpdated).length;
    const partialSuccess = results.filter(r => r.emailSent && !r.countUpdated).length;
    const failCount = results.filter(r => !r.emailSent).length;

    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`⚠️ Partial success (email sent, count not updated): ${partialSuccess}`);
    console.log(`❌ Failed: ${failCount}`);

    return Response.json({
      success: true,
      message: `Processed ${results.length} users`,
      stats: {
        total: results.length,
        success: successCount,
        partial: partialSuccess,
        failed: failCount,
      },
      results: results,
    });

  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return Response.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
    }, { status: 500 });
  }
}