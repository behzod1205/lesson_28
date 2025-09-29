// helpers/user.service.js
import { db, userfile, postfile } from "./index.js"

export async function getUserById(id) {
    const users = await db.read(userfile)
    return users.find(user => user.id === id)
}

export async function getUsersNames(postId) {
    const users = await db.read(userfile)
    const posts = await db.read(postfile)
    const post = posts.find(p=>p.id === postId)

    if(!post) return []

    let userNames = []
    
    post.liked_by.forEach((userId)=>{
        users.forEach((user)=>{
            if(user.id === userId) userNames.push(user.firstName)
        })
    })
    return userNames
}

export async function getUserAndPosts(userId) {
    const posts = await db.read(postfile)
    // let postsWithUser = []
    const userPosts = posts.filter(p=>p.author_id===userId)
    return userPosts
}
