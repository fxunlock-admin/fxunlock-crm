'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check } from 'lucide-react'

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your broker subscription</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant="secondary">Free Trial</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bids Remaining</span>
                <span className="font-semibold">Unlimited</span>
              </div>
              <Button className="w-full mt-4">
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>$99/month</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Unlimited bids</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Early access to deals</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
