interface ContactErrors {
  [field: string]: string;
}

// Define the structure for nested contact errors
interface ContactPeopleErrors {
  [index: number]: ContactErrors;
}

// Define the main error state shape
interface PartnerFormErrors {
  partner_name?: string;
  abbreviation?: string;
  country?: string;
  email?: string;
  nature_partner_id?: string;
  structure_partner_id?: string;
  status_id?: string;
  partner_logo?: string;
  contacts?: string; // For the overall contacts validation error
  contact_people?: ContactPeopleErrors; // Nested errors for contact individuals
  [key: string]: string | ContactPeopleErrors | undefined; // Allow for other top-level string errors
}

import React, { useState, useEffect, useMemo } from "react";
import type { Partner, FilterOption, ContactPerson } from "../../types/partners"; // Make sure to define ContactPerson in your types
import { Loader2, Save, Check, ChevronsUpDown, PlusCircle, XCircle } from "lucide-react";

// Shadcn UI Components (assuming these are correctly imported)
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Import the country data
import countries from "@/data/countries.json";

// --- Reusable Combobox Component for Countries (Unchanged) ---
interface CountryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CountryCombobox: React.FC<CountryComboboxProps> = ({
  value,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? countries.find(
                (country) => country.name.toLowerCase() === value.toLowerCase()
              )?.name
            : "Sélectionnez un pays..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un pays..." />
          <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-72">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={(currentValue) => {
                    const selectedCountryName =
                      countries.find(
                        (c) =>
                          c.name.toLowerCase() === currentValue.toLowerCase()
                      )?.name || "";
                    onValueChange(selectedCountryName);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// --- Main Modal Component (Refactored) ---
interface AddEditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData, id?: number) => void;
  partner: Partner | null;
  options: Record<string, FilterOption[]>;
  serverErrors: Record<string, string[]>; // This prop seems unused, but keeping it for context
  isLoading: boolean;
}

type PartnerFormData = Omit<Partial<Partner>, "contact_people"> & {
  nature_partner_id?: string | number;
  structure_partner_id?: string | number;
  status_id?: string | number;
  contact_people?: Partial<ContactPerson>[]; // Array of contacts
};

