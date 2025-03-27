import { Hono } from "hono";
import { tokenMiddleware } from "./middleware/token-middleware";
import {
  GetLikes,
  CreateLike
} from "../controllers/likes/likes-controllers";
import {
  GetLikesError,
  LikePostError,
} from "../controllers/likes/likes-types";
import { getPagination } from "../extras/pagination";

export const likesRoutes = new Hono();

// Get all likes on a post
likesRoutes.get("/on/:postId", tokenMiddleware, async (c) => {
  try {
    const postId = c.req.param("postId");
    const { page, limit } = getPagination(c);
    const result = await GetLikes({ postId, page, limit });
    return c.json(result, 200);
  } catch (error) {
    if (error === GetLikesError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found" }, 404);
    }
    if (error === GetLikesError.LIKES_NOT_FOUND) {
      return c.json({ error: "No likes found on this post" }, 404);
    }
    if (error === GetLikesError.PAGE_NOT_FOUND) {
      return c.json({ error: "No likes found on the requested page" }, 404);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});

// Create a like on a post
likesRoutes.post("/on/:postId", tokenMiddleware, async (c) => {
  try {
    const postId = c.req.param("postId");
    const userId = c.get("userId");
    const result = await CreateLike({ postId, userId });
    return c.json(result, 201);
  } catch (error) {
    if (error === LikePostError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found" }, 404);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});

