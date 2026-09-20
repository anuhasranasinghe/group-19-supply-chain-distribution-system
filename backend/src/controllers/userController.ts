// User Controller

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as userService from '../services/userService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await userService.getAllUsers(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id as string);
    res.json({ success: true, data: { user } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: { user }, message: 'User created successfully' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body);
    res.json({ success: true, data: { user }, message: 'User updated successfully' });
  } catch (error) { next(error); }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(req.params.id as string);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
}
