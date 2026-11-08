import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptionStore } from "../../../store/subscriptionStore";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function TicketModal({ isOpen, onClose }) {
  const { createTicket, submitting, pendingPayment } = useSubscriptionStore();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSubject(pendingPayment ? "Update on Payment Verification" : "Subscription Inquiry");
      setMessage("");
      setError("");
    }
  }, [isOpen, pendingPayment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!message.trim()) {
      setError("Please write your message or note.");
      return;
    }

    try {
      await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        paymentRequestId: pendingPayment?._id || pendingPayment?.id || null,
      });
      toast.success("Support ticket submitted! Super admin will reply to your note.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit ticket");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise Support Ticket / Note" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-secondary">
          Need an update on your payment confirmation, plan upgrade, or have a question about your subscription? Send a note to the super admin team here.
        </p>

        <Input
          label="Subject"
          required
          placeholder="e.g., Update on payment verification"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div>
          <label className="text-xs font-medium text-theme block mb-1">
            Message / Note <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            className="w-full text-sm rounded-lg border border-theme bg-surface px-3 py-2 text-theme placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Type your message, query, or note here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-3 border-t border-theme">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={submitting} disabled={submitting}>
            <Send size={14} /> Send Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
