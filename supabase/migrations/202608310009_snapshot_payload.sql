begin;
-- Raw plus normalized text, JSON escaped; private and never rendered as HTML.
update storage.buckets set file_size_limit=33554432,allowed_mime_types=array['text/plain','text/html','application/pdf','application/json'] where id='regulatory-snapshots';
commit;
