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
import { teamService } from '../../../services/team.service';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
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
  Key,
  Activity,
  Monitor,
  Copy,
  Check,
} from 'lucide-react';
import { useMerchantStore } from '../../../stores/merchant-store';
import { BentoLayout } from "../BentoLayout";
import { PermissionManager } from './PermissionManager';
import { useTeamSessions } from '../../../hooks/useTeamSessions';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
    color: 'text-foreground',
    bg: 'bg-foreground/10 border-foreground/20',
    description: 'Full access to everything',
    permissions: ['All permissions', 'Billing', 'Delete account'],
  },
  [MerchantRole.ADMIN]: {
    label: 'Admin',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-foreground',
    bg: 'bg-foreground/10 border-foreground/20',
    description: 'Manage team & all features',
    permissions: ['Invite members', 'Change roles', 'All features'],
  },
  [MerchantRole.DEVELOPER]: {
    label: 'Developer',
    icon: <Code className="w-3.5 h-3.5" />,
    color: 'text-foreground',
    bg: 'bg-muted border-border',
    description: 'API keys & integrations',
    permissions: ['API access', 'Webhooks', 'View payments'],
  },
  [MerchantRole.FINANCE]: {
    label: 'Finance',
    icon: <Wallet className="w-3.5 h-3.5" />,
    color: 'text-foreground',
    bg: 'bg-muted border-border',
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
  creationMethod: z.enum(['invite', 'direct']),
  autoGeneratePassword: z.boolean().optional(),
  password: z.string().optional(),
}).refine((data) => {
  // If direct creation and not auto-generating, password is required
  if (data.creationMethod === 'direct' && !data.autoGeneratePassword) {
    return data.password && data.password.length >= 8;
  }
  return true;
}, {
  message: 'Password must be at least 8 characters',
  path: ['password'],
});
type InviteFormData = z.infer<typeof inviteSchema>;

// Helper function to get status badge
const getStatusBadge = (member: TeamMember) => {
  if (!member.is_active) {
    return { label: 'Inactive', variant: 'secondary' as const, icon: XCircle };
  }
  if (member.invite_pending) {
    return { label: 'Pending Setup', variant: 'outline' as const, icon: Clock };
  }
  if (member.last_login) {
    return { label: 'Active', variant: 'default' as const, icon: CheckCircle2 };
  }
  return { label: 'Never Logged In', variant: 'secondary' as const, icon: Clock };
};

