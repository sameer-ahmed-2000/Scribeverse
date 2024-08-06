import { Hono } from 'hono';
import { handleRouter, userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();

// CORS options
const corsOptions = {
  origin: (origin: string) => {
    return origin === 'http://localhost:5173' ? origin : 'http://127.0.0.1:8787';
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.route('/api/v1/user', userRouter);
app.route('/api/v1/book', blogRouter);
app.route('/api/v1/update', handleRouter);

export default app;
