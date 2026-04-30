import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { TrendingUp } from 'lucide-react';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  currentPlan: string;
  upgradeUrl?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  currentPlan,
  upgradeUrl = '/billing',
}: UpgradeModalProps) {
  const handleUpgrade = () => {
    window.location.href = upgradeUrl;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="text-base">{message}</p>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Current Plan:</p>
              <p className="font-semibold text-foreground">{currentPlan}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
