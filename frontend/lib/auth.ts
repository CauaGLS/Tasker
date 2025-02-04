import { betterAuth } from "better-auth";
import { oneTap } from "better-auth/plugins";
import { Pool } from "pg";
import { Resend } from "resend";

import { ForgotPasswordEmail } from "@/components/email/forgot-password";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: `Tasker <${process.env.RESEND_FROM_EMAIL}>`,
        to: [user.email],
        subject: "Redefinir senha",
        react: await ForgotPasswordEmail({ user, url, token }),
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_FRONTEND_URL as string],
  // Plugins
  plugins: [oneTap()],
  // Database
  database: new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT as number | undefined,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  }),
  user: {
    modelName: "users",
    fields: {
      name: "name",
      email: "email",
      emailVerified: "email_verified",
      image: "image",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});
