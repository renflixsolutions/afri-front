import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScholarshipApplication } from '@/types/scholarships';
import { toast } from '@/components/ui/sonner';
import ScholarshipApplicationService from '@/services/api/ScholarshipApplicationService';
import {
  User,
  Mail,
  Phone,
  Award,
  Building,
  GraduationCap,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface ScholarshipApplicationViewModalProps {
  application: ScholarshipApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScholarshipApplicationViewModal({
  application,
  isOpen,
  onClose
}: ScholarshipApplicationViewModalProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'>('pending');
  const [handledBy, setHandledBy] = useState('');

  if (!application) return null;

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; status: string; handled_by: string }) =>
      ScholarshipApplicationService.updateApplication(data.id, {
        status: data.status as any,
        handled_by: data.handled_by,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-applications'] });
      toast.success('Application status updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application');
    }
  });

  const handleStatusUpdate = async () => {
    if (!application) return;

    if (newStatus === application.status) {
      toast.error('Please select a different status');
      return;
    }

    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync({
        id: application.id,
        status: newStatus,
        handled_by: handledBy || 'admin',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      under_review: { variant: 'outline', icon: <FileText className="h-3 w-3 mr-1" /> },
      shortlisted: { variant: 'default', icon: <UserCheck className="h-3 w-3 mr-1" /> },
      accepted: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFinalStatus = application.status === 'accepted' || application.status === 'rejected';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Scholarship Application Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Reference */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
              <div className="mt-1">{getStatusBadge(application.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="text-sm font-mono font-medium">{application.application_ref}</p>
            </div>
          </div>

          <Separator />

          {/* Scholarship Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Scholarship Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="text-sm font-medium">{application.opportunity.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Institution</p>
                <p className="text-sm font-medium">{application.opportunity.institution}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-sm font-medium">{application.opportunity.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Field of Study</p>
                <p className="text-sm font-medium">{application.opportunity.field_of_study}</p>
              </div>
              {application.opportunity.application_deadline && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(application.opportunity.application_deadline)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Applicant Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Applicant Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{application.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.phone}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted Date</p>
                <p className="text-sm font-medium">{formatDate(application.submitted_at)}</p>
              </div>
            </div>
          </div>

          {/* Motivation Statement */}
          {application.motivation && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Motivation Statement</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {application.motivation}
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          {application.student_application_documents && application.student_application_documents.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Application Documents ({application.student_application_documents.length})
                </h3>
                <div className="space-y-2">
                  {application.student_application_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {doc.document_type.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Construct full URL for the document
                          const baseUrl = 'http://localhost:8081/api/v1/u/files/';
                          window.open(baseUrl + doc.file_path, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Handled By */}
          {application.handled_by && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Handled By</h3>
                <p className="text-sm text-muted-foreground">{application.handled_by}</p>
              </div>
            </>
          )}

          {/* Status Update Section */}
          {!isFinalStatus && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Update Application Status</h3>

                <div className="space-y-2">
                  <Label htmlFor="status">New Status</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handled_by">Handled By (Optional)</Label>
                  <Textarea
                    id="handled_by"
                    placeholder="Enter your name or email..."
                    value={handledBy}
                    onChange={(e) => setHandledBy(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : `Update Status to ${newStatus.replace('_', ' ')}`}
                </Button>
              </div>
            </>
          )}

          {isFinalStatus && (
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                This application has reached a final status ({application.status}) and cannot be modified.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

