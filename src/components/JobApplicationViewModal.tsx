import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobApplication } from '@/types/jobs';
import { useState } from 'react';
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  User,
  Briefcase,
  FileCheck,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface JobApplicationViewModalProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'pending' | 'shortlisted' | 'rejected', remarks?: string) => Promise<void>;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
    pending: { variant: 'secondary', icon: <FileCheck className="h-3 w-3 mr-1" /> },
    shortlisted: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
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

export default function JobApplicationViewModal({
  application,
  isOpen,
  onClose,
  onStatusUpdate
}: JobApplicationViewModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'shortlisted' | 'rejected'>('pending');
  const [remarks, setRemarks] = useState('');

  if (!application) return null;

  const handleStatusUpdate = async () => {
    if (!application) return;

    // Validation
    if (newStatus === application.status) {
      toast.error('Please select a different status');
      return;
    }

    // Check workflow rules
    if (application.status === 'shortlisted' || application.status === 'rejected') {
      toast.error(`Cannot update ${application.status} application (final status)`);
      return;
    }

    if (!remarks.trim()) {
      toast.error('Please provide remarks for the status change');
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(application.id, newStatus, remarks);
      setRemarks('');
      toast.success(`Application ${newStatus === 'shortlisted' ? 'shortlisted' : 'rejected'} successfully`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isFinalStatus = application.status === 'shortlisted' || application.status === 'rejected';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Job Application Details
          </DialogTitle>
          <DialogDescription>
            Reference: {application.reference_code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
              <div className="mt-1">{getStatusBadge(application.status)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">{formatDate(application.created_at)}</p>
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="text-sm font-medium">{application.job.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="text-sm font-medium">{application.job.company}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{application.job.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="text-sm font-medium">{application.job.job_type}</p>
              </div>
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
                <span className="text-sm font-medium">{application.applicant_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{application.country}</span>
              </div>
              {application.passport_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Passport Number</p>
                  <p className="text-sm font-medium">{application.passport_number}</p>
                </div>
              )}
              {application.national_id && (
                <div>
                  <p className="text-sm text-muted-foreground">National ID</p>
                  <p className="text-sm font-medium">{application.national_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Cover Letter</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {application.cover_letter}
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          {application.application_documents && application.application_documents.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Application Documents
                </h3>
                <div className="space-y-2">
                  {application.application_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type.replace('_', ' ').toUpperCase()} • {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(doc.document_url, '_blank')}
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

          {/* Existing Remarks */}
          {application.remarks && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2">Previous Remarks</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  {application.remarks}
                </div>
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
                    onValueChange={(value) => setNewStatus(value as 'pending' | 'shortlisted' | 'rejected')}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks *</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter remarks for this status change..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || !remarks.trim()}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : `Update Status to ${newStatus === 'shortlisted' ? 'Shortlisted' : 'Rejected'}`}
                </Button>
              </div>
            </>
          )}

          {isFinalStatus && (
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                This application has reached a final status and cannot be modified.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

