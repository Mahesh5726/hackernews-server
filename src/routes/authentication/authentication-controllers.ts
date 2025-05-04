"use server";

import auth from "../../lib/auth";
export const signUp = async (params: {
  username: string;
  email: string;
  name: string;
  password: string;
}) => {
  const result = await auth.api.signUpEmail({
    body: {
      username: params.username,
      email: params.email,
      name: params.name,
      password: params.password,
    },
  });
  if ("error" in result && result.error) {
    throw new Error(
      typeof result.error === "object" &&
      result.error !== null &&
      "message" in result.error
        ? String(result.error.message)
        : "Signup failed."
    );
  }

  return result;
};

export const signIn = async (params: {
  password: string;
  username: string;
}) => {
  const result = await auth.api.signInUsername({
    body: {
      username: params.username,
      password: params.password,
    },
  });

  if (result && "error" in result && result.error) {
    throw new Error(
      typeof result.error === "object" &&
      result.error !== null &&
      "message" in result.error
        ? String(result.error.message)
        : "Login failed."
    );
  }

  return result;
};
