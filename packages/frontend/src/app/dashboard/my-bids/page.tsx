'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { FileText, TrendingUp } from 'lucide-react'

export default function MyBidsPage() {
  const user = useAuthStore((state) => state.user)
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBids()
  }, [])

  const loadBids = async () => {
    try {
      setLoading(true)
      const data = await api.getBids()
      setBids(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bids')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'COUNTERED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDealTypeColor = (dealType: string) => {
    switch (dealType) {
      case 'CPA':
        return 'border-t-blue-600'
      case 'REBATES':
        return 'border-t-purple-600'
      case 'HYBRID':
        return 'border-t-orange-600'
      case 'PNL':
        return 'border-t-green-600'
      default:
        return 'border-t-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bids</h1>
          <p className="text-gray-600 mt-2">Track your bids and negotiations</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">My Bids</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your bids and negotiations</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Bids: <span className="font-semibold">{bids.length}</span>
        </div>
      </div>

      {bids.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 dark:text-white">No bids yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Browse available deals and place your first bid
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bids.map((bid) => (
            <Card key={bid.id} className={`border-t-4 ${getDealTypeColor(bid.dealRequest?.dealType)} dark:bg-gray-800 dark:border-gray-700`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="dark:text-white">{bid.dealRequest?.title}</CardTitle>
                      <Badge className={getStatusColor(bid.status)}>
                        {bid.status}
                      </Badge>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        {bid.dealRequest?.dealType}
                      </Badge>
                    </div>
                    <CardDescription className="dark:text-gray-400">
                      {bid.dealRequest?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* CPA Deal Type */}
                  {bid.dealRequest?.dealType === 'CPA' && bid.offeredCpaTiers && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your CPA Offer</p>
                        <p className="font-semibold dark:text-white">{bid.offeredCpaTiers.length} tiers</p>
                      </div>
                      {bid.offeredLotsToQualifyCpa && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lots to Qualify</p>
                          <p className="font-semibold dark:text-white">{bid.offeredLotsToQualifyCpa} lots</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* REBATES Deal Type */}
                  {bid.dealRequest?.dealType === 'REBATES' && bid.offeredRebatePerLot && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your Rebate Offer</p>
                      <p className="font-semibold dark:text-white">${bid.offeredRebatePerLot}/lot</p>
                    </div>
                  )}

                  {/* HYBRID Deal Type */}
                  {bid.dealRequest?.dealType === 'HYBRID' && (
                    <>
                      {bid.offeredCpaTiers && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">CPA Tiers</p>
                          <p className="font-semibold dark:text-white">{bid.offeredCpaTiers.length} tiers</p>
                        </div>
                      )}
                      {bid.offeredLotsToQualifyCpa && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Lots to Qualify</p>
                          <p className="font-semibold dark:text-white">{bid.offeredLotsToQualifyCpa} lots</p>
                        </div>
                      )}
                      {bid.offeredRebatePerLot && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Rebate Offer</p>
                          <p className="font-semibold dark:text-white">${bid.offeredRebatePerLot}/lot</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* PNL Deal Type */}
                  {bid.dealRequest?.dealType === 'PNL' && bid.offeredPnlPercentage && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your PnL Offer</p>
                      <p className="font-semibold dark:text-white">{bid.offeredPnlPercentage}%</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                    <p className="font-semibold dark:text-white">{formatDate(bid.createdAt)}</p>
                  </div>
                </div>

                {bid.message && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Message</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{bid.message}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Deal by: {bid.dealRequest?.affiliate?.email}
                  </div>
                  {bid.status === 'PENDING' && (
                    <Button variant="outline" size="sm" disabled>
                      Awaiting Response
                    </Button>
                  )}
                  {bid.status === 'ACCEPTED' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      View Connection
                    </Button>
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
