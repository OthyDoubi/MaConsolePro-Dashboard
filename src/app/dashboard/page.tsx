'use client'

import { useState, useEffect } from 'react'
import { FluxTable } from "@/components/Dashboard/FluxTable"
import { OverviewCard } from '@/components/Dashboard/OverviewCard'
import { useAuthContext } from '@/lib/hooks/AuthProvider'
import { createClientBrowser } from '@/lib/supabase'
import { type Flux, type User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import toast from '@/components/ui/toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { RightPanel } from '@/components/Dashboard/RightPanel'
import { Loader2, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { userData, loading: authLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const [fluxList, setFluxList] = useState<Flux[]>([])
  const [fluxLoading, setFluxLoading] = useState(false)
  const [fluxError, setFluxError] = useState<string | null>(null)
  const [selectedFlux, setSelectedFlux] = useState<Flux | null>(null)
  const [assignableUsers, setAssignableUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;
    console.log('>>> Dashboard page loaded, checking auth state...');
    
    // Si l'authentification est encore en cours, on attend
    if (authLoading) {
      console.log('>>> Auth state still loading, waiting...');
      setPageLoading(true); // Afficher le spinner de chargement principal
      return;
    }
    
    console.log(`>>> Auth state loaded: isAuthenticated = ${isAuthenticated}`);
    
    // Si l'utilisateur est authentifié, charger les données
    if (isAuthenticated && userData) {
      console.log(`>>> User ${userData.email} is authenticated, loading initial data...`);
      setPageError(null); // Réinitialiser les erreurs potentielles
      loadInitialData();
    } else {
      // Si l'utilisateur n'est pas authentifié (après chargement de l'état auth), afficher une erreur ou rediriger
      console.error('>>> User is not authenticated after auth check.');
      setPageError("Vous n'êtes pas authentifié. Veuillez vous reconnecter.");
      setPageLoading(false); 
    }

    return () => {
      mounted = false;
    };
    // Dépendances: authLoading, isAuthenticated, userData (pour s'assurer qu'on a les infos)
  }, [authLoading, isAuthenticated, userData]); 

  // Fonction pour charger les données initiales
  async function loadInitialData() {
    // Vérifier si les données sont déjà en cours de chargement ou si l'utilisateur n'est pas là
    if (fluxLoading || !userData) {
      console.log("Chargement déjà en cours ou utilisateur non défini, pas de rechargement");
      return;
    }
      
    console.log("Chargement des données initiales...");
    setFluxLoading(true);
    setFluxError(null);
    setPageLoading(true); // Indiquer que la page charge des données
      
    const supabase = createClientBrowser();
      
    try {
      // Chargement des flux avec timeout
      const loadTimeout = setTimeout(() => {
        if (fluxLoading && pageLoading) { // Vérifier les deux états
          console.warn("⚠️ Timeout de chargement des flux, annulation");
          setFluxError("Le chargement des flux a pris trop de temps. Veuillez rafraîchir.");
          setFluxLoading(false);
          setPageLoading(false); // Arrêter le spinner principal aussi
        }
      }, 15000); 
      
      // Chargement des flux
      const { data: fluxData, error: fluxDbError } = await supabase
        .from('flux')
        .select('*')
        .order('created_at', { ascending: false });
      
      clearTimeout(loadTimeout); // Annuler le timeout si le chargement réussit
      
      if (fluxDbError) {
        console.error("Erreur de chargement des flux:", fluxDbError);
        setFluxError(`Erreur lors du chargement des flux: ${fluxDbError.message}`);
        setFluxList([]); // Vider la liste en cas d'erreur
      } else {
        console.log(`${fluxData?.length || 0} flux chargés`);
        setFluxList(fluxData || []);
        setFluxError(null); // Assurer qu'il n'y a pas d'erreur affichée
      }
      
      // Chargement des utilisateurs assignables
      setUsersLoading(true);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .neq('id', userData?.id || ''); // Assurer que userData existe
      
      if (usersError) {
        console.error("Erreur de chargement des utilisateurs:", usersError);
        setAssignableUsers([]);
      } else {
        setAssignableUsers(usersData || []);
      }
      
    } catch (error) {
      console.error("Erreur générale lors du chargement des données:", error);
      setFluxError(`Une erreur est survenue pendant le chargement: ${error instanceof Error ? error.message : String(error)}`);
      setFluxList([]);
      setAssignableUsers([]);
    } finally {
      // Fin du chargement (flux et utilisateurs)
      setFluxLoading(false);
      setUsersLoading(false);
      setPageLoading(false); // Arrêter le spinner principal une fois tout chargé (ou échoué)
    }
  }

  const handleFluxSelect = (flux: Flux | null) => {
    setSelectedFlux(flux);
  };

  const handleRefresh = async () => {
    // Recharger seulement si l'utilisateur est authentifié
    if (isAuthenticated && userData) {
      await loadInitialData();
    } else {
      console.warn("Tentative de rafraîchissement sans être authentifié.");
      setPageError("Impossible de rafraîchir, veuillez vous reconnecter.");
    }
  };

  // État de chargement initial (auth + données)
  if (pageLoading || authLoading) { // Afficher tant que l'auth OU les données chargent
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  // Affichage des erreurs de page (auth ou chargement initial)
  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Problème d'accès</h3>
          <p>{pageError}</p>
          <Button onClick={() => window.location.href='/login'} className="mt-4">
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }
  
  // Si on arrive ici, l'utilisateur est authentifié et les données sont prêtes (ou le chargement a échoué avec fluxError)
  const commandes = fluxList.filter(f => f.type_flux === 'Commande')
  const installations = fluxList.filter(f => f.type_flux === 'Installation')
  const locations = fluxList.filter(f => f.type_flux === 'Location')
  const rappels = fluxList.filter(f => f.state === 'Rappel')

  const isTraite = (state?: string | null) => {
    if (!state) return false
    return state.toLowerCase().includes('trait') // "Traité", "Traitée et transmise au vendeur", etc.
  }

  const commandesDone = commandes.filter(f => isTraite(f.state)).length
  const installationsDone = installations.filter(f => isTraite(f.state)).length
  const locationsDone = locations.filter(f => isTraite(f.state)).length

  return (
    <div className="flex flex-col flex-1 bg-gray-800 min-h-screen overflow-hidden">
      <header className="sticky top-0 z-10 border-b bg-gray-900 px-6 py-3 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Tableau de bord</h1>
          <div className="flex items-center space-x-2">
            {fluxError && (
              <p className="text-sm text-red-400">
                {fluxError}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="ml-2 text-white border-gray-600 hover:bg-gray-700"
                >
                  {isRefreshing ? 'Rafraîchissement...' : 'Réessayer'}
                </Button>
              </p>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info("Diagnostic non implémenté")}
              disabled={isDiagnosing}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              {isDiagnosing ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <Activity className="mr-2 h-4 w-4" />
              }
              Diagnostiquer
            </Button>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              {isRefreshing ? 'Chargement...' : 'Rafraîchir'}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {/* Vue d'ensemble */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
              <OverviewCard
                title="Commandes"
                count={commandesDone}
                total={commandes.length}
                loading={fluxLoading}
                bgColor="bg-gray-900"
                valueColor="text-white"
              />
              <OverviewCard
                title="Installations"
                count={installationsDone}
                total={installations.length}
                loading={fluxLoading}
                bgColor="bg-gray-900"
                valueColor="text-white"
              />
              <OverviewCard
                title="Locations"
                count={locationsDone}
                total={locations.length}
                loading={fluxLoading}
                bgColor="bg-gray-900"
                valueColor="text-white"
              />
              <OverviewCard
                title="Rappels"
                count={rappels.length}
                total={fluxList.length}
                loading={fluxLoading}
                bgColor="bg-gray-900"
                valueColor="text-white"
              />
            </section>
            
            {/* Tableau des flux */}
            <section className="rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
              {fluxLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <FluxTable 
                  fluxData={fluxList} 
                  onFluxSelect={(flux) => setSelectedFlux(flux)}
                  selectedFlux={selectedFlux}
                  assignableUsers={assignableUsers}
                  usersLoading={usersLoading}
                  onManualRefresh={handleRefresh}
                />
              )}
            </section>
          </div>
        </div>
        
        {/* Panneau latéral pour les détails et les actions */}
        {selectedFlux && (
          <div className="hidden w-80 border-l border-gray-700 bg-gray-900 p-4 lg:block text-white">
            <RightPanel 
              selectedFlux={selectedFlux} 
              assignableUsers={assignableUsers}
              usersLoading={usersLoading}
              onClose={() => setSelectedFlux(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}