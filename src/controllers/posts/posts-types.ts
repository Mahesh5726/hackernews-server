import type { Post } from "@prisma/client"


export type GetPostsResult = {
    posts: Post[]
}

export enum GetPostsError {
  POSTS_NOT_FOUND = "POSTS_NOT_FOUND",
  PAGE_BEYOND_LIMIT = "PAGE_BEYOND_LIMIT",
  UNKNOWN = "UNKNOWN"
}

export type CreatePostResult = {
    post: Post
}

export enum CreatePostError {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    TITLE_REQUIRED = "TITLE_REQUIRED",
    UNKNOWN = "UNKNOWN"
}

export enum DeletePostError {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    POST_NOT_FOUND = "POST_NOT_FOUND",
    UNKNOWN = "UNKNOWN"
}


