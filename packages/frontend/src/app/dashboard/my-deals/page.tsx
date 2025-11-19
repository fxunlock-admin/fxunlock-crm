'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatVolume } from '@/lib/utils'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export default function MyDealsPage() {
  const user = useAuthStore((state) => state.user)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyDeals()
  }, [])

  const loadMyDeals = async () => {
    try {
      setLoading(true)
      const data = await api.getMyDeals()
      setDeals(data)
    } catch (err) {
      console.error('Failed to load deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'success'
      case 'IN_NEGOTIATION':
        return 'warning'
      case 'CLOSED':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getDealTypeColor = (dealType: string) => {
    switch (dealType) {
      case 'CPA':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'REBATES':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'HYBRID':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'PNL':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Deals</h1>
          <p className="text-gray-600 mt-2">Manage your deal requests and bids</p>
        </div>
        <Link href="/dashboard/my-deals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first deal request to start receiving bids from brokers
            </p>
            <Link href="/dashboard/my-deals/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Deal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{deal.title}</CardTitle>
                      <Badge variant={getStatusColor(deal.status) as any}>
                        {deal.status.replace('_', ' ')}
                      </Badge>
                      {deal.dealType && (
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDealTypeColor(deal.dealType)}`}>
                          {deal.dealType}
                        </span>
                      )}
                    </div>
                    <CardDescription>{deal.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  {/* CPA Deal Type */}
                  {deal.dealType === 'CPA' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">FTDs per Month</p>
                        <p className="font-semibold">{deal.ftdsPerMonth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">CPA Tiers</p>
                        <p className="font-semibold">{deal.cpaTiers?.length || 0} tiers</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected ROI</p>
                        <p className="font-semibold">{deal.expectedRoi || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lots to Qualify</p>
                        <p className="font-semibold">{deal.lotsToQualifyCpa || 'N/A'} lots</p>
                      </div>
                    </>
                  )}

                  {/* REBATES Deal Type */}
                  {deal.dealType === 'REBATES' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Net Deposits/Month</p>
                        <p className="font-semibold">${(deal.netDepositsPerMonth || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volume (Lots)</p>
                        <p className="font-semibold">{(deal.expectedVolumeInLots || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rebate per Lot</p>
                        <p className="font-semibold">${deal.rebatePerLot || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* HYBRID Deal Type */}
                  {deal.dealType === 'HYBRID' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">FTDs/Month</p>
                        <p className="font-semibold">{deal.ftdsPerMonth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lots to Qualify CPA</p>
                        <p className="font-semibold">{deal.lotsToQualifyCpa || 'N/A'} lots</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Volume (Lots)</p>
                        <p className="font-semibold">{(deal.expectedVolumeInLots || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rebate per Lot</p>
                        <p className="font-semibold">${deal.rebatePerLot || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* PNL Deal Type */}
                  {deal.dealType === 'PNL' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Net Deposits/Month</p>
                        <p className="font-semibold">${(deal.netDepositsPerMonth || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">PnL Share</p>
                        <p className="font-semibold">{deal.pnlPercentage || 'N/A'}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-semibold">{deal.region || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* Common fields for all types */}
                  <div>
                    <p className="text-sm text-gray-500">Bids Received</p>
                    <p className="font-semibold">{deal._count?.bids || 0}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="font-semibold">{formatDate(deal.createdAt)}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Bids
                  </Button>
                  {deal.status === 'OPEN' && (
                    <Link href={`/dashboard/my-deals/${deal.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
