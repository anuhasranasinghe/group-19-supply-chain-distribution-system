CREATE OR REPLACE FUNCTION fn_check_truck_trip_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.end_time IS NOT NULL THEN
        -- 1. CHECK truck overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE truck_id = NEW.truck_id
              AND (TG_OP = 'INSERT' OR id <> NEW.id)
              AND status <> 'Completed'
              AND start_time < NEW.end_time
              AND (end_time IS NULL OR end_time > NEW.start_time)
        ) THEN
            RAISE EXCEPTION 'Truck is already booked for an overlapping time window';
        END IF;

        -- 2. CHECK driver overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE driver_id = NEW.driver_id
              AND (TG_OP = 'INSERT' OR id <> NEW.id)
              AND status <> 'Completed'
              AND start_time < NEW.end_time
              AND (end_time IS NULL OR end_time > NEW.start_time)
        ) THEN
            RAISE EXCEPTION 'Driver is already assigned to a conflicting trip';
        END IF;

        -- 3. CHECK assistant overlap
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE assistant_id = NEW.assistant_id
              AND (TG_OP = 'INSERT' OR id <> NEW.id)
              AND status <> 'Completed'
              AND start_time < NEW.end_time
              AND (end_time IS NULL OR end_time > NEW.start_time)
        ) THEN
            RAISE EXCEPTION 'Assistant is already assigned to a conflicting trip';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_truck_trip_overlap ON truck_trips;

CREATE TRIGGER trg_check_truck_trip_overlap
BEFORE INSERT OR UPDATE ON truck_trips
FOR EACH ROW
EXECUTE FUNCTION fn_check_truck_trip_overlap();