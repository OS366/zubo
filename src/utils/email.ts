// Utility to send a congratulatory email (to be connected to your email API)
// You can use Resend, SendGrid, Mailgun, etc.

export async function sendLeaderboardEmail({
  to,
  firstName,
  avatarUrl,
  lives,
}: {
  to: string;
  firstName: string;
  avatarUrl: string;
  lives: number;
}) {
  // Example: Use fetch to call your email API endpoint
  // Replace this with your actual email sending logic
  const html = `
    <div style="font-family: Arial, sans-serif; background: #181a20; color: #fff; padding: 32px; border-radius: 16px; max-width: 400px; margin: auto;">
      <div style="text-align: center;">
        <img src="${avatarUrl}" alt="avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #a78bfa; background: #fff; margin-bottom: 16px;" />
        <h2 style="margin: 0 0 8px 0;">Congratulations, ${firstName}!</h2>
        <p style="margin: 0 0 16px 0;">You made it to the Zubo Leaderboard 🎉</p>
        <div style="margin-bottom: 16px;">
          <strong>Lives Remaining:</strong> ${lives}
        </div>
        <p style="margin: 0 0 16px 0;">Thank you for playing Zubo and being part of our journey.<br/>— David Labs</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <div style="font-size: 12px; color: #aaa;">This email was sent by Zubo (zubo@davidlabs.ca)</div>
      </div>
    </div>
  `;
  // Example: POST to your email API endpoint
  // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, subject, html }) });
  // For now, just log
  console.log('Would send email to', to, 'with HTML:', html);
} 