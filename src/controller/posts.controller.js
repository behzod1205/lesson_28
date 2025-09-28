import { postfile, userfile } from "../helpers/index.js";
import { v4 as uuidv4 } from "uuid";
import { db, getUserById, getUsersNames } from "../helpers/index.js";
import { slugify } from "../helpers/index.js";

// POSTS
/*
    0. ID - string (unique)
    1. CATEGORIES - array of strings required
    2. CREATED_AT - date required
    3. UPDATED_AT - date 
    4. AUTHOR_ID - string (user id) required
    5. VIEWS - number  || 0
    6. LIKES - number || 0
    7. LIKED_BY - array of user ids || []
    8. SUMMARY - string (max 200 chars), required
    9. CONTENT - string required
    10. TITLE - string required 
    11. SLUG - string (unique) 
    12. STATUS - string (draft, published, archived)

    title = Nega biznesga juniorlar kerak: nega aynan siz ekaningizni qanday isbotlash mumkin?
    slug = nega-biznesga-juniorlar-kerak-nega-aynan-siz-ekanligingizni-qanday-isbotlash-mumkin
    https://mohirdev.uz/blog/nega-biznesga-juniorlar-kerak/
*/

export const postsController = {
    create: async function (req, res, next) {
        try {
        const { body } = req
        if (!body.title || !body.content || !body.summary || !body.author_id || !body.categories) {
            return res.status(400).send({ message: "Title, content, summary, author_id and categories are required!" })
        }
        if (body.summary.length > 200) {
            return res.status(400).send({ message: "Summary max length is 200 characters!" })
        }
        const slug = slugify(body.title)

        const posts = await db.read(postfile)
        const slugExists = posts.find(post => post.slug === slug)

        if (slugExists) {
            return res.status(409).send({ message: "Slug already exists!" })
        }

        const users = await db.read(userfile)
        const authorExists = users.find(user => user.id === body.author_id)

        if (!authorExists) {
            return res.status(400).send({ message: "Author not found!" })
        }

        const newPost = { id: uuidv4(), ...body, created_at: new Date().toLocaleString(), views: 0, likes: 0, liked_by: [], slug, status: "draft" }

        posts.push(newPost)
        await db.write(postfile, posts)

        res.status(201).send(newPost)

        } catch (error) {
        next(error)
        }
    },
    update: async function (req, res, next) {
        try {
        const { id } = req.params
        const { body } = req
        const posts = await db.read(postfile)
        const postIndex = posts.findIndex(post => post.id === id)

        if (postIndex === -1) {
            return res.status(404).send({ message: `#${id} Post not found!` })
        }

        if (body.title) {
            const slug = slugify(body.title)
            const slugExists = posts.find(post => post.slug === slug && post.id !== id)
            if (slugExists) {
            return res.status(409).send({ message: "Slug already exists!" })
            }
            body.slug = slug
        }

        if (body.summary && body.summary.length > 200) {
            return res.status(400).send({ message: "Summary max length is 200 characters!" })
        }

        if (body.author_id) {
            const users = await db.read(userfile)
            const authorExists = users.find(user => user.id === body.author_id)

            if (!authorExists) {
            return res.status(400).send({ message: "Author not found!" })
            }
        }

        body.updated_at = new Date().toLocaleString()
        posts.splice(postIndex, 1, { ...posts[postIndex], ...body })
        const updatedPost = posts[postIndex]
        await db.write(postfile, posts)

        res.send(updatedPost)

        } catch (error) {
        next(error)
        }
    },
    delete: async function (req, res, next) {
        try{
            const { id } = req.params
            const posts = await db.read(postfile)
            const foundPostIndex = posts.findIndex(p => p.id === id)
            if(foundPostIndex === -1){
                return res.status(404).json({message: `#${id} post not found!`})
            }

            posts.splice(foundPostIndex, 1)
            await db.write(postfile, posts)
            res.status(404).json({message: `#${id} post successfully deleted!`})
        }catch(err){
            next(err)
        }
    },
    find: async function (req, res, next) {
        try{
            const { page = 1, limit = 10, search } = req.query
            const posts = await db.read(postfile)

            let filteredPosts = posts

            if (search) {
                filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.content.toLowerCase().includes(search.toLowerCase()) ||
                post.summary.toLowerCase().includes(search.toLowerCase()) ||
                post.categories.some(category => category.toLowerCase().includes(search.toLowerCase()))
                )
            }

            const startIndex = (page - 1) * limit
            const endIndex = page * limit

            const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

            res.send({
                posts: paginatedPosts,
                total: filteredPosts.length,
                page,
                limit
            })
        }catch(err){
            next(err)
        }
    },
    findOne: async function (req, res, next) {
        try{
            const { id } = req.params
            const posts = await db.read(postfile)

            const foundPostIndex = posts.findIndex(p=> p.id === id)
            if(foundPostIndex === -1){
                return res.status(404).json({message: `#${id} post not found!`})
            }

            res.status(200).json(posts[foundPostIndex])
        }catch(err){
            next(err)
        }
    },
    findByAuthorId: async function (req, res, next) {
        try{
            // const { id } = req.params
            const { page=1, limit=10, authorid } = req.query
            const posts = await db.read(postfile)
            const user = await getUserById(authorid)

            if (!user) return res.status(404).send({ message: `#${id} User not found!` })
            
            const postsByAuthor = posts.filter(p=> p.author_id === authorid)
            
            const startIndex = (page - 1) * limit
            const endIndex = page * limit

            const paginatedPosts = postsByAuthor.slice(startIndex, endIndex)

            res.send({
                users: paginatedPosts,
                total: paginatedPosts.length,
                page,
                limit
            })
        }catch(err){
            next(err)
        }
    },
    liked_by: async function (req, res, next) {
        try{
            const { id } = req.params
            const { userId } = req.body

            if(!userId) return res.status(400).json({message: "User ID is required"})

            const posts = await db.read(postfile)
            const postIndex = posts.findIndex(p=> p.id === id)

            if (postIndex === -1) return res.status(404).json({message: `#Post with ID ${id} not found!`})

            const user = await getUserById(userId)
            if (!user) return res.status(404).json({message: `#User with ID ${id} not found!`})

            const post = posts[postIndex]
            if(!Array.isArray(post.liked_by)) post.liked_by = []

            const alreadyLiked = post.liked_by.includes(userId)
            let action;

            if(alreadyLiked){
                post.liked_by = post.liked_by.filter(u=>u!==userId)
                post.likes = Math.max(0, post.likes - 1)
                action = "unliked"
            }else{
                post.liked_by.push(userId)
                post.likes += 1
                action = "liked"
            }

            post.updated_at = new Date().toLocaleString()

            posts[postIndex] = post
            await db.write(postfile, posts)

            let userNames = await getUsersNames(id)

            res.status(200).json({
                action,
                likes: post.likes,
                liked_by: userNames.join(",")
        })

        }catch(err){
            next(err)
        }
    }
}