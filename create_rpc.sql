
-- Function to register a battery with image, bypassing PostgREST table cache
create or replace function register_battery_with_image(
  p_battery_id text,
  p_type text,
  p_voltage numeric,
  p_temperature numeric,
  p_charge_cycles integer,
  p_capacity numeric,
  p_location text,
  p_soh numeric,
  p_status text,
  p_image text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
  v_user_id uuid;
begin
  -- Get the ID of the authenticated user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into batteries (
    user_id,
    battery_id,
    type,
    voltage,
    temperature,
    charge_cycles,
    capacity,
    location,
    soh,
    status,
    image
  ) values (
    v_user_id,
    p_battery_id,
    p_type,
    p_voltage,
    p_temperature,
    p_charge_cycles,
    p_capacity,
    p_location,
    p_soh,
    p_status,
    p_image
  )
  returning json_build_object(
    'id', id,
    'battery_id', battery_id,
    'status', status,
    'image', image
  ) into v_result;

  return v_result;
end;
$$;
