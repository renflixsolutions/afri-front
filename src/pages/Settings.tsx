import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/services/api/SettingsService';
import { companySettingsService, CompanySettings } from '@/services/api/CompanySettingsService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, DollarSign, Settings as SettingsIcon, RefreshCw, MoreHorizontal, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeSubmenu, setActiveSubmenu] = useState('fee-payment');
  const { toast } = useToast();

  // Fee dialog state
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [feeForm, setFeeForm] = useState({
    module: '',
    amount: '',
    currency: 'KES',
    type: 'fixed',
    percentage: '',
  });

  // Company settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Fetch fee settings using React Query
  const { data: feeSettings = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['feeSettings'],
    queryFn: async () => {
      const fees = await settingsService.getFeeSettings();
      return fees;
    },
  });

  // Mutation for creating/updating fee
  const saveMutation = useMutation({
    mutationFn: ({ module, amount, currency, type, percentage }: { module: string; amount: number; currency: string; type: string; percentage: number }) =>
      settingsService.setModuleFee(module, amount, currency, type, percentage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feeSettings'] });
      toast({
        title: 'Success',
        description: `Fee for ${variables.module} ${editMode ? 'updated' : 'created'} successfully`,
        variant: 'default',
        className: 'bg-green-600 text-white border-green-700',
      });
      setFeeDialogOpen(false);
      setFeeForm({ module: '', amount: '', currency: 'KES', type: 'fixed', percentage: '' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save fee';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Fetch company settings
  const { data: companySettingsData, isLoading: companyLoading, refetch: refetchCompany } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const settings = await companySettingsService.getCompanySettings();
      setCompanySettings(settings);
      return settings;
    },
  });

  // Mutation for updating company settings
  const updateCompanyMutation = useMutation({
    mutationFn: (settings: CompanySettings) => companySettingsService.updateCompanySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
        variant: 'default',
        className: 'bg-green-600 text-white border-green-700',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company settings';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleAddFee = () => {
    toast({
      title: 'You cannot add fees directly',
      description: 'Please contact system developers for assistance to add fees.',
      variant: 'default',
      className: 'bg-blue-600 text-white border-blue-700',
    });
  };

  const handleEditFee = (module: string, amount: string, currency: string, type: string, percentage: string) => {
    setEditMode(true);
    setFeeForm({ module, amount, currency, type, percentage });
    setFeeDialogOpen(true);
  };

  const handleSaveFee = async () => {
    if (!feeForm.module || !feeForm.currency || !feeForm.type) {
      toast({
        title: 'Validation Error',
        description: 'Module, currency, and type are required',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on fee type
    if (feeForm.type === 'fixed') {
      if (!feeForm.amount) {
        toast({
          title: 'Validation Error',
          description: 'Amount is required for fixed fee type',
          variant: 'destructive',
        });
        return;
      }

      const amount = parseFloat(feeForm.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Amount must be a valid number greater than 0',
          variant: 'destructive',
        });
        return;
      }
    } else if (feeForm.type === 'percentage') {
      if (!feeForm.percentage) {
        toast({
          title: 'Validation Error',
          description: 'Percentage is required for percentage fee type',
          variant: 'destructive',
        });
        return;
      }

      const percentage = parseFloat(feeForm.percentage);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        toast({
          title: 'Validation Error',
          description: 'Percentage must be between 0 and 100',
          variant: 'destructive',
        });
        return;
      }
    }

    saveMutation.mutate({
      module: feeForm.module,
      amount: parseFloat(feeForm.amount || '0'),
      currency: feeForm.currency,
      type: feeForm.type,
      percentage: parseFloat(feeForm.percentage || '0'),
    });
  };

  const handleSaveCompanySettings = () => {
    updateCompanyMutation.mutate(companySettings);
  };


  // Group fee settings by module
  const groupedFees = feeSettings.reduce((acc, setting) => {
    const match = setting.key.match(/^fee\.([^.]+)\.(amount|currency|type|percentage|calculated_info)$/);
    if (match) {
      const [, module, field] = match;
      if (!acc[module]) {
        acc[module] = {
          module,
          amount: '',
          currency: '',
          type: 'fixed',
          percentage: '',
          calculated_info: null
        };
      }

      if (field === 'calculated_info') {
        acc[module].calculated_info = setting.value as any;
      } else {
        acc[module][field as 'amount' | 'currency' | 'type' | 'percentage'] = setting.value as string;
      }
    }
    return acc;
  }, {} as Record<string, {
    module: string;
    amount: string;
    currency: string;
    type: string;
    percentage: string;
    calculated_info: any;
  }>);

  const feeList = Object.values(groupedFees);

  // Sidebar menu items
  const submenuItems = [
    {
      id: 'general',
      label: 'General Settings',
      icon: SettingsIcon,
      description: 'Company information',
    },
    {
      id: 'fee-payment',
      label: 'Fee Payment',
      icon: DollarSign,
      description: 'Configure module fees',
    },
    // Add more submenu items here in the future
    // {
    //   id: 'payment-gateway',
    //   label: 'Payment Gateway',
    //   icon: CreditCard,
    //   description: 'Payment gateway settings',
    // },
  ];

  if (loading && feeSettings.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Skeleton */}
          <div className="col-span-12 md:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="col-span-12 md:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure system parameters, fees, and other settings
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {submenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubmenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSubmenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-80">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 md:col-span-9">
          {activeSubmenu === 'fee-payment' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Module Fee Configuration</CardTitle>
                    <CardDescription>
                      Set application fees for different modules (jobs, scholarships, language courses, etc.)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button onClick={handleAddFee}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fee
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Base Amount</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Calculated Fee</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeList.length > 0 ? (
                        feeList.map((fee) => {
                          const calcInfo = fee.calculated_info;
                          const displayAmount = calcInfo?.fixed_amount || fee.amount || '0';
                          const displayPercentage = calcInfo?.percentage || fee.percentage || '0';
                          const displayType = calcInfo?.type || fee.type || 'fixed';
                          const displayCurrency = calcInfo?.currency || fee.currency || 'KES';

                          // Calculate the sample fee for percentage type
                          const sampleCalculation = calcInfo?.sample_calculation;
                          const baseAmount = parseFloat(displayAmount.toString());
                          const percentageValue = parseFloat(displayPercentage.toString());
                          const calculatedAmount = displayType === 'percentage'
                            ? (sampleCalculation?.calculated_amount || (baseAmount * percentageValue / 100))
                            : baseAmount;

                          return (
                            <TableRow key={fee.module}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="capitalize">
                                    {fee.module.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={displayType === 'fixed' ? 'default' : 'secondary'}>
                                  {displayType === 'fixed' ? 'Fixed' : 'Percentage'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {parseFloat(displayAmount.toString()).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="font-mono">
                                {displayType === 'percentage' ? (
                                  <span className="text-green-600 font-semibold text-sm">{displayPercentage}%</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {displayType === 'percentage' ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-[#ff8b19]">
                                        {calculatedAmount.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        (from {baseAmount.toFixed(2)})
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {percentageValue}% of base
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-[#2f318f]">
                                      {baseAmount.toFixed(2)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      Fixed
                                    </Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{displayCurrency}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() =>
                                      handleEditFee(
                                        fee.module,
                                        displayAmount.toString(),
                                        displayCurrency,
                                        displayType,
                                        displayPercentage.toString()
                                      )
                                    }>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Edit Fee
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-12 w-12 opacity-20" />
                              <p className="text-lg font-medium">No fees configured</p>
                              <p className="text-sm">Click "Add Fee" to create your first module fee</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeSubmenu === 'general' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure company information and contact details
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => refetchCompany()}
                      variant="outline"
                      size="sm"
                      disabled={companyLoading}
                    >
                      {companyLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {companyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companySettings.name}
                          onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Email</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyPhone">Phone</Label>
                        <Input
                          id="companyPhone"
                          value={companySettings.phone}
                          onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                          placeholder="+1234567890"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="companyAddress">Address</Label>
                        <Input
                          id="companyAddress"
                          value={companySettings.address}
                          onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                          placeholder="123 Business St, City, Country"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveCompanySettings} disabled={updateCompanyMutation.isPending}>
                        {updateCompanyMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>Save Settings</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fee Dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit' : 'Add'} Module Fee
            </DialogTitle>
            <DialogDescription>
              Configure the application fee for a module (fixed amount or percentage-based)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module Name *</Label>
              <Input
                id="module"
                placeholder="e.g., job, course, scholarship"
                value={feeForm.module}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, module: e.target.value })
                }
                disabled={editMode}
              />
              <p className="text-xs text-muted-foreground">
                Use alphanumeric characters and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Fee Type *</Label>
              <select
                id="type"
                value={feeForm.type}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, type: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Choose between a fixed fee or a percentage-based fee
              </p>
            </div>

            {feeForm.type === 'fixed' && (
              <div className="space-y-2">
                <Label htmlFor="amount">Fixed Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="250.00"
                  value={feeForm.amount}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, amount: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter the fixed fee amount
                </p>
              </div>
            )}

            {feeForm.type === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage *</Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  placeholder="10"
                  value={feeForm.percentage}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, percentage: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter the percentage (e.g., 10 for 10%)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input
                id="currency"
                placeholder="KES, USD, EUR, etc."
                value={feeForm.currency}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, currency: e.target.value.toUpperCase() })
                }
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                2-10 alphabetic characters (e.g., KES, USD)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeeDialogOpen(false);
                setFeeForm({ module: '', amount: '', currency: 'KES', type: 'fixed', percentage: '' });
              }}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFee} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>Save Fee</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
