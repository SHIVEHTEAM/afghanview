-- Create staff_invitations table for staff invitation functionality
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.staff_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text])),
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'declined'::text])),
  invited_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  accepted_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT staff_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT staff_invitations_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT staff_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
  CONSTRAINT staff_invitations_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES auth.users(id),
  CONSTRAINT staff_invitations_business_email_unique UNIQUE (business_id, email)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_invitations_business_id ON public.staff_invitations(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON public.staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON public.staff_invitations(status);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_expires_at ON public.staff_invitations(expires_at);

-- Add RLS policies
ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for their business
CREATE POLICY "Users can view invitations for their business" ON public.staff_invitations
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses 
      WHERE user_id = auth.uid() OR created_by = auth.uid()
      UNION
      SELECT business_id FROM public.business_staff 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Policy: Business owners/managers can create invitations
CREATE POLICY "Business owners/managers can create invitations" ON public.staff_invitations
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses 
      WHERE user_id = auth.uid() OR created_by = auth.uid()
      UNION
      SELECT business_id FROM public.business_staff 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

-- Policy: Business owners/managers can update invitations
CREATE POLICY "Business owners/managers can update invitations" ON public.staff_invitations
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM public.businesses 
      WHERE user_id = auth.uid() OR created_by = auth.uid()
      UNION
      SELECT business_id FROM public.business_staff 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

-- Policy: Business owners/managers can delete invitations
CREATE POLICY "Business owners/managers can delete invitations" ON public.staff_invitations
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses 
      WHERE user_id = auth.uid() OR created_by = auth.uid()
      UNION
      SELECT business_id FROM public.business_staff 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager') AND is_active = true
    )
  );

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.staff_invitations 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically expire invitations
CREATE OR REPLACE FUNCTION trigger_expire_invitations()
RETURNS trigger AS $$
BEGIN
  PERFORM expire_old_invitations();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (runs on any insert/update to staff_invitations)
CREATE TRIGGER expire_invitations_trigger
  AFTER INSERT OR UPDATE ON public.staff_invitations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_expire_invitations();

-- Insert some sample invitations for testing (optional)
-- INSERT INTO public.staff_invitations (business_id, email, role, invited_by, expires_at)
-- SELECT 
--   b.id,
--   'test@example.com',
--   'staff',
--   b.user_id,
--   now() + interval '7 days'
-- FROM public.businesses b
-- WHERE b.user_id = (SELECT id FROM auth.users WHERE email = 'ahmadseyarhasir@gmail.com')
-- LIMIT 1; 