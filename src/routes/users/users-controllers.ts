import { prismaClient as prisma } from "../../lib/prisma";
import {
  GetMeError,
  type GetMeResult,
  type GetUsersResult,
  GetUsersError,
} from "./users-types";

export const GetMe = async (parameters: {
  userId: string;
  page: number;
  limit: number;
}): Promise<GetMeResult> => {
  try {
    const { userId, page, limit } = parameters;
    const skip = (page - 1) * limit;

    const totalUsers = await prisma.user.count();
    if (totalUsers === 0) {
      throw GetMeError.USER_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalUsers / limit);
    if (page > totalPages) {
      throw GetMeError.PAGE_BEYOND_LIMIT;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        about: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            postId: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
        likes: {
          select: {
            id: true,
            postId: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
          },
        },
      },
    });

    if (!user) {
      throw GetMeError.USER_NOT_FOUND;
    }

    const result: GetMeResult = {
      user: {
        id: user.id,
        name: user.name || "",
        about: user.about || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        posts: user.posts || [],
        comments: user.comments
          ? user.comments
              .filter((comment) => comment.postId !== null)
              .map((comment) => ({
                ...comment,
                postId: comment.postId as string,
              }))
          : [],
        likes: user.likes || [],
      },
    };

    return result;
  } catch (e) {
    console.error(e);
    throw GetMeError.UNKNOWN;
  }
};

export const GetUsers = async (parameter: {
  page: number;
  limit: number;
}): Promise<GetUsersResult> => {
  try {
    const { page, limit } = parameter;
    const skip = (page - 1) * limit;

    const totalUsers = await prisma.user.count();
    if (totalUsers === 0) {
      throw GetUsersError.USERS_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalUsers / limit);
    if (page > totalPages) {
      throw GetUsersError.PAGE_BEYOND_LIMIT;
    }

    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return { users };
  } catch (e) {
    console.error(e);
    if (
      e === GetUsersError.USERS_NOT_FOUND ||
      e === GetUsersError.PAGE_BEYOND_LIMIT
    ) {
      throw e;
    }
    throw GetUsersError.UNKNOWN;
  }
};
