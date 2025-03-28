import { prisma } from "../../extras/prisma";
import {
  GetMeError,
  type GetMeResult,
  type GetUsersResult,
  GetUsersError,
} from "./users-types";

export const GetMe = async (parameters: {
  userId: string;
}): Promise<GetMeResult> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parameters.userId },
    });

    if (!user) {
      throw GetMeError.USER_NOT_FOUND;
    }

    const result: GetMeResult = {
      user: user,
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
