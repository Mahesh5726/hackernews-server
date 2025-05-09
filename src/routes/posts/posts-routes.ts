import { Hono } from "hono";
import {
  authenticationMiddleware,
  type SecureSession,
} from "../middleware/session-middleware";
import {
  GetPosts,
  GetUserPosts,
  CreatePost,
  DeletePost,
  GetPostById,
  GetUserPostsBySlug,
  SearchPostsAndUsers,
} from "./posts-controllers";
import {
  GetPostsError,
  CreatePostError,
  DeletePostError,
  GetPostByIdError,
  SearchPostsError,
} from "./posts-types";
import { getPagination } from "../../extras/pagination";

export const postsRoutes = new Hono<SecureSession>();

postsRoutes.get("/search", async (c) => {
  const { query } = c.req.query();
  const { page, limit } = getPagination(c);

  try {
    const result = await SearchPostsAndUsers({ query, page, limit });
    return c.json(result, 200);
  } catch (error) {
    if (error === SearchPostsError.QUERY_REQUIRED) {
      return c.json({ error: "Query is required!" }, 400);
    }
    if (error === SearchPostsError.POSTS_NOT_FOUND) {
      return c.json({ error: "No posts or users found!" }, 404);
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});

postsRoutes.get("/", async (context) => {
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
        { status: 404 }
      );
    }
    return context.json({ error: "Unknown error!" }, { status: 500 });
  }
});

postsRoutes.get("/me", authenticationMiddleware, async (c) => {
  try {
    const userId = c.get("user")?.name;
    const { page, limit } = getPagination(c);
    const result = await GetUserPosts({ userId, page, limit });
    return c.json(result, { status: 200 });
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

postsRoutes.post("/", authenticationMiddleware, async (c) => {
  try {
    const userId = c.get("user").id;
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

postsRoutes.get("/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const result = await GetPostById({ postId });
    return c.json(result, 200);
  } catch (error) {
    if (error === GetPostByIdError.POST_NOT_FOUND) {
      return c.json({ error: "Post not found!" }, 404);
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});

postsRoutes.delete("/:postId", authenticationMiddleware, async (c) => {
  try {
    const userId = c.get("user").id;
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

postsRoutes.get("/by/:name", async (c) => {
  try {
    const { name } = c.req.param();
    const { page, limit } = getPagination(c);

    const result = await GetUserPostsBySlug({ name, page, limit });

    if (result.posts.length === 0) {
      return c.json({ error: "This user hasn't created any posts yet!" }, 404);
    }

    return c.json(result, 200);
  } catch (error) {
    if (error === GetPostsError.POSTS_NOT_FOUND) {
      return c.json({ error: "This user hasn't created any posts yet!" }, 404);
    }
    if (error === GetPostsError.PAGE_BEYOND_LIMIT) {
      return c.json({ error: "No posts found on the requested page!" }, 404);
    }
    return c.json({ error: "Unknown error!" }, 500);
  }
});
