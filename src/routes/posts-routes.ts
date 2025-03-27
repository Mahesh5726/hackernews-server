import { Hono } from "hono";
import { tokenMiddleware } from "./middleware/token-middleware";
import {
  CreatePost,
} from "../controllers/posts/posts-controllers";
import {
  CreatePostError,
} from "../controllers/posts/posts-types";

export const postsRoutes = new Hono();


postsRoutes.post("/", tokenMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const { title, content } = await c.req.json();
    const result = await CreatePost({ userId, title, content });
    return c.json(result, 201);
  } catch (error) {
    if (error === CreatePostError.TITLE_REQUIRED) {
      return c.json({ error: "Title is required!" }, 400);
    }
    if (error === CreatePostError.USER_NOT_FOUND) {
      return c.json({ error: "User not found!" }, 404);
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});


