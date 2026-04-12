# Team RBAC Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Team Login   │  │ Team Member  │  │  Permission  │         │
│  │    Page      │  │  Dashboard   │  │    Guard     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           usePermissions Hook                             │  │
│  │  - hasPermission()                                        │  │
│  │  - hasAllPermissions()                                    │  │
│  │  - hasAnyPermission()   