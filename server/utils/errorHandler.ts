import { Response } from 'express';

interface ErrorLogOptions {
  error: any;
  context: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
}

export function logAndRespondError(
  res: Response,
  options: ErrorLogOptions,
  statusCode: number = 500,
  clientMessage?: string
) {
  const errorMessage = options.error?.message || String(options.error);
  const errorStack = options.error?.stack;
  
  console.error(`❌ Error in ${options.context}:`, {
    message: errorMessage,
    stack: errorStack,
    userId: options.userId,
    userName: options.userName,
    userRole: options.userRole,
    ipAddress: options.ipAddress,
    timestamp: new Date().toISOString(),
  });

  const finalMessage = clientMessage || 
    (process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred');
  
  res.status(statusCode).json({ 
    error: finalMessage,
    ...(process.env.NODE_ENV === 'development' && { 
      details: errorMessage,
      stack: errorStack 
    })
  });
}
