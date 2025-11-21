-- Add 7 test families for debugging
-- Note: Replace 'YOUR_FRANCHISE_ID' with your actual franchise ID

DO $$
DECLARE
    franchise_uuid UUID := '9719702b-d755-4dec-89dc-42749f4a6cc2'::UUID;
    lead_id UUID;
    guardian_id UUID;
BEGIN
    -- Family 1: Johnson
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'new', 'Website', 'Interested in Jr program');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0101');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Emma', '2015-03-15', '{jr}');

    -- Family 2: Martinez
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'contacted', 'Referral', 'Looking for summer camp options');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Carlos', 'Martinez', 'carlos.martinez@email.com', '555-0102');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Diego', '2016-07-22', '{camp}');

    -- Family 3: Chen
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'tour_booked', 'Facebook Ad', 'Very interested in robotics');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Lisa', 'Chen', 'lisa.chen@email.com', '555-0103');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Kevin', '2014-11-08', '{create}');

    -- Family 4: Patel
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'tour_completed', 'Google Search', 'Completed tour, very positive feedback');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Priya', 'Patel', 'priya.patel@email.com', '555-0104');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Arjun', '2015-05-20', '{jr}');

    -- Family 5: Williams
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'enrolled', 'Walk-in', 'Enrolled in Jr program, starts next week');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Michael', 'Williams', 'michael.williams@email.com', '555-0105');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Sophia', '2016-01-12', '{jr}');

    -- Family 6: Anderson
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'contacted', 'Instagram', 'Has two kids, interested in both programs');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'Jennifer', 'Anderson', 'jennifer.anderson@email.com', '555-0106');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Olivia', '2015-09-03', '{jr}');
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Ethan', '2017-04-18', '{camp}');

    -- Family 7: Thompson
    lead_id := uuid_generate_v4();
    INSERT INTO leads (id, franchise_id, status, source, notes)
    VALUES (lead_id, franchise_uuid, 'lost', 'Email Campaign', 'Decided to go with competitor, price concerns');
    
    guardian_id := uuid_generate_v4();
    INSERT INTO guardians (id, lead_id, first_name, last_name, email, phone)
    VALUES (guardian_id, lead_id, 'David', 'Thompson', 'david.thompson@email.com', '555-0107');
    
    INSERT INTO students (guardian_id, first_name, dob, program_interest)
    VALUES (guardian_id, 'Liam', '2016-12-25', '{create}');

END $$;
