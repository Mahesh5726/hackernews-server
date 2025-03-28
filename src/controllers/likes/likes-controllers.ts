import { prisma } from "../../extras/prisma";
import {
  DeleteLikeError,
  GetLikesError,
  LikePostError,
  type DeleteLikeResult,
  type GetLikesResult,
  type LikePostResult,
} from "./likes-types";

export const GetLikes = async (parameters: {
  postId: string;
  page: number;
  limit: number;
}): Promise<GetLikesResult> => {
  try {
    const { postId, page, limit } = parameters;
    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw GetLikesError.POST_NOT_FOUND;
    }

    const totalLikes = await prisma.like.count({
      where: { postId },
    });
    if (totalLikes === 0) {
      throw GetLikesError.LIKES_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalLikes / limit);
    if (page > totalPages) {
      throw GetLikesError.PAGE_NOT_FOUND;
    }

    const likes = await prisma.like.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        }
      },
    });

    return { likes };
  } catch (e) {
    console.error(e);
    if (
      e === GetLikesError.POST_NOT_FOUND ||
      e === GetLikesError.LIKES_NOT_FOUND ||
      e === GetLikesError.PAGE_NOT_FOUND
    ) {
      throw e;
    }
    throw GetLikesError.UNKNOWN;
  }
};

export const CreateLike = async (parameters: {
  postId: string;
  userId: string;
}): Promise<LikePostResult> => {
  try {
    const { postId, userId } = parameters;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw LikePostError.POST_NOT_FOUND;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw LikePostError.USER_NOT_FOUND;
    }
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw LikePostError.ALREADY_LIKED;
    }

    const like = await prisma.like.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      update: {}, //this is to make sure that no updates are needed if like exists
      create: {
        postId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return { message: "Liked Post!", like };
  } catch (e) {
    console.error(e);
    if (e === LikePostError.POST_NOT_FOUND) {
      throw e;
    }
    if (e === LikePostError.ALREADY_LIKED) {
      throw e;
    }
    if (e === LikePostError.USER_NOT_FOUND) {
      throw e;
    }
    throw LikePostError.UNKNOWN;
  }
};

export const DeleteLike = async (parameters: {
  postId: string;
  userId: string;
}): Promise<DeleteLikeResult> => {
  try {
    const { postId, userId } = parameters;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw DeleteLikeError.POST_NOT_FOUND;
    }

    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    if (!like) {
      throw DeleteLikeError.LIKE_NOT_FOUND;
    }
    if (like.userId !== userId) {
      throw DeleteLikeError.USER_NOT_FOUND;
    }

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return { message: "Unliked Post!" };
  } catch (e) {
    console.error(e);
    if (
      e === DeleteLikeError.POST_NOT_FOUND ||
      e === DeleteLikeError.LIKE_NOT_FOUND ||
      e === DeleteLikeError.USER_NOT_FOUND
    ) {
      throw e;
    }
    throw DeleteLikeError.UNKNOWN;
  }
};
