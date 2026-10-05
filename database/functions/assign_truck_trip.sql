CREATE OR REPLACE FUNCTION assign_truck_trip(
    p_truck_id UUID,
    p_driver_id UUID,
    p_assistant_id UUID,
    p_route_id UUID,
    p_start_time TIMESTAMP,
    p_end_time TIMESTAMP
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_truck_trip_id UUID;
    v_driver_type VARCHAR(50);
    v_assistant_type VARCHAR(50);
    v_trip_duration INTERVAL;
    v_trip_hours DECIMAL(10,2);
    v_driver_weekly_hours DECIMAL(10,2);
    v_assistant_weekly_hours DECIMAL(10,2);
BEGIN
    -- 4. VALIDATE referenced entities exist and have correct types
    IF NOT EXISTS (SELECT 1 FROM trucks WHERE id = p_truck_id) THEN
        RAISE EXCEPTION 'Truck with ID % does not exist', p_truck_id;
    END IF;

    SELECT type INTO v_driver_type FROM workers WHERE id = p_driver_id;
    IF v_driver_type IS NULL OR v_driver_type <> 'driver' THEN
        RAISE EXCEPTION 'Worker with ID % is not a valid driver', p_driver_id;
    END IF;

    SELECT type INTO v_assistant_type FROM workers WHERE id = p_assistant_id;
    IF v_assistant_type IS NULL OR v_assistant_type <> 'assistant' THEN
        RAISE EXCEPTION 'Worker with ID % is not a valid assistant', p_assistant_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM routes WHERE id = p_route_id) THEN
        RAISE EXCEPTION 'Route with ID % does not exist', p_route_id;
    END IF;

    IF p_end_time IS NOT NULL AND p_end_time <= p_start_time THEN
        RAISE EXCEPTION 'Truck trip end time must be after start time';
    END IF;

    -- 1. VALIDATE no overlapping bookings
    IF p_end_time IS NOT NULL THEN
        -- Check truck overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE truck_id = p_truck_id
              AND status <> 'Completed'
              AND (end_time IS NULL OR end_time > p_start_time)
              AND start_time < p_end_time
        ) THEN
            RAISE EXCEPTION 'Truck % is already booked for an overlapping time window', p_truck_id;
        END IF;

        -- Check driver overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE driver_id = p_driver_id
              AND status <> 'Completed'
              AND (end_time IS NULL OR end_time > p_start_time)
              AND start_time < p_end_time
        ) THEN
            RAISE EXCEPTION 'Driver % is already booked for an overlapping time window', p_driver_id;
        END IF;

        -- Check assistant overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE assistant_id = p_assistant_id
              AND status <> 'Completed'
              AND (end_time IS NULL OR end_time > p_start_time)
              AND start_time < p_end_time
        ) THEN
            RAISE EXCEPTION 'Assistant % is already booked for an overlapping time window', p_assistant_id;
        END IF;
    END IF;

    -- 2. VALIDATE weekly working-hour limits
    IF p_end_time IS NOT NULL THEN
        v_trip_duration := p_end_time - p_start_time;
        v_trip_hours := EXTRACT(EPOCH FROM v_trip_duration) / 3600.0;

        v_driver_weekly_hours := calculate_weekly_hours(p_driver_id, p_start_time::DATE);
        IF (v_driver_weekly_hours + v_trip_hours) > 40.0 THEN
            RAISE EXCEPTION 'Driver % would exceed the 40-hour weekly limit (current: %h, new trip: %h)',
                p_driver_id, v_driver_weekly_hours, v_trip_hours;
        END IF;

        v_assistant_weekly_hours := calculate_weekly_hours(p_assistant_id, p_start_time::DATE);
        IF (v_assistant_weekly_hours + v_trip_hours) > 60.0 THEN
            RAISE EXCEPTION 'Assistant % would exceed the 60-hour weekly limit (current: %h, new trip: %h)',
                p_assistant_id, v_assistant_weekly_hours, v_trip_hours;
        END IF;
    END IF;

    -- 5. INSERT the TruckTrip row
    v_truck_trip_id := gen_random_uuid();
    INSERT INTO truck_trips (
        id,
        truck_id,
        driver_id,
        assistant_id,
        route_id,
        start_time,
        end_time,
        status
    ) VALUES (
        v_truck_trip_id,
        p_truck_id,
        p_driver_id,
        p_assistant_id,
        p_route_id,
        p_start_time,
        p_end_time,
        'Scheduled'
    );

    -- 6. RETURN the new truck trip's UUID
    RETURN v_truck_trip_id;
END;
$$;