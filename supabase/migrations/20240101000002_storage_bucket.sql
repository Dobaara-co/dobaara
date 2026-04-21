-- ============================================================
-- Storage bucket: listing-images
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,                     -- publicly readable
  10485760,                 -- 10 MB per file
  array['image/jpeg','image/jpg','image/png','image/webp','image/heic']
);

-- Anyone can read public listing images
create policy "listing_images_select_public"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Authenticated users can upload images into their own folder (userId/filename)
create policy "listing_images_insert_auth"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace their own images
create policy "listing_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
create policy "listing_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
