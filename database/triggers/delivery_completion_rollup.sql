CREATE OR REPLACE FUNCTION fn_check_delivery_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
BEGIN
    SELECT order_id
    INTO v_order_id
    FROM order_items
    WHERE id = NEW.order_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Order item % does not exist',
            NEW.order_item_id;
    END IF;

    -- Serialize completion checks for the same order.
    -- NO KEY UPDATE allows foreign-key checks to proceed.
    PERFORM id
    FROM orders
    WHERE id = v_order_id
    FOR NO KEY UPDATE;

    -- Require at least one order item.
    -- Every item's successfully delivered quantity must
    -- exactly match its ordered quantity.
    IF EXISTS (
        SELECT 1
        FROM order_items
        WHERE order_id = v_order_id
    )
    AND NOT EXISTS (
        SELECT 1
        FROM order_items AS oi
        WHERE oi.order_id = v_order_id
          AND oi.quantity <> (
              SELECT COALESCE(SUM(di.quantity), 0)
              FROM delivery_items AS di
              WHERE di.order_item_id = oi.id
                AND di.delivery_status = 'Delivered'
          )
    ) THEN
        UPDATE orders
        SET status = 'Delivered',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_order_id
          AND status IS DISTINCT FROM 'Delivered';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_delivery_completion_rollup
ON delivery_items;

CREATE TRIGGER trg_delivery_completion_rollup
AFTER UPDATE OF delivery_status ON delivery_items
FOR EACH ROW
WHEN (OLD.delivery_status IS DISTINCT FROM NEW.delivery_status)
EXECUTE FUNCTION fn_check_delivery_completion();