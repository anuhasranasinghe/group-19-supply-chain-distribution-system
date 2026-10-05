CREATE OR REPLACE FUNCTION update_delivery_status(
    p_delivery_item_id UUID,
    p_new_status VARCHAR(50),
    p_changed_by UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status VARCHAR(50);
BEGIN
    -- Read and lock the delivery row during this transaction.
    SELECT delivery_status
    INTO v_current_status
    FROM delivery_items
    WHERE id = p_delivery_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Delivery item % does not exist',
            p_delivery_item_id;
    END IF;

    IF p_new_status IS NULL THEN
        RAISE EXCEPTION 'Delivery status cannot be NULL';
    END IF;

    -- Allow only valid status transitions.
    IF NOT (
        (v_current_status = 'Pending'
            AND p_new_status = 'Scheduled')
        OR
        (v_current_status = 'Scheduled'
            AND p_new_status IN ('Delivered', 'Failed'))
        OR
        (v_current_status = 'Failed'
            AND p_new_status = 'Returned')
    ) THEN
        RAISE EXCEPTION
            'Invalid delivery status transition from % to %',
            v_current_status, p_new_status;
    END IF;

    UPDATE delivery_items
    SET delivery_status = p_new_status,
        delivered_at = CASE
            WHEN p_new_status = 'Delivered'
                THEN CURRENT_TIMESTAMP
            ELSE NULL
        END
    WHERE id = p_delivery_item_id;

    -- Order completion is handled by the Phase 6 trigger.
    -- p_changed_by is retained for backend compatibility;
    -- actor audit logging is not implemented here.
END;
$$;