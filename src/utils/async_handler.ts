// src/utils/async_handler.ts

import {Request, Response, NextFunction, RequestHandler} from 'express'

// Define the AsyncRequestHandler type
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

// Async handler wrapper
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}
