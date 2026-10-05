CREATE OR REPLACE FUNCTION fn_check_working_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_week_start DATE;
    v_trip_hours DECIMAL(10,2);
    v_driver_hours DECIMAL(10,2);
    v_assistant_hours DECIMAL(10,2);
BEGIN
    -- 1. CALCULATE ISO week start (Monday)
    v_week_start := date_trunc('week', NEW.start_time)::DATE;

    -- 2. CALCULATE proposed trip duration
    v_trip_hours := EXTRACT(EPOCH FROM (
        COALESCE(NEW.end_time, NEW.start_time + INTERVAL '8 hours') - NEW.start_time
    )) / 3600.0;

    -- 3. CHECK driver's weekly hours
    v_driver_hours := calculate_weekly_hours(NEW.driver_id, v_week_start);
    IF (v_driver_hours + v_trip_hours) > 40.0 THEN
        RAISE EXCEPTION 'Driver would exceed 40-hour weekly limit. Current: % hours, Proposed addition: % hours',
            v_driver_hours, v_trip_hours;
    END IF;

    -- 4. CHECK assistant's weekly hours
    v_assistant_hours := calculate_weekly_hours(NEW.assistant_id, v_week_start);
    IF (v_assistant_hours + v_trip_hours) > 60.0 THEN
        RAISE EXCEPTION 'Assistant would exceed 60-hour weekly limit. Current: % hours, Proposed addition: % hours',
            v_assistant_hours, v_trip_hours;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_working_hours ON truck_trips;

CREATE TRIGGER trg_check_working_hours
BEFORE INSERT OR UPDATE ON truck_trips
FOR EACH ROW
EXECUTE FUNCTION fn_check_working_hours();