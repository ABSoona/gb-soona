"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUserServicev2 } from "@/api/user/userService.v2";
import { geocodeAddress } from "@/lib/utils";
import { User } from "@/model/user/User";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDistance } from 'geolib';
import { useContactService } from "@/api/contact/contact-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522, // Paris par défaut
};

interface CoordinateursMapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number;
  onAssign: (data: { visiteur: User; coordinateur: User }) => void;
}
export default function CoordinateursMapSheet({ open, onOpenChange, contactId,onAssign }: CoordinateursMapSheetProps) {
  const [selectedVisiteurId, setSelectedVisiteurId] = useState<string | null>(null);
  const [geocodedVisiteurs, setGeocodedVisiteurs] = useState<any[]>([]);
  const { contacts = [] } = useContactService(
    open ? { where: { id: { equals: contactId } } } : undefined
  );
  const contact = contacts[0];
  const [beneficiaireCoords, setBeneficiaireCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (contact) {
      const fullAddress = `${contact.adresse}, ${contact.codePostal} ${contact.ville}`;
      geocodeAddress(fullAddress).then((coords) => {
        if (coords) setBeneficiaireCoords(coords);
      });
    }
  }, [contact]);

  const { users: benevoles = [] } = useUserServicev2(
    open ? { where: { role: { in: ["visiteur", "coordinateur"] } } } : undefined
  );
  const visiteursWithDistance = geocodedVisiteurs
    .map((v) => {
      const distance = beneficiaireCoords
        ? getDistance(v.coords, beneficiaireCoords) / 1000
        : null;
      return {
        ...v,
        distanceKm: distance,
      };
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });



  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    const geocodeAll = async () => {
      const geocoded = await Promise.all(
        benevoles.map(async (v: User) => {
          const fullAddress = `${v.adresseRue || ""}, ${v.adresseCodePostal || ""} ${v.adresseVille || ""}`;
          const coords = await geocodeAddress(fullAddress);
          return coords ? { ...v, coords } : null;
        })
      );
      setGeocodedVisiteurs(geocoded.filter(Boolean));
    };
    if (benevoles.length > 0) geocodeAll();
  }, [benevoles]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="rightfull" className="space-y-4 p-4">
        <SheetHeader>
          <SheetTitle>Carte des visiteurs</SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100vh-5rem)] gap-4">
          {/* Liste Visiteurs */}
          <Card className="w-96 border-r flex flex-col h-full">
  <CardHeader>
    <CardTitle>Bénévoles</CardTitle>
  </CardHeader>

  {/* Scroll interne, prend toute la hauteur dispo sauf pour le bouton */}
  <CardContent className="flex-1 px-2 overflow-hidden">
    <ScrollArea className="h-full pr-2">
      <RadioGroup
        value={selectedVisiteurId ?? ""}
        onValueChange={setSelectedVisiteurId}
        className="flex flex-col gap-2"
      >
        {visiteursWithDistance.map((visiteur) => (
          <Label
            key={visiteur.id}
            htmlFor={visiteur.id}
            className={`w-full flex gap-3 items-start rounded-lg border p-3 text-left text-sm transition-all cursor-pointer ${
              selectedVisiteurId === visiteur.id ? "bg-muted" : "hover:bg-accent"
            }`}
          >
            <RadioGroupItem value={visiteur.id} id={visiteur.id} className="mt-1" />
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-black text-white">
                {visiteur.firstName?.[0] ?? ""}
                {visiteur.lastName?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-base">
                {visiteur.firstName} {visiteur.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {visiteur.adresseCodePostal} {visiteur.adresseVille}
              </div>
              {visiteur.superieur && (
                <div className="text-xs text-muted-foreground">
                  Contact AB soona : {visiteur.superieur.firstName} {visiteur.superieur.lastName}
                </div>
              )}
              <div className="flex gap-2 mt-1">
                {visiteur.role === "coordinateur" && (
                  <Badge variant="secondary">Membre</Badge>
                )}
                {visiteur.distanceKm != null && (
                  <Badge variant="outline">{visiteur.distanceKm.toFixed(1)} km</Badge>
                )}
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </ScrollArea>
  </CardContent>

  {/* Bouton fixe en bas */}
  <div className="px-4 pb-4">
  <button
  className="w-full bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
  disabled={!selectedVisiteurId || isAssigning}
  onClick={async () => {
    if (selectedVisiteurId) {
      const visiteur = visiteursWithDistance.find(v => v.id === selectedVisiteurId);
      if (visiteur) {
        setIsAssigning(true);
        try {
          await onAssign({
            visiteur,
            coordinateur: visiteur.superieur ?? null
          });
        } finally {
          setIsAssigning(false);
        }
      }
    }
  }}
>
  {isAssigning && (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8z" />
    </svg>
  )}
  {isAssigning ? "Attribution..." : "Attribuer la visite"}
</button>
  </div>
</Card>


          {/* Carte */}
          <div className="flex-1">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={beneficiaireCoords ?? defaultCenter}
                zoom={11}
              >
                {geocodedVisiteurs.map((v) => (
                  <Marker
                    key={v.id}
                    position={v.coords}
                    icon={{
                      url:
                        selectedVisiteurId === v.id
                          ? "/images/icons8-location-30.png"
                          : "/images/icons8-location-gray-30.png",
                      scaledSize: new window.google.maps.Size(36, 36),
                    }}
                  /* label={{
                    text: `${v.firstName} ${v.lastName}`,
                    className: "text-sm text-black font-medium",
                  }} */
                  />
                ))}
                {beneficiaireCoords && (
                  <Marker
                    position={beneficiaireCoords}
                    icon={{
                      url: "/images/home.png",
                      scaledSize: new window.google.maps.Size(36, 36),
                    }}
                  />
                )}
              </GoogleMap>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}