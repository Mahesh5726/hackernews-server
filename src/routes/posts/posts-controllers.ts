import type { Context } from "hono";
import { prismaClient as prisma } from "../../lib/prisma";
import {
  GetPostsError,
  CreatePostError,
  DeletePostError,
  type GetPostsResult,
  type CreatePostResult,
  GetPostByIdError,
  type GetPostByIdResult,
  type GetCommentsByPostIdResult,
  GetCommentsByPostIdError,
  CreateCommentByPostIdError,
  type CreateCommentByPostIdResult,
  GetUserPostsBySlugError,
  SearchPostsError,
  type SearchPostsResult,
} from "./posts-types";

export const GetPosts = async (parameter: {
  page: number;
  limit: number;
  userId?: string;
}): Promise<GetPostsResult | Context> => {
  try {
    const { page, limit, userId } = parameter;
    const skip = (page - 1) * limit;

    const totalPosts = await prisma.post.count();
    if (totalPosts === 0) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalPosts / limit);
    if (page > totalPages) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedPosts = posts.map((post, index) => ({
      number: index + 1,
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      userId: post.author.id,
      user: {
        id: post.author.id,
        name: post.author.name,
      },
      likeCount: post.likes.length,
      likedByUser: userId
        ? post.likes.some((like) => like.userId === userId)
        : false,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          name: comment.user.name,
        },
      })),
    }));

    return { posts: formattedPosts };
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

    const totalPosts = await prisma.post.count({
      where: { userId },
    });

    if (totalPosts === 0) {
      throw GetPostsError.POSTS_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalPosts / limit);
    if (page > totalPages) {
      throw GetPostsError.PAGE_BEYOND_LIMIT;
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
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
        content: content || "",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
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
    if (e === DeletePostError.POST_NOT_FOUND) {
      throw DeletePostError.POST_NOT_FOUND;
    }
    if (e === DeletePostError.USER_NOT_FOUND) {
      throw DeletePostError.USER_NOT_FOUND;
    }
    throw DeletePostError.UNKNOWN;
  }
};

export const GetPostById = async (parameters: {
  postId: string;
}): Promise<GetPostByIdResult> => {
  try {
    const { postId } = parameters;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw GetPostByIdError.POST_NOT_FOUND;
    }

    return { post };
  } catch (e) {
    console.error(e);
    if (e === GetPostByIdError.POST_NOT_FOUND) {
      throw GetPostByIdError.POST_NOT_FOUND;
    }
    throw GetPostByIdError.UNKNOWN;
  }
};

export const GetCommentsByPostId = async (parameters: {
  postId: string;
}): Promise<GetCommentsByPostIdResult> => {
  try {
    const { postId } = parameters;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw GetCommentsByPostIdError.POST_NOT_FOUND;
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { comments };
  } catch (e) {
    console.error(e);
    if (e === GetCommentsByPostIdError.POST_NOT_FOUND) {
      throw GetCommentsByPostIdError.POST_NOT_FOUND;
    }
    throw GetCommentsByPostIdError.UNKNOWN;
  }
};

export const CreateCommentByPostId = async (parameters: {
  postId: string;
  userId: string;
  content: string;
}): Promise<CreateCommentByPostIdResult> => {
  try {
    const { postId, userId, content } = parameters;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw CreateCommentByPostIdError.POST_NOT_FOUND;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw CreateCommentByPostIdError.USER_NOT_FOUND;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { comment };
  } catch (e) {
    console.error(e);
    if (e === CreateCommentByPostIdError.POST_NOT_FOUND) {
      throw CreateCommentByPostIdError.POST_NOT_FOUND;
    }
    if (e === CreateCommentByPostIdError.USER_NOT_FOUND) {
      throw CreateCommentByPostIdError.USER_NOT_FOUND;
    }
    throw CreateCommentByPostIdError.UNKNOWN;
  }
};

export const GetUserPostsBySlug = async (parameters: {
  name: string;
  page: number;
  limit: number;
}): Promise<GetPostsResult> => {
  try {
    const { name, page, limit } = parameters;

    const user = await prisma.user.findFirst({
      where: { name },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw GetUserPostsBySlugError.USER_NOT_FOUND;
    }
    const totalPosts = await prisma.post.count({
      where: { userId: user.id },
    });

    if (totalPosts === 0) {
      throw GetUserPostsBySlugError.POSTS_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages) {
      throw GetUserPostsBySlugError.PAGE_BEYOND_LIMIT;
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { posts };
  } catch (e) {
    console.error(e);
    if (e === GetUserPostsBySlugError.USER_NOT_FOUND) {
      throw GetUserPostsBySlugError.USER_NOT_FOUND;
    }
    if (e === GetUserPostsBySlugError.POSTS_NOT_FOUND) {
      throw GetUserPostsBySlugError.POSTS_NOT_FOUND;
    }
    if (e === GetUserPostsBySlugError.PAGE_BEYOND_LIMIT) {
      throw GetUserPostsBySlugError.PAGE_BEYOND_LIMIT;
    }
    throw GetUserPostsBySlugError.UNKNOWN;
  }
};


export const SearchPostsAndUsers = async ({
  query,
  page = 1,
  limit = 10,
}: {
  query: string;
  page: number;
  limit: number;
}) => {
  if (!query || query.trim() === "") {
    throw SearchPostsError.QUERY_REQUIRED;
  }

  const skip = (page - 1) * limit;

  const postWhere = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };

  const userWhere = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ],
  };

  const [posts, users, totalPosts, totalUsers] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { content: { contains: query, mode: "insensitive" as const } },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      },
      skip,
      take: limit,
    }),
    prisma.post.count({ 
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { content: { contains: query, mode: "insensitive" as const } },
        ],
      } 
    }),
    prisma.user.count({ 
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    }),
  ]);

  if (posts.length === 0 && users.length === 0) {
    throw SearchPostsError.POSTS_NOT_FOUND;
  }

  return {
    posts,
    users,
    pagination: {
      page,
      limit,
      totalPosts,
      totalUsers,
      totalPostPages: Math.ceil(totalPosts / limit),
      totalUserPages: Math.ceil(totalUsers / limit),
    },
  };
};
