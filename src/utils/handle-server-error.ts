import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { ApolloError } from '@apollo/client';
import { createBrowserHistory, useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';

export function handleServerError(error: unknown) {


    let errMsg = 'Une erreur est survenue !';
    const history = createBrowserHistory();
    // 👉 Gestion des erreurs Axios
    if (error instanceof AxiosError || error instanceof AxiosError) {
        errMsg = error.response?.data?.title || error.message;

        switch (error.response?.status) {
            case 400:
                errMsg = 'Requête invalide. Veuillez vérifier vos données.';
                break;
            case 401:
                errMsg = 'Session expirée. Veuillez vous reconnecter.';
                useAuthStore.getState().auth.reset();
                history.push('/login'); 
                break;
            case 403:
                errMsg = 'Accès refusé.';
                break;
            case 404:
                errMsg = 'Ressource non trouvée.';
                break;
            case 500:
                errMsg = 'Erreur interne du serveur.';
                break;
            default:
                errMsg = error.response?.data?.message || 'Erreur inconnue.';
        }

        toast({ variant: 'destructive', title: errMsg });
        return;
    }
    
    // 👉 Gestion des erreurs Apollo (GraphQL)
    if (error instanceof ApolloError) {
        if (error.graphQLErrors.length > 0) {
            error.graphQLErrors.forEach((graphQLError) => {
                switch (graphQLError.extensions?.code) {
                    case 'UNAUTHENTICATED':
                       errMsg = 'Authentification requise !';
                        useAuthStore.getState().auth.reset();
                        history.push('/sign-in'); 
                        break;
                    case 'FORBIDDEN':
                        errMsg = 'Accès interdit !';
                        break;
                    case 'BAD_USER_INPUT':
                        errMsg = 'Données invalides. Veuillez corriger votre saisie.';
                        break;
                    default:
                        errMsg = graphQLError.message || 'Erreur GraphQL.';
                }

                toast({ variant: 'destructive', title: errMsg });
            });
        }

        if (error.networkError) {
            console.error('Erreur réseau :', error.networkError);
            toast({
                variant: 'destructive',
                title: 'Problème de connexion réseau.',
                description: error.networkError.message,
            });
        }

        throw error;
        return;
    }

    // 👉 Gestion des erreurs génériques
    if (error && typeof error === 'object' && 'status' in error && Number(error.status) === 204) {
        errMsg = 'Contenu non trouvé.';
        throw error;
    }

    // Erreur inconnue
    toast({ variant: 'destructive', title: errMsg });

}
