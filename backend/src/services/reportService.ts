import { pool } from '../database/connection.js';

export async function getQuarterlySalesReport(
  year?: number,
  quarter?: number
) {
  const result = await pool.query(
    `
      SELECT
        EXTRACT(YEAR FROM o.order_date)::integer AS year,
        EXTRACT(QUARTER FROM o.order_date)::integer AS quarter,
        COUNT(DISTINCT o.id)::integer AS order_count,
        COALESCE(SUM(oi.quantity), 0)::integer AS total_volume,
        COALESCE(
          SUM(oi.quantity * p.unit_price),
          0
        )::double precision AS total_revenue
      FROM orders AS o
      JOIN order_items AS oi
        ON oi.order_id = o.id
      JOIN products AS p
        ON p.id = oi.product_id
      WHERE o.status = 'Delivered'
        AND (
          $1::integer IS NULL
          OR EXTRACT(YEAR FROM o.order_date)::integer = $1
        )
        AND (
          $2::integer IS NULL
          OR EXTRACT(QUARTER FROM o.order_date)::integer = $2
        )
      GROUP BY
        EXTRACT(YEAR FROM o.order_date),
        EXTRACT(QUARTER FROM o.order_date)
      ORDER BY year DESC, quarter DESC
    `,
    [year ?? null, quarter ?? null]
  );

  return result.rows;
}

export async function getTopProductsReport(
  year?: number,
  quarter?: number
) {
  const result = await pool.query(
    `
      WITH product_totals AS (
        SELECT
          EXTRACT(YEAR FROM o.order_date)::integer AS year,
          EXTRACT(QUARTER FROM o.order_date)::integer AS quarter,
          p.id AS product_id,
          p.name AS product_name,
          COUNT(DISTINCT o.id)::integer AS order_count,
          SUM(oi.quantity)::integer AS total_quantity,
          SUM(
            oi.quantity * p.unit_price
          )::double precision AS total_revenue
        FROM orders AS o
        JOIN order_items AS oi
          ON oi.order_id = o.id
        JOIN products AS p
          ON p.id = oi.product_id
        WHERE o.status = 'Delivered'
          AND (
            $1::integer IS NULL
            OR EXTRACT(YEAR FROM o.order_date)::integer = $1
          )
          AND (
            $2::integer IS NULL
            OR EXTRACT(QUARTER FROM o.order_date)::integer = $2
          )
        GROUP BY
          EXTRACT(YEAR FROM o.order_date),
          EXTRACT(QUARTER FROM o.order_date),
          p.id,
          p.name
      )
      SELECT
        year,
        quarter,
        product_id,
        product_name,
        order_count,
        total_quantity,
        total_revenue,
        (
          DENSE_RANK() OVER (
            PARTITION BY year, quarter
            ORDER BY total_quantity DESC
          )
        )::integer AS product_rank
      FROM product_totals
      ORDER BY
        year DESC,
        quarter DESC,
        product_rank,
        product_name
    `,
    [year ?? null, quarter ?? null]
  );

  return result.rows;
}

export async function getCitySalesReport(
  startDate?: string,
  endDate?: string
) {
  const result = await pool.query(
    `
      SELECT
        s.city,
        COUNT(DISTINCT r.id)::integer AS route_count,
        COUNT(DISTINCT o.id)::integer AS order_count,
        SUM(oi.quantity)::integer AS total_units,
        SUM(
          oi.quantity * p.unit_price
        )::double precision AS total_revenue
      FROM orders AS o
      JOIN routes AS r
        ON r.id = o.route_id
      JOIN stores AS s
        ON s.id = r.store_id
      JOIN order_items AS oi
        ON oi.order_id = o.id
      JOIN products AS p
        ON p.id = oi.product_id
      WHERE o.status = 'Delivered'
        AND (
          $1::date IS NULL
          OR o.order_date >= $1::date
        )
        AND (
          $2::date IS NULL
          OR o.order_date < $2::date + INTERVAL '1 day'
        )
      GROUP BY s.city
      ORDER BY total_revenue DESC, s.city
    `,
    [startDate ?? null, endDate ?? null]
  );

  return result.rows;
}

export async function getRouteSalesReport(
  startDate?: string,
  endDate?: string
) {
  const result = await pool.query(
    `
      SELECT
        r.id AS route_id,
        r.area_name AS route_area,
        s.id AS store_id,
        s.name AS store_name,
        s.city AS store_city,
        COUNT(DISTINCT o.id)::integer AS order_count,
        SUM(oi.quantity)::integer AS total_units,
        SUM(
          oi.quantity * p.unit_price
        )::double precision AS total_revenue
      FROM orders AS o
      JOIN routes AS r
        ON r.id = o.route_id
      JOIN stores AS s
        ON s.id = r.store_id
      JOIN order_items AS oi
        ON oi.order_id = o.id
      JOIN products AS p
        ON p.id = oi.product_id
      WHERE o.status = 'Delivered'
        AND (
          $1::date IS NULL
          OR o.order_date >= $1::date
        )
        AND (
          $2::date IS NULL
          OR o.order_date < $2::date + INTERVAL '1 day'
        )
      GROUP BY
        r.id,
        r.area_name,
        s.id,
        s.name,
        s.city
      ORDER BY total_revenue DESC, r.area_name
    `,
    [startDate ?? null, endDate ?? null]
  );

  return result.rows;
}

