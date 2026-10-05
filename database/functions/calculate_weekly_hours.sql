CREATE OR REPLACE FUNCTION calculate_weekly_hours(
    p_worker_id UUID,
    p_week_start DATE
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_week_start_ts TIMESTAMP;
    v_week_end_ts TIMESTAMP;
    v_total_hours DECIMAL(10,2);
BEGIN
    -- ISO week starts Monday 00:00:00 and ends 7 days later
    v_week_start_ts := date_trunc('week', p_week_start::TIMESTAMP);
    v_week_end_ts := v_week_start_ts + INTERVAL '7 days';

    SELECT COALESCE(SUM(
        EXTRACT(EPOCH FROM (
            LEAST(COALESCE(end_time, CURRENT_TIMESTAMP), v_week_end_ts) -
            GREATEST(start_time, v_week_start_ts)
        )) / 3600.0
    ), 0.0)
    INTO v_total_hours
    FROM truck_trips
    WHERE (driver_id = p_worker_id OR assistant_id = p_worker_id)
      AND start_time < v_week_end_ts
      AND (end_time IS NULL OR end_time > v_week_start_ts);

    RETURN v_total_hours;
END;
$$;