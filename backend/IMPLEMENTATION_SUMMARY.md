OTPGuard Subscription System – Implementation Summary
Overview

The subscription system for OTPGuard has been successfully implemented and integrated into the backend. The system is designed to support a scalable SaaS model with clear plan separation, feature enforcement, and usage-based billing preparation.

What Has Been Implemented
1. Subscription Models

The backend now includes structured models to support subscription management:

Plan Model
Stores all subscription plans (Starter, Growth, Business, Enterprise) with their respective limits and features.
Subscription Model
Associates users or organizations with a specific plan, including lifecycle status (active, trial, expired).
UsageLog Model
Tracks API usage events such as OTP requests for monitoring and billing purposes.
UsageSummary Model
Aggregates monthly usage data for reporting and future billing integration.
2. Subscription Plans

The system supports four distinct plans:

Starter (Free)
Limited to 50 users, supports email OTP only, and includes a basic dashboard.
Growth
Supports up to 1,000 users, enables both email and SMS OTP, and includes analytics and a full dashboard. SMS usage is tracked with a configurable per-message cost.
Business
Offers unlimited users, supports all OTP channels (email, SMS, TOTP), and includes advanced features such as device tracking, geolocation, and custom branding.
Enterprise (Custom)
Extends the Business plan with custom limits, dedicated infrastructure options, SLA guarantees, and white-label capabilities.
3. Middleware and Enforcement Layer

A middleware layer has been introduced to enforce plan rules across the system:

Subscription validation to ensure users have an active plan
Feature-based access control
OTP channel restrictions based on plan
User limit enforcement
Rate limiting for OTP requests
API usage logging for tracking and billing

This ensures that all requests are validated against the user’s subscription before execution.

4. MFA Route Enhancements

All MFA-related endpoints have been updated to integrate subscription logic:

OTP requests are validated against allowed channels
SMS usage is tracked and costed
Rate limiting prevents abuse
TOTP setup is restricted to eligible plans
Usage data is recorded for analytics and billing
5. API Endpoints

The following endpoints are now available:

GET /api/subscription/plans – Retrieve all available plans
GET /api/subscription/current – Get current subscription details
POST /api/subscription/subscribe – Assign a plan
POST /api/subscription/upgrade – Upgrade an existing plan
POST /api/subscription/trial – Start a trial period
GET /api/subscription/usage – View usage statistics
GET /api/subscription/check/feature/<name> – Validate feature access
GET /api/subscription/check/channel/<type> – Validate channel access
6. Usage Tracking System

A complete usage tracking system has been implemented:

Real-time logging of OTP requests and API usage
SMS cost calculation based on plan configuration
Monthly aggregation of usage data
Metadata storage for deeper analytics
7. Migration and Setup

The system includes initialization and migration support:

Automatic creation of default plans during application startup
Migration scripts for existing users
Optional trial assignment (e.g., 14-day Growth trial)
Backward compatibility with existing system data
Architecture Overview

The system is structured into clear layers:

User Layer
Extended with helper methods to retrieve current subscription, validate features, and check usage limits.
Subscription Service
Handles plan logic, feature validation, usage tracking, and cost calculations.
Middleware Layer
Enforces subscription rules, rate limits, and request validation.
API Layer
Exposes endpoints for plan management, subscriptions, and usage analytics.
Security and Limits
Rate Limiting
OTP requests are limited per user within a defined time window
Configurable thresholds depending on usage context
Plan Enforcement
SMS is restricted for Starter users
TOTP is restricted to higher-tier plans
User limits are strictly enforced
Feature access is controlled through plan configuration
Error Handling

Standardized error responses are implemented for:

Missing or inactive subscriptions
Unauthorized feature access
Channel restrictions
User limit violations
Rate limit breaches
Billing Preparation
SMS Cost Tracking

The system calculates SMS costs dynamically based on the user’s plan and logs each usage event with cost attribution.

Monthly Usage Aggregation
Usage is summarized monthly per account
Costs are calculated and stored for future billing
Data is structured for integration with payment systems
M-Pesa Integration Readiness

The system is prepared for payment integration:

Webhook endpoint structure is defined for payment callbacks
Subscription status can be updated based on payment confirmation
Billing logic separates plan cost and usage-based charges
Analytics and Reporting

The backend supports:

Real-time usage tracking
Channel-specific statistics (email, SMS, TOTP)
Cost attribution per user
Monthly usage summaries for reporting
File Structure

The backend is organized as follows:

Subscription module for core logic and services
Middleware for enforcement
Routes for API exposure
Models extended to support subscriptions
Migration and testing scripts included
Next Steps
Immediate
Integrate subscription data into the frontend
Expose plan details in the user interface
Display usage metrics and limits
Short Term
Implement M-Pesa payment flow
Add subscription lifecycle management (downgrades, renewals)
Introduce notification system for usage and billing
Long Term
Expand analytics capabilities
Add enterprise-level customization
Improve reporting and customer insights
Conclusion

The OTPGuard subscription system is now fully integrated into the backend and designed for scalability. It supports structured plan management, strict feature enforcement, and detailed usage tracking. The system is ready for payment integration and can support real-world SaaS operations.

You’re out of messages with the most advanced Free model. Responses may be less detailed until 9:41 PM. Start a free Plus trial for better answers now.
Claim free offer