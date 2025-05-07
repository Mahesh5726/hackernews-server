import auth from "../../lib/auth";
import { createUnsecureRoute } from "../middleware/session-middleware";

export const authenticationsRoutes = createUnsecureRoute();

authenticationsRoutes.use((c) => {
  return auth.handler(c.req.raw);
});
