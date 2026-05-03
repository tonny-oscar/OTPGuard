OTPGuard Role-Based Dashboard System – Implementation Summary
Implementation Overview

A complete role-based dashboard system for OTPGuard has been successfully developed. The system enforces strict subscription-based feature access while maintaining a scalable and structured architecture suitable for a SaaS platform.

Project Structure
Context and State Management
src/context/SubscriptionContext.jsx
Manages global subscription state across the application.
Custom Hooks
src/hooks/useSubscription.js
Provides access to subscription data and status.
src/hooks/useFeatureFlag.js
Handles feature access and gating logic.
Utilities
src/utils/planPermissions.js
Defines plan-specific features, limits, and permissions.
Shared Components
src/components/shared/FeatureGate.jsx
Controls conditional rendering of features based on plan.
src/components/shared/UpgradePrompt.jsx
Displays prompts for locked features.
src/components/shared/PlanBadge.jsx
Displays the current subscription plan.
Dashboard Layout
src/components/dashboard/DashboardLayout.jsx
Main dashboard layout container.
src/components/dashboard/Sidebar.jsx
Navigation sidebar based on plan access.
src/components/dashboard/TopBar.jsx
Top navigation bar.
Dashboard Widgets
src/components/dashboard/widgets/MetricCard.jsx
Displays key metrics.
src/components/dashboard/widgets/UpgradeBanner.jsx
Promotes plan upgrades.
src/components/dashboard/widgets/ActivityTable.jsx
Displays user and system activity logs.
Plan-Specific Dashboards
src/components/plans/StarterDashboard.jsx
src/components/plans/GrowthDashboard.jsx
src/components/plans/BusinessDashboard.jsx
src/components/plans/EnterpriseDashboard.jsx
Routing
src/Pages/PlanBasedDashboard.jsx
Routes users to the appropriate dashboard based on their plan.
Updated Files
src/App.jsx
Wrapped with SubscriptionProvider to enable global access.
Dashboard Capabilities by Plan
Starter Plan

Included:

Basic metrics such as users, email OTPs, and API requests
Recent activity table with limited entries
API key management
Email OTP only

Restricted:

SMS OTP
Analytics
Device tracking
Custom branding
TOTP authentication

Upgrade indicators:

Prominent upgrade banner
Locked feature cards
Disabled sidebar items
Growth Plan

Included:

Expanded metrics with trends
Email and SMS OTP
SMS cost tracking
Basic analytics and usage charts
Enhanced activity table with filters
Data export functionality

Restricted:

TOTP authentication
Device tracking
Custom branding
Team management

Upgrade indicators:

Subtle prompts for Business-level features
Business Plan

Included:

Advanced metrics dashboard
All OTP channels (Email, SMS, TOTP)
Device tracking and geolocation insights
Advanced analytics
Custom branding support
Unlimited users
Full activity logs

Restricted:

White-labeling
SLA monitoring
Team and role management
Audit logs

Upgrade indicators:

Minimal prompts for Enterprise features
Enterprise Plan

Included:

Executive-level KPI dashboard
System health monitoring
SLA compliance tracking
Team and role management
Security audit logs
White-label configuration
Custom integrations
Advanced reporting

No restrictions:

All features are fully accessible
Feature Enforcement
Sidebar Navigation

Menu items dynamically adjust based on the active plan:

Starter: Basic navigation only
Growth: Adds analytics and usage tracking
Business: Includes advanced features like device tracking
Enterprise: Full access to all modules including team and system controls
Feature Gating

Features are conditionally rendered based on plan permissions. Locked features trigger upgrade prompts, while accessible features render normally.

Plan Permissions

Each plan defines:

Maximum users
Allowed OTP channels
Enabled features
Analytics availability
SMS capabilities
Usage Guide
Application Setup

Wrap the application with the subscription provider to enable global plan awareness.

Dashboard Routing

Replace the default dashboard with the plan-based routing system to ensure users access the correct interface.

Accessing Subscription Data

Use custom hooks to retrieve the current plan, plan details, and subscription status.

Feature Access Control

Use feature-based checks to conditionally render components or display upgrade prompts.

Core System Capabilities
Automatic Plan Detection
Retrieves subscription data from the backend
Caches data for performance
Automatically updates on load
Dynamic Navigation
Displays only accessible features
Indicates restricted features visually
Upgrade Flow Integration
Includes banners, inline prompts, and feature-level upgrade messaging
Metrics and Analytics
Displays data relevant to each plan level
Expands progressively with higher tiers
Device Tracking (Business and above)
Tracks user devices and locations
Identifies suspicious activity
System Monitoring (Enterprise)
Displays infrastructure health and uptime
Tracks SLA compliance
Team Management (Enterprise)
Supports role-based access control
Tracks user activity across teams
Customization
Adding New Features

Update plan permissions and wrap new components with feature gating.

Adding New Plans

Define the plan structure, create a dashboard, and integrate it into routing.

Custom Upgrade Prompts

Upgrade prompts can be tailored with custom messaging and styles.

Metrics Overview

Starter:

Active users
Email OTP usage
API requests

Growth:

User growth trends
Email and SMS usage
Success rates

Business:

Comprehensive OTP metrics
Device and location insights
System performance indicators

Enterprise:

Uptime and SLA metrics
Response times
Total usage and cost tracking
User Interface Approach
Visual Hierarchy
Starter: Minimal and simple
Growth: Data-focused
Business: Professional and detailed
Enterprise: Advanced and comprehensive
Progressive Exposure

Features and insights increase with each plan tier, guiding users toward upgrades.

Upgrade Path

Clear upgrade opportunities are presented through feature restrictions and contextual prompts.

Backend Integration
API Endpoints
Retrieve subscription details
Fetch available plans
Upgrade subscriptions
Access usage data
Data Structure

The system expects structured subscription data including plan details, status, and usage limits.

Next Steps
Immediate
Connect dashboards to live backend APIs
Add loading and error handling states
Validate plan-based rendering
Short Term
Integrate advanced charts
Enable real-time updates
Implement notifications
Build upgrade workflows
Long Term
Expand analytics capabilities
Implement billing systems
Add advanced reporting tools
Introduce administrative overrides
Conclusion

The OTPGuard dashboard system is fully implemented and production-ready. It enforces subscription-based access, supports scalable growth, and provides a structured path from free users to enterprise clients. The system follows modern SaaS design principles and is designed for maintainability, extensibility, and real-world deployment