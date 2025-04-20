import { Hono } from "hono";

export const swaggerDocument = new Hono();

swaggerDocument.get("/docs", (c) => {
  return c.json({
    openapi: "3.0.0",
    info: {
      title: "HackerNews API",
      version: "2.0.3",
      description: "HackerNews clone server",
      contact: {
        name: "HackerNews-Server",
        url: "https://github.com/Mahesh5726/hackernews-server",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://hackernews.lemonisland-20d31e0a.centralindia.azurecontainerapps.io/",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        TokenAuth: {
          type: "apiKey",
          in: "header",
          name: "token",
        },
      },
    },
    security: [
      {
        TokenAuth: [],
      },
    ],
    tags: [
      { name: "Authentication", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Posts", description: "Post management endpoints" },
      { name: "Likes", description: "Like management endpoints" },
      { name: "Comments", description: "Comment management endpoints" },
    ],
    paths: {
      "/auth/sign-in": {
        post: {
          tags: ["Auth"],
          summary: "Sign up with username and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                    name: { type: "string" },
                  },
                  required: ["username", "password"],
                },
              },
            },
          },
          responses: {
            "200": { description: "User created successfully" },
            "201": { description: "User already exists" },
            "409": { description: "Username already exists" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/auth/log-in": {
        post: {
          tags: ["Auth"],
          summary: "Log in with username and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["username", "password"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Successful login" },
            "201": { description: "User not found" },
            "401": { description: "Invalid credentials" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current authenticated user",
          responses: {
            "200": { description: "User details" },
            "201": { description: "User not found" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 5 },
            },
          ],
          responses: {
            "200": { description: "List of users" },
            "201": { description: "No users found" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/posts": {
        get: {
          tags: ["Posts"],
          summary: "Get all posts",
          responses: {
            "200": { description: "List of posts" },
            "201": { description: "No posts found" },
            "401": { description: "Unauthorized" },
            "404": { description: "No posts found" },
            "500": { description: "Unknown error" },
          },
        },
        post: {
          tags: ["Posts"],
          summary: "Create a new post",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                  required: ["title"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Post created" },
            "201": { description: "Post already exists" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/posts/me": {
        get: {
          tags: ["Posts"],
          summary: "Get posts created by current user",
          responses: {
            "200": { description: "List of user posts" },
            "201": { description: "No posts found" },
            "401": { description: "Unauthorized" },
            "404": { description: "User not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/posts/{postId}": {
        delete: {
          tags: ["Posts"],
          summary: "Delete a post by ID",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Post deleted" },
            "401": { description: "Unauthorized" },
            "404": { description: "Post not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/likes/on/{postId}": {
        post: {
          tags: ["Likes"],
          summary: "Like a post",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Post liked successfully" },
            "201": { description: "You have already liked this post" },
            "401": { description: "Unauthorized" },
            "404": { description: "Post not found" },
            "500": { description: "Unknown error" },
          },
        },
        get: {
          tags: ["Likes"],
          summary: "Get all likes on a post",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 5 },
            },
          ],
          responses: {
            "200": { description: "Likes returned successfully" },
            "201": { description: "No likes found" },
            "401": { description: "Unauthorized" },
            "404": { description: "Post not found" },
            "500": { description: "Unknown error" },
          },
        },
        delete: {
          tags: ["Likes"],
          summary: "Delete like from a post",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Like deleted successfully" },
            "401": { description: "Unauthorized" },
            "404": { description: "Like not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/comments/on/{postId}": {
        post: {
          tags: ["Comments"],
          summary: "Create a comment on a post",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                  },
                  required: ["content"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Comment created successfully" },
            "401": { description: "Unauthorized" },
            "404": { description: "Post not found" },
            "500": { description: "Unknown error" },
          },
        },
        get: {
          tags: ["Comments"],
          summary: "Get all comments on a post",
          parameters: [
            {
              name: "postId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: {
            "200": { description: "Comments returned successfully" },
            "201": { description: "No comments found" },
            "401": { description: "Unauthorized" },
            "404": { description: "Post not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
      "/comments/{commentId}": {
        delete: {
          tags: ["Comments"],
          summary: "Delete a comment",
          parameters: [
            {
              name: "commentId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Comment deleted successfully" },
            "401": { description: "Unauthorized" },
            "404": { description: "Comment not found" },
            "500": { description: "Unknown error" },
          },
        },
        patch: {
          tags: ["Comments"],
          summary: "Update a comment",
          parameters: [
            {
              name: "commentId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                  },
                  required: ["content"],
                },
              },
            },
          },
          responses: {
            "200": { description: "Comment updated successfully" },
            "401": { description: "Unauthorized" },
            "404": { description: "Comment not found" },
            "500": { description: "Unknown error" },
          },
        },
      },
    },
  });
});
