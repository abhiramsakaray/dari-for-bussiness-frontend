import React from 'react';
import { useTeamSessions, useRevokeAllSessions } from '@/hooks/useTeamSessions';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export const SessionManager: React.FC = () => {
  const { data: sessions, isLoading } = useTeamSessions();
  const revokeAllMutation = useRevokeAllSessions();

  const handleRevokeAll = () => {
    if (
      window.confirm(
        'Are you sure you want to revoke all sessions? You will be logged out.'
      )
    ) {
      revokeAllMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-gray-600 mt-1">
            Manage your active login sessions across devices
          </p>
        </div>
        {sessions && sessions.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleRevokeAll}
            disabled={revokeAllMutation.isPending}
          >
            {revokeAllMutation.isPending ? 'Revoking...' : 'Revoke All Sessions'}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {sessions?.map((session) => (
          <Card key={session.id} className={session.is_current ? 'border-blue-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {session.is_current ? 'Current Session' : 'Other Session'}
                </CardTitle>
                {session.is_current && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">IP Address</p>
                  <p className="font-medium">{session.ip_address}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Activity</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(session.last_activity), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Device</p>
                <p className="font-medium text-sm truncate">{session.user_agent}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Expires</p>
                <p className="font-medium text-sm">
                  {formatDistanceToNow(new Date(session.expires_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {sessions?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No active sessions found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
