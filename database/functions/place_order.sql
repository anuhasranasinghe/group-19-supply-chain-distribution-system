CREATE OR REPLACE FUNCTION place_order(
    p_customer_id UUID,
    p_delivery_address TEXT,
    p_requested_delivery_date DATE,
    p_route_id UUID,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INT;
BEGIN
    -- 1. VALIDATE the 7-day advance rule
    IF p_requested_delivery_date < CURRENT_DATE + INTERVAL '7 days' THEN
        RAISE EXCEPTION 'Order requested delivery date must be at least 7 days in advance.';
    END IF;

    -- 2. VALIDATE route coverage
    IF NOT EXISTS (SELECT 1 FROM routes WHERE id = p_route_id) THEN
        RAISE EXCEPTION 'Delivery address is not covered by any existing route';
    END IF;

    -- 3. VALIDATE customer exists
    IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id) THEN
        RAISE EXCEPTION 'Customer with ID % does not exist', p_customer_id;
    END IF;

    -- 4. VALIDATE items array
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one product item';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INT;

        IF NOT EXISTS (SELECT 1 FROM products WHERE id = v_product_id) THEN
            RAISE EXCEPTION 'Product with ID % does not exist', v_product_id;
        END IF;

        IF v_quantity IS NULL OR v_quantity <= 0 THEN
            RAISE EXCEPTION 'Product quantity must be greater than zero';
        END IF;
    END LOOP;

    -- 5. INSERT the Order row
    v_order_id := gen_random_uuid();
    INSERT INTO orders (
        id,
        customer_id,
        order_date,
        requested_delivery_date,
        delivery_address,
        route_id,
        status
    ) VALUES (
        v_order_id,
        p_customer_id,
        CURRENT_TIMESTAMP,
        p_requested_delivery_date,
        p_delivery_address,
        p_route_id,
        'Pending'
    );

    -- 6. INSERT all OrderItem rows
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INT;

        INSERT INTO order_items (
            id,
            order_id,
            product_id,
            quantity
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            v_product_id,
            v_quantity
        );
    END LOOP;

    -- 7. RETURN the new order's UUID
    RETURN v_order_id;
END;
$$;