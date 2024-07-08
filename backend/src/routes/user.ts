import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { signinInput, signupInput } from '@sameer119/bloggingweb-types'
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
export const userRouter=new Hono<CustomContext>()
export const handleRouter = new Hono<CustomContext>()

handleRouter.use("/*", async (c, next) => {
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


async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10
    return hashedPassword;
}
userRouter.post('/signup',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    const {success}=signupInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message:"Incorrect inputs"
            
        })
    }

    try{
        const existingUser =await prisma.user.findFirst({
        where:{
            email:body.email
        }
        })
        if (existingUser){
        c.status(409)
        return c.json({
            message:"Email is already taken"
            
        })
    }
        const hashedPassword=await hashPassword(body.password);
        const user = await prisma.user.create({
        
        data:{
            name:body.name,
            email:body.email,
            password:hashedPassword,
        }
        
        })
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch(error){
        c.status(500);
        return c.json({ message: 'Internal server error', error: (error as Error).message });
    }finally{
        prisma.$disconnect();
    }
})
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}
userRouter.post('/signin',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    const {success}=signinInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            message:"Incorrect inputs"
            
        })
    }
    try{
        
        const User =await prisma.user.findFirst({
        where:{
            email:body.email
        }
        })
        if (!User||!(await verifyPassword(body.password,User.password))){
        c.status(403)
        return c.json({
            message:"Invalid email or password"
        })
    }

    const jwt = await sign({ id: User.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
    } catch(error){
        console.error('Error during signin:', error);
        c.status(500);
        return c.json({ message: 'Internal server error', error: (error as Error).message });
    } finally{
        prisma.$disconnect();
    }
})

handleRouter.use("/*", async (c, next) => {
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