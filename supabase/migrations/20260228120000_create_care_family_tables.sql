-- care_requests: 돌봄 요청/수락 테이블
create table if not exists care_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references users(id) not null,
  caregiver_id uuid references users(id) not null,
  dog_id uuid references dogs(id),
  title text not null,
  description text,
  care_type text not null check (care_type in ('walk', 'sitting', 'grooming', 'hospital', 'other')),
  datetime timestamptz not null,
  duration_hours integer default 1,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- family_groups: 패밀리 그룹 테이블
create table if not exists family_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creator_id uuid references users(id) not null,
  dog_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- family_members: 그룹 멤버 테이블
create table if not exists family_members (
  group_id uuid references family_groups(id) on delete cascade,
  member_id uuid references users(id),
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  primary key (group_id, member_id)
);

-- RLS 정책
alter table care_requests enable row level security;
alter table family_groups enable row level security;
alter table family_members enable row level security;

-- care_requests: 요청자/돌보미만 조회 가능
create policy "care_requests_select" on care_requests
  for select using (auth.uid() = requester_id or auth.uid() = caregiver_id);

create policy "care_requests_insert" on care_requests
  for insert with check (auth.uid() = requester_id);

create policy "care_requests_update" on care_requests
  for update using (auth.uid() = requester_id or auth.uid() = caregiver_id);

-- family_groups: 멤버만 조회, 생성자만 생성
create policy "family_groups_select" on family_groups
  for select using (
    exists (select 1 from family_members where group_id = id and member_id = auth.uid())
    or creator_id = auth.uid()
  );

create policy "family_groups_insert" on family_groups
  for insert with check (auth.uid() = creator_id);

-- family_members: 같은 그룹 멤버만 조회
create policy "family_members_select" on family_members
  for select using (
    exists (select 1 from family_members fm where fm.group_id = group_id and fm.member_id = auth.uid())
  );

create policy "family_members_insert" on family_members
  for insert with check (
    exists (select 1 from family_members fm where fm.group_id = group_id and fm.member_id = auth.uid() and fm.role in ('owner', 'admin'))
    or exists (select 1 from family_groups fg where fg.id = group_id and fg.creator_id = auth.uid())
  );
