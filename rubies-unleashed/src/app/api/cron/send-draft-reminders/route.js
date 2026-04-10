import { createAdminClient } from "@/lib/supabase-server";
import { sendDraftReminderEmail } from "@/lib/emailService";

/**
 * ================================================================
 * CRON JOB: Send Draft Project Reminders
 * ================================================================
 * Schedule: Weekly (Thursdays 10 AM UTC)
 * Target: Architects with projects stuck in draft for 2+ days
 * Limit: Max 2 reminders per project
 * ================================================================
 */

export async function GET(request) {
  try {
    console.log("🔍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "🔍 Service key exists:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    // 🔐 Security: Verify cron authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron attempt");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting draft reminder cron job...");

    const supabase = createAdminClient();

    // 📊 Query: Draft projects older than 2 days with < 2 reminders sent
    const twoDaysAgo = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Step 1: Get draft projects
    const { data: draftProjects, error } = await supabase
      .from("projects")
      .select("id, title, user_id, created_at, draft_reminder_count")
      .eq("status", "draft")
      .lt("created_at", twoDaysAgo)
      .lt("draft_reminder_count", 2)
      .limit(50);

    if (error) {
      console.error("❌ Database query failed:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!draftProjects || draftProjects.length === 0) {
      console.log("✅ No draft projects to remind");
      return Response.json({
        success: true,
        message: "No reminders to send",
        count: 0,
      });
    }

    // Step 2: Get usernames for those user_ids (Architects only)
    const userIds = draftProjects.map((p) => p.user_id);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, role")
      .in("id", userIds)
      .eq("role", "architect");

    if (profileError) {
      console.error("❌ Profile query failed:", profileError);
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    // Step 3: Filter projects to only those owned by Architects
    const architectIds = new Set(profiles.map((p) => p.id));
    const filteredProjects = draftProjects
      .filter((p) => architectIds.has(p.user_id))
      .map((p) => ({
        ...p,
        username: profiles.find((pr) => pr.id === p.user_id)?.username,
      }));

    console.log(`📧 Found ${filteredProjects.length} draft projects to remind`);

    // 📧 Fetch email addresses from auth.users
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Failed to fetch auth users:", authError);
      return Response.json({ error: authError.message }, { status: 500 });
    }

    // 🔗 Match projects with owner emails
    const projectsWithEmails = filteredProjects
      .map((project) => {
        const authUser = authData.users.find((u) => u.id === project.user_id);
        if (!authUser) return null;

        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(project.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        return {
          ...project,
          email: authUser.email,
          daysSinceCreated,
        };
      })
      .filter(Boolean);

    console.log(
      `📬 Matched ${projectsWithEmails.length} projects with owner emails`,
    );

    // 📨 Send reminder emails
    const results = [];

    for (const project of projectsWithEmails) {
      try {
        const emailResult = await sendDraftReminderEmail({
          to: project.email,
          username: project.username,
          projectTitle: project.title,
          projectId: project.id,
          daysSinceCreated: project.daysSinceCreated,
        });

        if (emailResult.success) {
          // Increment reminder count on the project
          const { error: updateError } = await supabase
            .from("projects")
            .update({
              draft_reminder_count: (project.draft_reminder_count || 0) + 1,
              draft_reminder_last_sent: new Date().toISOString(),
            })
            .eq("id", project.id);

          if (updateError) {
            console.error(
              `❌ Failed to update count for project ${project.id}:`,
              updateError,
            );
            results.push({
              projectId: project.id,
              projectTitle: project.title,
              username: project.username,
              emailSent: true,
              countUpdated: false,
              error: updateError.message,
            });
          } else {
            console.log(
              `✅ Sent reminder for "${project.title}" to ${project.username} (day ${project.daysSinceCreated})`,
            );
            results.push({
              projectId: project.id,
              projectTitle: project.title,
              username: project.username,
              emailSent: true,
              countUpdated: true,
              newCount: (project.draft_reminder_count || 0) + 1,
              daysSinceCreated: project.daysSinceCreated,
            });
          }
        } else {
          console.error(
            `❌ Failed to send email for "${project.title}" to ${project.username}`,
          );
          results.push({
            projectId: project.id,
            projectTitle: project.title,
            username: project.username,
            emailSent: false,
            error: emailResult.error,
          });
        }

        // ⏱️ Rate limiting: 200ms between sends
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`❌ Error processing project ${project.id}:`, err);
        results.push({
          projectId: project.id,
          projectTitle: project.title,
          username: project.username,
          emailSent: false,
          error: err.message,
        });
      }
    }

    // 📊 Summary
    const successCount = results.filter(
      (r) => r.emailSent && r.countUpdated,
    ).length;
    const partialSuccess = results.filter(
      (r) => r.emailSent && !r.countUpdated,
    ).length;
    const failCount = results.filter((r) => !r.emailSent).length;

    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(
      `⚠️ Partial success (email sent, count not updated): ${partialSuccess}`,
    );
    console.log(`❌ Failed: ${failCount}`);

    return Response.json({
      success: true,
      message: `Processed ${results.length} draft projects`,
      stats: {
        total: results.length,
        success: successCount,
        partial: partialSuccess,
        failed: failCount,
      },
      results,
    });
  } catch (error) {
    console.error("❌ Draft reminder cron job failed:", error);
    return Response.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
