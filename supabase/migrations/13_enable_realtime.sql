-- Enable Realtime for relevant tables
begin;

  -- Remove from publication first to avoid "relation already in publication" error if re-running
  -- (Though 'add table' usually errors if already present, we can try to handle it or just ignore error in manual run)
  -- Standard way is just to try adding.

  alter publication supabase_realtime add table funds;
  alter publication supabase_realtime add table fund_submissions;
  alter publication supabase_realtime add table ads;

commit;
