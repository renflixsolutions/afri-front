import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NoPermission() {
  const navigate = useNavigate();
  return (
    <div className="h-full flex items-center justify-center bg-muted">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-center">Access Denied</CardTitle>
          <CardDescription className="text-center mt-2">
            You do not have permission to access this resource.<br />
            Please contact your administrator if you believe this is a mistake.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button variant="default" onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
}
