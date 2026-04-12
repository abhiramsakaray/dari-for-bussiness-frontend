import React, { useState } from 'react';
import { useMemberPermissions, useAllPermissions } from '@/hooks/usePermissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team.service';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { PERMISSIONS_QUERY_KEY } from '@/hooks/usePermissions';

interface PermissionManagerProps {
  memberId: string;
  memberName: string;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  memberId,
  memberName,
}) => {
  const queryClient = useQueryClient();
  const { data: allPermissions, isLoading: loadingAll } = useAllPermissions();
  const { data: memberPermissions, isLoading: loadingMember } = useMemberPermissions(memberId);

  const [selectedGrant, setSelectedGrant] = useState<string[]>([]);
  const [selectedRevoke, setSelectedRevoke] = useState<string[]>([]);

  const updatePermissionsMutation = useMutation({
    mutationFn: (input: { grant?: string[]; revoke?: string[] }) =>
      teamService.updateMemberPermissions(memberId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERMISSIONS_QUERY_KEY] });
      setSelectedGrant([]);
      setSelectedRevoke([]);
      toast.success('Permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to update permissions'));
    },
  });

  const handleToggleGrant = (permissionCode: string) => {
    setSelectedGrant((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleToggleRevoke = (permissionCode: string) => {
    setSelectedRevoke((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleSave = () => {
    updatePermissionsMutation.mutate({
      grant: selectedGrant.length > 0 ? selectedGrant : undefined,
      revoke: selectedRevoke.length > 0 ? selectedRevoke : undefined,
    });
  };

  if (loadingAll || loadingMember) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions?.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  const hasPermission = (code: string) => {
    return memberPermissions?.effective_permissions.includes(code);
  };

  const isCustomGranted = (code: string) => {
    return memberPermissions?.custom_granted.includes(code);
  };

  const isCustomRevoked = (code: string) => {
    return memberPermissions?.custom_revoked.includes(code);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Permissions for {memberName}</CardTitle>
          <CardDescription>
            Role: <Badge>{memberPermissions?.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
              <div>Permission</div>
              <div>Current Status</div>
              <div>Actions</div>
            </div>

            {Object.entries(permissionsByCategory || {}).map(([category, permissions]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-lg capitalize mt-4">{category}</h3>
                {permissions.map((perm) => (
                  <div
                    key={perm.code}
                    className="grid grid-cols-3 gap-4 items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium text-sm">{perm.name}</p>
                      <p className="text-xs text-gray-500">{perm.code}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasPermission(perm.code) ? (
                        <Badge variant="default">Has Access</Badge>
                      ) : (
                        <Badge variant="secondary">No Access</Badge>
                      )}
                      {isCustomGranted(perm.code) && (
                        <Badge variant="outline" className="text-green-600">
                          Custom Grant
                        </Badge>
                      )}
                      {isCustomRevoked(perm.code) && (
                        <Badge variant="outline" className="text-red-600">
                          Custom Revoke
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedGrant.includes(perm.code)}
                          onCheckedChange={() => handleToggleGrant(perm.code)}
                          disabled={hasPermission(perm.code) && !isCustomRevoked(perm.code)}
                        />
                        Grant
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedRevoke.includes(perm.code)}
                          onCheckedChange={() => handleToggleRevoke(perm.code)}
                          disabled={!hasPermission(perm.code) || isCustomRevoked(perm.code)}
                        />
                        Revoke
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedGrant.length > 0 && (
                <p>Granting {selectedGrant.length} permission(s)</p>
              )}
              {selectedRevoke.length > 0 && (
                <p>Revoking {selectedRevoke.length} permission(s)</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGrant([]);
                  setSelectedRevoke([]);
                }}
                disabled={selectedGrant.length === 0 && selectedRevoke.length === 0}
              >
                Clear
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  (selectedGrant.length === 0 && selectedRevoke.length === 0) ||
                  updatePermissionsMutation.isPending
                }
              >
                {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Role Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {memberPermissions?.role_permissions.map((perm) => (
                  <Badge key={perm} variant="secondary">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>

            {memberPermissions?.custom_granted.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-green-600">Custom Granted</h4>
                <div className="flex flex-wrap gap-2">
                  {memberPermissions.custom_granted.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-green-600">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {memberPermissions?.custom_revoked.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Custom Revoked</h4>
                <div className="flex flex-wrap gap-2">
                  {memberPermissions.custom_revoked.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-red-600">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Effective Permissions</h4>
              <p className="text-sm text-gray-600 mb-2">
                Total: {memberPermissions?.effective_permissions.length}
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {memberPermissions?.effective_permissions.map((perm) => (
                  <Badge key={perm} variant="default" className="text-xs">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
