import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
} from '../../../hooks/useTeam';
import { TeamMember, MerchantRole } from '../../../types/api.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
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
  Mail,
} from 'lucide-react';
import { useMerchantStore } from '../../../stores/merchant-store';
import { BentoLayout } from "../BentoLayout";
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

const ROLE_CONFIG: Record<MerchantRole, {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = {
  [MerchantRole.OWNER]: {
    label: 'Owner',
    icon: <Crown className="w-4 h-4" />,
    color: 'text-amber-600',
    description: 'Full access to everything',
  },
  [MerchantRole.ADMIN]: {
    label: 'Admin',
    icon: <Shield className="w-4 h-4" />,
    color: 'text-blue-600',
    description: 'Manage team & all features',
  },
  [MerchantRole.DEVELOPER]: {
    label: 'Developer',
    icon: <Code className="w-4 h-4" />,
    color: 'text-green-600',
    description: 'API keys & integrations',
  },
  [MerchantRole.FINANCE]: {
    label: 'Finance',
    icon: <Wallet className="w-4 h-4" />,
    color: 'text-purple-600',
    description: 'Payments & financial data',
  },
  [MerchantRole.VIEWER]: {
    label: 'Viewer',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-gray-600',
    description: 'Read-only access',
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
  if (data.creationMethod === 'direct' && !data.autoGeneratePassword) {
    return data.password && data.password.length >= 8;
  }
  return true;
}, {
  message: 'Password must be at least 8 characters',
  path: ['password'],
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function TeamMembersListNew() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<MerchantRole>(MerchantRole.VIEWER);
  const [removeDialogMember, setRemoveDialogMember] = useState<TeamMember | null>(null);
  const [creationResult, setCreationResult] = useState<{ success: boolean; message: string; temporaryPassword?: string } | null>(null);

  const currentUser = useMerchantStore((state) => state.email);
  const currentRole = useMerchantStore((state) => state.role);

  const { data: team, isLoading, error } = useTeamMembers();
  const inviteMutation = useInviteTeamMember();
  const updateMutation = useUpdateTeamMember();
  const removeMutation = useRemoveTeamMember();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<InviteFormData>({
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

  const canManageTeam = !currentRole || currentRole === MerchantRole.OWNER || currentRole === MerchantRole.ADMIN;

  const handleInvite = async (data: InviteFormData) => {
    setCreationResult(null);
    
    try {
      if (data.creationMethod === 'invite') {
        // Send invitation
        await inviteMutation.mutateAsync({
          email: data.email,
          name: data.name,
          role: data.role,
        });
        setCreationResult({
          success: true,
          message: `Invitation sent to ${data.email}. User must accept invitation to set password.`,
        });
      } else {
        // Create account directly
        const input: any = { 
          email: data.email, 
          role: data.role,
        };
        if (data.name?.trim()) input.name = data.name.trim();
        
        if (data.autoGeneratePassword) {
          input.auto_generate_password = true;
        } else if (data.password) {
          input.password = data.password;
        }
        
        const response = await inviteMutation.mutateAsync(input);
        setCreationResult({
          success: true,
          message: 'Account created successfully! User can login immediately.',
          temporaryPassword: (response as any).temporary_password,
        });
      }
      
      setTimeout(() => {
        reset();
        setCreationResult(null);
        setShowCreateForm(false);
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
    try {
      await updateMutation.mutateAsync({ memberId: editMember.id, input: { role: editRole } });
      toast.success('Role updated successfully');
      setEditMember(null);
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeDialogMember) return;
    try {
      await removeMutation.mutateAsync(removeDialogMember.id);
      toast.success('Member removed successfully');
      setRemoveDialogMember(null);
    } catch (error: any) {
      toast.error('Failed to remove member');
    }
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
        <Card className="border-destructive/30 mt-8 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">
              {is403 ? 'Plan Upgrade Required' : 'Error Loading Team'}
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            {is403
              ? 'Team management requires a higher plan. Upgrade to invite collaborators.'
              : 'Failed to load team members. Please refresh the page.'}
          </p>
          {is403 && (
            <Button onClick={() => window.location.href = '/billing'}>
              View Plans
            </Button>
          )}
        </Card>
      </BentoLayout>
    );
  }

  return (
    <BentoLayout activePage="team">
      {showCreateForm ? (
        <CreateTeamMemberForm
          onSubmit={handleSubmit(handleInvite)}
          onCancel={() => {
            reset();
            setCreationResult(null);
            setShowCreateForm(false);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          {canManageTeam && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-3xl font-bold mt-2">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{activeCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold mt-2 text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roles</p>
                <p className="text-3xl font-bold mt-2">{Object.keys(ROLE_CONFIG).length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </Card>
        </div>

        {/* Members List */}
        {members.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Invite your first team member to start collaborating
              </p>
              {canManageTeam && (
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {members.map(member => {
              const roleConfig = ROLE_CONFIG[member.role];
              const isCurrentUser = member.email === currentUser;
              
              return (
                <Card key={member.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">
                            {member.name || member.email}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {/* Role Badge */}
                          <div className={`flex items-center gap-1.5 text-sm ${roleConfig.color}`}>
                            {roleConfig.icon}
                            <span className="font-medium">{roleConfig.label}</span>
                          </div>

                          {/* Status Badge */}
                          {member.invite_pending ? (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </Badge>
                          ) : member.is_active ? (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {canManageTeam && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditMember(member); setEditRole(member.role); }}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setRemoveDialogMember(member)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Dialogs remain the same */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for {editMember?.name || editMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={editRole} onValueChange={(v) => setEditRole(v as MerchantRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG)
                  .filter(([role]) => role !== MerchantRole.OWNER)
                  .map(([role, config]) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="text-xs text-muted-foreground">— {config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={handleRoleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={!!removeDialogMember} onOpenChange={() => setRemoveDialogMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removeDialogMember?.name || removeDialogMember?.email}? 
              They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogMember(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} disabled={removeMutation.isPending}>
              {removeMutation.isPending ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BentoLayout>
  );
}

/* Create Team Member Form Component */
interface CreateTeamMemberFormProps {
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

function CreateTeamMemberForm({
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
}: CreateTeamMemberFormProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    if (creationResult?.temporaryPassword) {
      navigator.clipboard.writeText(creationResult.temporaryPassword);
      setCopied(true);
      toast.success('Password copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add Team Member</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create an account or send an invitation
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Success/Error Message */}
      {creationResult && (
        <Card className={`p-4 ${creationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {creationResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${creationResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {creationResult.message}
              </p>
              {creationResult.temporaryPassword && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm font-medium mb-2">Temporary Password:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {creationResult.temporaryPassword}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPassword}
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this password securely with the team member
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Creation Method */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Creation Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Instant access with password
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
                User sets own password
              </p>
            </label>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                placeholder="colleague@company.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="John Doe"
              />
            </div>
          </div>
        </Card>

        {/* Role Selection */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Role & Permissions</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(v) => setValue('role', v as MerchantRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG)
                    .filter(([role]) => role !== MerchantRole.OWNER)
                    .map(([role, config]) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <span className={config.color}>{config.icon}</span>
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={ROLE_CONFIG[selectedRole].color}>
                    {ROLE_CONFIG[selectedRole].icon}
                  </span>
                  <span className="font-semibold">{ROLE_CONFIG[selectedRole].label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ROLE_CONFIG[selectedRole].description}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Password Settings (only for direct creation) */}
        {creationMethod === 'direct' && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Password Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('autoGeneratePassword')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto-generate secure password</span>
              </label>

              {!autoGeneratePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    {...register('password')} 
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {creationMethod === 'direct' ? 'Create Account' : 'Send Invitation'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
