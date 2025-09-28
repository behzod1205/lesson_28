import { Router } from "express";
import { postsController } from "../controller/posts.controller.js";

const PostRouter = Router()

PostRouter.get("/", (req, res, next)=>{
    const { authorid } = req.query

    if (authorid) return postsController.findByAuthorId(req, res, next)

    return postsController.find(req, res, next)
})
PostRouter.get("/:id", postsController.findOne)
PostRouter.post("/", postsController.create)
PostRouter.put("/:id", postsController.update)
PostRouter.delete("/:id", postsController.delete)
PostRouter.post("/:id/like", postsController.liked_by)

export default PostRouter