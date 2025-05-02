import { Hono } from "hono";
import {
  signIn,
  signUp,
} from "../controllers/authentication/authentication-controllers";
import {
  LogInWithUsernameAndPasswordError,
  SignUpWithUsernameAndPasswordError,
} from "../controllers/authentication/authentication-types";
import { authRoute } from "./middleware/session-middleware";

export const authenticationRoutes = new Hono();

authenticationRoutes.route("/auth", authRoute);

authenticationRoutes.post("/sign-up", async (c) => {
  const { username, password, name, email } = await c.req.json();
  try {
    const result = await signUp({
      username,
      password,
      name,
      email,
    });

    // Set the session cookie
    c.header(
      "Set-Cookie",
      `__Secure-better-auth.session_token=${result.token}; Path=/; Max-Age=604800; HttpOnly; SameSite=None; Secure=true`
    );

    return c.json({ data: result }, 200);
  } catch (error) {
    if (error === SignUpWithUsernameAndPasswordError.CONFLICTING_USERNAME) {
      return c.json({ error: "Username already exists" }, 409);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});

authenticationRoutes.post("/log-in", async (c) => {
  try {
    const { username, password } = await c.req.json();

    const result = await signIn({
      username,
      password,
    });

    c.header(
      "Set-Cookie",
      `__Secure-better-auth.session_token=${result?.token}; Path=/; Max-Age=604800; HttpOnly; SameSite=None; Secure=true`
    );

    return c.json(
      {
        data: result,
      },
      200
    );
  } catch (error) {
    if (
      error === LogInWithUsernameAndPasswordError.INCORRECT_USERNAME_OR_PASSWORD
    ) {
      return c.json({ error: "Incorrect username or password" }, 401);
    }

    return c.json({ error: "Unknown error" }, 500);
  }
});
