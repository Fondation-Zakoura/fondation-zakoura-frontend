import React, { useState, useEffect } from 'react';
import type { Partner, PersonneContact, FilterOption } from '../../types/partners';
import {
  X, Building, Globe, MapPin, Flag, Text, HeartHandshake, User, Mail, Phone,
  Loader2, Save, Network, ClipboardList, Briefcase, PencilLine
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddEditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData, id?: number) => void;
  partner: Partner | null;
  options: Record<string, FilterOption[]>;
  serverErrors: Record<string, string[]>;
  isLoading: boolean;
}

export const AddEditPartnerModal: React.FC<AddEditPartnerModalProps> = ({
  isOpen, onClose, onSave, partner, options, serverErrors, isLoading
}) => {
  const [formData, setFormData] = useState<Partial<Partner & PersonneContact>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    // This logic remains the same
    const firstContact = partner?.contact_people?.[0];
    if (partner) {
      setFormData({
        ...partner,
        contact_last_name: firstContact?.last_name || '',
        contact_first_name: firstContact?.first_name || '',
        contact_position: firstContact?.position || '',
        contact_email: firstContact?.email || '',
        contact_phone: firstContact?.phone || '',
        contact_address: firstContact?.address || '',
        partner_type: partner.partner_type || 'National',
      });
    } else {
      setFormData({ partner_type: 'National' }); // Default value
    }
    setLogoFile(null);
  }, [partner, isOpen]);

  // Handler for standard inputs and textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  // New handler for shadcn Select component
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // This submission logic remains the same
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });
    if (logoFile) data.append('partner_logo', logoFile);
    if (partner?.id) data.append('_method', 'PUT');

    onSave(data, partner?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[1100px] !max-w-none p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {partner ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 pt-0">
            <ScrollArea className="max-h-[65vh] overflow-auto pr-2">
              <div className="space-y-10">

                {/* Informations Générales */}
                <section>
                  <h3 className="text-lg font-medium text-[#008c95] mb-4">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <Label htmlFor="partner_name">Nom du Partenaire *</Label>
                      <Input id="partner_name" name="partner_name" value={formData.partner_name || ''} onChange={handleChange} required />
                      {serverErrors?.partner_name && <p className="text-sm text-destructive mt-1">{serverErrors.partner_name[0]}</p>}
                    </div>
                     <div>
                      <Label htmlFor="abbreviation">Abbréviation *</Label>
                      <Input id="abbreviation" name="abbreviation" value={formData.abbreviation || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label htmlFor="country">Pays *</Label>
                      <Input id="country" name="country" value={formData.country || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="address">Adresse</Label>
                      <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
                    </div>
                  </div>
                </section>

                {/* Classification & Phase */}
                <section>
                  <h3 className="text-lg font-medium text-[#008c95] mb-4">Classification & Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                    <div>
                      <Label>Nature *</Label>
                      <Select name="nature_partner_id" value={String(formData.nature_partner_id || '')} onValueChange={(value) => handleSelectChange('nature_partner_id', value)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                        <SelectContent>
                          {(options.natures || []).map((opt) => <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type *</Label>
                      <Select name="partner_type" value={formData.partner_type || ''} onValueChange={(value) => handleSelectChange('partner_type', value)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National">National</SelectItem>
                          <SelectItem value="International">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div>
                      <Label>Structure *</Label>
                      <Select name="structure_partner_id" value={String(formData.structure_partner_id || '')} onValueChange={(value) => handleSelectChange('structure_partner_id', value)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                        <SelectContent>
                          {(options.structures || []).map((opt) => <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Phase *</Label>
                      <Select name="status_id" value={String(formData.status_id || '')} onValueChange={(value) => handleSelectChange('status_id', value)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                        <SelectContent>
                           {(options.statuts || []).map((opt) => <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Personne de Contact */}
                <section>
                   <h3 className="text-lg font-medium text-[#008c95] mb-4">Personne de Contact</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                      <div><Label htmlFor="contact_first_name">Prénom *</Label><Input id="contact_first_name" name="contact_first_name" value={formData.contact_first_name || ''} onChange={handleChange} required /></div>
                      <div><Label htmlFor="contact_last_name">Nom *</Label><Input id="contact_last_name" name="contact_last_name" value={formData.contact_last_name || ''} onChange={handleChange} required /></div>
                      <div><Label htmlFor="contact_position">Poste *</Label><Input id="contact_position" name="contact_position" value={formData.contact_position || ''} onChange={handleChange} required /></div>
                      <div><Label htmlFor="contact_email">Email *</Label><Input id="contact_email" name="contact_email" type="email" value={formData.contact_email || ''} onChange={handleChange} required /></div>
                      <div><Label htmlFor="contact_phone">Téléphone *</Label><Input id="contact_phone" name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} required /></div>
                      <div><Label htmlFor="contact_address">Adresse (facultative)</Label><Input id="contact_address" name="contact_address" value={formData.contact_address || ''} onChange={handleChange} /></div>
                   </div>
                </section>

                {/* Autres Informations */}
                <section>
                  <h3 className="text-lg font-medium text-[#008c95] mb-4">Autres Informations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea id="note" name="note" rows={4} value={formData.note || ''} onChange={handleChange} />
                    </div>
                    <div>
                       <Label htmlFor="actions">Actions</Label>
                       <Input id="actions" name="actions" value={formData.actions || ''} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="partner_logo">Logo</Label>
                      <Input id="partner_logo" type="file" accept="image/*" onChange={handleLogoChange} />
                      {logoFile && <img src={URL.createObjectURL(logoFile)} alt="Preview" className="mt-2 h-24 object-contain rounded-md border p-1" />}
                    </div>
                  </div>
                </section>

              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="p-4 bg-gray-50 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Annuler</Button>
            </DialogClose>
            <Button type="submit" style={{ backgroundColor: '#008c95' }} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" />Sauvegarder</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};