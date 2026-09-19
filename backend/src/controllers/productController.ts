// ============================================================
// Product Controller
// ============================================================
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as productService from '../services/productService.js';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await productService.getAllProducts(page, limit);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id as string);
    res.json({ success: true, data: { product } });
  } catch (error) { next(error); }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: { product }, message: 'Product created' });
  } catch (error) { next(error); }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    res.json({ success: true, data: { product }, message: 'Product updated' });
  } catch (error) { next(error); }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id as string);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) { next(error); }
}
