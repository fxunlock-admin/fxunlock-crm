import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; role: string }) {
    const response = await this.client.post('/auth/register', data)
    return response.data
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data)
    return response.data
  }

  async getProfile() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  // User endpoints
  async updateProfile(data: any) {
    const response = await this.client.put('/users/profile', data)
    return response.data
  }

  async updateBrokerProfile(data: any) {
    const response = await this.client.put('/users/broker-profile', data)
    return response.data
  }

  async getBrokerProfile() {
    const response = await this.client.get('/users/broker-profile')
    return response.data
  }

  // Deal endpoints
  async getDeals(filters?: any) {
    const response = await this.client.get('/deals', { params: filters })
    return response.data
  }

  async getDeal(id: string) {
    const response = await this.client.get(`/deals/${id}`)
    return response.data
  }

  async createDeal(data: any) {
    const response = await this.client.post('/deals', data)
    return response.data
  }

  async updateDeal(id: string, data: any) {
    const response = await this.client.put(`/deals/${id}`, data)
    return response.data
  }

  async cancelDeal(id: string) {
    const response = await this.client.delete(`/deals/${id}`)
    return response.data
  }

  async getMyDeals() {
    const response = await this.client.get('/deals/my-deals')
    return response.data
  }

  // Bid endpoints
  async getBids() {
    const response = await this.client.get('/bids')
    return response.data
  }

  async createBid(data: any) {
    const response = await this.client.post('/bids', data)
    return response.data
  }

  async getBidsByDeal(dealRequestId: string) {
    const response = await this.client.get(`/bids/deal/${dealRequestId}`)
    return response.data
  }

  async getBid(id: string) {
    const response = await this.client.get(`/bids/${id}`)
    return response.data
  }

  async updateBid(id: string, data: any) {
    const response = await this.client.put(`/bids/${id}`, data)
    return response.data
  }

  async withdrawBid(id: string) {
    const response = await this.client.delete(`/bids/${id}`)
    return response.data
  }

  async acceptBid(id: string) {
    const response = await this.client.post(`/bids/${id}/accept`)
    return response.data
  }

  async rejectBid(id: string) {
    const response = await this.client.post(`/bids/${id}/reject`)
    return response.data
  }

  // Negotiation endpoints
  async createNegotiation(data: any) {
    const response = await this.client.post('/negotiations', data)
    return response.data
  }

  async getNegotiationsByBid(bidId: string) {
    const response = await this.client.get(`/negotiations/bid/${bidId}`)
    return response.data
  }

  // Connection endpoints
  async getConnections() {
    const response = await this.client.get('/connections')
    return response.data
  }

  async getConnection(id: string) {
    const response = await this.client.get(`/connections/${id}`)
    return response.data
  }

  // Message endpoints
  async sendMessage(data: { connectionId: string; content: string }) {
    const response = await this.client.post('/messages', data)
    return response.data
  }

  async getMessagesByConnection(connectionId: string) {
    const response = await this.client.get(`/messages/connection/${connectionId}`)
    return response.data
  }

  async markMessagesAsRead(connectionId: string) {
    const response = await this.client.put(`/messages/connection/${connectionId}/read`)
    return response.data
  }

  // Subscription endpoints
  async createCheckoutSession() {
    const response = await this.client.post('/subscriptions/create-checkout-session')
    return response.data
  }

  async createPortalSession() {
    const response = await this.client.post('/subscriptions/create-portal-session')
    return response.data
  }

  async getSubscriptionStatus() {
    const response = await this.client.get('/subscriptions/status')
    return response.data
  }

  // Admin endpoints
  async getUsers(filters?: any) {
    const response = await this.client.get('/admin/users', { params: filters })
    return response.data
  }

  async verifyUser(id: string) {
    const response = await this.client.put(`/admin/users/${id}/verify`)
    return response.data
  }

  async suspendUser(id: string) {
    const response = await this.client.put(`/admin/users/${id}/suspend`)
    return response.data
  }

  async rejectUser(id: string) {
    const response = await this.client.put(`/admin/users/${id}/reject`)
    return response.data
  }

  async getAllDeals(filters?: any) {
    const response = await this.client.get('/admin/deals', { params: filters })
    return response.data
  }

  async closeDeal(id: string) {
    const response = await this.client.put(`/admin/deals/${id}/close`)
    return response.data
  }

  async getAuditLogs(filters?: any) {
    const response = await this.client.get('/admin/audit-logs', { params: filters })
    return response.data
  }

  async getStats() {
    const response = await this.client.get('/admin/stats')
    return response.data
  }
}

export const api = new ApiClient()
