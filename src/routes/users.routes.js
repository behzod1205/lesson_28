import { Router } from "express";
import { usersController } from "../controller/users.controller.js";

const UserRouter = Router()

UserRouter.get("/", (req, res, next)=> {
    const { age, lastName, firstName, birthday } = req.query
    if (age) {
        return usersController.findByAge(req, res, next)
    } else if (lastName || firstName) {
        return usersController.findByName(req, res, next)
    } else if (birthday) {
        return usersController.findByBirthday(req, res, next)
    }
    
    return usersController.find(req, res, next)
})
UserRouter.get("/:id", usersController.findOne)  
UserRouter.post("/", usersController.create)
UserRouter.put("/:id", usersController.update)
UserRouter.delete("/:id", usersController.delete)

export { UserRouter }
