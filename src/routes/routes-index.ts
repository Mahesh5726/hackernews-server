import { Hono } from "hono";

export const allRoutes = new Hono()

allRoutes.get("/ping", (c) => {
    return c.json({
        message: "pong"
    })
})


