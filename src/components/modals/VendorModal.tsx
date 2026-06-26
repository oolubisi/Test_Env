/* ───────────────────────────────────────────
   VendorModal — Create / Edit vendor
   ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import type { Vendor } from "@/types";
import { callApi, setCache, getFullCache } from "@/lib/api";
import { useAppState } from "@/hooks/useAppState";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AttachmentUpload from "@/components/AttachmentUpload";

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editVendor?: Vendor | null;
}

export default function VendorModal({
  isOpen,
  onClose,
  editVendor,
}: VendorModalProps) {
  const { refresh } = useAppState();
  const isEdit = Boolean(editVendor);

  const [vendorId, setVendorId] = useState("");
  const [company, setCompany] = useState("");
  const [trade, setTrade] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");
  const [passport, setPassport] = useState("");
  const [attachments, setAttachments] = useState("");
  const [archived, setArchived] = useState("No");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editVendor) {
      setVendorId(editVendor.vendorId || "");
      setCompany(editVendor.company || "");
      setTrade(editVendor.trade || "");
      setContactName(editVendor.contactName || "");
      setPhone1(editVendor.phone1 || "");
      setPhone2(editVendor.phone2 || "");
      setEmail(editVendor.email || "");
      setPassport(editVendor.passport || "");
      setAttachments(editVendor.attachments || "");
      setArchived(editVendor.archived || "No");
      setError("");
    } else {
      const cache = getFullCache();
      const existingIds = (cache.vendors || [])
        .map((v: Vendor) => parseInt(v.vendorId, 10))
        .filter((n: number) => !isNaN(n));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      setVendorId(String(maxId + 1));
      setCompany("");
      setTrade("");
      setContactName("");
      setPhone1("");
      setPhone2("");
      setEmail("");
      setPassport("");
      setAttachments("");
      setArchived("No");
      setError("");
    }
  }, [editVendor, isOpen]);

  const validate = useCallback((): boolean => {
    if (!company.trim()) {
      setError("Company name is required.");
      return false;
    }
    if (phone1 && phone1.length !== 11) {
      setError("Phone 1 must be exactly 11 digits.");
      return false;
    }
    if (phone2 && phone2.length !== 11) {
      setError("Phone 2 must be exactly 11 digits.");
      return false;
    }
    setError("");
    return true;
  }, [company, phone1, phone2]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setSaving(true);
      try {
        const payload: Record<string, unknown> = {
          vendorId,
          company: company.trim(),
          trade: trade.trim(),
          contactName: contactName.trim(),
          phone1: phone1.trim(),
          phone2: phone2.trim(),
          email: email.trim(),
          passport,
          attachments,
          archived,
        };

        const resp = await callApi("saveVendor", payload);
        if (resp.status === "success" || resp.status === "queued") {
          const cache = getFullCache();
          const existingIdx = cache.vendors.findIndex(
            (v: Vendor) => v.vendorId === vendorId
          );
          const updatedVendor: Vendor = {
            vendorId,
            company: company.trim(),
            trade: trade.trim(),
            contactName: contactName.trim(),
            phone1: phone1.trim(),
            phone2: phone2.trim(),
            email: email.trim(),
            passport,
            attachments,
            archived,
            lastModified: new Date().toISOString(),
          };

          if (existingIdx >= 0) {
            const updated = [...cache.vendors];
            updated[existingIdx] = updatedVendor;
            setCache("vendors", updated);
          } else {
            setCache("vendors", [...cache.vendors, updatedVendor]);
          }
          refresh();
          onClose();
        } else {
          setError(resp.message || "Failed to save vendor.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      } finally {
        setSaving(false);
      }
    },
    [
      validate,
      vendorId,
      company,
      trade,
      contactName,
      phone1,
      phone2,
      email,
      passport,
      attachments,
      archived,
      refresh,
      onClose,
    ]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Vendor" : "New Vendor"}
      onSubmit={handleSubmit}
      submitText={saving ? "Saving…" : isEdit ? "Update" : "Create"}
      submitDisabled={saving}
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="vm-vendorId">Vendor ID</Label>
          <Input
            id="vm-vendorId"
            value={vendorId}
            disabled
            className="mt-1 bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="vm-company">
            Company <span className="text-destructive">*</span>
          </Label>
          <Input
            id="vm-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="vm-trade">Trade</Label>
          <Input
            id="vm-trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g. Electrical, Plumbing"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="vm-contactName">Contact Name</Label>
          <Input
            id="vm-contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Primary contact person"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vm-phone1">Phone 1 (11 digits)</Label>
            <Input
              id="vm-phone1"
              value={phone1}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                setPhone1(val);
              }}
              placeholder="080XXXXXXXX"
              inputMode="tel"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="vm-phone2">Phone 2 (11 digits)</Label>
            <Input
              id="vm-phone2"
              value={phone2}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                setPhone2(val);
              }}
              placeholder="080XXXXXXXX"
              inputMode="tel"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vm-email">Email</Label>
          <Input
            id="vm-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Passport Photo</Label>
          <div className="mt-1">
            <AttachmentUpload
              value={passport}
              onChange={setPassport}
              maxFiles={1}
              label=""
            />
          </div>
        </div>

        <div>
          <Label>Attachments</Label>
          <div className="mt-1">
            <AttachmentUpload
              value={attachments}
              onChange={setAttachments}
              label=""
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vm-archived">Archived</Label>
          <select
            id="vm-archived"
            value={archived}
            onChange={(e) => setArchived(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
