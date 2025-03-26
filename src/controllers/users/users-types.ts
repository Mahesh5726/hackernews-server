import type { User } from "@prisma/client"

export type GetMeResult = {
    user: User
}

export enum GetMeError {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    UNKNOWN = "UNKNOWN",
}

export type GetUsersResult = {
    users: User[]
}

export enum GetUsersError {
    USERS_NOT_FOUND = "USERS_NOT_FOUND",
    UNKNOWN = "UNKNOWN",
}
