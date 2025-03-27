import { Hono } from "hono";
import { tokenMiddleware } from "./middleware/token-middleware";
import {
  GetPosts,
  GetUserPosts,
  CreatePost,
  DeletePost,
} from "../controllers/posts/posts-controllers";
import {
  GetPostsError,
  CreatePostError,
  DeletePostError,
} from "../controllers/posts/posts-types";
import { getPagination } from "../extras/pagination";

export const postsRoutes = new Hono();

postsRoutes.get("", tokenMiddleware, async (context) => {
  try {
    const { page, limit } = getPagination(context);
    const result = await GetPosts({ page, limit });
    return context.json(result, { status: 200 });
  } catch (error) {
    if (error === GetPostsError.POSTS_NOT_FOUND) {
      return context.json(
        { error: "No posts found in the system!" },
        { status: 404 }
      );
    }
    if (error === GetPostsError.PAGE_BEYOND_LIMIT) {
      return context.json(
        { error: "No posts found on the requested page!" },
        404
      );
    }
    return context.json({ error: "Unknown error!" }, 500);
  }
});

postsRoutes.get("/me", tokenMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const { page, limit } = getPagination(c);
    const result = await GetUserPosts({ userId, page, limit });
    return c.json(result, 200);
  } catch (error) {
    if (error === GetPostsError.POSTS_NOT_FOUND) {
      return c.json({ error: "You haven't created any posts yet!" }, 404);
    }
    if (error === GetPostsError.PAGE_BEYOND_LIMIT) {
      return c.json({ error: "No posts found on the requested page!" }, 404);
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});

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

postsRoutes.delete("/:postId", tokenMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const postId = c.req.param("postId");
    await DeletePost({ postId, userId });
    return c.json({ message: "Post deleted successfully" }, 200);
  } catch (error) {
    if (error === DeletePostError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found!" }, 404);
    }
    if (error === DeletePostError.USER_NOT_FOUND) {
      return c.json({ error: "User not found!" });
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});
