import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scholarship } from '@/types/scholarships';
import {
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  DollarSign,
  ExternalLink,
  Users,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScholarshipDetailsModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScholarshipDetailsModal({ scholarship, isOpen, onClose }: ScholarshipDetailsModalProps) {
  if (!scholarship) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{scholarship.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {scholarship.is_published ? (
              <Badge className="bg-blue-100 text-blue-700">Published</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
            {scholarship.is_fully_funded && (
              <Badge className="bg-emerald-100 text-emerald-700">Fully Funded</Badge>
            )}
            {scholarship.partner && (
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {scholarship.partner.name}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            {scholarship.country && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{scholarship.country}</p>
                </div>
              </div>
            )}

            {scholarship.institution && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{scholarship.institution}</p>
                </div>
              </div>
            )}

            {scholarship.level && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Education Level</p>
                  <p className="font-medium">{scholarship.level}</p>
                </div>
              </div>
            )}

            {scholarship.application_deadline && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Deadline</p>
                  <p className="font-medium">{formatDate(scholarship.application_deadline)}</p>
                </div>
              </div>
            )}

            {scholarship.field_of_study && (
              <div className="flex items-start gap-3 col-span-2">
                <div className="p-2 bg-muted rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Field of Study</p>
                  <p className="font-medium">{scholarship.field_of_study}</p>
                </div>
              </div>
            )}
          </div>

          {scholarship.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {scholarship.description}
                </div>
              </div>
            </>
          )}

          {scholarship.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {scholarship.requirements}
                </div>
              </div>
            </>
          )}

          {scholarship.benefits && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {scholarship.benefits}
                </div>
              </div>
            </>
          )}

          {scholarship.application_link && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Application</h3>
                <Button
                  variant="outline"
                  onClick={() => window.open(scholarship.application_link!, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Application Link
                </Button>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {formatDate(scholarship.created_at)}</p>
            <p>Last Updated: {formatDate(scholarship.updated_at)}</p>
            {scholarship.created_by && <p>Created By: {scholarship.created_by}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

