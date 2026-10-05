CREATE OR REPLACE FUNCTION assign_order_to_train(
    p_order_item_id UUID,
    p_train_trip_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_quantity INT;
    v_product_id UUID;
    v_space_per_unit DECIMAL(10,4);
    v_already_allocated_units INT;
    v_unallocated_units INT;
    v_max_capacity DECIMAL(10,4);
    v_allocated_space DECIMAL(10,4);
    v_remaining_space DECIMAL(10,4);
    v_units_that_fit INT;
    v_to_city VARCHAR(100);
    v_trip_date DATE;
    v_next_trip_id UUID;
BEGIN
    -- 1. RETRIEVE order item and product details
    SELECT oi.quantity, oi.product_id, p.unit_space_consumption
    INTO v_total_quantity, v_product_id, v_space_per_unit
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.id = p_order_item_id;

    IF v_total_quantity IS NULL THEN
        RAISE EXCEPTION 'Order item with ID % does not exist', p_order_item_id;
    END IF;

    -- Calculate already allocated units for this item across all trips
    SELECT COALESCE(SUM(quantity_allocated), 0)
    INTO v_already_allocated_units
    FROM order_train_allocations
    WHERE order_item_id = p_order_item_id;

    v_unallocated_units := v_total_quantity - v_already_allocated_units;

    IF v_unallocated_units <= 0 THEN
        -- All units already allocated
        RETURN;
    END IF;

    -- 2. CALCULATE remaining capacity on the specified train trip
    SELECT tt.max_capacity, tt.to_city, tt.trip_date
    INTO v_max_capacity, v_to_city, v_trip_date
    FROM train_trips tt
    WHERE tt.id = p_train_trip_id;

    IF v_max_capacity IS NULL THEN
        RAISE EXCEPTION 'Train trip with ID % does not exist', p_train_trip_id;
    END IF;

    SELECT COALESCE(SUM(ota.quantity_allocated * p.unit_space_consumption), 0)
    INTO v_allocated_space
    FROM order_train_allocations ota
    JOIN order_items oi ON ota.order_item_id = oi.id
    JOIN products p ON oi.product_id = p.id
    WHERE ota.train_trip_id = p_train_trip_id;

    v_remaining_space := v_max_capacity - v_allocated_space;

    -- 3. DETERMINE how much can fit on this trip
    IF v_remaining_space > 0 THEN
        v_units_that_fit := FLOOR(v_remaining_space / v_space_per_unit);
    ELSE
        v_units_that_fit := 0;
    END IF;

    IF v_units_that_fit > v_unallocated_units THEN
        v_units_that_fit := v_unallocated_units;
    END IF;

    -- 4. INSERT OrderTrainAllocation for what fits
    IF v_units_that_fit > 0 THEN
        INSERT INTO order_train_allocations (
            id,
            order_item_id,
            train_trip_id,
            quantity_allocated
        ) VALUES (
            gen_random_uuid(),
            p_order_item_id,
            p_train_trip_id,
            v_units_that_fit
        );

        v_unallocated_units := v_unallocated_units - v_units_that_fit;
    END IF;

    -- 5. If OVERFLOW remains: find next trip and allocate
    IF v_unallocated_units > 0 THEN
        SELECT id INTO v_next_trip_id
        FROM train_trips
        WHERE to_city = v_to_city
          AND (trip_date > v_trip_date OR (trip_date = v_trip_date AND id <> p_train_trip_id))
        ORDER BY trip_date ASC, departure_time ASC
        LIMIT 1;

        IF v_next_trip_id IS NULL THEN
            RAISE EXCEPTION 'Insufficient train cargo capacity and no subsequent train trip available for destination city %', v_to_city;
        END IF;

        -- Recursive call for remaining units
        PERFORM assign_order_to_train(p_order_item_id, v_next_trip_id);
    END IF;
END;
$$;