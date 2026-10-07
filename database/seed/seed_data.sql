DO $$
DECLARE
    -- Password hash for 'password123'
    v_pwd VARCHAR(255) := '$2a$10$e8wFvVnJ.G5g5X1xY5g5X.wFvVnJ.G5g5X1xY5g5X.wFvVnJ.G5g5';

    -- User IDs
    u_admin UUID := 'a0000000-0000-0000-0000-000000000001';
    u_dispatcher UUID := 'a0000000-0000-0000-0000-000000000002';
    
    -- Store Managers
    u_mgr1 UUID := 'a0000000-0000-0000-0000-000000000011';
    u_mgr2 UUID := 'a0000000-0000-0000-0000-000000000012';
    u_mgr3 UUID := 'a0000000-0000-0000-0000-000000000013';
    u_mgr4 UUID := 'a0000000-0000-0000-0000-000000000014';
    u_mgr5 UUID := 'a0000000-0000-0000-0000-000000000015';
    u_mgr6 UUID := 'a0000000-0000-0000-0000-000000000016';

    -- Drivers
    u_drv1 UUID := 'a0000000-0000-0000-0000-000000000021';
    u_drv2 UUID := 'a0000000-0000-0000-0000-000000000022';
    u_drv3 UUID := 'a0000000-0000-0000-0000-000000000023';
    u_drv4 UUID := 'a0000000-0000-0000-0000-000000000024';

    -- Assistants
    u_ast1 UUID := 'a0000000-0000-0000-0000-000000000031';
    u_ast2 UUID := 'a0000000-0000-0000-0000-000000000032';
    u_ast3 UUID := 'a0000000-0000-0000-0000-000000000033';
    u_ast4 UUID := 'a0000000-0000-0000-0000-000000000034';

    -- Customers
    u_cust1 UUID := 'a0000000-0000-0000-0000-000000000041';
    u_cust2 UUID := 'a0000000-0000-0000-0000-000000000042';
    u_cust3 UUID := 'a0000000-0000-0000-0000-000000000043';
    u_cust4 UUID := 'a0000000-0000-0000-0000-000000000044';
    u_cust5 UUID := 'a0000000-0000-0000-0000-000000000045';
    u_cust6 UUID := 'a0000000-0000-0000-0000-000000000046';
    u_cust7 UUID := 'a0000000-0000-0000-0000-000000000047';
    u_cust8 UUID := 'a0000000-0000-0000-0000-000000000048';
    u_cust9 UUID := 'a0000000-0000-0000-0000-000000000049';
    u_cust10 UUID := 'a0000000-0000-0000-0000-000000000050';


