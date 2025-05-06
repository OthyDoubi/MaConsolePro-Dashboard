'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X, MapPin, Phone, Mail, Calendar, Clock, Package, User, Tag, ActivitySquare } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Database } from "@/lib/database.types"
import { createClientBrowser } from "@/lib/supabase"
import toast from "@/components/ui/toast"
import { useState } from "react"

export type Flux = Database['public']['Tables']['flux']['Row']
export type User = Database['public']['Tables']['users']['Row']

type RightPanelProps = {
  selectedFlux: Flux
  assignableUsers: User[]
  usersLoading: boolean
  onClose: () => void
}

export function RightPanel({
  selectedFlux,
  assignableUsers,
  usersLoading,
  onClose
}: RightPanelProps) {
  const [saving, setSaving] = useState(false)

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr })
    } catch (error) {
      return 'Date invalide'
    }
  }

  // Formater l'heure
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: fr })
    } catch (error) {
      return 'Heure invalide'
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copié dans le presse-papier'))
      .catch(err => toast.error('Erreur lors de la copie: ' + err))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Détails du flux</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>

      <Card className="border-gray-700 bg-gray-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Informations client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-gray-300">Nom</Label>
            <div className="flex items-center justify-between">
              <p className="text-white">{selectedFlux.client_name}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => handleCopyToClipboard(selectedFlux.client_name)}
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">Adresse</Label>
            <div className="flex items-center justify-between">
              <p className="text-white">{selectedFlux.address}, {selectedFlux.post_code} {selectedFlux.city}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => handleCopyToClipboard(`${selectedFlux.address}, ${selectedFlux.post_code} ${selectedFlux.city}`)}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">Téléphone</Label>
            <div className="flex items-center justify-between">
              <p className="text-white">{selectedFlux.client_phone}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => handleCopyToClipboard(selectedFlux.client_phone)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {selectedFlux.client_email && (
            <div>
              <Label className="text-gray-300">Email</Label>
              <div className="flex items-center justify-between">
                <p className="text-white">{selectedFlux.client_email}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => handleCopyToClipboard(selectedFlux.client_email)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-700 bg-gray-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Détails du flux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-gray-300">Type</Label>
            <div className="flex items-center justify-between">
              <p className="text-white">{selectedFlux.type_flux || 'Non spécifié'}</p>
              <ActivitySquare className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">État actuel</Label>
            <div className="flex items-center justify-between">
              <p className={`rounded-full px-2.5 py-0.5 text-xs font-medium
                ${selectedFlux.state?.toLowerCase().includes('trait') 
                  ? 'bg-green-500/10 text-green-500' 
                  : selectedFlux.state === 'Rappel'
                    ? 'bg-orange-500/10 text-orange-500'
                    : selectedFlux.state === 'Planifié'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-red-500/10 text-red-500'
                }`}
              >
                {selectedFlux.state || 'Non traité'}
              </p>
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">Jeu</Label>
            <div className="flex items-center justify-between">
              <p className="text-white">{selectedFlux.game_model || 'Non spécifié'}</p>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">Créé le</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-white">{formatDate(selectedFlux.created_at)}</p>
                <Clock className="h-4 w-4 text-gray-400 ml-2" />
                <p className="text-white">{formatTime(selectedFlux.created_at)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-300">Assigné à</Label>
            <p className="text-white">{selectedFlux.assignee_email || 'Non assigné'}</p>
          </div>
          
          {selectedFlux.details && (
            <div>
              <Label className="text-gray-300">Détails supplémentaires</Label>
              <p className="text-white whitespace-pre-line text-sm mt-1">{selectedFlux.details}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-2 pt-2">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Contacter le client
        </Button>
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          Ajouter un commentaire
        </Button>
      </div>
    </div>
  )
}