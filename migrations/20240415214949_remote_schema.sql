alter table "public"."jobs" drop column "city";

alter table "public"."jobs" add column "company_name" character varying;

alter table "public"."jobs" add column "description" text;

alter table "public"."jobs" add column "hub" character varying;

alter table "public"."jobs" add column "json" json;

alter table "public"."jobs" add column "location" character varying;

alter table "public"."jobs" add column "via" character varying;

alter table "public"."jobs" disable row level security;

create policy "Enable read access for all users"
on "public"."jobs"
as permissive
for select
to public
using (true);



