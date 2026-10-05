CREATE OR REPLACE FUNCTION fn_check_consecutive_assignments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_driver_consecutive_count INT;
    v_assistant_consecutive_count INT;
BEGIN
    -- 1. CHECK driver consecutive assignments (driver cannot do 2 consecutive deliveries)
    SELECT COUNT(*)
    INTO v_driver_consecutive_count
    FROM (
        SELECT start_time
        FROM truck_trips
        WHERE driver_id = NEW.driver_id
          AND (TG_OP = 'INSERT' OR id <> NEW.id)
          AND start_time < NEW.start_time
        ORDER BY start_time DESC
        LIMIT 1
    ) recent_trips;

    -- If driver had a recent trip on the same day or immediately preceding without rest break (e.g. within 12 hours)
    IF v_driver_consecutive_count > 0 THEN
        IF EXISTS (
            SELECT 1 FROM truck_trips
            WHERE driver_id = NEW.driver_id
              AND (TG_OP = 'INSERT' OR id <> NEW.id)
              AND start_time < NEW.start_time
              AND (end_time IS NULL OR (NEW.start_time - end_time) < INTERVAL '12 hours')
        ) THEN
            RAISE EXCEPTION 'Driver cannot be scheduled for two consecutive truck deliveries without adequate rest period';
        END IF;
    END IF;

    -- 2. CHECK assistant consecutive assignments (assistant cannot do >2 consecutive routes)
    SELECT COUNT(*)
    INTO v_assistant_consecutive_count
    FROM (
        SELECT start_time
        FROM truck_trips
        WHERE assistant_id = NEW.assistant_id
          AND (TG_OP = 'INSERT' OR id <> NEW.id)
          AND start_time < NEW.start_time
          AND (end_time IS NULL OR (NEW.start_time - end_time) < INTERVAL '12 hours')
        ORDER BY start_time DESC
        LIMIT 2
    ) recent_assistant_trips;

    IF v_assistant_consecutive_count >= 2 THEN
        RAISE EXCEPTION 'Assistant cannot be scheduled for more than two consecutive routes without adequate rest period';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_consecutive_assignments ON truck_trips;

CREATE TRIGGER trg_check_consecutive_assignments
BEFORE INSERT OR UPDATE ON truck_trips
FOR EACH ROW
EXECUTE FUNCTION fn_check_consecutive_assignments();