'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Check } from 'lucide-react'

const DEAL_TYPES = [
  { value: 'CPA', label: 'CPA' },
  { value: 'REBATES', label: 'Rebates' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'PNL', label: 'PnL' }
]

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    regulatedBy: '',
    yearsInBusiness: '',
    dealsAccepted: [] as string[]
  })

  useEffect(() => {
    loadBrokerProfile()
  }, [])

  const loadBrokerProfile = async () => {
    try {
      if (user?.role === 'BROKER') {
        const profile = await api.getBrokerProfile()
        if (profile) {
          setFormData({
            companyName: profile.companyName || '',
            website: profile.website || '',
            regulatedBy: profile.regulatedBy || '',
            yearsInBusiness: profile.yearsInBusiness?.toString() || '',
            dealsAccepted: profile.dealsAccepted || []
          })
        }
      }
    } catch (err) {
      console.error('Failed to load broker profile:', err)
    }
  }

  const handleDealTypeToggle = (dealType: string) => {
    setFormData(prev => ({
      ...prev,
      dealsAccepted: prev.dealsAccepted.includes(dealType)
        ? prev.dealsAccepted.filter(t => t !== dealType)
        : [...prev.dealsAccepted, dealType]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      if (user?.role === 'BROKER') {
        await api.updateBrokerProfile({
          ...formData,
          yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null
        })
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'BROKER') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings</p>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Settings page for affiliates coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Broker Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your broker profile and preferences</p>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="dark:text-white">Broker Profile</CardTitle>
            </div>
            <CardDescription className="dark:text-gray-400">
              Update your company information and deal preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="dark:text-gray-200">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Brokerage Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="dark:text-gray-200">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourbroker.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regulatedBy" className="dark:text-gray-200">Regulated By</Label>
                <Input
                  id="regulatedBy"
                  placeholder="e.g., FCA, CySEC, ASIC"
                  value={formData.regulatedBy}
                  onChange={(e) => setFormData({ ...formData, regulatedBy: e.target.value })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness" className="dark:text-gray-200">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.yearsInBusiness}
                  onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="dark:text-gray-200">Deals Accepted</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select the types of deals you're interested in
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEAL_TYPES.map((dealType) => (
                  <div
                    key={dealType.value}
                    className={`flex items-center space-x-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.dealsAccepted.includes(dealType.value)
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleDealTypeToggle(dealType.value)}
                  >
                    <Checkbox
                      id={dealType.value}
                      checked={formData.dealsAccepted.includes(dealType.value)}
                      onCheckedChange={() => handleDealTypeToggle(dealType.value)}
                      className="dark:border-gray-600"
                    />
                    <label
                      htmlFor={dealType.value}
                      className="text-sm font-medium cursor-pointer dark:text-gray-200"
                    >
                      {dealType.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={loadBrokerProfile}
                disabled={loading}
                className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
