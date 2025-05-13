
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailVerificationAlertProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function EmailVerificationAlert({
  isOpen,
  onClose,
  email,
}: EmailVerificationAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#222] border-gray-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-[#F9A825] mr-2" />
            Email Verification Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to
            verify your account before logging in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-[#D32F2F] text-white hover:bg-[#B71C1C]">
            I'll check my email
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
