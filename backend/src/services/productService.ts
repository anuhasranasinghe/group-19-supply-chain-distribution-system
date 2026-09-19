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

  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from the "products" table.
  // 2. Order by name ASC for alphabetical listing.
  // 3. Apply pagination: LIMIT $1 OFFSET $2
  // 4. Also run a COUNT(*) for total products.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [limit, offset]);
  const countResult = await pool.query(`/* YOUR SQL COUNT QUERY HERE */`);

  return {
    products: result.rows,
    total: parseInt(countResult.rows[0]?.count || '0', 10),
    page,
    limit,
  };
}

export async function getProductById(productId: string) {
  // TODO: Write the PostgreSQL query here.
  //
  // This query should:
  // 1. Select all columns from "products" WHERE id = $1.
  // 2. Use parameterized query.

  const result = await pool.query(`/* YOUR SQL QUERY HERE */`, [productId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return result.rows[0];
}

export async function createProduct(data: CreateProductData) {
  // TODO: Write the PostgreSQL INSERT query here.
  //
  // INSERT INTO products (name, unit_price, unit_space_consumption)
  // VALUES ($1, $2, $3)
  // RETURNING *
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL INSERT QUERY HERE */`, [
    data.name, data.unit_price, data.unit_space_consumption
  ]);

  return result.rows[0];
}

export async function updateProduct(productId: string, data: UpdateProductData) {
  // TODO: Write the PostgreSQL UPDATE query here.
  //
  // UPDATE products SET name = COALESCE($2, name), ...
  // WHERE id = $1
  // RETURNING *
  //
  // Use COALESCE to only update provided fields.
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL UPDATE QUERY HERE */`, [
    productId, data.name, data.unit_price, data.unit_space_consumption
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return result.rows[0];
}

export async function deleteProduct(productId: string) {
  // TODO: Write the PostgreSQL DELETE query here.
  //
  // DELETE FROM products WHERE id = $1 RETURNING id
  //
  // Note: If this product has been ordered (referenced by order_items),
  // the FK constraint should prevent deletion (ON DELETE RESTRICT).
  // The database will raise an error that our error handler will catch.
  //
  // IMPORTANT: Use parameterized values via pg.

  const result = await pool.query(`/* YOUR SQL DELETE QUERY HERE */`, [productId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Product');
  }

  return { deleted: true };
}
