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
            }
        });

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