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

    -- Store IDs
    st_colombo UUID := 'b0000000-0000-0000-0000-000000000001';
    st_galle UUID := 'b0000000-0000-0000-0000-000000000002';
    st_matara UUID := 'b0000000-0000-0000-0000-000000000003';
    st_jaffna UUID := 'b0000000-0000-0000-0000-000000000004';
    st_trinco UUID := 'b0000000-0000-0000-0000-000000000005';
    st_batta UUID := 'b0000000-0000-0000-0000-000000000006';

    -- Route IDs
    rt_col1 UUID := 'c0000000-0000-0000-0000-000000000001';
    rt_col2 UUID := 'c0000000-0000-0000-0000-000000000002';
    rt_gal1 UUID := 'c0000000-0000-0000-0000-000000000003';
    rt_gal2 UUID := 'c0000000-0000-0000-0000-000000000004';
    rt_mat1 UUID := 'c0000000-0000-0000-0000-000000000005';
    rt_mat2 UUID := 'c0000000-0000-0000-0000-000000000006';
    rt_jaf1 UUID := 'c0000000-0000-0000-0000-000000000007';
    rt_jaf2 UUID := 'c0000000-0000-0000-0000-000000000008';
    rt_tri1 UUID := 'c0000000-0000-0000-0000-000000000009';
    rt_tri2 UUID := 'c0000000-0000-0000-0000-000000000010';
    rt_bat1 UUID := 'c0000000-0000-0000-0000-000000000011';
    rt_bat2 UUID := 'c0000000-0000-0000-0000-000000000012';

    -- Product IDs
    p_det1kg UUID := 'd0000000-0000-0000-0000-000000000001';
    p_soap100g UUID := 'd0000000-0000-0000-0000-000000000002';
    p_shampoo200ml UUID := 'd0000000-0000-0000-0000-000000000003';
    p_tea500g UUID := 'd0000000-0000-0000-0000-000000000004';
    p_biscuit400g UUID := 'd0000000-0000-0000-0000-000000000005';
    p_oil1l UUID := 'd0000000-0000-0000-0000-000000000006';
    p_flour1kg UUID := 'd0000000-0000-0000-0000-000000000007';
    p_sugar1kg UUID := 'd0000000-0000-0000-0000-000000000008';
    p_milk500g UUID := 'd0000000-0000-0000-0000-000000000009';
    p_noodle400g UUID := 'd0000000-0000-0000-0000-000000000010';

    -- Train Trip IDs
    tt_col1 UUID := 'e0000000-0000-0000-0000-000000000001';
    tt_col2 UUID := 'e0000000-0000-0000-0000-000000000002';
    tt_gal1 UUID := 'e0000000-0000-0000-0000-000000000003';
    tt_mat1 UUID := 'e0000000-0000-0000-0000-000000000004';
    tt_jaf1 UUID := 'e0000000-0000-0000-0000-000000000005';

    -- Variables used by the order and order-item seed loop
    v_ord_id UUID;
    v_ord_item_id UUID;
    v_overflow_item_id UUID;

    -- Truck IDs from the reference project
    tr_01 UUID := 'f0000000-0000-0000-0000-000000000001';
    tr_02 UUID := 'f0000000-0000-0000-0000-000000000002';
    tr_03 UUID := 'f0000000-0000-0000-0000-000000000003';
    tr_04 UUID := 'f0000000-0000-0000-0000-000000000004';


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

    -- 4. STORES
    INSERT INTO stores (id, name, city, location, managed_by) VALUES
    (st_colombo, 'Colombo Central Depot', 'Colombo', 'Pettah Goods Yard, Colombo', u_mgr1),
    (st_galle, 'Galle Southern Hub', 'Galle', 'Station Road, Galle', u_mgr2),
    (st_matara, 'Matara Regional Store', 'Matara', 'Railway Avenue, Matara', u_mgr3),
    (st_jaffna, 'Jaffna Northern Terminal', 'Jaffna', 'Station Road, Jaffna', u_mgr4),
    (st_trinco, 'Trincomalee Bay Depot', 'Trincomalee', 'Harbour Road, Trincomalee', u_mgr5),
    (st_batta, 'Batticaloa East Hub', 'Batticaloa', 'Station Road, Batticaloa', u_mgr6)
    ON CONFLICT (id) DO NOTHING;

    -- 5. ROUTES
    INSERT INTO routes (id, store_id, area_name, max_delivery_time) VALUES
    (rt_col1, st_colombo, 'Colombo North & Central', INTERVAL '4 hours'),
    (rt_col2, st_colombo, 'Colombo South & Suburbs', INTERVAL '5 hours'),
    (rt_gal1, st_galle, 'Galle Fort & Coastal Zone', INTERVAL '3 hours'),
    (rt_gal2, st_galle, 'Galle Inland Route', INTERVAL '4 hours'),
    (rt_mat1, st_matara, 'Matara Town Route', INTERVAL '3 hours'),
    (rt_mat2, st_matara, 'Weligama - Matara Corridor', INTERVAL '4 hours'),
    (rt_jaf1, st_jaffna, 'Jaffna City Center', INTERVAL '4 hours'),
    (rt_jaf2, st_jaffna, 'Nallur & Peninsula Outer', INTERVAL '5 hours'),
    (rt_tri1, st_trinco, 'Trinco Town & Bay Zone', INTERVAL '4 hours'),
    (rt_tri2, st_trinco, 'China Bay Industrial Area', INTERVAL '4 hours'),
    (rt_bat1, st_batta, 'Batticaloa Town Center', INTERVAL '4 hours'),
    (rt_bat2, st_batta, 'Kattankudy & Coastal Route', INTERVAL '5 hours')
    ON CONFLICT (id) DO NOTHING;

    -- 6. PRODUCTS
    INSERT INTO products (id, name, unit_price, unit_space_consumption) VALUES
    (p_det1kg, 'KandyPack Detergent Powder 1kg', 450.00, 0.5000),
    (p_soap100g, 'KandyPack Beauty Soap 100g', 120.00, 0.1000),
    (p_shampoo200ml, 'KandyPack Herbal Shampoo 200ml', 350.00, 0.2000),
    (p_tea500g, 'Ceylon Premium Black Tea 500g', 850.00, 0.4000),
    (p_biscuit400g, 'KandyPack Cream Crackers 400g', 280.00, 0.3000),
    (p_oil1l, 'Pure Coconut Cooking Oil 1L', 950.00, 0.8000),
    (p_flour1kg, 'White Wheat Flour 1kg', 220.00, 0.5000),
    (p_sugar1kg, 'Refined White Sugar 1kg', 240.00, 0.5000),
    (p_milk500g, 'Full Cream Milk Powder 500g', 1100.00, 0.4000),
    (p_noodle400g, 'Instant Fried Noodles 400g', 180.00, 0.3000)
    ON CONFLICT (id) DO NOTHING;

    -- 7. TRAIN TRIPS
    INSERT INTO train_trips (
        id, from_city, to_city, destination_store_id,
        trip_date, departure_time, arrival_time, max_capacity
    ) VALUES
    (tt_col1, 'Kandy', 'Colombo', st_colombo,
     CURRENT_DATE + INTERVAL '1 day',
     CURRENT_TIMESTAMP + INTERVAL '1 day',
     CURRENT_TIMESTAMP + INTERVAL '1 day 4 hours',
     1000),
    
    (tt_col2, 'Kandy', 'Colombo', st_colombo,
     CURRENT_DATE + INTERVAL '2 days',
     CURRENT_TIMESTAMP + INTERVAL '2 days',
     CURRENT_TIMESTAMP + INTERVAL '2 days 4 hours',
     1000),
    
    (tt_gal1, 'Kandy', 'Galle', st_galle,
     CURRENT_DATE + INTERVAL '1 day',
     CURRENT_TIMESTAMP + INTERVAL '1 day 1 hour',
     CURRENT_TIMESTAMP + INTERVAL '1 day 6 hours',
     800),
    
    (tt_mat1, 'Kandy', 'Matara', st_matara,
     CURRENT_DATE + INTERVAL '2 days',
     CURRENT_TIMESTAMP + INTERVAL '2 days 1 hour',
     CURRENT_TIMESTAMP + INTERVAL '2 days 7 hours',
     800),
    
    (tt_jaf1, 'Kandy', 'Jaffna', st_jaffna,
     CURRENT_DATE + INTERVAL '1 day',
     CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours',
     CURRENT_TIMESTAMP + INTERVAL '1 day 9 hours',
     1200)
    
    ON CONFLICT (id) DO NOTHING;

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

        IF i = 6 THEN
            v_overflow_item_id := v_ord_item_id;
        END IF;

        v_ord_item_id := gen_random_uuid();
        INSERT INTO order_items (id, order_id, product_id, quantity)
        VALUES (v_ord_item_id, v_ord_id, p_tea500g, 5 + (i % 4));
    END LOOP;

    -- 10. ORDER TRAIN ALLOCATIONS
    
    INSERT INTO order_train_allocations (
        id,
        order_item_id,
        train_trip_id,
        quantity_allocated
    ) VALUES
    (
        gen_random_uuid(),
        v_overflow_item_id,
        tt_col1,
        6
    ),
    (
        gen_random_uuid(),
        v_overflow_item_id,
        tt_col2,
        5
    );

    -- 11. TRUCKS
    INSERT INTO trucks (id, vehicle_no, capacity) VALUES
    (tr_01, 'WP-GA-1001', 500.00),
    (tr_02, 'SP-GB-2002', 450.00),
    (tr_03, 'NP-GC-3003', 600.00),
    (tr_04, 'EP-GD-4004', 500.00)
    ON CONFLICT (id) DO NOTHING;


    -- 12. TRUCK TRIPS
    INSERT INTO truck_trips (
        id, truck_id, driver_id, assistant_id, route_id,
        start_time, end_time, status
    ) VALUES
    (
        gen_random_uuid(), tr_01, u_drv1, u_ast1, rt_col1,
        CURRENT_TIMESTAMP + INTERVAL '8 days',
        CURRENT_TIMESTAMP + INTERVAL '8 days 4 hours',
        'Scheduled'
    ),
    (
        gen_random_uuid(), tr_02, u_drv2, u_ast2, rt_gal1,
        CURRENT_TIMESTAMP + INTERVAL '9 days',
        CURRENT_TIMESTAMP + INTERVAL '9 days 4 hours',
        'Scheduled'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 14. INVENTORY
    INSERT INTO inventory (id, store_id, product_id, quantity) VALUES
    (gen_random_uuid(), st_colombo, p_det1kg, 500),
    (gen_random_uuid(), st_colombo, p_tea500g, 300),
    (gen_random_uuid(), st_galle, p_det1kg, 400),
    (gen_random_uuid(), st_matara, p_soap100g, 1000)
    ON CONFLICT DO NOTHING;

END $$;


