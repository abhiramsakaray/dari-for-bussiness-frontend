/**
 * Example: How to integrate usage limit checks in your components
 * 
 * This file demonstrates the pattern for checking limits before performing actions.
 * Copy this pattern to any component that creates resources (payments, invoices, etc.)
 */

import React, { useState } from 'react';
import { useLimitCheck } from '../../../hooks/useLimitCheck';
import { UpgradeModal } from './UpgradeModal';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function UsageLimitExample() {
  const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();
  const [isCreating, setIsCreating] = useState(false);

  // Example: Creating a payment
  const handleCreatePayment = async (amount: number, currency: string) => {
    // Check limit first
    const limitCheck = await checkActionLimit('create_payment', amount, currency);

    if (!limitCheck.allowed) {
      // Modal will be shown automatically via upgradeModalData
      return;
    }

    // Proceed with payment creation
    setIsCreating(true);
    try {
      // Your API call here
      // await api.post('/payments', { amount, currency });
      toast.success('Payment created successfully!');
    } catch (error) {
      // Handle 403 limit_exceeded error from backend
      if ((error as any)?.response?.status === 403) {
        const errorData = (error as any).response.data;
        if (errorData.error === 'limit_exceeded') {
          // Show upgrade modal with backend error message
          toast.error(errorData.message);
          return;
        }
      }
      toast.error('Failed to create payment');
    } finally {
      setIsCreating(false);
    }
  };

  // Example: Creating a payment link
  const handleCreatePaymentLink = async () => {
    const limitCheck = await checkActionLimit('create_payment_link');

    if (!limitCheck.allowed) {
      return;
    }

    // Proceed with payment link creation
    try {
      // await api.post('/payment-links', data);
      toast.success('Payment link created!');
    } catch (error) {
      toast.error('Failed to create payment link');
    }
  };

  // Example: Creating an invoice
  const handleCreateInvoice = async () => {
    const limitCheck = await checkActionLimit('create_invoice');

    if (!limitCheck.allowed) {
      return;
    }

    // Proceed with invoice creation
    try {
      // await api.post('/invoices', data);
      toast.success('Invoice created!');
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  // Example: Adding a team member
  const handleAddTeamMember = async () => {
    const limitCheck = await checkActionLimit('add_team_member');

    if (!limitCheck.allowed) {
      return;
    }

    // Proceed with team member addition
    try {
      // await api.post('/team/members', data);
      toast.success('Team member added!');
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  // Example: Creating a subscription plan
  const handleCreateSubscriptionPlan = async () => {
    const limitCheck = await checkActionLimit('create_subscription_plan');

    if (!limitCheck.allowed) {
      return;
    }

    // Proceed with subscription plan creation
    try {
      // await api.post('/subscription-plans', data);
      toast.success('Subscription plan created!');
    } catch (error) {
      toast.error('Failed to create subscription plan');
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Usage Limit Integration Examples</h2>
      
      <div className="space-y-2">
        <Button onClick={() => handleCreatePayment(1000, 'USD')} disabled={isCreating}>
          Create Payment ($1000)
        </Button>
        
        <Button onClick={handleCreatePaymentLink}>
          Create Payment Link
        </Button>
        
        <Button onClick={handleCreateInvoice}>
          Create Invoice
        </Button>
        
        <Button onClick={handleAddTeamMember}>
          Add Team Member
        </Button>
        
        <Button onClick={handleCreateSubscriptionPlan}>
          Create Subscription Plan
        </Button>
      </div>

      {/* Upgrade Modal - automatically shown when limit is reached */}
      {upgradeModalData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={closeUpgradeModal}
          title={upgradeModalData.title}
          message={upgradeModalData.message}
          currentPlan={upgradeModalData.currentPlan}
        />
      )}
    </div>
  );
}

/**
 * INTEGRATION PATTERN SUMMARY:
 * 
 * 1. Import the hook:
 *    import { useLimitCheck } from '../../../hooks/useLimitCheck';
 *    import { UpgradeModal } from './UpgradeModal';
 * 
 * 2. Use the hook in your component:
 *    const { checkActionLimit, upgradeModalData, closeUpgradeModal, showUpgradeModal } = useLimitCheck();
 * 
 * 3. Check limit before action:
 *    const limitCheck = await checkActionLimit('create_payment', amount, currency);
 *    if (!limitCheck.allowed) return;
 * 
 * 4. Add the UpgradeModal to your JSX:
 *    {upgradeModalData && (
 *      <UpgradeModal
 *        isOpen={showUpgradeModal}
 *        onClose={closeUpgradeModal}
 *        title={upgradeModalData.title}
 *        message={upgradeModalData.message}
 *        currentPlan={upgradeModalData.currentPlan}
 *      />
 *    )}
 * 
 * 5. Handle backend 403 errors:
 *    catch (error) {
 *      if (error?.response?.status === 403 && error.response.data.error === 'limit_exceeded') {
 *        toast.error(error.response.data.message);
 *      }
 *    }
 */
