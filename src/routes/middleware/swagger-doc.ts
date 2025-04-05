export const swaggerDocument = {
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
  tags: [
    { name: "Authentication", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
    { name: "Posts", description: "Post management endpoints" },
    { name: "Likes", description: "Like management endpoints" },
    { name: "Comments", description: "Comment management endpoints" },
  ],
};
