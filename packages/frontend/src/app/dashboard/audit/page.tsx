'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart } from 'lucide-react'

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600 mt-2">View system activity and audit trail</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
          <p className="text-gray-600 text-center">
            Audit log viewer coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
