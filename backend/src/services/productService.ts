// ============================================================
// Product Service — Product Catalog Business Logic
// ============================================================
// Handles CRUD operations for products in the Kandypack
// FMCG catalogue.
// ============================================================

import { pool } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

interface CreateProductData {
  name: string;
  unit_price: number;
  unit_space_consumption: number;
}

interface UpdateProductData {
  name?: string;
  unit_price?: number;
  unit_space_consumption?: number;
}

export async function getAllProducts(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;

  const result = await pool.query(`SELECT *
     FROM products
     ORDER BY name ASC, id ASC
     LIMIT $1 OFFSET $2`, [limit, offset]);
  const countResult = await pool.query(`SELECT COUNT(*) AS count
     FROM products`);

  return {
    products: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

export async function getProductById(productId: string) {

  const result = await pool.query(`SELECT *
     FROM products
     WHERE id = $1`, [productId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return result.rows[0];
}

export async function createProduct(data: CreateProductData) {

  const result = await pool.query(`INSERT INTO products (
       name,
       unit_price,
       unit_space_consumption
     )
     VALUES ($1, $2, $3)
     RETURNING *`, [
    data.name, data.unit_price, data.unit_space_consumption
  ]);

  return result.rows[0];
}

export async function updateProduct(productId: string, data: UpdateProductData) {

  const result = await pool.query(`UPDATE products
     SET name = COALESCE($2, name),
         unit_price = COALESCE($3, unit_price),
         unit_space_consumption = COALESCE(
           $4,
           unit_space_consumption
         ),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`, [
    productId, data.name, data.unit_price, data.unit_space_consumption
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return result.rows[0];
}

export async function deleteProduct(productId: string) {

  const result = await pool.query(`DELETE FROM products
     WHERE id = $1
     RETURNING id`, [productId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return { deleted: true };
}
