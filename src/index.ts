import "dotenv/config";
import { serve } from "@hono/node-server";
import { allRoutes } from "./routes/routes-index";

serve(allRoutes, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
