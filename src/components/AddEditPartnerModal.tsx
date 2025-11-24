import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { PartnerFormData } from "@/types/partners";

interface AddEditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: FormData) => Promise<void>;
  partner?: PartnerFormData & { id?: string; logo?: string };
  mode: 'add' | 'edit';
}

const initialFormData: PartnerFormData = {
  name: '',
  type: '',
  country: '',
  website: '',
  email: '',
  phone: '',
  logo: null,
  description: '',
  is_active: true,
};

export function AddEditPartnerModal({ isOpen, onClose, onSave, partner, mode }: AddEditPartnerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && partner) {
        console.log('Loading partner data:', partner);
        console.log('Partner is_active value:', partner.is_active, 'Type:', typeof partner.is_active);

        setFormData({
          name: partner.name || '',
          type: partner.type || '',
          country: partner.country || '',
          website: partner.website || '',
          email: partner.email || '',
          phone: partner.phone || '',
          logo: null,
          description: partner.description || '',
          // Explicitly convert to boolean - handles 1/0, true/false, "1"/"0"
          is_active: Boolean(partner.is_active),
        });
        if (partner.logo) {
          setLogoPreview(partner.logo);
        }
      } else {
        setFormData(initialFormData);
        setLogoPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, mode, partner]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartnerFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Invalid website URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('description', formData.description);
      // Ensure is_active is sent as '1' or '0' based on the actual boolean value
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');

      // Debug logging
      console.log('Form data is_active:', formData.is_active);
      console.log('Sending is_active as:', formData.is_active ? '1' : '0');

      if (formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }

      await onSave(formDataToSend);
      toast.success(`Partner ${mode === 'add' ? 'created' : 'updated'} successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode === 'add' ? 'create' : 'update'} partner`);
      console.error('Error saving partner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setLogoPreview(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'add' ? 'Add New Partner' : 'Edit Partner'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Fill in the details below to add a new partner'
              : 'Update the partner information below'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Partner Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Partner Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Global Education Network"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Partner Type and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Partner Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., University Partner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., Canada"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., info@partner.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +1 416-555-2345"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g., https://www.partner.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Partner Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the partner organization"
              rows={4}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive partners will not be visible in the system
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : mode === 'add' ? 'Create Partner' : 'Update Partner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

