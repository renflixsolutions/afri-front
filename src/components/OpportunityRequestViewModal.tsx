// filepath: c:\Users\omond\WebstormProjects\afri-front\src\components\OpportunityRequestViewModal.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { OpportunityRequest } from "@/types/opportunity-requests";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Paperclip,
  X,
  CheckCircle,
  Check
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
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: { status: string; admin_notes: string }) =>
      OpportunityRequestService.updateOpportunityRequest(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-requests'] });
      toast.success('Request status updated successfully');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update request status');
    }
  });

  const handleStatusUpdate = (status: string) => {
    const adminNotes = status === 'received' 
      ? 'Request acknowledged.' 
      : 'Request completed successfully.';
    
    updateMutation.mutate({ status, admin_notes: adminNotes });
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
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
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
              <>
                <Button
                  onClick={() => handleStatusUpdate('received')}
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Received
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