BEGIN
    -- 1. USERS
    INSERT INTO users (id, username, password_hash, name, system_role) VALUES
    (u_admin, 'admin', v_pwd, 'System Administrator', 'admin'),
    (u_dispatcher, 'dispatcher', v_pwd, 'Chief Dispatcher', 'dispatcher'),
    (u_mgr1, 'mgr_colombo', v_pwd, 'Sunil Perera', 'store_manager'),
    (u_mgr2, 'mgr_galle', v_pwd, 'Kamal Silva', 'store_manager'),
    (u_mgr3, 'mgr_matara', v_pwd, 'Nimal Fernando', 'store_manager'),
    (u_mgr4, 'mgr_jaffna', v_pwd, 'K. Rajan', 'store_manager'),
    (u_mgr5, 'mgr_trinco', v_pwd, 'S. Thaniga', 'store_manager'),
    (u_mgr6, 'mgr_batta', v_pwd, 'M. Farook', 'store_manager'),
    (u_drv1, 'driver_1', v_pwd, 'Saman Kumara', 'driver'),
    (u_drv2, 'driver_2', v_pwd, 'Bandara Herath', 'driver'),
    (u_drv3, 'driver_3', v_pwd, 'Chathura Jay', 'driver'),
    (u_drv4, 'driver_4', v_pwd, 'Dhammika P', 'driver'),
    (u_ast1, 'ast_1', v_pwd, 'Ruwan Senanayake', 'assistant'),
    (u_ast2, 'ast_2', v_pwd, 'Nuwan Pradeep', 'assistant'),
    (u_ast3, 'ast_3', v_pwd, 'Kasun Rajitha', 'assistant'),
    (u_ast4, 'ast_4', v_pwd, 'Dinesh Chandimal', 'assistant'),
    (u_cust1, 'cust_col1', v_pwd, 'Lanka Traders Colombo', 'customer'),
    (u_cust2, 'cust_col2', v_pwd, 'Colombo Supermart', 'customer'),
    (u_cust3, 'cust_gal1', v_pwd, 'Southern Wholesale Galle', 'customer'),
    (u_cust4, 'cust_gal2', v_pwd, 'Galle Mini Market', 'customer'),
    (u_cust5, 'cust_mat1', v_pwd, 'Matara Retailers', 'customer'),
    (u_cust6, 'cust_jaf1', v_pwd, 'Jaffna Distributors', 'customer'),
    (u_cust7, 'cust_jaf2', v_pwd, 'Northern Stores Jaffna', 'customer'),
    (u_cust8, 'cust_tri1', v_pwd, 'Eastern Supply Trinco', 'customer'),
    (u_cust9, 'cust_bat1', v_pwd, 'Batticaloa Depot', 'customer'),
    (u_cust10, 'cust_col3', v_pwd, 'Metro Groceries Colombo', 'customer')
    ON CONFLICT (id) DO NOTHING;

    -- 2. CUSTOMERS
    INSERT INTO customers (id, street_name, city, postal_code, phone_no) VALUES
    (u_cust1, 'Main Street 100', 'Colombo', '00100', '0771234561'),
    (u_cust2, 'Galle Road 450', 'Colombo', '00300', '0771234562'),
    (u_cust3, 'Fort Station Road 12', 'Galle', '80000', '0771234563'),
    (u_cust4, 'Matara Road 88', 'Galle', '80000', '0771234564'),
    (u_cust5, 'Beach Road 25', 'Matara', '81000', '0771234565'),
    (u_cust6, 'Kandy Road 300', 'Jaffna', '40000', '0771234566'),
    (u_cust7, 'Hospital Road 15', 'Jaffna', '40000', '0771234567'),
    (u_cust8, 'Dockyard Road 40', 'Trincomalee', '31000', '0771234568'),
    (u_cust9, 'Main Bazaar 77', 'Batticaloa', '30000', '0771234569'),
    (u_cust10, 'Highlevel Road 120', 'Colombo', '00500', '0771234570')
    ON CONFLICT (id) DO NOTHING;

    -- 3. WORKERS
    INSERT INTO workers (id, type, hourly_pay, phone_no) VALUES
    (u_mgr1, 'store_manager', 1500.00, '0711111111'),
    (u_mgr2, 'store_manager', 1450.00, '0711111112'),
    (u_mgr3, 'store_manager', 1400.00, '0711111113'),
    (u_mgr4, 'store_manager', 1500.00, '0711111114'),
    (u_mgr5, 'store_manager', 1400.00, '0711111115'),
    (u_mgr6, 'store_manager', 1400.00, '0711111116'),
    (u_drv1, 'driver', 1000.00, '0712222221'),
    (u_drv2, 'driver', 1000.00, '0712222222'),
    (u_drv3, 'driver', 950.00, '0712222223'),
    (u_drv4, 'driver', 950.00, '0712222224'),
    (u_ast1, 'assistant', 700.00, '0713333331'),
    (u_ast2, 'assistant', 700.00, '0713333332'),
    (u_ast3, 'assistant', 650.00, '0713333333'),
    (u_ast4, 'assistant', 650.00, '0713333334')
    ON CONFLICT (id) DO NOTHING;

END $$;


    -- 8. ORDERS & ORDER ITEMS
    FOR i IN 1..40 LOOP
        v_ord_id := gen_random_uuid();
        INSERT INTO orders (
            id, 
            customer_id, 
            order_date, 
            requested_delivery_date, 
            delivery_address, 
            route_id, 
            status
        ) VALUES (
            v_ord_id,
            CASE (i % 10)
                WHEN 0 THEN u_cust10 WHEN 1 THEN u_cust1 WHEN 2 THEN u_cust2 WHEN 3 THEN u_cust3 WHEN 4 THEN u_cust4
                WHEN 5 THEN u_cust5 WHEN 6 THEN u_cust6 WHEN 7 THEN u_cust7 WHEN 8 THEN u_cust8 ELSE u_cust9
            END,
            CURRENT_TIMESTAMP - (i || ' days')::INTERVAL,
            CURRENT_DATE + (7 + (i % 5)) * INTERVAL '1 day',
            'Sample Delivery Street Address #' || i,
            CASE (i % 6)
                WHEN 0 THEN rt_col1 WHEN 1 THEN rt_gal1 WHEN 2 THEN rt_mat1 
                WHEN 3 THEN rt_jaf1 WHEN 4 THEN rt_tri1 ELSE rt_bat1
            END,
            CASE 
                WHEN i <= 15 THEN 'Delivered' 
                WHEN i <= 30 THEN 'Scheduled' 
                ELSE 'Pending' 
            END
        );

        -- Insert 2 order items per order (Detergent + Tea)
        v_ord_item_id := gen_random_uuid();
        INSERT INTO order_items (id, order_id, product_id, quantity)
        VALUES (v_ord_item_id, v_ord_id, p_det1kg, 10 + (i % 5));

        v_ord_item_id := gen_random_uuid();
        INSERT INTO order_items (id, order_id, product_id, quantity)
        VALUES (v_ord_item_id, v_ord_id, p_tea500g, 5 + (i % 4));
    END LOOP;