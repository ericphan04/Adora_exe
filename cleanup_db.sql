-- SQL Script to safely delete other billboards and their associated transaction history
BEGIN;

-- 1. Create a temporary table of billboard IDs to delete
CREATE TEMP TABLE billboards_to_delete AS
SELECT id FROM billboards 
WHERE title NOT IN (
    '115 Nguyễn Văn Linh, vòng xoay ngã 6 Đà Nẵng',
    '180 Triệu Nữ Vương, vòng xoay ngã 6 Đà Nẵng',
    'Cầu Rồng – Nguyễn Văn Linh (Đài truyền hình VTV 8 Đà Nẵng)',
    'Lê Duẩn – Ông Ích Khiêm, Đà Nẵng',
    'Chợ Cồn Đà Nẵng',
    'Building JW Marriott Đà Nẵng'
);

-- 2. Create a temporary table of booking IDs to delete
CREATE TEMP TABLE bookings_to_delete AS
SELECT id FROM bookings WHERE billboard_id IN (SELECT id FROM billboards_to_delete);

-- 3. Delete payments related to the deleted bookings
DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings_to_delete);

-- 4. Delete notifications related to the deleted bookings
DELETE FROM notifications WHERE booking_id IN (SELECT id FROM bookings_to_delete);

-- 5. Delete messages in conversations related to the deleted bookings or billboards
DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations 
    WHERE booking_id IN (SELECT id FROM bookings_to_delete)
       OR billboard_id IN (SELECT id FROM billboards_to_delete)
);

-- 6. Delete conversations related to the deleted bookings or billboards
DELETE FROM conversations 
WHERE booking_id IN (SELECT id FROM bookings_to_delete)
   OR billboard_id IN (SELECT id FROM billboards_to_delete);

-- 7. Delete reviews related to the deleted bookings or billboards
DELETE FROM reviews 
WHERE booking_id IN (SELECT id FROM bookings_to_delete)
   OR billboard_id IN (SELECT id FROM billboards_to_delete);

-- 8. Delete reports related to the deleted billboards
DELETE FROM reports 
WHERE (target_type = 'BILLBOARD' AND target_id IN (SELECT id FROM billboards_to_delete));

-- 9. Delete the bookings
DELETE FROM bookings WHERE id IN (SELECT id FROM bookings_to_delete);

-- 10. Delete availability calendar, features, and images of deleted billboards
DELETE FROM billboard_availabilities WHERE billboard_id IN (SELECT id FROM billboards_to_delete);
DELETE FROM billboard_features WHERE billboard_id IN (SELECT id FROM billboards_to_delete);
DELETE FROM billboard_images WHERE billboard_id IN (SELECT id FROM billboards_to_delete);

-- 11. Finally delete the billboards
DELETE FROM billboards WHERE id IN (SELECT id FROM billboards_to_delete);

-- 12. Clean up temp tables
DROP TABLE bookings_to_delete;
DROP TABLE billboards_to_delete;

COMMIT;
