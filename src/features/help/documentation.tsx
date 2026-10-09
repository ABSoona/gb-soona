import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ThemeSwitch } from '@/components/theme-switch';
import { NotificationBell } from '@/components/notification-bell';
import { ProfileDropdown } from '@/components/profile-dropdown';

import image1 from '@/assets/79a5c3be-ecb4-4c89-966d-291fd6336655.png';
import image2 from '@/assets/d9e3b096-6a1b-4864-9c35-00da1cca89e4.png';
import image3 from '@/assets/105f0906-6ace-4949-8155-329e2ebb16bd.png';
import image4 from '@/assets/e791bc5b-f6bc-475a-9735-ffcee0b4148e.png';
import image5 from '@/assets/c85d90c0-fd96-42a6-835b-def4d98adae0.png';
import image6 from '@/assets/9b72d9e7-5b53-49bc-95c7-304040450f50.png';
import image7 from '@/assets/30bbd1fb-80ba-4bcc-8cea-38243754db3d.png';
import image8 from '@/assets/67aaa1d3-b09a-4fec-99c2-9cc3ebe1cbd6.png';
import image9 from '@/assets/95c03ec8-9ef2-4337-bbed-86e83dbade1b.png';
import image10 from '@/assets/48189b58-a998-4566-8e05-e8cf08b3b69c.png';
import image11 from '@/assets/de26492d-75bf-4e49-a9d0-bc46c76eec3a.png';
import processDiagram from '@/assets/diagram-process.png';
import { useRef } from 'react';

