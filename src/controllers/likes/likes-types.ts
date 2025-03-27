import type { Like } from "@prisma/client"

export type GetLikesResult = {
  likes: Like[];
};

export enum GetLikesError {
  POST_NOT_FOUND = "POST_NOT_FOUND",
  UNKNOWN = "UNKNOWN",
}

export type LikePostResult = {
    message: string
}

export enum LikePostError {
    POST_NOT_FOUND = "POST_NOT_FOUND",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    UNKNOWN = "UNKNOWN"
}

export type DeleteLikeResult = {
    message: string
}

export enum DeleteLikeError {
    LIKE_NOT_FOUND = "LIKE_NOT_FOUND",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    UNKNOWN = "UNKNOWN"
}




