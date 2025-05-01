import { Button } from '@/components/ui/button';
import { useContactService } from '@/api/contact/contact-service';
import { useDemandeService } from '@/api/demande/demandeService';
import { useAideService } from '@/api/aide/aideService';
import { faker } from '@faker-js/faker';
import { useState } from 'react';

export function GenerateFakeData() {
  const { contacts, deleteContact, createContact } = useContactService();
  const { demandes, deleteDemande, createDemande } = useDemandeService();
 const { aides, deleteAide, createAide } = useAideService(); 

  const [loading, setLoading] = useState(false);

  const demandeStatusTypes = ['recue', 'en_visite', 'en_commision', 'clôturée', 'refusée','EnCours'] as const;
  const situationsPro = ['sans_emploi', 'employé', 'indépendant', 'retraité'] as const;
  const situationsFam = ['marié', 'divorcé', 'veuf', 'célibataire'] as const;

  const handleGenerate = async () => {
    setLoading(true);

    // 🔀 Supprimer les anciennes entrées
   /* for (const aide of aides) await deleteAide(aide.id);
    for (const demande of demandes) await deleteDemande(demande.id); 
    for (const contact of contacts) await deleteContact(contact.id);*/

    // ✨ Générer 20 contacts avec aides et demandes
    for (let i = 0; i < 20; i++) {
      const contactData = {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: faker.internet.email(),
        adresse: faker.location.streetAddress(),
        ville: faker.location.city(),
        telephone: faker.phone.number(),
        age: faker.number.int({ min: 18, max: 80 }),
        codePostal: parseInt(faker.location.zipCode(), 10),
        numBeneficiaire: faker.string.alphanumeric(10),
        remarques: faker.lorem.sentence(),
        status: 'active',
        dateCreation: faker.date.past().toISOString(),
      };

      const contactRes = await createContact(contactData);
      if (!contactRes || !contactRes.id) continue;
      const contactId = contactRes.id;

      const demandeCount = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < demandeCount; j++) {
        await createDemande({
          contact: { id: contactId },
          revenus: faker.number.int({ min: 800, max: 2000 }),
          revenusConjoint: faker.number.int({ min: 0, max: 1000 }),
          loyer: faker.number.int({ min: 300, max: 1000 }),
          dettes: faker.number.int({ min: 0, max: 2000 }),
          autresCharges: faker.number.int({ min: 0, max: 800 }),
          autresAides: faker.lorem.word(),
          facturesEnergie: faker.number.int({ min: 50, max: 400 }),
          nombreEnfants: faker.number.int({ min: 0, max: 4 }),
          agesEnfants: '6,10',
          situationFamiliale: faker.helpers.arrayElement(situationsFam),
          situationProConjoint: faker.helpers.arrayElement(situationsPro),
          situationProfessionnelle: faker.helpers.arrayElement(situationsPro),
          natureDettes: 'Crédit conso',
          remarques: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(demandeStatusTypes),
        });
      }

      const aideCount = faker.number.int({ min: 1, max: 3 });
      for (let k = 0; k < aideCount; k++) {
        const now = new Date();
        await createAide({
          contact: { id: contactId },
          dateAide: faker.date.between({from :'2025-01-01',to:'2026-03-01'},).toISOString(),
          dateExpiration: faker.date.soon({ days: 120 }).toISOString(),
          montant: faker.number.int({ min: 100, max: 1200 }),
          nombreVersements: faker.number.int({ min: 1, max: 6 }),
          frequence: 'Mensuelle',
          typeField: 'FinanciRe',
          crediteur: 'LeBNFiciaire',
          infosCrediteur: faker.company.name(),
          remarque: faker.lorem.sentence(),
          suspendue: false,
        });
      }
    } 

    setLoading(false);
  };

  return (
    <div className="mb-4">
      <Button disabled={loading} onClick={handleGenerate}>
        {loading ? 'Création en cours...' : 'Générer 20 contacts avec aides et demandes'}
      </Button>
    </div>
  );
}
