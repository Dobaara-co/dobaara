-- Fix handle_new_user: previous regex [^a-z0-9] stripped uppercase letters before
-- lower() ran, so 'Dave' became 'ave' instead of 'dave'. Changed to [^a-zA-Z0-9].
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
  v_first := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    '[^a-zA-Z0-9]', '', 'g'
  ));
  v_last_initial := lower(left(regexp_replace(
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    '[^a-zA-Z0-9]', '', 'g'
  ), 1));

  if v_first <> '' then
    base_username := v_first || v_last_initial;
  else
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
