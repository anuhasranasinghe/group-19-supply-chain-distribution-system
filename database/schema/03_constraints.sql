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