export const AddEditPartnerModal: React.FC<AddEditPartnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partner,
  options,
  isLoading,
}) => {
  const emptyContact = useMemo(() => ({
  first_name: "",
  last_name: "",
  position: "",
  email: "",
  phone: "",
  address: "",
}), []);

  const [formData, setFormData] = useState<PartnerFormData>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  // Use the specific type for errors
  const [errors, setErrors] = useState<PartnerFormErrors>({}); 

  useEffect(() => {
    if (isOpen) {
      if (partner) {
        setFormData({
          ...partner,
          partner_type: partner.partner_type || "National",
          // Ensure contact_people is an array, provide one empty if none exist
          contact_people:
            partner.contact_people && partner.contact_people.length > 0
              ? [...partner.contact_people]
              : [emptyContact],
        });
      } else {
        // Initialize a new partner with one empty contact
        setFormData({ partner_type: "National", contact_people: [emptyContact] });
      }
      setLogoFile(null);
      setErrors({});
    }
  }, [partner, isOpen , emptyContact]);

  const clearError = (name: string, index?: number) => {
    setErrors((prev) => {
      const newErrors: PartnerFormErrors = { ...prev };

      // Handle nested contact_people errors
      if (index !== undefined && newErrors.contact_people?.[index]) {
        const contactSpecificErrors = newErrors.contact_people[index];
        if (contactSpecificErrors[name]) {
          delete contactSpecificErrors[name];
        }
        // If all errors for this contact are cleared, remove the contact's error entry
        if (Object.keys(contactSpecificErrors).length === 0) {
          // If the contact_people object is empty for this index, delete it
          // Casting to any for the delete operation as direct manipulation of indexed properties can be tricky with strict types
          // After setting to undefined, filter out undefined entries to keep it clean
          if (newErrors.contact_people && !Object.values(newErrors.contact_people).some(val => val !== undefined)) {
            delete newErrors.contact_people; // If all contacts errors are cleared, remove the contact_people key
          }
        }
      } 
      // Handle top-level errors
      else if (newErrors[name]) {
        delete newErrors[name];
      }
      return newErrors;
    });
  };


  // --- Handlers for regular form fields ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError("partner_logo");
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  // --- Handlers for the dynamic contact list ---
  const handleContactChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedContacts = [...(formData.contact_people || [])];
    updatedContacts[index] = { ...updatedContacts[index], [name]: value };
    setFormData((prev) => ({ ...prev, contact_people: updatedContacts }));
    clearError(name, index);
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contact_people: [...(prev.contact_people || []), emptyContact],
    }));
    // Clear any general 'contacts' error when adding a new one
    clearError("contacts"); 
  };

  const removeContact = (index: number) => {
    const updatedContacts = [...(formData.contact_people || [])];
    updatedContacts.splice(index, 1);
    setFormData((prev) => ({ ...prev, contact_people: updatedContacts }));
    // Also remove any specific errors for the deleted contact
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      if (newErrors.contact_people) {
        // Shift remaining contact errors if an earlier one was removed
        const newContactPeopleErrors: ContactPeopleErrors = {};
        Object.keys(newErrors.contact_people).forEach(key => {
            const numKey = Number(key);
            if (numKey > index) {
                newContactPeopleErrors[numKey - 1] = newErrors.contact_people![numKey];
            } else if (numKey < index) {
                newContactPeopleErrors[numKey] = newErrors.contact_people![numKey];
            }
        });
        newErrors.contact_people = newContactPeopleErrors;
        if (Object.keys(newContactPeopleErrors).length === 0) {
            delete newErrors.contact_people;
        }
      }
      return newErrors;
    });
  };

  // --- Validation and Submission ---
  const validate = (): boolean => {
    const newErrors: PartnerFormErrors = {}; // Use the specific type

    // Partner validation
    if (!formData.partner_name?.trim())
      newErrors.partner_name = "Le nom du partenaire est obligatoire.";
    if (!formData.abbreviation?.trim())
      newErrors.abbreviation = "L'abbréviation est obligatoire.";
    else if (formData.abbreviation.length > 5)
      newErrors.abbreviation = "L'abbréviation ne doit pas dépasser 5 caractères.";
    if (!formData.country?.trim())
      newErrors.country = "Le pays est obligatoire.";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "L'adresse email du partenaire n'est pas valide.";
    if (!formData.nature_partner_id)
      newErrors.nature_partner_id = "La nature est obligatoire.";
    if (!formData.structure_partner_id)
      newErrors.structure_partner_id = "La structure est obligatoire.";
    if (!formData.status_id) newErrors.status_id = "La phase est obligatoire.";

    // Contact Person validation
    const contactErrors: ContactPeopleErrors = {}; // Use the specific type
    if (!formData.contact_people || formData.contact_people.length === 0) {
      newErrors.contacts = "Au moins une personne de contact est requise.";
    } else {
      formData.contact_people.forEach((contact, index) => {
        const errorsForContact: ContactErrors = {}; // Use the specific type
        if (!contact.first_name?.trim())
          errorsForContact.first_name = "Le prénom est obligatoire.";
        if (!contact.last_name?.trim())
          errorsForContact.last_name = "Le nom est obligatoire.";
        if (!contact.position?.trim())
          errorsForContact.position = "Le poste est obligatoire.";
        if (!contact.phone?.trim())
          errorsForContact.phone = "Le téléphone est obligatoire.";
        if (!contact.email?.trim())
          errorsForContact.email = "L'email est obligatoire.";
        else if (!/\S+@\S+\.\S+/.test(contact.email))
          errorsForContact.email = "L'adresse email n'est pas valide.";

        if (Object.keys(errorsForContact).length > 0) {
          contactErrors[index] = errorsForContact;
        }
      });
    }

    if (Object.keys(contactErrors).length > 0) {
      newErrors.contact_people = contactErrors;
    }

    if (logoFile && logoFile.size > 2 * 1024 * 1024)
      newErrors.partner_logo = "Le logo ne doit pas dépasser 2 Mo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && (!newErrors.contact_people || Object.keys(newErrors.contact_people).length === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    const data = new FormData();

    // Append all top-level partner fields
    Object.entries(formData).forEach(([key, value]) => {
      // Skip contact_people, it will be handled separately
      if (key !== "contact_people" && value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    // Append contact_people array in a format backend can parse
    formData.contact_people?.forEach((contact, index) => {
      Object.entries(contact).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(`contact_people[${index}][${key}]`, String(value));
        }
      });
    });

    if (logoFile) data.append("partner_logo", logoFile);
    if (partner?.id) data.append("_method", "PUT");
    onSave(data, partner?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {partner ? "Modifier le partenaire" : "Ajouter un partenaire"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6 pt-0">
            <ScrollArea className="max-h-[65vh] overflow-auto pr-2">
              <div className="space-y-10">
                {/* --- General Info Section --- */}
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <Label className="mb-2"  htmlFor="partner_name">Nom du Partenaire <p className="text-xs text-red-600">*</p></Label>
                      <Input id="partner_name" name="partner_name" value={formData.partner_name || ""} onChange={handleChange} />
                      {errors.partner_name && <p className="text-sm text-destructive mt-1">{errors.partner_name}</p>}
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="abbreviation">Abbréviation <p className="text-xs text-red-600">*</p></Label>
                      <Input id="abbreviation" name="abbreviation" value={formData.abbreviation || ""} onChange={handleChange} />
                      {errors.abbreviation && <p className="text-sm text-destructive mt-1">{errors.abbreviation}</p>}
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="country">Pays <p className="text-xs text-red-600">*</p></Label>
                      <CountryCombobox value={formData.country || ""} onValueChange={(value) => handleSelectChange("country", value)} />
                      {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="phone">Téléphone</Label>
                      <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} />
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div className="md:col-span-3">
                      <Label className="mb-2"  htmlFor="address">Adresse</Label>
                      <Input id="address" name="address" value={formData.address || ""} onChange={handleChange} />
                    </div>
                  </div>
                </section>
                
                {/* --- Classification Section --- */}
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Classification & Phase
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <div className="w-full">
                      <Label>Nature <p className="text-xs text-red-600">*</p></Label>
                      <Select
                        name="nature_partner_id"
                        value={String(formData.nature_partner_id || "")}
                        onValueChange={(value) => handleSelectChange("nature_partner_id", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue
                            placeholder="Sélectionnez..."
                            className="truncate"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {(options.natures || []).map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)} className="truncate">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.nature_partner_id && (
                        <p className="text-sm text-destructive mt-1">{errors.nature_partner_id}</p>
                      )}
                    </div>
                    <div className="w-full">
                      <Label>Type <p className="text-xs text-red-600">*</p></Label>
                      <Select
                        name="partner_type"
                        value={formData.partner_type || ""}
                        onValueChange={(value) => handleSelectChange("partner_type", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="National" className="truncate">National</SelectItem>
                          <SelectItem value="International" className="truncate">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label>Structure <p className="text-xs text-red-600">*</p></Label>
                      <Select
                        name="structure_partner_id"
                        value={String(formData.structure_partner_id || "")}
                        onValueChange={(value) => handleSelectChange("structure_partner_id", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {(options.structures || []).map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)} className="truncate">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.structure_partner_id && (
                        <p className="text-sm text-destructive mt-1">{errors.structure_partner_id}</p>
                      )}
                    </div>
                    <div className="w-full">
                      <Label>Phase <p className="text-xs text-red-600">*</p></Label>
                      <Select
                        name="status_id"
                        value={String(formData.status_id || "")}
                        onValueChange={(value) => handleSelectChange("status_id", value)}
                      >
                        <SelectTrigger className="w-full max-w-[220px] truncate">
                          <SelectValue placeholder="Sélectionnez..." className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          {(options.statuts || []).map((opt) => (
                            <SelectItem key={opt.id} value={String(opt.id)} className="truncate">
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status_id && (
                        <p className="text-sm text-destructive mt-1">{errors.status_id}</p>
                      )}
                    </div>
                  </div>
                </section>
                {/* --- Contact Person Section --- */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-primary">
                      Personnes de Contact
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addContact}
                      className="text-primary"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un contact
                    </Button>
                  </div>
                  {errors.contacts && <p className="text-sm text-destructive mb-4">{errors.contacts}</p>}
                  <div className="space-y-6">
                    {(formData.contact_people || []).map((contact, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg relative space-y-4"
                      >
                        {(formData.contact_people?.length ?? 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeContact(index)}
                            className="absolute top-2 right-2 text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                          <div>
                            <Label>Prénom <p className="text-xs text-red-600">*</p></Label>
                            <Input
                              name="first_name"
                              value={contact.first_name || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                            {errors.contact_people?.[index]?.first_name && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.contact_people[index].first_name}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Nom <p className="text-xs text-red-600">*</p></Label>
                            <Input
                              name="last_name"
                              value={contact.last_name || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                            {errors.contact_people?.[index]?.last_name && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.contact_people[index].last_name}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Poste <p className="text-xs text-red-600">*</p></Label>
                            <Input
                              name="position"
                              value={contact.position || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                            {errors.contact_people?.[index]?.position && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.contact_people[index].position}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Email <p className="text-xs text-red-600">*</p></Label>
                            <Input
                              type="email"
                              name="email"
                              value={contact.email || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                            {errors.contact_people?.[index]?.email && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.contact_people[index].email}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Téléphone <p className="text-xs text-red-600">*</p></Label>
                            <Input
                              name="phone"
                              value={contact.phone || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                            {errors.contact_people?.[index]?.phone && (
                              <p className="text-sm text-destructive mt-1">
                                {errors.contact_people[index].phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Adresse (facultative)</Label>
                            <Input
                              name="address"
                              value={contact.address || ""}
                              onChange={(e) => handleContactChange(index, e)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* --- Other Info Section --- */}
                <section>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Autres Informations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <Label className="mb-2"  htmlFor="note">Note</Label>
                      <Textarea id="note" name="note" rows={4} value={formData.note || ""} onChange={handleChange}/>
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="actions">Actions</Label>
                      <Input id="actions" name="actions" value={formData.actions || ""} onChange={handleChange} />
                    </div>
                    <div>
                      <Label className="mb-2"  htmlFor="partner_logo">Logo</Label>
                      <Input id="partner_logo" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                      {errors.partner_logo && <p className="text-sm text-destructive mt-1">{errors.partner_logo}</p>}
                      {logoFile && ( <img src={URL.createObjectURL(logoFile)} alt="Preview" className="mt-2 h-24 object-contain rounded-md border p-1" /> )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? ( <Loader2 className="animate-spin" /> ) : ( <> <Save size={16} className="mr-2" /> Sauvegarder </> )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};