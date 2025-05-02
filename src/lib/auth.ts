import { betterAuth } from "better-auth";
import { betterAuthSecret, serverUrl, webClientUrl } from "../../environment";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prismaClient } from "./prisma";
import { username } from "better-auth/plugins";

const auth = betterAuth({
  baseURL: serverUrl,
  trustedOrigins: [webClientUrl],
  secret: betterAuthSecret,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
  database: prismaAdapter(prismaClient, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
  },
  session: {
    modelName: "Session",
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  username: {
    enabled: true,
  },
  cookies: {
    enabled: true,
    secure: true,
  },
});

export default auth;
