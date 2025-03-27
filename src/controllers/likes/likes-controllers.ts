import { prisma } from "../../extras/prisma";
import {
  GetLikesError,
  LikePostError,
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
        user: true,
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
        user: true,
      },
    });

    return { message: "Liked Post!", like };
  } catch (e) {
    console.error(e);
    if (e === LikePostError.POST_NOT_FOUND) {
      throw e;
    }
    throw LikePostError.UNKNOWN;
  }
};
