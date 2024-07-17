import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate';
import { createPostInput, updatePostInput } from '@sameer119/bloggingweb-types';
import { Hono } from 'hono'
import { jwtVerify } from 'jose';


interface CustomContext {
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
    Variables: {
        userId: string;
    };
}

export const blogRouter = new Hono<CustomContext>()


blogRouter.use("/*", async (c, next) => {
    try {
        const authHeader = c.req.header("Authorization") || "";
        if(authHeader && authHeader.startsWith('Bearer ')){
            const token=authHeader.split(' ')[1];
            const {payload}=await jwtVerify(token,new TextEncoder().encode(c.env.JWT_SECRET))
            if (payload && typeof payload === 'object' && 'id' in payload) {
                c.set('userId', payload.id as string);
            }
            await next()
        }
    } catch (error) {
        console.error("Authorization error:", error);
        c.status(403);
        return c.json({ error: "Unauthorized" });
    }
});


blogRouter.post('/blog',async (c)=>{
    try{
        const userId = c.get('userId');
        const prisma = new PrismaClient({
            datasourceUrl: c.env?.DATABASE_URL	,
        }).$extends(withAccelerate());
        console.log(userId)
        const body = await c.req.json();
        const {success}=createPostInput.safeParse(body)
        if(!success){
            c.status(411)
        return c.json({
            message:"Incorrect inputs"
        })
        }
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId,
                topic: body.topic,

            }
        });
        c.status(200)
        return c.json({
            id: blog.id
        });
        
    }catch(error){
        c.status(422);
        return c.json({ error: "Error while posting the blog" });
    }
    
})


blogRouter.put('/blog',async(c)=>{
    try{
        const userId = c.get('userId');
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL	,
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const{success}=updatePostInput.safeParse(body);
        if(!success){
            c.status(411)
            return c.json({
                message:"Incorrect input"
            })
        }
        prisma.post.update({
            where: {
                id: body.id,
                authorId: userId
            },
            data: {
                title: body.title,
                content: body.content
            }
        });
        prisma.$disconnect
        c.status(200)
        return c.text('updated post');
    }catch(error){
        c.status(422);
        return c.json({ error: "Error while updating the blog" });
    }
})
blogRouter.delete('/blog/:id',async (c)=>{
    try{
        const id=c.req.param("id");
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL	,
        }).$extends(withAccelerate());

        const post=await prisma.post.findUnique({
            where:{
                id
            }
        })
        c.status(200)
        return c.json({
            message:"Post deleted"
        })
    }catch(error){
        c.status(422);
        return c.json({ error: "Error while deleting the blog" });
    }
})
blogRouter.get('/blog/:id',async (c)=>{
    try{
        const id =  c.req.param("id");
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL	,
        }).$extends(withAccelerate());
        
        const post = await prisma.post.findUnique({
            where: {
                id
            },
            include:{
                _count:{
                    select:{ 
                        likes:true,
                        comments:true
                    }
                }
            }
        });
        c.status(200)
        return c.json({
            post
        });
    }catch(error){
        c.status(422);
        return c.json({ error: "Error while getting the blog" });
    }
    
})

blogRouter.get('/bulk',async (c)=>{
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL	,
        }).$extends(withAccelerate());
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = parseInt(c.req.query('limit') || '10', 10);
        const offset = (page - 1) * limit;
        const posts = await prisma.post.findMany({
            skip: offset,
            take: limit,
        });
        const totalBlogs = await prisma.post.count();
        c.status(200)
        return c.json({
            posts,
            page,
            limit,
            totalPages: Math.ceil(totalBlogs / limit),
            totalBlogs,
        });
    }catch(error){
        c.status(422);
        return c.json({ error: "Error while getting the all blogs" });
    }
    
})

blogRouter.post('/:postId/comments', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        const postId=c.req.param('postId')
        const body = await c.req.json();
        const { content } = body;
    
        if (!content || !postId) {
        c.status(400);
        return c.json({ message: "Missing required fields (content, postId)" });
        }
    
        const currentUserId = c.get('userId');
    
        try {
        const comment = await prisma.comment.create({
            data: {
                content,
                author: { connect: { id: currentUserId } },
                post:{connect:{id:postId}}
            },
        });
        c.status(200)
        return c.json({ message: "Comment created successfully", comment });
        } catch (error) {
        console.error("Error creating comment:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
        } finally {
        await prisma.$disconnect();
        }
    }
);

