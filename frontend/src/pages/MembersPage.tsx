import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import {
  Badge, Button, Avatar, AvatarFallback,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
  Skeleton,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Input, FormField,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '../components/ui'
import { useWorkspaceMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from '../features/workspaces'
import { useAuthStore } from '../stores/auth-store'
import { inviteMemberSchema, type InviteMemberFormData } from '../features/auth/validation'
import { MoreVertical, UserPlus, Trash2 } from 'lucide-react'

const roleBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'slate'> = {
  OWNER: 'default',
  ADMIN: 'warning',
  LEAD: 'success',
  DEVELOPER: 'slate',
  QA: 'outline',
  SUPERVISOR: 'slate',
}

const ROLES = ['DEVELOPER', 'QA', 'LEAD', 'SUPERVISOR', 'ADMIN'] as const

export function MembersPage() {
  const { user } = useAuthStore()
  const { data: members, isLoading } = useWorkspaceMembers()
  const inviteMember = useInviteMember()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()

  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InviteMemberFormData>({
    resolver: joiResolver(inviteMemberSchema),
    defaultValues: { name: '', email: '', role: 'DEVELOPER' },
  })
  const selectedRole = watch('role')

  const onInvite = (data: InviteMemberFormData) => {
    inviteMember.mutate(data, {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-medium text-slate-900">Members</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus size={16} />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>Add a new member to this workspace.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
              <FormField label="Name" htmlFor="invite-name" error={errors.name}>
                <Input id="invite-name" {...register('name')} />
              </FormField>
              <FormField label="Email" htmlFor="invite-email" error={errors.email}>
                <Input id="invite-email" type="email" {...register('email')} />
              </FormField>
              <FormField label="Role" htmlFor="invite-role" error={errors.role}>
                <Select value={selectedRole} onValueChange={(v) => setValue('role', v, { shouldValidate: true })}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <Button type="submit" className="w-full" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? 'Inviting…' : 'Send Invite'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-slate-900">Workspace Members</h3>
          <span className="text-sm text-ink-muted">{members?.length ?? '—'} member{(members?.length ?? 0) !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-ink-muted border-b border-border">
                <th className="text-left font-medium py-2 pr-4">Name</th>
                <th className="text-left font-medium py-2 pr-4 hidden sm:table-cell">Email</th>
                <th className="text-left font-medium py-2 pr-4">Role</th>
                <th className="text-left font-medium py-2 pr-4 hidden md:table-cell">Joined</th>
                <th className="w-12 py-2" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-4 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-48" />
                  </td>
                </tr>
              )}
              {members?.map((member) => {
                const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                const isSelf = member.userId === user?.id
                const isOwner = member.role === 'OWNER'
                const joinedDate = new Date(member.joinedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
                return (
                  <tr key={member.userId} className="border-t border-border">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-accent-soft text-accent text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 truncate block">{member.name}</span>
                          <span className="text-xs text-ink-muted sm:hidden">{member.email}</span>
                          {isSelf && <span className="text-xs text-ink-muted ml-1 hidden sm:inline">(you)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-ink-muted hidden sm:table-cell">{member.email}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={roleBadgeVariant[member.role] ?? 'slate'}>{member.role}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-ink-muted hidden md:table-cell">{joinedDate}</td>
                    <td className="py-2">
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ROLES.map((r) => (
                              <DropdownMenuItem
                                key={r}
                                disabled={member.role === r || updateRole.isPending}
                                onClick={() => updateRole.mutate({ userId: member.userId, role: r })}
                              >
                                {r}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-danger-600"
                              onClick={() => {
                                if (confirm(`Remove ${member.name} from workspace?`)) {
                                  removeMember.mutate(member.userId)
                                }
                              }}
                            >
                              <Trash2 size={14} /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                )
              })}
              {members?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
