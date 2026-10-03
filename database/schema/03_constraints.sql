-- Order status must be a recognized value
ALTER TABLE orders
ADD CONSTRAINT chk_orders_status
CHECK (status IN ('Pending', 'Scheduled', 'Delivered'));

-- 7-Day Advance Order Rule
ALTER TABLE orders
ADD CONSTRAINT chk_orders_7day_rule
CHECK (requested_delivery_date >= order_date::date + INTERVAL '7 days');

-- Order item quantity must be positive
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_quantity
CHECK (quantity > 0);

-- Delivery item status must be a recognized value
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_status
CHECK (
    delivery_status IN (
        'Pending', 'Scheduled', 'Delivered', 'Failed', 'Returned'
    )
);

-- Delivery quantity must be positive
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_quantity
CHECK (quantity > 0);