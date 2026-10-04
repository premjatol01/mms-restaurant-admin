import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { useTablesQRStore } from "../../../store/tablesQRStore";
import Drawer from "../../../components/ui/Drawer";
import Button from "../../../components/ui/Button";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function GenerateQRDrawer({ isOpen, onClose }) {
  const { generateQRCodes, qrTemplates, fetchQRTemplates } = useTablesQRStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) fetchQRTemplates();
  }, [isOpen, fetchQRTemplates]);

  const activeTemplates = qrTemplates.filter((t) => t.status === "active");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateQRCodes(1, selectedTemplateId || null);
      toast.success("QR code generated successfully.");
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Generate QR Code" size="md">
      <div className="space-y-5">
        <p className="text-sm text-secondary">
          Choose a template from your super-admin panel or generate a plain QR code. Generated QR codes will appear in your table list and can be assigned from the table actions.
        </p>

        {/* Template grid */}
        <div>
          <p className="text-sm font-medium text-theme mb-3">Select Template</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Plain QR option */}
            <button
              type="button"
              onClick={() => setSelectedTemplateId(null)}
              className={`border-2 rounded-lg p-2 transition-all ${
                selectedTemplateId === null
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20"
                  : "border-theme hover:border-[var(--color-primary)]/50"
              }`}
            >
              <div className="w-full aspect-square rounded mb-2 bg-gray-100 flex items-center justify-center">
                <QrCode size={36} className="text-gray-400" />
              </div>
              <p className="text-xs font-medium text-theme text-center leading-tight">Plain QR</p>
            </button>

            {activeTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`border-2 rounded-lg p-2 transition-all ${
                  selectedTemplateId === tpl.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20"
                    : "border-theme hover:border-[var(--color-primary)]/50"
                }`}
              >
                <img
                  src={getImageUrl(tpl.imagePath)}
                  alt={tpl.name}
                  className="w-full aspect-square object-cover rounded mb-2 bg-white"
                />
                <p className="text-xs font-medium text-theme text-center leading-tight">{tpl.name}</p>
              </button>
            ))}
          </div>

          {activeTemplates.length === 0 && (
            <p className="text-xs text-secondary mt-3">
              No templates available yet. A plain QR code will be generated.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-theme">
          <Button variant="secondary" className="flex-1" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleGenerate} loading={isGenerating}>
            {isGenerating ? "Generating..." : "Generate QR"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}