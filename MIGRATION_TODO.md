# AfghanView Migration Todo List

## Restaurant → Business Migration (99% Complete)

### 🔴 CRITICAL - Blocking Issues

- [x] **Fix slideshows table missing** - API calls failing with "relation does not exist"
- [x] **Update API endpoints** - All `/api/slideshows` calls still use `restaurantId` parameter
- [x] **Fix subscription endpoints** - Still reference `restaurant_subscriptions` and `restaurant_id`

### 🟠 HIGH PRIORITY - Core Functionality

- [x] **Update all API endpoints** to use `business_id` instead of `restaurant_id`
- [x] **Migrate subscription logic** from `restaurant_subscriptions` to `business_subscriptions`
- [x] **Update permissions system** to use `business_staff` instead of `restaurant_staff`
- [x] **Fix admin pages** - All admin restaurant management needs business-centric logic
- [x] **Update client dashboard** - Remove remaining restaurant references

### 🟡 MEDIUM PRIORITY - UI & UX

- [x] **Update all UI text** - Change "restaurant" to "business" in components
- [x] **Fix mock data** - Update all hardcoded restaurant data to business data
- [x] **Update component props** - Change `restaurantId` to `businessId` throughout
- [x] **Fix navigation and routing** - Update any restaurant-specific routes

### 🟢 LOW PRIORITY - Cleanup

- [x] **Update documentation** - Fix all docs to reflect business-centric model
- [x] **Clean up migration scripts** - Remove old restaurant logic
- [x] **Update RLS policies** - Ensure all policies use new table names
- [x] **Remove unused code** - Clean up any restaurant-specific dead code

### 📋 DETAILED TASKS

#### API Endpoints to Update

- [x] `pages/api/slideshows/index.ts` - Already partially done, needs parameter fix
- [x] `pages/api/subscription/create-checkout-session.ts`
- [x] `pages/api/subscription/upgrade.ts`
- [x] `pages/api/restaurant/staff/index.ts` - Rename to `/api/business/staff/`
- [x] `pages/api/slides/[id].ts`
- [x] `pages/api/slides/index.ts`
- [x] `pages/api/slides/reorder.ts`
- [x] `pages/api/slides/ai-all-in-one.ts`

#### Frontend Components to Update

- [x] `pages/client/staff.tsx` - Update state and logic
- [x] `pages/client/index.tsx` - Dashboard logic
- [x] `pages/client/slideshows.tsx` - API calls
- [x] `components/client/StaffManagement.tsx` - Already partially done
- [x] `pages/admin/restaurants/index.tsx` - Complete rewrite needed
- [x] `pages/admin/restaurants/[id].tsx` - Complete rewrite needed
- [x] `pages/admin/restaurants/new.tsx` - Complete rewrite needed
- [x] `pages/restaurant/[id].tsx` - Update to business display

#### Database & Backend

- [x] Create missing `slideshows` table
- [x] Update all RLS policies to use new table names
- [x] Fix foreign key constraints
- [x] Update triggers and functions

#### Scripts & Documentation

- [x] `scripts/setup-staff-system.js` - Update to use business tables
- [x] `docs/STAFF_MANAGEMENT.md` - Update documentation
- [x] All migration SQL files - Clean up and finalize

### 🎯 CURRENT STATUS

- **Schema Migration**: 100% ✅
- **Core Business Logic**: 100% ✅
- **API Endpoints**: 100% ✅
- **Frontend Components**: 100% ✅
- **Admin Interface**: 100% ✅
- **Documentation**: 100% ✅

### 🚀 NEXT STEPS

1. ✅ Fix slideshows table issue (CRITICAL)
2. ✅ Update API endpoints systematically
3. ✅ Migrate subscription logic
4. ✅ Update frontend components
5. ✅ Rewrite admin interface
6. ✅ Clean up documentation and scripts

---

_Last Updated: [Current Date]_
_Estimated Completion: 99% → Target: 100%_
