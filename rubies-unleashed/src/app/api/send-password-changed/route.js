import { sendPasswordChangedEmail } from "@/lib/emailService";

export async function POST(request) {
  try {
    const { to, username } = await request.json();

    if (!to || !username) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await sendPasswordChangedEmail({ to, username });
    return Response.json(result);
  } catch (error) {
    console.error("❌ Password changed email route failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}