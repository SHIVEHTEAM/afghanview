# Staff Management System

The ShivehView platform now supports multi-user restaurant management with role-based access control. This allows restaurant owners to invite staff members with different levels of permissions.

## Overview

The staff management system enables:

- **Multiple users** to manage a single restaurant
- **Role-based permissions** with three distinct roles
- **Secure access control** based on user roles
- **Invitation system** for adding new staff members
- **Permission management** for different operations

## Roles and Permissions

### 1. Owner

**Full access to all features**

- ✅ View all slides
- ✅ Create, edit, and delete slides
- ✅ Publish slides
- ✅ Manage staff (invite, edit roles, remove)
- ✅ View analytics
- ✅ Manage restaurant settings
- ✅ Access all restaurant features

### 2. Manager

**Can manage slides and invite staff**

- ✅ View all slides
- ✅ Create, edit, and delete slides
- ✅ Publish slides
- ✅ Invite new staff members (staff role only)
- ✅ View analytics
- ❌ Cannot manage other managers or owners
- ❌ Cannot remove staff members
- ❌ Cannot change staff roles

### 3. Staff

**Basic slide management**

- ✅ View all slides
- ✅ Create and edit slides
- ❌ Cannot delete slides
- ❌ Cannot publish slides
- ❌ Cannot manage staff
- ❌ Cannot view analytics
- ❌ Cannot access settings

## Database Schema

The system uses the existing `restaurant_staff` table:

```sql
CREATE TABLE public.restaurant_staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  user_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT restaurant_staff_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_staff_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT restaurant_staff_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id)
);
```

## API Endpoints

### Staff Management API

- **GET** `/api/restaurant/staff?restaurant_id={id}` - Get all staff members
- **POST** `/api/restaurant/staff?restaurant_id={id}` - Invite new staff member
- **PUT** `/api/restaurant/staff?restaurant_id={id}` - Update staff member role
- **DELETE** `/api/restaurant/staff?restaurant_id={id}&staff_id={id}` - Remove staff member

### Authentication

All endpoints require authentication via Bearer token in the Authorization header.

### Permission Checks

- Only owners and managers can view staff list
- Only owners and managers can invite staff
- Only owners can update staff roles
- Only owners can remove staff members
- Managers can only invite staff members (not other managers or owners)

## Frontend Components

### StaffManagement Component

Located at `components/client/StaffManagement.tsx`

Features:

- Display all staff members with their roles
- Invite new staff members
- Edit staff member roles (owners only)
- Remove staff members (owners only)
- Role-based UI visibility

### Staff Page

Located at `pages/client/staff.tsx`

Features:

- Full staff management interface
- Integration with client layout
- Permission-based access control

## Usage Guide

### For Restaurant Owners

1. **Access Staff Management**

   - Navigate to the "Staff" section in the client dashboard
   - Only visible to owners and managers

2. **Invite New Staff**

   - Click "Invite Staff" button
   - Enter email address
   - Select role (Owner, Manager, or Staff)
   - Send invitation

3. **Manage Existing Staff**
   - View all staff members and their roles
   - Edit roles (owners only)
   - Remove staff members (owners only)

### For Managers

1. **Invite Staff Members**

   - Can only invite staff members (not managers or owners)
   - Use the same invitation process

2. **Manage Slides**
   - Full access to slide creation and editing
   - Can publish slides
   - Can view analytics

### For Staff Members

1. **Basic Operations**
   - View all slides
   - Create and edit slides
   - Cannot delete or publish slides

## Security Features

### Role Hierarchy

- Owners have full access
- Managers have limited management access
- Staff have basic editing access

### Permission Validation

- Server-side permission checks on all API endpoints
- Client-side permission checks in components
- Role-based UI visibility

### Safety Measures

- Cannot remove the last owner from a restaurant
- Managers cannot promote staff to manager/owner roles
- Soft deletion (is_active flag) for staff removal

## Implementation Details

### Permission System

The permission system is implemented in `lib/permissions.ts`:

```typescript
export interface RestaurantPermission {
  canViewSlides: boolean;
  canCreateSlides: boolean;
  canEditSlides: boolean;
  canDeleteSlides: boolean;
  canManageStaff: boolean;
  canInviteStaff: boolean;
  canRemoveStaff: boolean;
  canUpdateStaffRoles: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canPublishSlides: boolean;
}
```

### React Hook

Use the `useRestaurantPermissions` hook in components:

```typescript
const { canCreateSlides, canManageStaff, loading } =
  useRestaurantPermissions(restaurantId);

if (canCreateSlides) {
  // Show create slide button
}
```

### API Integration

All API endpoints check permissions before allowing operations:

```typescript
// Example: Only owners can update staff roles
if (userRole !== "owner") {
  return res.status(403).json({ error: "Only owners can update staff roles" });
}
```

## Future Enhancements

### Planned Features

1. **Custom Permissions**

   - Allow owners to create custom permission sets
   - Granular control over specific features

2. **Audit Logging**

   - Track all staff management actions
   - History of role changes and invitations

3. **Bulk Operations**

   - Invite multiple staff members at once
   - Bulk role updates

4. **Email Notifications**

   - Automatic email notifications for invitations
   - Role change notifications

5. **Temporary Access**
   - Time-limited access for temporary staff
   - Scheduled role changes

### Integration Points

- **Analytics**: Track staff activity and contributions
- **Notifications**: Alert owners of important staff actions
- **Audit Trail**: Log all staff-related changes
- **Backup Management**: Ensure data safety during staff changes

## Troubleshooting

### Common Issues

1. **"Access denied" errors**

   - Check if user has the correct role
   - Verify restaurant_id is correct
   - Ensure user is active in restaurant_staff table

2. **Cannot invite staff**

   - Verify user has invite permissions (owner/manager)
   - Check if email is already a staff member
   - Ensure restaurant exists and is active

3. **Role update fails**
   - Only owners can update roles
   - Cannot remove the last owner
   - Check if target user exists and is active

### Debug Information

- Check browser console for client-side errors
- Review server logs for API errors
- Verify database constraints and foreign keys
- Test with different user roles

## Support

For technical support or questions about the staff management system:

1. Check this documentation
2. Review the API endpoints and error messages
3. Verify user permissions and roles
4. Contact the development team for complex issues
