'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-gray-600 mt-2">Your active partnerships and messages</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
          <p className="text-gray-600 text-center">
            Connections are created when a bid is accepted
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
