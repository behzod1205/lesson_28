import { Router } from "express";
import { commentController } from "../controller/comments.controller.js";

const CommentRouter = Router()

CommentRouter.get("/", commentController.find)
CommentRouter.get("/:id", commentController.findOne)
CommentRouter.put("/:id", commentController.update)
CommentRouter.delete("/:id", commentController.delete)
CommentRouter.post("/", commentController.create)

export default CommentRouter