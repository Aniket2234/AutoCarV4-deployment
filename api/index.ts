import express from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { checkInactivityTimeout } from "../server/middleware";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const PgSession = ConnectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'autoshop-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use(checkInactivityTimeout);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const statusCode = res.statusCode;
      const logLine = `${req.method} ${path} ${statusCode} in ${duration}ms`;
      
      console.log(logLine);

      const truncatedResponse = capturedJsonResponse 
        ? JSON.stringify(capturedJsonResponse).substring(0, 500) 
        : undefined;

      const logData = {
        method: req.method,
        path: path,
        status: statusCode,
        duration: duration,
        timestamp: new Date().toISOString(),
        response: truncatedResponse,
      };
      
      try {
        const logHeader = JSON.stringify(logData);
        if (logHeader.length <= 4096) {
          res.setHeader('X-API-Log', logHeader);
        }
      } catch (e) {
        console.error('Failed to set API log header:', e);
      }
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('❌ Unhandled error:', {
      error: message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: (req as any).session?.userId,
      timestamp: new Date().toISOString(),
    });

    const clientMessage = process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : message;

    res.status(status).json({ 
      error: clientMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    });
  });
})();

export default app;
