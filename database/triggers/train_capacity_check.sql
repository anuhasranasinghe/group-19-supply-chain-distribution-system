CREATE OR REPLACE FUNCTION fn_check_train_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_capacity DECIMAL(10,4);
    v_space_per_unit DECIMAL(10,4);
    v_current_allocated_space DECIMAL(10,4);
    v_new_space DECIMAL(10,4);
BEGIN
    -- 3. GET the trip's max_capacity
    SELECT max_capacity INTO v_max_capacity
    FROM train_trips
    WHERE id = NEW.train_trip_id;

    IF v_max_capacity IS NULL THEN
        RAISE EXCEPTION 'Train trip with ID % does not exist', NEW.train_trip_id;
    END IF;

    -- Get space consumption per unit for NEW item
    SELECT p.unit_space_consumption INTO v_space_per_unit
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.id = NEW.order_item_id;

    IF v_space_per_unit IS NULL THEN
        RAISE EXCEPTION 'Order item % or associated product not found', NEW.order_item_id;
    END IF;

    -- 1. CALCULATE total space currently allocated to the trip (excluding current row for UPDATE)
    SELECT COALESCE(SUM(ota.quantity_allocated * p.unit_space_consumption), 0)
    INTO v_current_allocated_space
    FROM order_train_allocations ota
    JOIN order_items oi ON ota.order_item_id = oi.id
    JOIN products p ON oi.product_id = p.id
    WHERE ota.train_trip_id = NEW.train_trip_id
      AND (TG_OP = 'INSERT' OR ota.id <> NEW.id);

    -- 2. ADD space for new/updated allocation
    v_new_space := NEW.quantity_allocated * v_space_per_unit;

    -- 4. IF total_allocated + new_space > max_capacity -> RAISE EXCEPTION
    IF (v_current_allocated_space + v_new_space) > v_max_capacity THEN
        RAISE EXCEPTION 'Allocation would exceed train trip capacity. Max: %, Already allocated: %, Required: %',
            v_max_capacity, v_current_allocated_space, v_new_space;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_train_capacity ON order_train_allocations;

CREATE TRIGGER trg_check_train_capacity
BEFORE INSERT OR UPDATE ON order_train_allocations
FOR EACH ROW
EXECUTE FUNCTION fn_check_train_capacity();