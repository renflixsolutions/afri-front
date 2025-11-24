import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Edit, Plus, Trash2 } from 'lucide-react';
import { roleService, Role, Permission } from '@/services/api/RoleService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RolesPermissions() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userRolesQuery = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => roleService.getUserRoles(),
  });

  const permissionsQuery = useQuery({
    queryKey: ['userPermissions'],
    queryFn: () => roleService.getUserPermissions(),
  });

  const mutation = useMutation({
    mutationFn: (roleData: { name: string; permissions: number[] }) => {
      const data = { name: roleData.name, permissions: roleData.permissions.map(String) };
      if (selectedRole) {
        return roleService.updateUserRole(selectedRole.id, data);
      } else {
        return roleService.createUserRole(data);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: data?.message || 'Role saved successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: 'Failed to save role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    // Convert permission codes to numbers since the API returns them as strings but permissions API uses numbers
    const permCodes = new Set(role.permissions.map(p => Number(p.code)));
    setSelectedPermissions(permCodes);
    setIsEditDialogOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleName('');
    setSelectedPermissions(new Set());
    setIsEditDialogOpen(true);
  };

  const handleSaveRole = () => {
    mutation.mutate({ name: roleName, permissions: Array.from(selectedPermissions) });
  };

  const togglePermission = (code: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedPermissions(newSelected);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    roleService.deleteUserRole(roleToDelete.id).then((response) => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: response?.message || 'Role deleted successfully',
        variant: 'default',
      });
    }).catch((error: unknown) => {
      console.error('Error deleting role:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete role. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    });
  };

  const renderRoles = (roles: Role[], isLoading: boolean, error: unknown) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading roles...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load roles. Please try again.</p>
        </div>
      );
    }

    if (!roles || roles.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No roles found.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="border-0 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {role.name}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditRole(role)} disabled={role.name === 'Executive'}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className={role.name === 'Executive' ? 'text-destructive' : ''}>
                        <p>{role.name === 'Executive' ? 'This role cannot be edited.' : 'Edit Role'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteRole(role)} disabled={role.name === 'Executive'}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className={role.name === 'Executive' ? 'text-destructive' : ''}>
                        <p>{role.name === 'Executive' ? 'This role cannot be deleted.' : 'Delete Role'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Permissions ({role.permissions.length}):</p>
                <div className="space-y-1">
                  {role.permissions.slice(0, 5).map((permission) => (
                    <div key={permission.code} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      {permission.name}
                    </div>
                  ))}
                  {role.permissions.length > 5 && (
                    <div className="text-xs text-muted-foreground italic pl-4">
                      +{role.permissions.length - 5} more permissions
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground">Manage user roles and their permissions</p>
          </div>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Create User Role
        </Button>
      </div>

      {/* User Roles */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">User Roles</h2>
        {renderRoles(userRolesQuery.data || [], userRolesQuery.isLoading, userRolesQuery.error)}
      </div>

      {/* Edit/Create Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6 p-4">
                <div>
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  {permissionsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading permissions...</span>
                    </div>
                  ) : permissionsQuery.error ? (
                    <div className="text-center py-8">
                      <p className="text-destructive">Failed to load permissions. Please try again.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 mt-4">
                      {Object.entries(permissionsQuery.data || {}).map(([category, perms]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map((permission: Permission) => (
                              <div key={permission.code} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permission.code}`}
                                  checked={selectedPermissions.has(Number(permission.code))}
                                  onCheckedChange={() => togglePermission(Number(permission.code))}
                                />
                                <Label htmlFor={`perm-${permission.code}`} className="text-sm">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>
                {selectedRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the role{' '}
              <span className="font-semibold text-primary">{roleToDelete?.name}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteRole} variant="destructive">
              Delete Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
