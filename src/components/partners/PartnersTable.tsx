import React from 'react';
import {
    Building,
    User,
    Mail,
    Phone,
    Info,
    MapPin,
    Briefcase,
    Tag,
    Flag,
    FileText,
    StickyNote
} from 'lucide-react';
import type { Partner, ContactPerson } from '../../types/partners'; // Make sure ContactPerson is exported from your types

// --- Shadcn UI Components ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Helper Functions & Components ---

/**
 * Determines the badge color based on the status text.
 */
const getBadgeVariant = (text: string | null): "default" | "secondary" | "destructive" | "outline" => {
  const status = text?.toLowerCase() || '';
  if (status.includes('actif') || status.includes('signée')) return 'default';
  if (status.includes('discussion')) return 'secondary';
  if (status.includes('archivé')) return 'outline';
  return 'secondary';
};

/**
 * A reusable component for displaying a single piece of detail with an icon.
 */
const DetailItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value?: string | null;
    children?: React.ReactNode;
    className?: string
}> = ({ icon: Icon, label, value, children, className }) => {
    if (!value && !children) return null;
    return (
        <div className={`flex items-start gap-4 ${className}`}>
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-grow">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="text-base text-foreground break-words">{value || children}</div>
            </div>
        </div>
    );
};

// --- Main Modal Component ---

export const PartnerDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    partner: Partner | null;
}> = ({ isOpen, onClose, partner }) => {
  if (!isOpen || !partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] p-0" onPointerDownOutside={e => e.preventDefault()}>
        <ScrollArea className="max-h-[90vh]">
          <div className="p-8 bg-slate-50">
            {/* --- HEADER --- */}
            <DialogHeader>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-28 w-28 text-3xl border-4 border-white shadow-lg">
                        <AvatarImage src={partner.logo_url ?? undefined} alt={partner.partner_name} />
                        <AvatarFallback className='bg-primary text-primary-foreground'>
                            {partner.partner_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <DialogTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {partner.partner_name}
                        </DialogTitle>
                        <p className="text-xl text-muted-foreground mt-1">{partner.abbreviation}</p>
                        <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                            <Badge variant={getBadgeVariant(partner.status)} className="text-sm">{partner.status}</Badge>
                            <Badge variant={partner.partner_type === 'National' ? 'secondary' : 'default'} className="text-sm">{partner.partner_type}</Badge>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <div className="mt-10 space-y-8">
                {/* --- CONTACTS SECTION (UPDATED FOR MULTIPLE CONTACTS) --- */}
                {(partner.contact_people?.length ?? 0) > 0 && (
                    <section className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                            <User className="w-6 h-6 text-primary"/>
                            Personnes de Contact
                        </h3>
                        <div className="space-y-6">
                            {partner.contact_people.map((contact: ContactPerson, index: number) => (
                                <div key={contact.id || index} className="p-5 border rounded-lg bg-slate-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                      <DetailItem icon={User} label="Nom" value={`${contact.first_name} ${contact.last_name}`} />
                                      <DetailItem icon={Briefcase} label="Poste" value={contact.position} />
                                      <DetailItem icon={Mail} label="Courriel" value={contact.email} />
                                      <DetailItem icon={Phone} label="Téléphone" value={contact.phone} />
                                      <DetailItem icon={MapPin} className="md:col-span-2" label="Adresse" value={contact.address} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- PARTNER INFO SECTION --- */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                        <Building className="w-6 h-6 text-primary"/>
                        Informations sur le Partenaire
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <DetailItem icon={Tag} label="Nature" value={partner.nature_partner} />
                        <DetailItem icon={Briefcase} label="Structure" value={partner.structure_partner} />
                        <DetailItem icon={Flag} label="Pays" value={partner.country} />
                        <DetailItem icon={Phone} label="Téléphone (Général)" value={partner.phone} />
                        <DetailItem icon={Mail} className="md:col-span-2" label="Courriel (Général)" value={partner.email} />
                        <DetailItem icon={MapPin} className="md:col-span-2" label="Adresse" value={partner.address}/>
                    </div>
                </section>

                {/* --- OTHER INFO SECTION --- */}
                {(partner.actions || partner.note) && (
                    <section className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-3">
                            <Info className="w-6 h-6 text-primary"/>
                            Autres Détails
                        </h3>
                        <div className="space-y-5">
                            <DetailItem icon={FileText} label="Actions/Projets" value={partner.actions}/>
                            <DetailItem icon={StickyNote} label="Note" value={partner.note}/>
                        </div>
                    </section>
                )}

            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};