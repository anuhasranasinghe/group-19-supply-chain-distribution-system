CREATE OR REPLACE FUNCTION fn_record_order_status_history()
RETURNS TRIGGER
LANGUAGE plpqsql
AS $$ 
BEGIN
INSERT INTO order_status_history(
    id,
    order_id,
    old_status,
    new_status,
    changed_at,
    changed_by
) VALUES(
    gen_random_uuid(),
    NEW.id,
    OLD.status,
    NEW.status,
    CURRENT_TIMESTAMP,
    NULL
);
RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_history ON orders;

CREATE TRIGGER trg_order_status_history
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status IF DISTINCT FROM NEW.status)
EXECUTE FUNCTION fn_record_order_status_history();
