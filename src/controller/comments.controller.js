import { db, commentfile } from "../helpers/index.js";
import { v4 as uuidv4 } from "uuid";

/*
example comment
{
  "id": "1",
  "post_id": "1",
  "author_id": "user2",
  "content": "This is a comment on the post.",
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z"
}
*/

export const commentController = {
    create: async function (req, res, next) {
        try{
            const comments = await db.read(commentfile)
            const comment = req.body
            if(!comment.post_id||!comment.author_id||!comment.content){
                return res.status(400).json({message: "PostID, AuthorID or content is required"})
            }

            const newComment = {id: uuidv4(), ...comment, created_at: new Date().toLocaleString()}
            comments.push(newComment)
            await db.write(commentfile, comments)
            res.status(200).json(newComment)
        }catch(err){
            next(err)
        }
    },
    update: async function (req, res, next) {
        try{
            const { id } = req.params
            const data = req.body
            const comments = await db.read(commentfile)
            const commentIndex = comments.findIndex(c=>c.id === id)
            if(commentIndex === -1) return res.status(404).json({message: `#Comment with Id ${id}`})

            const comment = {...comments[commentIndex], ...data, updated_at: new Date().toLocaleString()}
            comments[commentIndex] = comment
            await db.write(commentfile, comments)
            res.status(200).json(comment)
        }catch(err){
            next(err)
        }
    },
    delete: async function (req, res, next) {
        try{
            const { id } =req.params
            const comments = await db.read(commentfile)
            const commentIndex = comments.findIndex(c=>c.id === id)
            if (commentIndex ===-1) return res.status(404).json({message: `#Comment with ID ${id} not found`})

            comments.splice(commentIndex, 1)
            await db.write(commentfile, comments)

            res.status(200).json({message: `#Comment with ID ${id} successfully deleted`})
        }catch(err){
            next(err)
        }
    },
    find: async function (req, res, next) {
        try{
            const {page=1, limit=10, search} = req.query
            const comments = await db.read(commentfile)
            let filteredComs = comments

            if (search){
                filteredComs = filteredComs.filter(c=>c.post_id.toLowerCase().includes(search.toLowerCase())||
                c.author_id.toLowerCase().includes(search.toLowerCase())||
                c.content.toLowerCase().includes(search.toLowerCase()))
            }

            const startIndex = (page - 1 ) * limit
            const endIndex = page * limit

            const paginatedComments = filteredComs.slice(startIndex, endIndex)

            res.status(200).json({
                comments: paginatedComments,
                total: filteredComs.length,
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
            const comments = await db.read(commentfile)
            const comment = comments.find(c=>c.id ===id)
            if (!comment) return res.status(404).json({message: `Comment with ID ${id} not found`})
            
            res.status(200).json(comment)
        }catch(err){
            next(err)
        }
    }
}