-- Update handle_new_user: username prefers first_name + last initial from metadata;
-- full_name prefers raw_user_meta_data->>'full_name' (set on email sign-up) over 'name' (Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username  text;
  final_username text;
  suffix         int := 0;
  v_first        text;
  v_last_initial text;
begin
  -- Derive username base: prefer first_name + last initial from metadata
  v_first := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    '[^a-z0-9]', '', 'g'
  ));
  v_last_initial := lower(left(regexp_replace(
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    '[^a-zA-Z0-9]', '', 'g'
  ), 1));

  if v_first <> '' then
    base_username := v_first || v_last_initial;
  else
    -- Fall back to existing email prefix / preferred_username logic
    base_username := coalesce(
      new.raw_user_meta_data->>'preferred_username',
      lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
    );
  end if;

  -- Ensure uniqueness (unchanged)
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
