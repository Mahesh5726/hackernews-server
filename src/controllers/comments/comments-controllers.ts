import { prisma } from "../../extras/prisma";
import {
  GetCommentsError,
  CreateCommentError,
  type GetCommentsResult,
  type CreateCommentResult,
  DeleteCommentError,
  UpdateCommentError,
  type UpdateCommentResult,
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

export const UpdateComment = async (parameters: {
  commentId: string;
  userId: string;
  content: string;
}): Promise<UpdateCommentResult> => {
  try {
    const { commentId, userId, content } = parameters;

    if (!content.trim()) {
      throw UpdateCommentError.INVALID_INPUT;
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw UpdateCommentError.COMMENT_NOT_FOUND;
    }

    if (existingComment.userId !== userId) {
      throw UpdateCommentError.UNAUTHORIZED;
    }

    if (
      existingComment.content.toLowerCase().trim() ===
      content.toLowerCase().trim()
    ) {
      throw UpdateCommentError.NO_CHANGES;
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: true,
      },
    });

    return { comment };
  } catch (e) {
    console.error(e);
    if (
      e === UpdateCommentError.COMMENT_NOT_FOUND ||
      e === UpdateCommentError.INVALID_INPUT ||
      e === UpdateCommentError.NO_CHANGES ||
      e === UpdateCommentError.UNAUTHORIZED
    ) {
      throw e;
    }
    throw UpdateCommentError.UNKNOWN;
  }
};

export const DeleteComment = async (parameters: {
  commentId: string;
  userId: string;
}): Promise<void> => {
  try {
    const { commentId, userId } = parameters;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw DeleteCommentError.COMMENT_NOT_FOUND;
    }

    if (comment.userId !== userId) {
      throw DeleteCommentError.UNAUTHORIZED;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  } catch (e) {
    console.error(e);
    if (
      e === DeleteCommentError.COMMENT_NOT_FOUND ||
      e === DeleteCommentError.UNAUTHORIZED
    ) {
      throw e;
    }
    throw DeleteCommentError.UNKNOWN;
  }
};
