"use client";

import React, { useState } from "react";
import { Pill, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PrescriptionItemDraft {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionFormProps {
  items?: PrescriptionItemDraft[];
  onChange?: (items: PrescriptionItemDraft[]) => void;
  title?: string;
}

export function PrescriptionForm({
  items: controlledItems,
  onChange,
  title = "Prescription Items",
}: PrescriptionFormProps) {
  const [internalItems, setInternalItems] = useState<PrescriptionItemDraft[]>([]);
  const items = controlledItems ?? internalItems;

  const [isOpen, setIsOpen] = useState(false);

  // New item draft inputs
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const updateItems = (newItems: PrescriptionItemDraft[]) => {
    if (onChange) {
      onChange(newItems);
    } else {
      setInternalItems(newItems);
    }
  };

  const handleAddMedication = () => {
    if (!medication.trim()) return;

    const newItem: PrescriptionItemDraft = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      medication: medication.trim(),
      dosage: dosage.trim() || "Standard",
      frequency: frequency.trim() || "As directed",
      duration: duration.trim() || "7 days",
      instructions: instructions.trim() || "Take as directed",
    };

    updateItems([...items, newItem]);
    setMedication("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setInstructions("");
  };

  const handleRemoveMedication = (itemId: string) => {
    updateItems(items.filter((item) => item.id !== itemId));
  };

  return (
    <div className="border border-[#141618] bg-white p-5 sm:p-6 space-y-4 shadow-[2px_2px_0px_#141618]">
      <div className="flex items-center justify-between border-b border-[#141618] pb-3">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-[#141618]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#141618]">
            {title} ({items.length})
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-none border border-[#141618] text-xs font-mono uppercase font-bold text-[#141618] hover:bg-[#FAFAF7]"
        >
          {isOpen ? "Close Pad" : "+ Add Prescription Items"}
        </Button>
      </div>

      {/* Dynamic Item Form */}
      {isOpen && (
        <div className="border border-[#141618] bg-[#FAFAF7] p-4 space-y-4">
          <span className="text-[11px] font-mono uppercase text-[#5A5D61] font-bold block">
            Add Prescription Line Item
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                Medication &amp; Form *
              </label>
              <Input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="e.g. Amoxicillin 500mg caps"
                className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                Dosage
              </label>
              <Input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg"
                className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                Frequency
              </label>
              <Input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Three times daily"
                className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                Duration / Quantity
              </label>
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 7 days (21 capsules)"
                className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#5A5D61] font-bold mb-1">
                Patient Instructions / Advice
              </label>
              <Input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with food. Complete the full antibiotic course."
                className="w-full rounded-none border border-[#141618] bg-white p-1.5 text-xs text-[#141618]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="default"
              size="xs"
              onClick={handleAddMedication}
              disabled={!medication.trim()}
              className="rounded-none border border-[#141618] bg-[#141618] text-xs font-mono uppercase font-bold text-[#FAFAF7] hover:bg-black flex items-center gap-1"
            >
              <Plus className="size-3" />
              <span>Add Item to Prescription</span>
            </Button>
          </div>
        </div>
      )}

      {/* Configured Items List */}
      {items.length === 0 ? (
        <div className="border border-dashed border-[#D8D4CC] p-4 text-center text-xs font-mono text-[#5A5D61]">
          No medication items added to this prescription yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-[#141618] bg-[#FAFAF7] p-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#5A5D61] text-[11px] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-[#141618]">{item.medication}</span>
                  <span className="font-mono text-[11px] text-[#5A5D61]">
                    ({item.dosage})
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[#5A5D61]">
                  <span>{item.frequency}</span> • <span>{item.duration}</span> —{" "}
                  <span className="italic">{item.instructions}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => handleRemoveMedication(item.id)}
                className="text-[#B91C1C] hover:bg-[#FFF5F5] rounded-none size-7 p-0"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Remove item</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
