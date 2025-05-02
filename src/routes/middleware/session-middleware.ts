import { Hono } from "hono";
import { type Session, type User } from "better-auth";
import { createMiddleware } from "hono/factory";
import auth from "../../lib/auth";

export const authRoute = new Hono();

authRoute.on(["GET", "POST"], "/*", (context) => {
  return auth.handler(context.req.raw);
});



export type SessionVariables = {
  user: User;
  session: Session;
};

export const sessionMiddleware = createMiddleware<{
  Variables: SessionVariables;
}>(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  if (!session) {
    return context.body(null, 401);
  }

  context.set("user", session.user as User);
  context.set("session", session.session as Session);

  return await next();
});
