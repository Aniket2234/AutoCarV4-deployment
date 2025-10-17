# Deployment Guide

This guide provides instructions for deploying the Mauli Car World application to production.

## Environment Variables

The following environment variables must be configured for deployment:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `SESSION_SECRET` | Secret key for session encryption | `your-secure-random-string-min-32-chars` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Replit uses 5000) | `5000` |

### Security Notes

1. **SESSION_SECRET**: Generate a secure random string (minimum 32 characters)
   ```bash
   # Generate a secure secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MONGODB_URI**: Use a production MongoDB instance with:
   - Strong password
   - IP whitelist configured
   - SSL/TLS enabled
   - Regular backups enabled

## Deployment Options

### Option 1: Replit Deployment (Recommended)

Replit provides built-in deployment tools that work seamlessly with this application.

#### Prerequisites
- MongoDB Atlas account or MongoDB instance
- Configured environment variables in Replit Secrets

#### Steps
1. Configure environment variables:
   - Go to Replit Secrets (lock icon in left sidebar)
   - Add all required variables listed above
   
2. Deploy using Replit's deployment system:
   - The deployment config is already set up in `.replit.deploy.json`
   - Build command: `npm run build`
   - Run command: `npm run start`
   
3. The application will be available at your Replit deployment URL

### Option 2: Vercel Deployment

#### Prerequisites
- Vercel account
- MongoDB Atlas account
- PostgreSQL database (for session storage - required for serverless)
- Vercel CLI installed (`npm i -g vercel`)

#### Why PostgreSQL is Required
Vercel uses serverless functions, which means each request may be handled by a different server instance. The in-memory session store (MemoryStore) won't work because sessions need to be shared across all instances. PostgreSQL provides a persistent, shared session storage solution.

#### Configuration

1. **Set up PostgreSQL Database**:
   - Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres)
   - Get the connection string (DATABASE_URL)

2. **Set up environment variables in Vercel**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add DATABASE_URL
   vercel env add SESSION_SECRET
   vercel env add NODE_ENV
   ```

3. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

#### Important Notes for Vercel
- **Serverless Architecture**: Each API request may run on a different server instance
- **Session Storage**: Uses PostgreSQL (connect-pg-simple) instead of MemoryStore for session persistence
- **MongoDB Connection**: Uses connection caching to optimize database connections
- **Static Files**: Frontend is served from `/dist/client` directory
- **API Routes**: All `/api/*` requests are routed to the serverless function
- **CORS Configuration**: The vercel.json includes CORS headers. If you need credentials (cookies), you must specify an exact origin instead of using wildcards
- **Session Cookies**: Ensure your domain is configured to allow cookies in the session configuration

#### Vercel Deployment Checklist
- [ ] PostgreSQL database created and DATABASE_URL configured
- [ ] MongoDB Atlas cluster created and MONGODB_URI configured
- [ ] All environment variables set in Vercel dashboard
- [ ] `vercel.json` configuration file present (already included)
- [ ] Build succeeds locally with `npm run build`
- [ ] Deploy with `vercel --prod`

## API Logging

The application includes comprehensive API logging:

### Server-Side Logging
- All API requests are logged with method, path, status, and duration
- Errors include full stack traces in development mode
- Production errors are sanitized for security

### Browser Console Logging
- All API responses log to the browser console
- Color-coded by status (green for success, red for errors)
- Includes request method, path, status code, and duration
- Full response data available in console object

### Monitoring in Production
1. Check server logs for detailed error information
2. Use browser console to debug API issues
3. Monitor MongoDB connection status in logs

## Build Process

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

The build process:
1. Builds the frontend with Vite
2. Bundles the backend with esbuild
3. Outputs to `/dist` directory

## Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist deployment IP addresses (or use 0.0.0.0/0 for all IPs)
4. Get connection string from Atlas dashboard
5. Add connection string to environment variables

### Connection Pooling
The application uses Mongoose with connection caching to optimize database performance.

## Health Check

After deployment, verify:
1. Application is accessible at deployment URL
2. MongoDB connection is successful (check logs)
3. API endpoints respond correctly
4. Session authentication works
5. Browser console shows API logs

## Troubleshooting

### Common Issues

1. **MongoDB Connection Fails**
   - Verify MONGODB_URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

2. **Session Issues**
   - Verify SESSION_SECRET is set
   - In production, ensure cookies are configured for HTTPS
   - Consider using connect-pg-simple or connect-mongo for session storage

3. **API 500 Errors**
   - Check server logs for detailed error messages
   - Verify all environment variables are set
   - Check MongoDB connection status

4. **Build Fails**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors with `npm run check`
   - Verify Node.js version is 20.x

## Performance Optimization

1. **Database Indexes**: Already configured in models
2. **Connection Pooling**: Mongoose handles this automatically
3. **Static Asset Caching**: Configure CDN for `/dist` assets
4. **API Response Compression**: Consider adding compression middleware

## Security Checklist

- [ ] SESSION_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] HTTPS is enabled (handled by platform)
- [ ] CORS is configured if needed
- [ ] Environment variables are in Secrets/Environment Variables (not in code)
- [ ] MongoDB IP whitelist is configured
- [ ] Regular security updates for dependencies
