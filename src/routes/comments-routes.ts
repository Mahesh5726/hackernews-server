import { Hono } from "hono";
import { tokenMiddleware } from "./middleware/token-middleware";
import {
  GetComments,
  CreateComment
} from "../controllers/comments/comments-controllers";
import {
  GetCommentsError,
  CreateCommentError
} from "../controllers/comments/comments-types";
import { getPagination } from "../extras/pagination";

export const commentsRoutes = new Hono();


commentsRoutes.get("/on/:postId", tokenMiddleware, async (c) => {
  try {
    const postId = c.req.param("postId");
    const { page, limit } = getPagination(c);
    const result = await GetComments({ postId, page, limit });
    return c.json(result, 200);
  } catch (error) {
    if (error === GetCommentsError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found" }, 404);
    }
    if (error === GetCommentsError.COMMENTS_NOT_FOUND) {
      return c.json({ error: "No comments found on this post" }, 404);
    }
    if (error === GetCommentsError.PAGE_BEYOND_LIMIT) {
      return c.json({ error: "No comments found on the requested page" }, 404);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});


commentsRoutes.post("/on/:postId", tokenMiddleware, async (c) => {
  try {
    const postId = c.req.param("postId");
    const userId = c.get("userId");
    const { content } = await c.req.json();
    const result = await CreateComment({ postId, userId, content });
    return c.json(result, 201);
  } catch (error) {
    if (error === CreateCommentError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found" }, 404);
    }
    if (error === CreateCommentError.INVALID_INPUT) {
      return c.json({ error: "Comment content is required" }, 400);
    }
    return c.json({ error: "Unknown error" }, 500);
  }
});

