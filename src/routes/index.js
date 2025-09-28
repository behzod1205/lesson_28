import { Router } from "express";
import { UserRouter } from "./users.routes.js";
import PostRouter from "./posts.routes.js";
import CommentRouter from "./comments.routes.js";

const MainRouter = Router();

MainRouter.use("/users", UserRouter);
MainRouter.use("/posts", PostRouter);
MainRouter.use("/comments", CommentRouter);

export { MainRouter };
