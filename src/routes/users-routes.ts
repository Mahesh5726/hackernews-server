import { Hono } from "hono";
import { GetUsers, GetMe } from "../controllers/users/users-controllers";
import { GetUsersError, GetMeError } from "../controllers/users/users-types";
import { getPagination } from "../extras/pagination";
import { sessionMiddleware } from "./middleware/session-middleware";
import { prismaClient } from "../integrations/prisma";
export const usersRoutes = new Hono();

usersRoutes.all("/me", sessionMiddleware, async (context) => {
  const user = context.get("user");
  const userId = user?.id;

  if (!userId) {
    return context.json({ error: "User not found" }, 404);
  }

  if (context.req.method === "GET") {
    // Existing GET method to fetch user profile
    try {
      const { page, limit } = getPagination(context);
      const result = await GetMe({ userId, page, limit });

      if (!result) {
        return context.json({ error: "User not found" }, 404);
      }

      return context.json(result, 200);
    } catch (error) {
      if (error === GetMeError.USER_NOT_FOUND) {
        return context.json({ error: "User not found" }, 404);
      }
      if (error === GetMeError.UNKNOWN) {
        return context.json({ error: "Unknown error" }, 500);
      }
    }
  } else if (context.req.method === "POST") {
    // New POST method to update "About" field
    try {
      const { about } = await context.req.json();

      if (!about) {
        return context.json({ error: "About field is required" }, 400);
      }

      // Update the 'about' field in the database
      const updatedUser = await prismaClient.user.update({
        where: { id: userId },
        data: { about },
      });

      return context.json({ user: updatedUser }, 200);
    } catch (error) {
      console.error("Error updating About:", error);
      return context.json({ error: "Failed to update About" }, 500);
    }
  }
});

usersRoutes.get("/", sessionMiddleware, async (context) => {
  try {
    const { page, limit } = getPagination(context);

    const result = await GetUsers({ page, limit });
    if (!result) {
      return context.json({ error: "No users found" }, 404);
    }
    return context.json(result, 200);
  } catch (error) {
    if (error === GetUsersError.USERS_NOT_FOUND) {
      return context.json({ error: "No users found" }, 404);
    }
    if (error === GetUsersError.PAGE_BEYOND_LIMIT) {
      return context.json(
        { error: "No users found on the page requested" }, 404);
    }
    if (error === GetUsersError.UNKNOWN) {
      return context.json({ error: "Unknown error" }, 500);
    }
  }
});
