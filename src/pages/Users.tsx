import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Users as UsersIcon, Globe, Calendar, Lock, XCircle } from 'lucide-react';
import { userService } from '@/services/api/UserService';
import AddUserDialog from '@/components/AddUserDialog';

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Use React Query to fetch users
  const { data: pagination, isLoading: loading } = useQuery({
    queryKey: ['users', currentPage],
    queryFn: () => userService.listUsers(currentPage),
  });

  const users = pagination?.data || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
            <p className="text-muted-foreground">Manage system users and their access</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <AddUserDialog />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg">Users List</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery ? 'No users found' : 'No users available'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first user'}
              </p>
              {!searchQuery && (
                <AddUserDialog />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/system-users/${user.id}`, { state: { user } })}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-full">
                          <Globe className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {user.country.map((country, index) => (
                            <Badge key={country.id || index} variant="outline" className="text-xs">
                              {country.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/10 rounded-full">
                          <Calendar className="h-3 w-3 text-secondary" />
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {new Date(user.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              const days = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
                              if (days === 0) return 'Today';
                              if (days === 1) return 'Yesterday';  
                              if (days < 30) return `${days} days ago`;
                              if (days < 365) return `${Math.floor(days / 30)} months ago`;
                              return `${Math.floor(days / 365)} years ago`;
                            })()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.account_locked && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                        {user.inactive && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-300 flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                        {!user.account_locked && !user.inactive && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.from} to {pagination.to} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={pagination.prev_page_url === null}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={pagination.next_page_url === null}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
