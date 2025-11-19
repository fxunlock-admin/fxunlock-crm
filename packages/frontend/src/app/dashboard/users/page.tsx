'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage platform users</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-600 text-center">
            User management interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
