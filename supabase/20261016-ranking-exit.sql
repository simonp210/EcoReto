-- Activa la salida de rankings privados y recarga el esquema de la API.
-- Ejecutar en Supabase SQL Editor sobre el proyecto EcoReto.

alter table public.ranking_competitions
    add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.ranking_competitions
    add column if not exists invite_code text unique;
alter table public.ranking_competitions
    add column if not exists competition_type text not null default 'institution';
alter table public.ranking_competitions
    add column if not exists city text;
alter table public.ranking_competitions
    add column if not exists website text;
alter table public.ranking_competitions
    add column if not exists last_activity_at timestamptz not null default now();

create table if not exists public.ranking_competition_members (
    competition_id uuid not null references public.ranking_competitions(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    joined_at timestamptz not null default now(),
    primary key (competition_id, user_id)
);

alter table public.ranking_competitions enable row level security;
alter table public.ranking_competition_members enable row level security;

drop policy if exists "EcoReto: ver rankings disponibles" on public.ranking_competitions;
create policy "EcoReto: ver rankings disponibles" on public.ranking_competitions
    for select to authenticated using (
        is_active and (
            created_by = (select auth.uid())
            or exists (
                select 1 from public.ranking_competition_members m
                where m.competition_id = id and m.user_id = (select auth.uid())
            )
        )
    );

drop policy if exists "EcoReto: ver membresías propias" on public.ranking_competition_members;
create policy "EcoReto: ver membresías propias" on public.ranking_competition_members
    for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.ranking_competitions, public.ranking_competition_members from public, anon, authenticated;
grant select (id, name, scope, country, school, city, website, competition_type,
              is_active, invite_code)
    on public.ranking_competitions to authenticated;
grant select on public.ranking_competition_members to authenticated;

create or replace function public.ecoreto_salir_ranking(p_competition_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    usuario uuid := auth.uid();
    tipo text;
begin
    if usuario is null then
        raise exception 'Inicia sesión para salir de un ranking.' using errcode = '28000';
    end if;

    select c.competition_type into tipo
    from public.ranking_competitions c
    where c.id = p_competition_id and c.scope = 'custom' and c.is_active
    for update;

    if tipo is null then
        raise exception 'El ranking no está disponible para salir.' using errcode = '22023';
    end if;

    delete from public.ranking_competition_members
    where competition_id = p_competition_id and user_id = usuario;

    if not found then
        raise exception 'No participas en ese ranking.' using errcode = '22023';
    end if;

    if tipo = 'friends' then
        if not exists (
            select 1 from public.ranking_competition_members
            where competition_id = p_competition_id
        ) then
            update public.ranking_competitions
            set is_active = false, last_activity_at = now()
            where id = p_competition_id;
        else
            update public.ranking_competitions
            set created_by = null, last_activity_at = now()
            where id = p_competition_id and created_by = usuario;
        end if;
    end if;

    return true;
end;
$$;

revoke all on function public.ecoreto_salir_ranking(uuid) from public, anon;
grant execute on function public.ecoreto_salir_ranking(uuid) to authenticated;

notify pgrst, 'reload schema';
