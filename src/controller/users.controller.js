import { commentfile, db, getUserAndPosts, getUserById } from "../helpers/index.js"
import { v4 as uuidv4 } from "uuid"
import { userfile } from "../helpers/index.js"

// {
//     "firstName": "Islom",
//     "lastName": "Hamidov",
//     "birthday": "22.12.2010",
//     "gender": "MALE",
//     "age": 15,
//     "email": "islom_hamidov859@gmail.com",
//     "phone": "+9989929210825",
//     "id": "b7adaaac-aaa9-435e-abd7-ba3456ea65d8"
//   }


export const usersController = {
    create: async function (req, res, next) {
        try {
        const users = await db.read(userfile)
        const newUser = req.body

        const checkEmail = users.find(user => user.email === newUser.email)
        if (checkEmail) {
            return res.status(409).send({ message: "Email already exists!" })
        }
        newUser.id = uuidv4()

        users.push(newUser)

        await db.write(userfile, users)

        res.status(201).send(newUser)
        } catch (error) {
        next(error)
        }
    },
    update: async function (req, res, next) {
        try {
        const users = await db.read(userfile)
        const { id } = req.params
        const userIndex = users.findIndex(user => user.id === id)

        if (req.body.email) {
            const emailExists = users.find(user => user.email === req.body.email)
            if (emailExists) {
            return res.status(409).send({ message: "Email already exists!" })
            }
        }

        if (userIndex === -1) {
            return res.status(404).send({ message: `#${id} User not found!` })
        }

        users.splice(userIndex, 1, { ...users[userIndex], ...req.body })
        const updatedUser = users[userIndex]
        await db.write(userfile, users)

        res.send(updatedUser)
        } catch (error) {
        next(error)
        }
    },
    delete: async function (req, res, next) {
        try {
        const { id } = req.params
        const users = await db.read(userfile)
        const userIndex = users.findIndex(user => user.id === id)

        if (userIndex === -1) {
            return res.status(404).send({ message: `#${id} User not found!` })
        }

        users.splice(userIndex, 1)
        await db.write(userfile, users)

        res.status(204).send({message: `#${id} User deleted successfully!` })

        } catch (error) {
        next(error)
        }
    },
    find: async function (req, res, next) {
        try {
        const { page = 1, limit = 10, search } = req.query
        let users = await db.read(userfile)


        if (search) {
            users = users.filter(user =>
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.phone.toLowerCase().includes(search.toLowerCase())
            )
        }

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const paginatedUsers = users.slice(startIndex, endIndex)

        res.send({
            users: paginatedUsers,
            total: users.length,
            page,
            limit
        })
        } catch (error) {
        next(error)
        }
    },
    findByAge: async function (req, res, next) {
        try {
        const { age } = req.query
        const users = await db.read(userfile)
        const filteredUsers = users.filter(user => user.age === Number(age))

        if (filteredUsers.length === 0) {
            return res.status(404).send({ message: `No users found with age ${age}` })
        }

        res.send(filteredUsers)

        } catch (error) {
        next(error)
        }
    },
    findByName: async function (req, res, next) {
        try {
        const { firstName, lastName } = req.query
        const users = await db.read(userfile)
        let filteredUsers = users

        if (firstName) {
            filteredUsers = filteredUsers.filter(user =>
            user.firstName.toLowerCase().includes(firstName.toLowerCase())
            )
        }

        if (lastName) {
            filteredUsers = filteredUsers.filter(user =>
            user.lastName.toLowerCase().includes(lastName.toLowerCase())
            )
        }

        if (filteredUsers.length === 0) {
            return res.status(404).send({ message: `No users found with the given name` })
        }

        res.send(filteredUsers)

        } catch (error) {
        next(error)
        }
    },
    findByBirthday: async function (req, res, next) {
        try {
        const { birthday } = req.query
        const users = await db.read(userfile)
        const filteredUsers = users.filter(user => user.birthday === birthday)

        if (filteredUsers.length === 0) {
            return res.status(404).send({ message: `No users found with birthday ${birthday}` })
        }

        res.send(filteredUsers)

        } catch (error) {
        next(error)
        }
    },
    findOne: async function (req, res, next) {
        try {
        const { id } = req.params
        const user = getUserById(id)

        if (!user) {
            return res.status(404).send({ message: `#${id} User not found!` })
        }

        res.send(user)

        } catch (error) {
        next(error)
        }
    },
    findUserAndPosts: async function (req, res, next) {
        try{
            const { id } = req.params
            const { page, limit, search} = req.query
            const users = await db.read(userfile)
            const User = users.find(user=>user.id === id)
            if(!User) return res.status(404).json({message: `#User with ID ${id} not found`})
            
            const UserName = User.firstName + " " + User.lastName
            const posts = await getUserAndPosts(id)
            
            let filteredPosts = posts

            if (search) {
                filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.content.toLowerCase().includes(search.toLowerCase()) ||
                post.summary.toLowerCase().includes(search.toLowerCase()) ||
                post.categories.some(category => category.toLowerCase().includes(search.toLowerCase()))
                )
            }

            const pageNum = parseInt(page) || 1
            const limitNum = parseInt(limit) || 5

            const startIndex = (pageNum - 1) * limitNum
            const endIndex = pageNum * limitNum

            const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

            res.send({
                User: UserName,
                posts: paginatedPosts,
                total: filteredPosts.length,
                page: pageNum,
                limit: limitNum
            })

        }catch(err){
            next(err)
        }
    },
    findUserAndOnePost:  async function (req, res, next) {
        try{
            const { id, postId } = req.params
            const users = await db.read(userfile)
            const User = users.find(user=>user.id === id)
            if(!User) return res.status(404).json({message: `#User with ID ${id} not found`})
            
            const UserName = User.firstName + " " + User.lastName
            const posts = await getUserAndPosts(id)
            
            let filteredPost = posts.find(post=>post.id ===postId) || []

            res.send({
                User: UserName,
                post: filteredPost
            })

        }catch(err){
            next(err)
        }
    }, 
    findUserAndOneWithComments: async function (req, res, next) {
        try{
            const { id, postId } = req.params
            const { page, limit, search} = req.query

            const users = await db.read(userfile)
            const comments = await db.read(commentfile)

            const User = users.find(user=>user.id === id)
            if(!User) return res.status(404).json({message: `#User with ID ${id} not found`})
            
            const UserName = User.firstName + " " + User.lastName
            const posts = await getUserAndPosts(id)
            const Coms = comments.filter(com=>(com.post_id===postId&&com.author_id===id))

            let filteredPost = posts.find(post=>post.id ===postId) || []

            if(!Coms) return res.status(400).json({message: `#Post with Id ${postId} doesn't have any commnets`})
            if (search){
                Coms = Coms.filter(c=>c.post_id.toLowerCase().includes(search.toLowerCase())||
                c.author_id.toLowerCase().includes(search.toLowerCase())||
                c.content.toLowerCase().includes(search.toLowerCase()))
            }
                
            const pageNum = parseInt(page) || 1
            const limitNum = parseInt(limit) || 5

            const startIndex = (pageNum - 1) * limitNum
            const endIndex = pageNum * limitNum

            const paginatedComs = Coms.slice(startIndex, endIndex)

            res.send({
                User: UserName,
                post: filteredPost,
                comments: paginatedComs,
                page: pageNum,
                limit: limitNum
            })

        }catch(err){
            next(err)
        }
    }
}