export async function getWorkerHoursReport(
  startDate?: string,
  endDate?: string
) {
  const result = await pool.query(
    `
      WITH worker_assignments AS (
        SELECT
          tt.driver_id AS worker_id,
          tt.start_time,
          tt.end_time
        FROM truck_trips AS tt
        WHERE tt.end_time IS NOT NULL
          AND (
            $1::date IS NULL
            OR tt.start_time >= $1::date
          )
          AND (
            $2::date IS NULL
            OR tt.start_time < $2::date + INTERVAL '1 day'
          )

        UNION ALL

        SELECT
          tt.assistant_id AS worker_id,
          tt.start_time,
          tt.end_time
        FROM truck_trips AS tt
        WHERE tt.end_time IS NOT NULL
          AND (
            $1::date IS NULL
            OR tt.start_time >= $1::date
          )
          AND (
            $2::date IS NULL
            OR tt.start_time < $2::date + INTERVAL '1 day'
          )
      )
      SELECT
        w.id AS worker_id,
        u.name AS worker_name,
        w.type AS worker_type,
        w.hourly_pay::double precision AS hourly_pay,
        COUNT(*)::integer AS trip_count,
        ROUND(
          SUM(
            EXTRACT(
              EPOCH FROM (
                worker_assignments.end_time -
                worker_assignments.start_time
              )
            ) / 3600.0
          )::numeric,
          2
        )::double precision AS total_hours
      FROM worker_assignments
      JOIN workers AS w
        ON w.id = worker_assignments.worker_id
      JOIN users AS u
        ON u.id = w.id
      GROUP BY
        w.id,
        u.name,
        w.type,
        w.hourly_pay
      ORDER BY total_hours DESC, u.name
    `,
    [startDate ?? null, endDate ?? null]
  );

  return result.rows;
}


export async function getTruckUsageReport(
  year?: number,
  month?: number
) {
  const result = await pool.query(
    `
      SELECT
        EXTRACT(YEAR FROM tt.start_time)::integer AS year,
        EXTRACT(MONTH FROM tt.start_time)::integer AS month,
        t.id AS truck_id,
        t.vehicle_no,
        COUNT(tt.id)::integer AS trip_count,
        ROUND(
          SUM(
            CASE
              WHEN tt.end_time IS NOT NULL
                THEN EXTRACT(
                  EPOCH FROM (tt.end_time - tt.start_time)
                ) / 3600.0
              ELSE 0
            END
          )::numeric,
          2
        )::double precision AS total_hours
      FROM truck_trips AS tt
      JOIN trucks AS t
        ON t.id = tt.truck_id
      WHERE (
          $1::integer IS NULL
          OR EXTRACT(YEAR FROM tt.start_time)::integer = $1
        )
        AND (
          $2::integer IS NULL
          OR EXTRACT(MONTH FROM tt.start_time)::integer = $2
        )
      GROUP BY
        EXTRACT(YEAR FROM tt.start_time),
        EXTRACT(MONTH FROM tt.start_time),
        t.id,
        t.vehicle_no
      ORDER BY
        year DESC,
        month DESC,
        trip_count DESC,
        t.vehicle_no
    `,
    [year ?? null, month ?? null]
  );

  return result.rows;
}

export async function getCustomerOrderHistory(customerId?: string) {
  const result = await pool.query(
    `
      SELECT
        o.id AS order_id,
        o.customer_id,
        customer_user.name AS customer_name,
        o.order_date,
        o.requested_delivery_date,
        o.delivery_address,
        o.status AS order_status,
        r.id AS route_id,
        r.area_name AS route_area,
        s.id AS store_id,
        s.name AS store_name,
        s.city AS store_city,
        oi.id AS order_item_id,
        oi.product_id,
        p.name AS product_name,
        oi.quantity AS ordered_quantity,
        p.unit_price::double precision AS unit_price,
        (
          oi.quantity * p.unit_price
        )::double precision AS line_total,
        di.id AS delivery_item_id,
        di.quantity AS delivery_quantity,
        di.delivery_status,
        di.delivered_at,
        tt.id AS truck_trip_id,
        tt.status AS truck_trip_status,
        tt.start_time AS truck_trip_start_time,
        tt.end_time AS truck_trip_end_time,
        t.vehicle_no
      FROM orders AS o
      JOIN users AS customer_user
        ON customer_user.id = o.customer_id
      JOIN routes AS r
        ON r.id = o.route_id
      JOIN stores AS s
        ON s.id = r.store_id
      JOIN order_items AS oi
        ON oi.order_id = o.id
      JOIN products AS p
        ON p.id = oi.product_id
      LEFT JOIN delivery_items AS di
        ON di.order_item_id = oi.id
      LEFT JOIN truck_trips AS tt
        ON tt.id = di.truck_trip_id
      LEFT JOIN trucks AS t
        ON t.id = tt.truck_id
      WHERE (
        $1::uuid IS NULL
        OR o.customer_id = $1
      )
      ORDER BY
        o.order_date DESC,
        o.id,
        oi.id,
        di.id
    `,
    [customerId ?? null]
  );

  return result.rows;
}