export default function TeamMembersList() {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<MerchantRole>(MerchantRole.VIEWER);
  const [removeDialogMember, setRemoveDialogMember] = useState<TeamMember | null>(null);
  const [selectedMemberForPermissions, setSelectedMemberForPermissions] = useState<TeamMember | null>(null);
  const [selectedMemberForSessions, setSelectedMemberForSessions] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [creationResult, setCreationResult] = useState<{ success: boolean; message: string; temporaryPassword?: string } | null>(null);

  const currentUser = useMerchantStore((state) => state.email);
  const currentRole = useMerchantStore((state) => state.role);

  const { data: team, isLoading, error } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updateMutation = useUpdateTeamMember();
  const removeMutation = useRemoveTeamMember();
  const resendMutation = useResendInvite();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { 
      role: MerchantRole.VIEWER,
      creationMethod: 'direct',
      autoGeneratePassword: true,
    },
  });
  const selectedRole = watch('role');
  const creationMethod = watch('creationMethod');
  const autoGeneratePassword = watch('autoGeneratePassword');

  // Allow team management for OWNER and ADMIN, or if role is not set (assume they have permission)
  const canManageTeam = !currentRole || currentRole === MerchantRole.OWNER || currentRole === MerchantRole.ADMIN;

  const handleInvite = async (data: InviteFormData) => {
    setCreationResult(null);
    
    try {
      let response: any;
      
      if (data.creationMethod === 'invite') {
        // Method 1: Send invitation (existing endpoint)
        const input: any = { email: data.email, role: data.role };
        if (data.name?.trim()) input.name = data.name.trim();
        response = await inviteMutation.mutateAsync(input);
        setCreationResult({
          success: true,
          message: `Invitation sent to ${data.email}. User must accept invitation to set password.`,
        });
      } else {
        // Method 2: Create account directly (new RBAC endpoint with password)
        const input: any = { 
          email: data.email, 
          role: data.role,
        };
        if (data.name?.trim()) input.name = data.name.trim();
        
        // IMPORTANT: Must provide password or auto_generate_password
        if (data.autoGeneratePassword) {
          input.auto_generate_password = true;
        } else if (data.password) {
          input.password = data.password;
        } else {
          setCreationResult({
            success: false,
            message: 'Must provide password or enable auto-generate',
          });
          return;
        }
        
        // Use the direct creation endpoint
        response = await teamService.createTeamMember(input);
        
        // Backend returns temporary_password if auto-generated
        setCreationResult({
          success: true,
          message: response.message || 'Account created successfully! User can login immediately.',
          temporaryPassword: response.temporary_password || undefined,
        });
      }
      
      reset();
      // Show success for 3 seconds then go back
      setTimeout(() => {
        setShowAddMemberForm(false);
        setCreationResult(null);
      }, 3000);
    } catch (error: any) {
      setCreationResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to add team member',
      });
    }
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
      <BentoLayout activePage="team">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </BentoLayout>
    );
  }

  if (error) {
    const is403 = (error as any)?.response?.status === 403;
    return (
      <BentoLayout activePage="team">
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
      </BentoLayout>
    );
  }

  return (
    <BentoLayout activePage="team">
      {/* Show Add Member Form or Main Content */}
      {showAddMemberForm ? (
        <AddTeamMemberForm
          onSubmit={handleSubmit(handleInvite)}
          onCancel={() => {
            reset();
            setCreationResult(null);
            setShowAddMemberForm(false);
          }}
          register={register}
          errors={errors}
          setValue={setValue}
          selectedRole={selectedRole}
          creationMethod={creationMethod}
          autoGeneratePassword={autoGeneratePassword}
          creationResult={creationResult}
          isSubmitting={inviteMutation.isPending}
        />
      ) : (
        <div className="h-[calc(100vh-7rem)] flex flex-col gap-4 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-semibold">Team Management</h1>
            <p className="text-sm text-muted-foreground">Manage members, permissions, and sessions</p>
          </div>
          {canManageTeam && (
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setShowAddMemberForm(true)}>
              <UserPlus className="h-4 w-4" /> Invite Member
            </Button>
          )}
        </div>

        {/* ── Stats row ── */}
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

        {/* ── Tabs for different views ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Key className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Monitor className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="flex-1 min-h-0 mt-4">
            <div className="h-full grid grid-cols-3 gap-4">
              {/* Members area — col span 2 */}
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
                      <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setShowAddMemberForm(true)}>
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
                        onManagePermissions={() => {
                          setSelectedMemberForPermissions(member);
                          setActiveTab('permissions');
                        }}
                        onViewSessions={() => {
                          setSelectedMemberForSessions(member);
                          setActiveTab('sessions');
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right column — Role guide */}
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
                    <Button className="w-full gap-2" variant="outline" onClick={() => setShowAddMemberForm(true)}>
                      <UserPlus className="h-4 w-4" /> Invite Member
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              {selectedMemberForPermissions ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Manage Permissions</h3>
                    <Button variant="outline" onClick={() => setSelectedMemberForPermissions(null)}>
                      Back to Members
                    </Button>
                  </div>
                  <PermissionManager
                    memberId={selectedMemberForPermissions.id}
                    memberName={selectedMemberForPermissions.name || selectedMemberForPermissions.email}
                  />
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Key className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Select a Member</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a team member from the Members tab to manage their permissions
                  </p>
                  <Button onClick={() => setActiveTab('members')}>
                    Go to Members
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              {selectedMemberForSessions ? (
                <MemberSessionsView
                  member={selectedMemberForSessions}
                  onBack={() => setSelectedMemberForSessions(null)}
                />
              ) : (
                <Card className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Monitor className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Select a Member</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a team member from the Members tab to view their active sessions
                  </p>
                  <Button onClick={() => setActiveTab('members')}>
                    Go to Members
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="flex-1 min-h-0 mt-4">
            <div className="h-full overflow-y-auto">
              <Card className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Activity Log</h3>
                <p className="text-sm text-muted-foreground">
                  Activity logging feature coming soon. Track all team member actions and changes.
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      )}

      {/* ── Edit Role Dialog ── */}
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
                        <span className="text-xs text-muted-foreground">— {cfg.description}</span>
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
              {updateMutation.isPending ? 'Saving…' : 'Save Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Remove Confirm Dialog ── */}
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
              {removeMutation.isPending ? 'Removing…' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BentoLayout>
  );
}

/* ─── Add Team Member Form (Full Screen) ─────────────────────────────────────────── */
interface AddTeamMemberFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  register: any;
  errors: any;
  setValue: any;
  selectedRole: MerchantRole;
  creationMethod: 'invite' | 'direct';
  autoGeneratePassword: boolean;
  creationResult: { success: boolean; message: string; temporaryPassword?: string } | null;
  isSubmitting: boolean;
}

function AddTeamMemberForm({
  onSubmit,
  onCancel,
  register,
  errors,
  setValue,
  selectedRole,
  creationMethod,
  autoGeneratePassword,
  creationResult,
  isSubmitting,
}: AddTeamMemberFormProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    if (creationResult?.temporaryPassword) {
      navigator.clipboard.writeText(creationResult.temporaryPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b shrink-0">
        <div>
          <h1 className="text-2xl font-semibold">Add Team Member</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create an account or send an invitation to join your team
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Creation Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Creation Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    creationMethod === 'direct' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="direct"
                        {...register('creationMethod')}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold">Create Account Directly</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Instant access with password. Best for internal team members.
                    </p>
                  </label>

                  <label className={`flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    creationMethod === 'invite' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="invite"
                        {...register('creationMethod')}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold">Send Email Invitation</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      User sets own password. More secure for external users.
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register('email')} 
                      placeholder="colleague@company.com"
                      className="h-10"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name {creationMethod === 'direct' ? '*' : '(Optional)'}
                    </Label>
                    <Input 
                      id="name" 
                      {...register('name')} 
                      placeholder="John Smith"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={selectedRole} onValueChange={(v) => setValue('role', v as MerchantRole)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MerchantRole).filter(r => r !== MerchantRole.OWNER).map(role => {
                        const cfg = ROLE_CONFIG[role];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <span className={cfg.color}>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                              <span className="text-xs text-muted-foreground">— {cfg.description}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_CONFIG[selectedRole].description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Password Setup (Direct Creation Only) */}
            {creationMethod === 'direct' && (
              <Card className="border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Password Setup</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('autoGeneratePassword')}
                      className="mt-1 w-4 h-4"
                    />
                    <div>
                      <p className="font-medium">Auto-generate secure password (Recommended)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        System will create a strong password that you'll need to share with the user securely
                      </p>
                    </div>
                  </label>

                  {!autoGeneratePassword && (
                    <div className="space-y-2 pl-7">
                      <Label htmlFor="password">Custom Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="Enter a secure password"
                        className="h-10"
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Requirements: 8+ characters, uppercase, lowercase, number, special character
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Result Message */}
            {creationResult && (
              <Card className={
                creationResult.success 
                  ? 'border-green-200 dark:border-green-900' 
                  : 'border-red-200 dark:border-red-900'
              }>
                <CardContent className={`pt-6 ${
                  creationResult.success 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-start gap-3">
                    {creationResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        creationResult.success 
                          ? 'text-green-900 dark:text-green-100' 
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        {creationResult.message}
                      </p>
                      
                      {creationResult.success && creationResult.temporaryPassword && (
                        <>
                          <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Temporary Password:</p>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCopyPassword}
                                className="h-8"
                              >
                                {copied ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                            <code className="text-base bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded block font-mono">
                              {creationResult.temporaryPassword}
                            </code>
                            <div className="mt-3 flex items-start gap-2 text-yellow-600 dark:text-yellow-400">
                              <span className="text-lg">⚠️</span>
                              <p className="text-sm">
                                Save this password! Share it securely with the team member via a secure channel (not email).
                              </p>
                            </div>
                          </div>

                          {/* Next Steps */}
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                            <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                              <li>Share the login credentials with the team member</li>
                              <li>They can login at <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/login</code></li>
                              <li>Recommend they change their password after first login</li>
                            </ol>
                          </div>
                        </>
                      )}
                      
                      {creationResult.success && creationMethod === 'invite' && (
                        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                          ✅ The invitation expires in 7 days.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} size="lg">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isSubmitting 
                  ? 'Processing…' 
                  : creationMethod === 'invite' 
                    ? 'Send Invitation' 
                    : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Member Card ─────────────────────────────────────────── */
interface MemberCardProps {
  member: TeamMember;
  currentUserEmail: string | null;
  canManage: boolean;
  onResendInvite: () => void;
  onEditRole: () => void;
  onRemove: () => void;
  onManagePermissions: () => void;
  onViewSessions: () => void;
}

function MemberCard({ member, currentUserEmail, canManage, onResendInvite, onEditRole, onRemove, onManagePermissions, onViewSessions }: MemberCardProps) {
  const cfg = ROLE_CONFIG[member.role];
  const isCurrentUser = member.email === currentUserEmail;
  const isOwner = member.role === MerchantRole.OWNER;
  const canModify = canManage && !isCurrentUser && !isOwner;
  const statusBadge = getStatusBadge(member);
  const StatusIcon = statusBadge.icon;

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
        <Badge variant={statusBadge.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusBadge.label}
        </Badge>
      </div>

      {/* Last login */}
      <p className="text-xs text-muted-foreground shrink-0 hidden lg:block">
        {member.last_login ? formatRelativeTime(member.last_login) : 'Never logged in'}
      </p>

      {/* Actions */}
      {canModify || isCurrentUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canModify && (
              <>
                <DropdownMenuItem onClick={onEditRole}>
                  <UserCog className="w-4 h-4 mr-2" /> Change Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onManagePermissions}>
                  <Key className="w-4 h-4 mr-2" /> Manage Permissions
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={onViewSessions}>
              <Monitor className="w-4 h-4 mr-2" /> View Sessions
            </DropdownMenuItem>
            {member.invite_pending && canModify && (
              <DropdownMenuItem onClick={onResendInvite}>
                <RefreshCw className="w-4 h-4 mr-2" /> Resend Invite
              </DropdownMenuItem>
            )}
            {canModify && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Remove Member
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="h-8 w-8 shrink-0" />
      )}
    </div>
  );
}

/* ─── Member Sessions View ─────────────────────────────────────────── */
interface MemberSessionsViewProps {
  member: TeamMember;
  onBack: () => void;
}

function MemberSessionsView({ member, onBack }: MemberSessionsViewProps) {
  const { data: sessions, isLoading } = useTeamSessions(member.id);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {member.name || member.email} - {sessions?.length || 0} active session(s)
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Members
        </Button>
      </div>

      <div className="grid gap-4">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
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
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No active sessions found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

