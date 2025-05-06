'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { MoreHorizontal, Search, Calendar, PhoneCall, CheckCircle, XCircle, Send } from "lucide-react"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuthContext } from '@/lib/hooks/AuthProvider'
import { createClientBrowser } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import toast from '@/components/ui/toast'

export type Flux = Database['public']['Tables']['flux']['Row']
export type User = Database['public']['Tables']['users']['Row']

type FluxTableProps = {
  fluxData: Flux[];
  onFluxSelect: (flux: Flux | null) => void;
  selectedFlux: Flux | null;
  assignableUsers: User[];
  usersLoading: boolean;
  onManualRefresh: () => void;
}

export function FluxTable({ 
  fluxData, 
  onFluxSelect, 
  selectedFlux, 
  assignableUsers,
  usersLoading,
  onManualRefresh
}: FluxTableProps) {
  const { userData } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFlux, setFilteredFlux] = useState<Flux[]>(fluxData)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Filtrer les flux en fonction du terme de recherche
    const results = fluxData.filter(flux => {
      const searchFields = [
        flux.client_name,
        flux.address,
        flux.city,
        flux.post_code,
        flux.client_phone,
        flux.client_email,
        flux.game_model,
        flux.type_flux,
        flux.state,
        flux.assignee_email
      ]
      
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    
    setFilteredFlux(results)
    setTotalItems(results.length)
    // Remettre à la page 1 si les filtres ou le terme de recherche changent
    setCurrentPage(1)
  }, [fluxData, searchTerm])

  // Calculer l'index de début et de fin pour la pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredFlux.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredFlux.length / itemsPerPage)

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr })
    } catch (error) {
      return 'Date invalide'
    }
  }

  // Gestionnaire pour le changement d'état
  const handleChangeState = async (flux: Flux, newState: string) => {
    const supabase = createClientBrowser()
    setIsProcessing(true)
    
    try {
      // Mettre à jour l'état du flux
      const { error } = await supabase
        .from('flux')
        .update({ state: newState })
        .eq('id', flux.id)
      
      if (error) {
        throw error
      }

      // Message de confirmation
      toast.success(`État changé en "${newState}" avec succès`)
      
      // Rafraîchir les données
      onManualRefresh()
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error)
      toast.error('Erreur lors du changement d\'état')
    } finally {
      setIsProcessing(false)
    }
  }

  // Gestionnaire pour l'assignation de flux
  const handleAssign = async (flux: Flux, userId: string, userEmail: string) => {
    const supabase = createClientBrowser()
    setIsProcessing(true)
    
    try {
      // Mettre à jour l'assignation du flux
      const { error } = await supabase
        .from('flux')
        .update({ 
          assignee_id: userId,
          assignee_email: userEmail
        })
        .eq('id', flux.id)
      
      if (error) {
        throw error
      }

      // Message de confirmation
      toast.success(`Flux assigné à ${userEmail} avec succès`)
      
      // Rafraîchir les données
      onManualRefresh()
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
      toast.error('Erreur lors de l\'assignation')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-0 bg-gray-900 text-white">
      <CardHeader className="pb-2 text-white">
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
          <CardTitle>Flux récents {userData ? `(${userData.role.replace('_',' ')})` : ''}</CardTitle>
          <CardDescription className="text-gray-300">
            {totalItems} flux trouvés
          </CardDescription>
        </div>
        <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2 mt-2">
          {/* Barre de recherche simplifiée sans autocomplétion */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-8 bg-gray-800 border-gray-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow>
                <TableHead className="text-gray-200">Client</TableHead>
                <TableHead className="text-gray-200">Type</TableHead>
                <TableHead className="text-gray-200">Jeu</TableHead>
                <TableHead className="text-gray-200">Créé le</TableHead>
                <TableHead className="text-gray-200">État</TableHead>
                <TableHead className="text-gray-200">Assigné à</TableHead>
                <TableHead className="text-gray-200 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-white">
                    Aucun flux trouvé
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((flux) => (
                  <TableRow 
                    key={flux.id} 
                    className={`cursor-pointer hover:bg-gray-800 ${selectedFlux?.id === flux.id ? 'bg-gray-800' : ''}`}
                    onClick={() => onFluxSelect(flux)}
                  >
                    <TableCell>
                      <div className="font-medium text-white">{flux.client_name}</div>
                      <div className="text-sm text-gray-400">{flux.client_phone}</div>
                    </TableCell>
                    <TableCell className="text-white">
                      {flux.type_flux || 'Non spécifié'}
                    </TableCell>
                    <TableCell className="text-white">
                      {flux.game_model || 'Non spécifié'}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatDate(flux.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${flux.state?.toLowerCase().includes('trait') 
                          ? 'bg-green-500/10 text-green-500' 
                          : flux.state === 'Rappel'
                            ? 'bg-orange-500/10 text-orange-500'
                            : flux.state === 'Planifié'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {flux.state || 'Non traité'}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {flux.assignee_email || 'Non assigné'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Ouvrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            
                            {/* Actions selon le rôle de l'utilisateur */}
                            {(userData?.role === 'vendeur' || userData?.role === 'super_admin') && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Traité')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Marquer comme traité</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Non traité')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  <span>Marquer comme non traité</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Planifié')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                                  <span>Planifier</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Rappel')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <PhoneCall className="mr-2 h-4 w-4 text-orange-500" />
                                  <span>Rappel client</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                              </>
                            )}
                            
                            {/* Actions pour les techniciens */}
                            {(userData?.role === 'technicien' || userData?.role === 'super_admin') && flux.type_flux === 'Installation' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Traitée et transmise au vendeur')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <Send className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Transmettre au vendeur</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                              </>
                            )}
                            
                            {/* Actions pour les gestionnaires de stock */}
                            {(userData?.role === 'gestionnaire_stock' || userData?.role === 'super_admin') && 
                             (flux.type_flux === 'Commande' || flux.type_flux === 'Location') && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleChangeState(flux, 'Traitée et transmise au vendeur')}
                                  disabled={isProcessing}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <Send className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Transmettre au vendeur</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                              </>
                            )}
                            
                            {/* Assignation pour tous les rôles */}
                            <DropdownMenuLabel>Assigner à</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {assignableUsers.map(user => (
                              <DropdownMenuItem 
                                key={user.id}
                                onClick={() => handleAssign(flux, user.id, user.email)}
                                disabled={isProcessing || flux.assignee_id === user.id}
                                className="hover:bg-gray-700 cursor-pointer"
                              >
                                {user.email}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-white border-gray-700 hover:bg-gray-800"
            >
              Précédent
            </Button>
            <div className="text-sm text-gray-300">
              Page {currentPage} sur {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-white border-gray-700 hover:bg-gray-800"
            >
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}