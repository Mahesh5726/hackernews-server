import { Hono } from "hono";
import { tokenMiddleware } from "./middleware/token-middleware";
import {
  GetLikes,
  CreateLike,
  DeleteLike,
} from "../controllers/likes/likes-controllers";
import {
  DeleteLikeError,
  GetLikesError,
  LikePostError,
} from "../controllers/likes/likes-types";
import { getPagination } from "../extras/pagination";

export const likesRoutes = new Hono();

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

likesRoutes.delete("/on/:postId", tokenMiddleware, async (c) => {
  try {
    const postId = c.req.param("postId");
    const userId = c.get("userId");
    const result = await DeleteLike({ postId, userId });
    return c.json(result, 200);
  } catch (error) {
    if (error === DeleteLikeError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found" }, 404);
    }
    if (error === DeleteLikeError.LIKE_NOT_FOUND) {
      return c.json({ error: "Like not found" }, 404);
    }
    if (error === DeleteLikeError.USER_NOT_FOUND) {
      return c.json({ error: "You can only remove your own likes" }, 403);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});
