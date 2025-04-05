import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { swaggerDocument } from "./swagger-doc";
import { authenticationRoutes } from "./authentication-routes";
import { usersRoutes } from "./users-routes";
import { postsRoutes } from "./posts-routes";
import { likesRoutes } from "./likes-routes";
import { commentsRoutes } from "./comments-routes";

export const allRoutes = new Hono();

allRoutes.get("/ui", swaggerUI({ url: "/docs" }));
allRoutes.route("/", swaggerDocument);
allRoutes.route("/auth", authenticationRoutes);
allRoutes.route("/users", usersRoutes);
allRoutes.route("/posts", postsRoutes);
allRoutes.route("/likes", likesRoutes);
allRoutes.route("/comments", commentsRoutes);
