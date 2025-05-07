import { betterAuth } from "better-auth";
import { betterAuthSecret, serverUrl, webClientUrl } from "../../environment";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prismaClient } from "./prisma";
import { username } from "better-auth/plugins";

const auth = betterAuth({
  baseURL: serverUrl,
  basePath: "/authentications",
  trustedOrigins: [webClientUrl],
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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
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
  cookies: {
    enabled: true,
  },
});

export default auth;
