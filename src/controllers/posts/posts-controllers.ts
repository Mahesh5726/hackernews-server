import type { Context } from "hono";
import { getPagination } from "../../extras/pagination";
import { prisma } from "../../extras/prisma";
import {
  GetPostsError,
  CreatePostError,
  DeletePostError,
  type GetPostsResult,
  type CreatePostResult,
} from "./posts-types";

export const GetPosts = async (parameter: {
  page: number;
  limit: number;
}): Promise<GetPostsResult | Context> => {
  try {
    const { page, limit } = parameter;
    const skip = (page - 1) * limit;

    // checking if the posts exist
    const totalPosts = await prisma.post.count();
    if (totalPosts === 0) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }

    // checking if given page number doesn't exist or is beyond limits
    const totalPages = Math.ceil(totalPosts / limit);
    if (page > totalPages) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: true,
      },
    });

    return { posts };
  } catch (e) {
    console.error(e);
    if (e === GetPostsError.POSTS_NOT_FOUND) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }
    if (e === GetPostsError.PAGE_BEYOND_LIMIT) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }
    throw GetPostsError.UNKNOWN;
  }
};

export const GetUserPosts = async (parameters: {
  userId: string;
  page: number;
  limit: number;
}): Promise<GetPostsResult> => {
  try {
    const { userId, page, limit } = parameters;

    // checking if user has any posts
    const totalPosts = await prisma.post.count({
      where: { userId },
    });

    if (totalPosts === 0) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }

    // Check if requested page exists
    const totalPages = Math.ceil(totalPosts / limit);
    if (page > totalPages) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: true,
      },
    });

    return { posts };
  } catch (e) {
    console.error(e);
    if (e === GetPostsError.POSTS_NOT_FOUND) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }
    if (e === GetPostsError.PAGE_BEYOND_LIMIT) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }
    throw GetPostsError.UNKNOWN;
  }
};

export const CreatePost = async (parameters: {
  userId: string;
  title: string;
  content?: string;
}): Promise<CreatePostResult> => {
  try {
    const { userId, title, content } = parameters;

    if (!title) {
      throw CreatePostError.TITLE_REQUIRED;
    }

    if (!userId) {
      throw CreatePostError.USER_NOT_FOUND;
    }

    const post = await prisma.post.create({
      data: {
        userId,
        title,
        content,
      },
      include: {
        user: true,
      },
    });

    return { post };
  } catch (e) {
    console.error(e);
    throw CreatePostError.UNKNOWN;
  }
};

export const DeletePost = async (parameters: {
  postId: string;
  userId: string;
}): Promise<string> => {
  try {
    const { postId, userId } = parameters;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw DeletePostError.POST_NOT_FOUND;
    }

    if (post.userId !== userId) {
      throw DeletePostError.USER_NOT_FOUND;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return "Post deleted successfully";
  } catch (e) {
    console.error(e);
    throw DeletePostError.UNKNOWN;
  }
};
