import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useResendInvite,
} from '../../../hooks/useTeam';
import { TeamMember, MerchantRole } from '../../../types/api.types';
import { formatRelativeTime } from '../../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  UserPlus,
  MoreVertical,
  Trash2,
  Shield,
  Users,
  Crown,
  Code,
  Wallet,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  UserCog,
} from 'lucide-react';
import { useMerchantStore } from '../../../stores/merchant-store';
import { DashboardLayout } from '../DashboardLayout';

const ROLE_CONFIG: Record<MerchantRole, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  description: string;
  permissions: string[];
}> = {
  [MerchantRole.OWNER]: {
    label: 'Owner',
    icon: <Crown className="w-3.5 h-3.5" />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    description: 'Full access to everything',
    permissions: ['All permissions', 'Billing', 'Delete account'],
  },
  [MerchantRole.ADMIN]: {
    label: 'Admin',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    description: 'Manage team & all features',
    permissions: ['Invite members', 'Change roles', 'All features'],
  },
  [MerchantRole.DEVELOPER]: {
    label: 'Developer',
    icon: <Code className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    description: 'API keys & integrations',
    permissions: ['API access', 'Webhooks', 'View payments'],
  },
  [MerchantRole.FINANCE]: {
    label: 'Finance',
    icon: <Wallet className="w-3.5 h-3.5" />,
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    description: 'Payments & financial data',
    permissions: ['Invoices', 'Withdrawals', 'Analytics'],
  },
  [MerchantRole.VIEWER]: {
    label: 'Viewer',
    icon: <Eye className="w-3.5 h-3.5" />,
    color: 'text-muted-foreground',
    bg: 'bg-muted/50 border-border',
    description: 'Read-only access',
    permissions: ['View dashboard', 'View payments', 'No actions'],
  },
};

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  role: z.nativeEnum(MerchantRole),
});
type InviteFormData = z.infer<typeof inviteSchema>;

