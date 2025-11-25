// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\OpportunityRequestViewModal.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OpportunityRequest } from "@/types/opportunity-requests";
import {
  FileText,
  Calendar,
  Clock,
  Paperclip,
  X,
  CheckCircle,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import OpportunityRequestService from "@/services/api/OpportunityRequestService";

interface OpportunityRequestViewModalProps {
  request: OpportunityRequest;
  isOpen: boolean;
  onClose: () => void;
}

export function OpportunityRequestViewModal({ request, isOpen, onClose }: OpportunityRequestViewModalProps) {
  const queryClient = useQueryClient();
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: { status: string; admin_notes: string }) =>
      OpportunityRequestService.updateOpportunityRequest(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-requests'] });
      toast.success('Request status updated successfully');
      setIsCompleteModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error?.toString() || 'An error occurred while updating the request status.');
    }
  });

  const handleStatusUpdate = (status: string) => {
    const adminNotes = status === 'received' 
      ? 'Request acknowledged.' 
      : '';

    updateMutation.mutate({ status, admin_notes: adminNotes });
  };

  const handleComplete = (adminNotes: string) => {
    if (adminNotes.trim()) {
      updateMutation.mutate({ status: 'completed', admin_notes: adminNotes });
    } else {
      toast.error('Please enter admin notes with opportunity details.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'received':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {request.title}
          </DialogTitle>
          <DialogDescription>
            View details of the opportunity request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requester and Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Requester</Label>
              <p className="text-lg font-medium mt-1">{request.user.full_name}</p>
              <p className="text-sm text-muted-foreground">{request.user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                <div className="mt-1">
                  <Badge variant="outline">{request.type}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(request.status)} text-white`}>
                    {request.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <p className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(request.created_at)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {request.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <Paperclip className="h-4 w-4" />
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Attachment {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Updated At */}
          <Separator />
          <div className="text-sm text-muted-foreground">
            <Label>Last Updated</Label>
            <p className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4" />
              {formatDate(request.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            {request.status === 'pending' && (
              <Button
                onClick={() => handleStatusUpdate('received')}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {updateMutation.isPending ? 'Marking as Received...' : 'Mark as Received'}
              </Button>
            )}
            {request.status === 'received' && (
              <Button
                onClick={() => setIsCompleteModalOpen(true)}
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Complete Request Modal */}
    <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Complete Opportunity Request
          </DialogTitle>
          <DialogDescription>
            To complete this request, you must provide the requester with specific opportunity details. This helps them take the next steps in their journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">What to include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Job or opportunity links</li>
              <li>• Contact information for follow-up</li>
              <li>• Salary or compensation details</li>
              <li>• Application deadlines or next steps</li>
              <li>• Any additional relevant information</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="complete-notes">Opportunity Details</Label>
            <Textarea
              id="complete-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide detailed opportunity information to help the requester..."
              rows={6}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setIsCompleteModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => handleComplete(adminNotes)}
            disabled={updateMutation.isPending || !adminNotes.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {updateMutation.isPending ? 'Completing...' : 'Complete Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