export default function Documentation() {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const handleFullscreen = () => {
        if (wrapperRef.current) {
            if (wrapperRef.current.requestFullscreen) {
                wrapperRef.current.requestFullscreen();
            } else if ((wrapperRef.current as any).webkitRequestFullscreen) {
                (wrapperRef.current as any).webkitRequestFullscreen();
            } else if ((wrapperRef.current as any).msRequestFullscreen) {
                (wrapperRef.current as any).msRequestFullscreen();
            }
        }
    };
    return (
        <>
            <Header>
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitch />
                    <NotificationBell />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-center">📘 Comment traiter une demande dans Mizana</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">🔎 Vue d'ensemble du processus</h2>
                    <p>
                        Le schéma ci-dessous illustre le parcours complet d'une demande d’aide dans l’application Soona : de la soumission initiale jusqu’à la clôture...
                    </p>
                    <div
                        ref={wrapperRef}
                        className="inline-block bg-white p-4 rounded shadow cursor-zoom-in max-w-full"
                        onClick={handleFullscreen}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            src={processDiagram}
                            alt="Schéma global du processus"
                            className="max-w-full max-h-full h-auto w-auto"
                        />
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">1. 📥 Réception de la demande</h2>
                    <p>Les demandes d’aides sont directement enregistrées dans l’application dès qu’un bénéficiaire soumet le formulaire sur le site soona.fr. Cette étape est 100 % automatisée. Chaque demande est attribuée à un assistant social référent qui devient responsable du suivi du dossier.</p>
                    <img src={image1} alt="Réception de la demande" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">2. 📞 Tentative de contact</h2>
                    <p>L’assistant(e) social(e) tente d’entrer en relation avec le demandeur. En fonction du résultat, elle enregistre un événement : soit un contact réussi avec un résumé de l’échange, soit un échec de contact. Cette trace permet de justifier les suites données à la demande.</p>
                    <p><strong>Règle métier :</strong> après <strong>4 échecs consécutifs</strong> de contact, la demande passe automatiquement à l’état <strong>« En attente »</strong>. Il s’agit d’un sas temporaire où l’on attend un retour du demandeur. Si aucun retour n’est reçu après <strong>30 jours</strong>, la demande passe automatiquement à l’état <strong>« Abandonnée »</strong>.</p>
                    <img src={image2} alt="Synthèse entretien" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">3. 📄 Demande de justificatifs</h2>
                    <p>Après un contact établi, l’assistant(e) envoie un message au bénéficiaire pour lui demander les pièces justificatives nécessaires à l’étude du dossier. L’interface propose un modèle de message bilingue. L’état de la demande passe automatiquement à "Attente justificatifs".</p>
                    <img src={image3} alt="Demande de justificatifs" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">4. 📎 Réception des justificatifs</h2>
                    <p>Les documents envoyés par le bénéficiaire sont ajoutés au dossier. Dès que des justificatifs sont présents, l’étape suivante de visite devient possible. Chaque justificatif est classé par type et horodaté.</p>
                    <img src={image4} alt="Ajout justificatifs" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">5. 🗺️ Organisation de la visite</h2>
                    <p>Une visite de terrain est organisée pour vérifier la réalité de la situation. Une carte interactive permet de choisir le bénévole le plus proche. Une fois la visite programmée, l’état passe à "En visite" et une fiche PDF est envoyée automatiquement au bénévole et à son référent.</p>
                    <img src={image5} alt="Carte des visiteurs" className="rounded border shadow my-4" />
                    <img src={image6} alt="Visite planifiée" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">6. 📝 Rapport et comité</h2>
                    <p>Après la visite, le rapport est ajouté au dossier. L’application propose automatiquement de passer la demande à l’étape "En comité" pour une décision collective. Cette action est validée via une fenêtre de confirmation.</p>
                    <img src={image7} alt="Passage en comité" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">7. ✅ Décision du comité</h2>
                    <p>Lors du comité, deux options apparaissent dans l’interface : approuver ou rejeter la demande. Ces actions sont réservées aux membres autorisés. Si la demande est approuvée, l’utilisateur peut immédiatement créer une aide financière.</p>
                    <img src={image8} alt="Actions du comité" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">8. 💶 Attribution de l’aide</h2>
                    <p>Une fois la demande acceptée, un formulaire permet de configurer l’aide : type, montant, fréquence, date, créancier. Cela permet de tracer précisément les aides attribuées et de générer les suivis financiers.</p>
                    <img src={image9} alt="Ajout aide" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">9. 💼 Suivi des versements</h2>
                    <p>Une fois l’aide créée, la demande passe automatiquement au statut <strong>« En cours »</strong>. Le système génère un ou plusieurs versements programmés en fonction de la configuration de l’aide (montant, fréquence, date d’échéance). Ces versements sont visibles dans la section « Versements ».</p>
                    <p>Pour chaque ligne de versement, deux actions principales sont disponibles :</p>
                    <ul className="list-disc list-inside ml-4 text-muted-foreground">
                        <li><strong>Voir le RIB du bénéficiaire</strong> : utile pour effectuer le virement.</li>
                        <li><strong>Attacher la preuve de virement</strong> : permet de téléverser un justificatif (screenshot, PDF, etc.).</li>
                    </ul>
                    <img src={image10} alt="Liste des versements" className="rounded border shadow my-4" />
                    <img src={image11} alt="Menu versement" className="rounded border shadow my-4" />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">10. 🏁 Clôture ou réétude de la demande</h2>
                    <p>
                        Dès que toutes les preuves de virement ont été ajoutées pour chaque versement lié à une même aide, la demande passe automatiquement au statut final <strong>« Clôturée »</strong>. Cela permet de valider officiellement que l’aide a été entièrement versée et que la gestion est terminée.
                    </p>
                    <p className="mt-2">
                        Toutefois, si l'utilisateur a sélectionné l’option <strong>« Réétudier »</strong> lors de l'attribution de l'aide, la demande n’est pas clôturée : elle est renvoyée à l’étape <strong>« En comité »</strong> pour qu’une prolongation ou un complément d’aide puisse être étudié. Cette option permet une plus grande flexibilité dans la gestion des situations évolutives.
                    </p>
                </section>
            </Main>
        </>
    );
}
