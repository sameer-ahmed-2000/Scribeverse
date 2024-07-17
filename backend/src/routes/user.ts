import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { interestInput, signinInput, signupInput } from '@sameer119/bloggingweb-types'
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
        return c.json({ id:user.id, jwt });
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
    return c.json({ id:User.id,jwt });
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

handleRouter.get('/me',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const userId=c.get('userId')
        const user=await prisma.user.findFirst({
            where:{
                id:userId
            },
            include:{
                following:true,
                followers:true,
                _count:{
                    select:{
                        following:true,
                        followers:true
                    }
                }
            }
        })
        c.status(200)
        return c.json({
            user,
            
        })
    }catch{

    }
})

handleRouter.post('/update-interests', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    const parsedInput = interestInput.safeParse(body);
    if(!parsedInput.success){
        c.status(411)
        return c.json({
            message:"Incorrect inputs"
            
        })
    }
    const {add=[]}=parsedInput.data||{}

    try {
        const userId=c.get('userId')
        const user= await prisma.user.findFirst({
            where:{
                id:userId
            },
            select:{
                interests:true
            }
        })
        let newInterest=user?.interests||[];
        newInterest=Array.from(new Set([...newInterest,...add]))
        await prisma.user.update({
            data:{
                interests:newInterest
            },
            where:{id:userId}
        })
        c.status(200)
        return c.json({
            message:"Interests updated successfully",
            interests:newInterest
        })
        
    } catch (error) {
        c.status(500)
        c.json({ message: "Internal server error" });
    } finally {
        await prisma.$disconnect();
    }
});

handleRouter.post('/delete-interests', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    const parsedInput = interestInput.safeParse(body);
    if(!parsedInput.success){
        c.status(411)
        return c.json({
            message:"Incorrect inputs"
            
        })
    }
    const {remove=[]}=parsedInput.data||{}

    try {
        const userId=c.get('userId')
        const user= await prisma.user.findFirst({
            where:{
                id:userId
            },
            select:{
                interests:true
            }
        })
        let removeInterest=user?.interests||[];
        removeInterest = removeInterest.filter(interest => !remove.includes(interest));
        await prisma.user.update({
            data:{
                interests:removeInterest
            },
            where:{id:userId}
        })
        c.status(200)
        return c.json({
            message:"Interests updated successfully",
            interests:removeInterest
        })
        
    } catch (error) {
        c.status(500)
        return c.json({message:"Error while updating"})
    } finally {
        await prisma.$disconnect();
    }
});

handleRouter.post('/follow/:id', async (c) => {
    const id=c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userIdToFollow  = id;

    if (!userIdToFollow) {
        c.status(400);
        return c.json({ message: "User ID to follow is required" });
    }

    try {
        const currentUserId = c.get('userId');
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userIdToFollow,
                },
            },
        });

        if (existingFollow) {
            c.status(409);
            return c.json({ message: "You are already following this user" });
        }
        await prisma.$transaction([
            prisma.follow.create({
                data: {
                    followerId: currentUserId,
                    followingId: userIdToFollow,
                },
            }),
            prisma.user.update({
                where: { id: currentUserId },
                data: {
                    following: {},
                },
            }),
            prisma.user.update({
                where: { id: userIdToFollow },
                data: {
                    followers: {},
                },
            }),
        ]);
        c.status(200)
        return c.json({ message: "Successfully followed the user" });
    } catch (error) {
        console.error("Error following user:", error);
        c.status(500);
        return c.json({ message: "Internal server error", error });
    } finally {
        await prisma.$disconnect();
    }
});


handleRouter.post('/unfollow/:id', async (c) => {
    const id=c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userIdToUnfollow = id;
    if (!userIdToUnfollow) {
        c.status(400);
        return c.json({ message: "User ID to unfollow is required" });
    }

    try {
        const currentUserId = c.get('userId');
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userIdToUnfollow,
                },
            },
        });

        if (!existingFollow) {
            c.status(404);
            return c.json({ message: "You are not following this user" });
        }
        await prisma.$transaction([
            prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: userIdToUnfollow,
                    },
                },
            }),
            prisma.user.update({
                where: { id: currentUserId },
                data: {
                    following: {},
                },
            }),
            prisma.user.update({
                where: { id: userIdToUnfollow },
                data: {
                    followers: {},
                },
            }),
        ]);
        c.status(200)
        return c.json({ message: "Successfully unfollowed the user" });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        c.status(500);
        return c.json({ message: "Internal server error", error});
    } finally {
        await prisma.$disconnect();
    }
});
