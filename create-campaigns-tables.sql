-- Create campaigns table
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create campaign_data table (to store leads over time)
create table if not exists public.campaign_data (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  date date not null,
  leads_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(campaign_id, date)
);

-- Enable RLS
alter table public.campaigns enable row level security;
alter table public.campaign_data enable row level security;

-- Create policies for campaigns
create policy "Users can view their own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert their own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- Create policies for campaign_data
create policy "Users can view their own campaign data"
  on public.campaign_data for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_data.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can insert their own campaign data"
  on public.campaign_data for insert
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_data.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can update their own campaign data"
  on public.campaign_data for update
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_data.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can delete their own campaign data"
  on public.campaign_data for delete
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_data.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- Insert demo campaigns
insert into public.campaigns (id, user_id, name, color)
values 
  ('11111111-1111-1111-1111-111111111111'::uuid, auth.uid(), 'Campanha 1', '#ef4444'),
  ('22222222-2222-2222-2222-222222222222'::uuid, auth.uid(), 'Campanha 2', '#22c55e'),
  ('33333333-3333-3333-3333-333333333333'::uuid, auth.uid(), 'Campanha 3', '#f59e0b');

-- Insert demo data for the campaigns (last 30 days)
insert into public.campaign_data (campaign_id, date, leads_count)
select 
  '11111111-1111-1111-1111-111111111111'::uuid,
  current_date - i,
  floor(random() * 20 + 10)::integer
from generate_series(0, 29) as i;

insert into public.campaign_data (campaign_id, date, leads_count)
select 
  '22222222-2222-2222-2222-222222222222'::uuid,
  current_date - i,
  floor(random() * 30 + 15)::integer
from generate_series(0, 29) as i;

insert into public.campaign_data (campaign_id, date, leads_count)
select 
  '33333333-3333-3333-3333-333333333333'::uuid,
  current_date - i,
  floor(random() * 25 + 12)::integer
from generate_series(0, 29) as i;
