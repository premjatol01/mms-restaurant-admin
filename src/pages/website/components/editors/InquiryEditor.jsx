import { useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import EditorShell from "../shared/EditorShell";
import FormBlock from "../shared/FormBlock";
import FieldError from "../shared/FieldError";
import { checkboxClass, inputClass } from "../shared/fieldStyles";
import { DEFAULT_PURPOSE_OPTIONS, INQUIRY_FIELDS, MAX_PURPOSE_OPTIONS } from "../../utils/constants";
import { normalizeField, validateInquiry } from "../../utils/validation";

const buildInitialContent = (content) => ({
  ...content,
  fields: Object.fromEntries(INQUIRY_FIELDS.map(({ key }) => [key, normalizeField(content.fields?.[key])])),
  purposeOptions: content.purposeOptions ?? [...DEFAULT_PURPOSE_OPTIONS]
});

export default function InquiryEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(() => buildInitialContent(section.content));
  const [errors, setErrors] = useState({});
  const [newOption, setNewOption] = useState("");
  const [optionError, setOptionError] = useState("");

  const { fields, purposeOptions } = content;

  const setField = (key, patch) =>
    setContent((c) => ({ ...c, fields: { ...c.fields, [key]: { ...c.fields[key], ...patch } } }));

  const toggleShow = (key, enabled) => setField(key, { enabled, required: enabled ? fields[key].required : false });

  const addOption = () => {
    const value = newOption.trim();
    if (!value) return;
    if (purposeOptions.some((option) => option.toLowerCase() === value.toLowerCase())) {
      setOptionError("This option is already in the list");
      return;
    }
    if (purposeOptions.length >= MAX_PURPOSE_OPTIONS) {
      setOptionError(`You can add up to ${MAX_PURPOSE_OPTIONS} options`);
      return;
    }
    setContent((c) => ({ ...c, purposeOptions: [...c.purposeOptions, value] }));
    setNewOption("");
    setOptionError("");
  };

  const removeOption = (option) => {
    setContent((c) => ({ ...c, purposeOptions: c.purposeOptions.filter((o) => o !== option) }));
    setOptionError("");
  };

  const handleSave = () => {
    const next = validateInquiry(content);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content);
  };

  return (
    <EditorShell
      title="Contact / Inquiry Section"
      description="Choose which fields visitors fill in and which ones they must complete"
      onBack={onCancel}
      onSave={handleSave}
    >
      <div>
        <Input
          label="Section Title"
          value={content.title}
          onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))}
          placeholder="Contact Us"
        />
        <FieldError message={errors.title} />
      </div>
      <Textarea
        label="Description"
        value={content.description}
        onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
        placeholder="Have a question? Send us an inquiry."
        rows={2}
      />

      <FormBlock title="Form fields" description="A field marked Required must be filled in before the visitor can send the inquiry">
        <div className="border border-theme rounded-lg divide-y divide-theme">
          <div className="hidden sm:flex items-center justify-between px-4 py-2 text-xs font-medium text-secondary bg-secondary-soft rounded-t-lg">
            <span>Field</span>
            <div className="flex gap-6">
              <span className="w-14">Show</span>
              <span className="w-16">Required</span>
            </div>
          </div>
          {INQUIRY_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-theme">{label}</p>
                <p className="text-xs text-secondary">{hint}</p>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm sm:w-14">
                  <input
                    type="checkbox"
                    checked={fields[key].enabled}
                    onChange={(e) => toggleShow(key, e.target.checked)}
                    className={checkboxClass}
                    aria-label={`Show ${label}`}
                  />
                  <span className="text-theme sm:sr-only">Show</span>
                </label>
                <label className={`flex items-center gap-2 text-sm sm:w-16 ${fields[key].enabled ? "" : "opacity-40"}`}>
                  <input
                    type="checkbox"
                    checked={fields[key].required}
                    disabled={!fields[key].enabled}
                    onChange={(e) => setField(key, { required: e.target.checked })}
                    className={checkboxClass}
                    aria-label={`${label} is required`}
                  />
                  <span className="text-theme sm:sr-only">Required</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <FieldError message={errors.fields} />
      </FormBlock>

      {fields.purpose.enabled && (
        <FormBlock title="Purpose options" description="Visitors choose one of these when they send an inquiry">
          <ul className="flex flex-wrap gap-2">
            {purposeOptions.map((option) => (
              <li key={option} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 text-sm rounded-full border border-theme text-theme">
                {option}
                <button
                  type="button"
                  onClick={() => removeOption(option)}
                  className="p-0.5 rounded-full text-secondary hover:text-red-500"
                  aria-label={`Remove ${option}`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => { setNewOption(e.target.value); setOptionError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              placeholder="Add an option, for example Birthday Party"
              maxLength={40}
              className={inputClass}
              aria-label="New purpose option"
            />
            <Button variant="secondary" onClick={addOption}>
              <Plus size={16} />
              Add
            </Button>
          </div>
          <FieldError message={optionError || errors.purposeOptions} />
        </FormBlock>
      )}
    </EditorShell>
  );
}
