import nodemailer from "nodemailer";
import { siteConfig } from "./site";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export type ApplicationInput = {
  name: string;
  studentId: string;
  phone: string;
  teams: string[];
  motivation: string;
};

export async function sendApplicationEmail(
  input: ApplicationInput
): Promise<void> {
  const user = env("GMAIL_USER");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass: env("GMAIL_APP_PASSWORD"),
    },
  });

  const to = process.env.RECRUIT_EMAIL_TO || siteConfig.contactEmail;

  await transporter.sendMail({
    from: `"Delibot 지원서" <${user}>`,
    to,
    subject: `[Delibot 팀원 지원] ${input.name} (${input.teams.join(", ")})`,
    text: [
      `이름: ${input.name}`,
      `학번: ${input.studentId}`,
      `연락처: ${input.phone}`,
      `지원 분야: ${input.teams.join(", ")}`,
      "",
      "지원 동기 및 자기소개:",
      input.motivation,
    ].join("\n"),
  });
}
