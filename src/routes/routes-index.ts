import { Hono } from "hono";
import { authenticationRoutes } from "./authentication-routes";

export const allRoutes = new Hono();

allRoutes.route("/auth", authenticationRoutes);

allRoutes.get("/ping", (c) => {
  return c.json({
    message: "pong",
  });
});


