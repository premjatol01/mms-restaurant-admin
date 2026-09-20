import { useState } from "react";
import { toast } from "sonner";
import { useWebsiteStore } from "../../../store/websiteStore";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";

export default function BasicInfoForm() {
  const { restaurantName, description, phone, email, address, updateBasicInfo } = useWebsiteStore();
  const [basicInfo, setBasicInfo] = useState({ restaurantName, description, phone, email, address });

  const setField = (key) => (e) => setBasicInfo((info) => ({ ...info, [key]: e.target.value }));

  const handleSave = () => {
    updateBasicInfo(basicInfo);
    toast.success("Basic information saved");
  };

  return (
    <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-theme">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Restaurant Name" value={basicInfo.restaurantName} onChange={setField("restaurantName")} />
        <Input label="Phone Number" value={basicInfo.phone} onChange={setField("phone")} />
        <Input label="Email" type="email" value={basicInfo.email} onChange={setField("email")} />
        <Input label="Address" value={basicInfo.address} onChange={setField("address")} />
      </div>
      <Textarea
        label="Short Description"
        value={basicInfo.description}
        onChange={setField("description")}
        rows={3}
        placeholder="Brief description for your restaurant website..."
      />
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
