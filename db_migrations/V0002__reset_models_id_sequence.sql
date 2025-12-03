-- Reset sequence for models table to start from 1
SELECT setval('models_id_seq', COALESCE((SELECT MAX(id) FROM models), 0) + 1, false);
