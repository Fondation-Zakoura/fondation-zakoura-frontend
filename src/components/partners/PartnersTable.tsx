import React from 'react';
import { 
    X, 
    Building,
    User,
    Mail,
    Phone,
    Info
} from 'lucide-react';
import type { Partner, ContactPerson } from '../../types/partners'; // Assuming types are in this path

// --- Shadcn UI Components ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
 * A reusable component for displaying a single piece of detail.
 */
const DetailItem: React.FC<{ label: string; value?: string | null; children?: React.ReactNode }> = ({ label, value, children }) => {
    if (!value && !children) return null;
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-1 text-base text-foreground">{value || children}</div>
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
      <DialogContent className="w-[1100px] !max-w-none p-0" onPointerDownOutside={e => e.preventDefault()}>
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* --- HEADER --- */}
            <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <Avatar className="h-20 w-20 text-xl">
                                <AvatarImage src={partner.logo_url ?? undefined} alt={partner.partner_name} />
                                <AvatarFallback>
                                    {partner.partner_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-3xl font-bold text-gray-900">
                                    {partner.partner_name}
                                </DialogTitle>
                                <p className="text-lg text-muted-foreground">{partner.abbreviation}</p>
                            </div>
                        </div>
                        {/* <DialogClose className="text-muted-foreground">
                            <X size={24} />
                        </DialogClose> */}
                    </div>
                </DialogHeader>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px]">

                    {/* --- LEFT PANE: PARTNER DETAILS --- */}
                    <Card className="lg:col-span-3 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <Building className="w-6 h-6 text-primary"/>
                                Informations sur le Partenaire
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <DetailItem label="Nature" value={partner.nature_partner} />
                                <DetailItem label="Structure" value={partner.structure_partner} />
                                <DetailItem label="Type">
                                    <Badge variant={partner.partner_type === 'National' ? 'secondary' : 'default'}>{partner.partner_type}</Badge>
                                </DetailItem>
                                <DetailItem label="Phase">
                                    <Badge variant={getBadgeVariant(partner.status)}>{partner.status}</Badge>
                                </DetailItem>
                                <DetailItem label="Pays" value={partner.country} />
                                <DetailItem label="Téléphone (Général)" value={partner.phone} />
                                <div className="md:col-span-2">
                                    <DetailItem label="Courriel (Général)" value={partner.email} />
                                </div>
                            </dl>
                            <Separator />
                            <dl className="space-y-5">
                                <DetailItem label="Adresse" value={partner.address}/>
                                <DetailItem label="Actions/Projets" value={partner.actions}/>
                                <DetailItem label="Note" value={partner.note}/>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* --- RIGHT PANE: CONTACTS --- */}
                    <Card className="lg:col-span-2 h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <User className="w-6 h-6 text-primary"/>
                                Personnes de Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="space-y-4 flex-1 flex flex-col">
                            {partner.contact_people && partner.contact_people.length > 0 ? (
                              partner.contact_people.map((contact, index) => (
                                <React.Fragment key={contact.id}>
                                  <div className="flex flex-col">
                                    <p className="font-bold text-base text-foreground">{contact.first_name} {contact.last_name}</p>
                                    {contact.position && <p className="text-sm text-primary font-medium">{contact.position}</p>}
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                      {contact.email && <p className="flex items-center gap-2"><Mail size={14}/> {contact.email}</p>}
                                      {contact.phone && <p className="flex items-center gap-2"><Phone size={14}/> {contact.phone}</p>}
                                    </div>
                                  </div>
                                  {index < partner.contact_people.length - 1 && <Separator />}
                                </React.Fragment>
                              ))
                            ) : (
                              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground py-10">
                                <div>
                                  <Info size={24} className="mb-2"/>
                                  <span>Aucune personne de contact.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};