export default function TeamMembersList() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<MerchantRole>(MerchantRole.VIEWER);
  const [removeDialogMember, setRemoveDialogMember] = useState<TeamMember | null>(null);

  const currentUser = useMerchantStore((state) => state.email);
  const currentRole = useMerchantStore((state) => state.role);

  const { data: team, isLoading, error } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updateMutation = useUpdateTeamMember();
  const removeMutation = useRemoveTeamMember();
  const resendMutation = useResendInvite();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: MerchantRole.VIEWER },
  });
  const selectedRole = watch('role');

  const canManageTeam = currentRole === MerchantRole.OWNER || currentRole === MerchantRole.ADMIN;

  const handleInvite = async (data: InviteFormData) => {
    const input: any = { email: data.email, role: data.role };
    if (data.name?.trim()) input.name = data.name.trim();
    await inviteMutation.mutateAsync(input);
    reset();
    setInviteDialogOpen(false);
  };

  const handleRoleUpdate = async () => {
    if (!editMember) return;
    await updateMutation.mutateAsync({ memberId: editMember.id, input: { role: editRole } });
    setEditMember(null);
  };

  const handleRemoveConfirm = async () => {
    if (!removeDialogMember) return;
    await removeMutation.mutateAsync(removeDialogMember.id);
    setRemoveDialogMember(null);
  };

  const members = team?.items ?? [];
  const activeCount = members.filter(m => m.is_active && !m.invite_pending).length;
  const pendingCount = members.filter(m => m.invite_pending).length;

  if (isLoading) {
    return (
      <DashboardLayout activePage="team">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    const is403 = (error as any)?.response?.status === 403;
    return (
      <DashboardLayout activePage="team">
        <Card className="border-destructive/30 mt-8">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {is403 ? 'Plan Upgrade Required' : 'Error Loading Team'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {is403
                ? 'Team management requires a higher plan. Upgrade to invite collaborators.'
                : 'Failed to load team members. Please refresh.'}
            </p>
            {is403 && (
              <Button className="mt-4" onClick={() => window.location.href = '#/billing'}>
                View Plans
              </Button>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="team">
      <div className="h-[calc(100vh-7rem)] flex flex-col gap-4 overflow-hidden">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-semibold">Team Management</h1>
            <p className="text-sm text-muted-foreground">Manage members and their access levels</p>
          </div>
          {canManageTeam && (
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4" /> Invite Member
            </Button>
          )}
        </div>

        {/* â”€â”€ Stats row â”€â”€ */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          <Card className="bg-card border-border p-4 text-center">
            <p className="text-2xl font-bold">{members.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Members</p>
          </Card>
          <Card className="bg-green-400/5 border-green-400/20 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </Card>
          <Card className="bg-yellow-400/5 border-yellow-400/20 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending Invite</p>
          </Card>
          <Card className="bg-primary/5 border-primary/20 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{Object.keys(ROLE_CONFIG).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Role Levels</p>
          </Card>
        </div>

        {/* â”€â”€ Main bento â”€â”€ */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">

          {/* Members area â€” col span 2 */}
          <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
            {members.length === 0 ? (
              <Card className="flex-1 bg-card border-border flex flex-col items-center justify-center gap-4 p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">No team members yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invite collaborators to help manage your account
                  </p>
                </div>
                {canManageTeam && (
                  <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4" /> Invite First Member
                  </Button>
                )}
              </Card>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {members.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    currentUserEmail={currentUser}
                    canManage={canManageTeam}
                    onResendInvite={() => resendMutation.mutate(member.id)}
                    onEditRole={() => { setEditMember(member); setEditRole(member.role); }}
                    onRemove={() => setRemoveDialogMember(member)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column â€” Role guide */}
          <Card className="bg-secondary/40 border-border flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border shrink-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Role Permissions</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.values(MerchantRole).map(role => {
                const cfg = ROLE_CONFIG[role];
                return (
                  <div key={role} className={`rounded-lg border p-3 ${cfg.bg}`}>
                    <div className={`flex items-center gap-2 font-medium text-sm mb-1 ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{cfg.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {cfg.permissions.map(p => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {canManageTeam && (
              <div className="p-4 border-t border-border shrink-0">
                <Button className="w-full gap-2" variant="outline" onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Invite Member
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* â”€â”€ Invite Dialog â”€â”€ */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your merchant account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleInvite)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register('email')} placeholder="colleague@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input id="name" {...register('name')} placeholder="John Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={selectedRole} onValueChange={(v) => setValue('role', v as MerchantRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(MerchantRole).filter(r => r !== MerchantRole.OWNER).map(role => {
                    const cfg = ROLE_CONFIG[role];
                    return (
                      <SelectItem key={role} value={role}>
                        <span className="flex items-center gap-2">
                          <span className={cfg.color}>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                          <span className="text-xs text-muted-foreground">â€” {cfg.description}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { reset(); setInviteDialogOpen(false); }}>Cancel</Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="bg-primary hover:bg-primary/90">
                {inviteMutation.isPending ? 'Sendingâ€¦' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Edit Role Dialog â”€â”€ */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for <strong>{editMember?.name || editMember?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={editRole} onValueChange={(v) => setEditRole(v as MerchantRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(MerchantRole).filter(r => r !== MerchantRole.OWNER).map(role => {
                  const cfg = ROLE_CONFIG[role];
                  return (
                    <SelectItem key={role} value={role}>
                      <span className="flex items-center gap-2">
                        <span className={cfg.color}>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                        <span className="text-xs text-muted-foreground">â€” {cfg.description}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {editRole && (
              <div className={`rounded-lg border p-3 text-sm ${ROLE_CONFIG[editRole].bg}`}>
                <p className={`font-medium mb-1 ${ROLE_CONFIG[editRole].color}`}>{ROLE_CONFIG[editRole].description}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ROLE_CONFIG[editRole].permissions.map(p => (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={handleRoleUpdate} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
              {updateMutation.isPending ? 'Savingâ€¦' : 'Save Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Remove Confirm Dialog â”€â”€ */}
      <Dialog open={!!removeDialogMember} onOpenChange={() => setRemoveDialogMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{removeDialogMember?.name || removeDialogMember?.email}</strong>? They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogMember(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} disabled={removeMutation.isPending}>
              {removeMutation.isPending ? 'Removingâ€¦' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* â”€â”€â”€ Member Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface MemberCardProps {
  member: TeamMember;
  currentUserEmail: string | null;
  canManage: boolean;
  onResendInvite: () => void;
  onEditRole: () => void;
  onRemove: () => void;
}

function MemberCard({ member, currentUserEmail, canManage, onResendInvite, onEditRole, onRemove }: MemberCardProps) {
  const cfg = ROLE_CONFIG[member.role];
  const isCurrentUser = member.email === currentUserEmail;
  const isOwner = member.role === MerchantRole.OWNER;
  const canModify = canManage && !isCurrentUser && !isOwner;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${cfg.bg}`}>
        <span className={`text-sm font-bold ${cfg.color}`}>
          {(member.name || member.email).charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{member.name || 'No name'}</p>
          {isCurrentUser && <span className="text-xs text-muted-foreground">(You)</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>

      {/* Role badge */}
      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} shrink-0`}>
        {cfg.icon}
        {cfg.label}
      </div>

      {/* Status */}
      <div className="shrink-0">
        {member.invite_pending ? (
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <Clock className="h-3.5 w-3.5" /> Pending
          </div>
        ) : member.is_active ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <XCircle className="h-3.5 w-3.5" /> Inactive
          </div>
        )}
      </div>

      {/* Last login */}
      <p className="text-xs text-muted-foreground shrink-0 hidden lg:block">
        {member.last_login ? formatRelativeTime(member.last_login) : 'Never logged in'}
      </p>

      {/* Actions */}
      {canModify ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditRole}>
              <UserCog className="w-4 h-4 mr-2" /> Change Role
            </DropdownMenuItem>
            {member.invite_pending && (
              <DropdownMenuItem onClick={onResendInvite}>
                <RefreshCw className="w-4 h-4 mr-2" /> Resend Invite
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="h-8 w-8 shrink-0" />
      )}
    </div>
  );
}

