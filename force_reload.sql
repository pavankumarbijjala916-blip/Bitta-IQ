-- Force a schema cache reload by making a harmless comment change on the table
COMMENT ON TABLE batteries IS 'Battery health monitoring data - Cache Reloaded';
NOTIFY pgrst, 'reload config';
