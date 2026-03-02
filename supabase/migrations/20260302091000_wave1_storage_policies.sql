-- Wave 1 storage buckets and policies

BEGIN;

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('dog-profiles', 'dog-profiles', TRUE),
    ('dog-documents', 'dog-documents', FALSE),
    ('walk-records', 'walk-records', TRUE),
    ('danglog-images', 'danglog-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Dog profiles
DROP POLICY IF EXISTS dog_profiles_auth_read_v1 ON storage.objects;
CREATE POLICY dog_profiles_auth_read_v1 ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'dog-profiles');

DROP POLICY IF EXISTS dog_profiles_auth_insert_v1 ON storage.objects;
CREATE POLICY dog_profiles_auth_insert_v1 ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dog-profiles' AND owner = auth.uid());

DROP POLICY IF EXISTS dog_profiles_auth_update_v1 ON storage.objects;
CREATE POLICY dog_profiles_auth_update_v1 ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'dog-profiles' AND owner = auth.uid());

DROP POLICY IF EXISTS dog_profiles_auth_delete_v1 ON storage.objects;
CREATE POLICY dog_profiles_auth_delete_v1 ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'dog-profiles' AND owner = auth.uid());

-- Dog documents
DROP POLICY IF EXISTS dog_documents_owner_read_v1 ON storage.objects;
CREATE POLICY dog_documents_owner_read_v1 ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'dog-documents' AND owner = auth.uid());

DROP POLICY IF EXISTS dog_documents_owner_insert_v1 ON storage.objects;
CREATE POLICY dog_documents_owner_insert_v1 ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dog-documents' AND owner = auth.uid());

DROP POLICY IF EXISTS dog_documents_owner_update_v1 ON storage.objects;
CREATE POLICY dog_documents_owner_update_v1 ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'dog-documents' AND owner = auth.uid());

DROP POLICY IF EXISTS dog_documents_owner_delete_v1 ON storage.objects;
CREATE POLICY dog_documents_owner_delete_v1 ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'dog-documents' AND owner = auth.uid());

-- Walk records
DROP POLICY IF EXISTS walk_records_auth_read_v1 ON storage.objects;
CREATE POLICY walk_records_auth_read_v1 ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'walk-records');

DROP POLICY IF EXISTS walk_records_auth_insert_v1 ON storage.objects;
CREATE POLICY walk_records_auth_insert_v1 ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'walk-records' AND owner = auth.uid());

DROP POLICY IF EXISTS walk_records_auth_update_v1 ON storage.objects;
CREATE POLICY walk_records_auth_update_v1 ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'walk-records' AND owner = auth.uid());

DROP POLICY IF EXISTS walk_records_auth_delete_v1 ON storage.objects;
CREATE POLICY walk_records_auth_delete_v1 ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'walk-records' AND owner = auth.uid());

-- Danglog images
DROP POLICY IF EXISTS danglog_images_auth_read_v1 ON storage.objects;
CREATE POLICY danglog_images_auth_read_v1 ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'danglog-images');

DROP POLICY IF EXISTS danglog_images_auth_insert_v1 ON storage.objects;
CREATE POLICY danglog_images_auth_insert_v1 ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'danglog-images' AND owner = auth.uid());

DROP POLICY IF EXISTS danglog_images_auth_update_v1 ON storage.objects;
CREATE POLICY danglog_images_auth_update_v1 ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'danglog-images' AND owner = auth.uid());

DROP POLICY IF EXISTS danglog_images_auth_delete_v1 ON storage.objects;
CREATE POLICY danglog_images_auth_delete_v1 ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'danglog-images' AND owner = auth.uid());

COMMIT;
