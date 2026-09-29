# GasNet-Admin Documentation

Admin dashboard for CJG TRADING LPG cylinder distribution. React + TypeScript + Vite + Supabase.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System overview, data flow, design patterns, tech stack |
| [Database Schema](schema.md) | Table definitions, constraints, RLS policies |
| [Services](services.md) | Supabase client, app service layer, all CRUD operations |
| [Authentication](auth.md) | Auth context, session management, admin-only access |
| [Home Page](pages-home.md) | Dashboard overview, KPI cards, branch status, sales targets |
| [Analytics Page](pages-analytics.md) | Charts, filters, AI insights, sales decision recommendations |
| [Data Page](pages-data.md) | Inventory, transactions, product catalog, report export |
| [Settings Page](pages-settings.md) | Branch, staff, and target management |
| [Components](components.md) | Shared layout, sidebar, protected route |
| [Styles](styles.md) | Design system, theme tokens, Tailwind config |

## Quick Reference

| Topic | Document |
|-------|----------|
| How auth/admin access works | [Authentication](auth.md) |
| How the service layer is organized | [Services](services.md#app-service) |
| How inventory CRUD works | [Services](services.md#inventory-operations) |
| How analytics data is transformed | [Analytics Page](pages-analytics.md#data-transformation) |
| How AI recommendations work | [Analytics Page](pages-analytics.md#ai-insights) |
| How settings pages manage entities | [Settings Page](pages-settings.md) |
