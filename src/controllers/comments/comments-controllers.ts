import { prisma } from "../../extras/prisma";
import {
  GetCommentsError,
  CreateCommentError,
  type GetCommentsResult,
  type CreateCommentResult
} from "./comments-types";


export const GetComments = async (parameters: {
  postId: string;
  page: number;
  limit: number;
}): Promise<GetCommentsResult> => {
  try {
    const { postId, page, limit } = parameters;

    if (page < 1 || limit < 1) {
      throw GetCommentsError.PAGE_BEYOND_LIMIT;
    }

    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw GetCommentsError.POST_NOT_FOUND;
    }

    const totalComments = await prisma.comment.count({
      where: { postId },
    });

    if (totalComments === 0) {
      throw GetCommentsError.COMMENTS_NOT_FOUND;
    }

    const totalPages = Math.ceil(totalComments / limit);
    if (page > totalPages) {
      throw GetCommentsError.PAGE_BEYOND_LIMIT;
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: true,
      },
    });

    return { comments };
  } catch (e) {
    console.error(e);
    if (
      e === GetCommentsError.POST_NOT_FOUND ||
      e === GetCommentsError.COMMENTS_NOT_FOUND ||
      e === GetCommentsError.PAGE_BEYOND_LIMIT
    ) {
      throw e;
    }
    throw GetCommentsError.UNKNOWN;
  }
};

export const CreateComment = async (parameters: {
  postId: string;
  userId: string;
  content: string;
}): Promise<CreateCommentResult> => {
  try {
    const { postId, userId, content } = parameters;

    if (!content.trim()) {
      throw CreateCommentError.INVALID_INPUT;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw CreateCommentError.POST_NOT_FOUND;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
      include: {
        user: true,
      },
    });

    return { comment };
  } catch (e) {
    console.error(e);
    if (
      e === CreateCommentError.POST_NOT_FOUND ||
      e === CreateCommentError.INVALID_INPUT
    ) {
      throw e;
    }
    throw CreateCommentError.UNKNOWN;
  }
};
