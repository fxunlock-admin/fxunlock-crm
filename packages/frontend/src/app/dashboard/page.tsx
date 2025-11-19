'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, MessageSquare, TrendingUp, Users } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    activeDeals: 0,
    pendingBids: 0,
    connections: 0,
    availableDeals: 0,
    myBids: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user?.role])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'AFFILIATE') {
        const deals = await api.getMyDeals()
        const activeDeals = deals.filter((d: any) => d.status === 'OPEN' || d.status === 'IN_NEGOTIATION')
        const pendingBids = deals.reduce((sum: number, deal: any) => 
          sum + (deal.bids?.filter((b: any) => b.status === 'PENDING').length || 0), 0
        )
        const connections = await api.getConnections()
        
        setStats({
          activeDeals: activeDeals.length,
          pendingBids,
          connections: connections.length,
          availableDeals: 0,
          myBids: 0
        })
      } else if (user?.role === 'BROKER') {
        const deals = await api.getDeals({ status: 'OPEN' })
        const connections = await api.getConnections()
        // TODO: Add API endpoint to get broker's bids
        
        setStats({
          activeDeals: 0,
          pendingBids: 0,
          connections: connections.length,
          availableDeals: deals.length,
          myBids: 0
        })
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role === 'AFFILIATE') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.profile?.firstName || 'Affiliate'}!</h1>
          <p className="text-gray-600 mt-2">Manage your deal requests and partnerships</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Deals</CardTitle>
              <CardDescription>Your open deal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.activeDeals}</div>
              <Link href="/dashboard/my-deals">
                <Button variant="link" className="px-0">View all deals →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Bids</CardTitle>
              <CardDescription>Bids awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.pendingBids}</div>
              <Link href="/dashboard/my-deals">
                <Button variant="link" className="px-0">Review bids →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connections</CardTitle>
              <CardDescription>Active partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.connections}</div>
              <Link href="/dashboard/connections">
                <Button variant="link" className="px-0">View connections →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/dashboard/my-deals/new">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Create New Deal
              </Button>
            </Link>
            <Link href="/dashboard/connections">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Messages
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user?.role === 'BROKER') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.brokerProfile?.companyName || 'Broker'}!</h1>
          <p className="text-gray-600 mt-2">Browse deals and manage your bids</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Deals</CardTitle>
              <CardDescription>Open deals to bid on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.availableDeals}</div>
              <Link href="/dashboard/deals">
                <Button variant="link" className="px-0">Browse deals →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Bids</CardTitle>
              <CardDescription>Your active bids</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.myBids}</div>
              <Link href="/dashboard/my-bids">
                <Button variant="link" className="px-0">View bids →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connections</CardTitle>
              <CardDescription>Accepted partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stats.connections}</div>
              <Link href="/dashboard/connections">
                <Button variant="link" className="px-0">View connections →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/dashboard/deals">
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Browse Deals
              </Button>
            </Link>
            <Link href="/dashboard/subscription">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ADMIN
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/users">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/dashboard/deals">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View All Deals
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
