# Currency Migration - Complete Action Plan

## 🎯 Goal
Transform the application from **frontend-based currency handling** to **backend-driven currency management** for production-quality, consistent, and accurate currency display across all pages.

---

## 📊 Current State Analysis

### Where Currency is Used

#### 1. **Analytics Dashboard** (`src/app/components/analytics/AnalyticsDashboard.tsx`)
- **Current**: Uses `formatCurrency(totalVolume, analyticsCurrency)`
- **Fields**: `total_volume`, `avg_payment`, `invoice_volume`
- **Issue**: Mixing USD and local currency, inconsistent formatting

#### 2. **Payment Detail** (`src/app/components/PaymentDetail.tsx`)
- **Current**: C