blogRouter.get('/:postId/comments', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    });

    const postId = c.req.param('postId');

    try {
    const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
            author: {
                select:{
                    name:true
                }
            },
            _count:{
                select:{
                    likes:true,
                    replies:true
                }
            }
            
        },
    });
    c.status(200)
    return c.json({ comments });
    } catch (error) {
    console.error("Error fetching comments:", error);
    c.status(500);
    return c.json({ message: "Internal server error" });
    } finally {
    await prisma.$disconnect();
    }
});

blogRouter.put('/comments/:commentId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const commentId = c.req.param('commentId');
    const body = await c.req.json();
    const { content } = body;

    if (!content) {
        c.status(400);
        return c.json({ message: "Missing required field (content)" });
    }

    try {
    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
    });
    c.status(200)
    return c.json({ message: "Comment updated successfully", updatedComment });
    } catch (error) {
    console.error("Error updating comment:", error);
    c.status(500);
    return c.json({ message: "Internal server error" });
    } finally {
    await prisma.$disconnect();
    }
});


blogRouter.delete('/comments/:commentId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
    
        const commentId = c.req.param('commentId')
    
        try {
        await prisma.comment.delete({ where: { id: commentId } });
        c.status(200)
        return c.json({ message: "Comment deleted successfully" });
        } catch (error) {
        console.error("Error deleting comment:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
        } finally {
        await prisma.$disconnect();
        }
    });


blogRouter.post('/likes/:type/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
        
    const type = c.req.param('type').toLowerCase();
    const id = c.req.param('id');

    if (!['post', 'comment'].includes(type)) {
        c.status(400);
        return c.json({ message: "Invalid like type" });
    }
    
    const currentUserId = c.get('userId');
        
    try {

        const existingLike = await prisma.like.findFirst({
            where: {
                userId: currentUserId,
                ...(type === 'post' ? { postId: id } : { commentId: id })
            }
        });

        if (existingLike) {
            c.status(400);
            return c.json({ message: "You have already liked this " + type });
        }
        const likeData: any = {
            user: { connect: { id: currentUserId } },
        };
        if (type === 'post') {
            likeData.post = { connect: { id: id } };
        } else if (type === 'comment') {
            likeData.comment = { connect: { id: id } };
        }
        const like = await prisma.like.create({ data: likeData });
        c.status(200)
        return c.json({ message: "Like created successfully", like });
    } catch (error) {
        console.error("Error creating like:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
    } finally {
        await prisma.$disconnect();
    }
});


blogRouter.get('/likes/post/:postId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
        });
    
        const postId = c.req.param('postId');
    
        try {
        const likes = await prisma.like.findMany({
            where: { postId },
            include: {
                user: {
                    select:{
                        name:true
                    }
                }
            },
        });
        c.status(200)
        return c.json({ likes });
        } catch (error) {
        console.error("Error fetching likes:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
        } finally {
        await prisma.$disconnect();
        }
    });

blogRouter.get('/likes/comment/:commentId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
        });
        
        const commentId = c.req.param('commentId');
        
        try {
        const likes = await prisma.like.findMany({
            where: { commentId },
            include: {
                user: {
                    select:{
                        name:true
                    }
                }
            },
        });
        c.status(200)
        return c.json({ likes });
        } catch (error) {
        console.error("Error fetching likes:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
        } finally {
        await prisma.$disconnect();
        }
    });

blogRouter.delete('/likes/:likeId', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const likeId = c.req.param('likeId');

    try {
        await prisma.like.delete({ where: { id: likeId } });
        c.status(200)
        return c.json({ message: "Like deleted successfully" });
    } catch (error) {
        console.error("Error deleting like:", error);
        c.status(500);
        return c.json({ message: "Internal server error" });
    } finally {
        await prisma.$disconnect();
    }
});