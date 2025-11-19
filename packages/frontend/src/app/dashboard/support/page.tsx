'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageCircle, Mail, Phone, Clock } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: Date
}

export default function SupportPage() {
  const user = useAuthStore((state) => state.user)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to FlowXchange Support. How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setNewMessage('')

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. A support agent will respond shortly. Our typical response time is under 2 hours during business hours.',
        sender: 'support',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, supportMessage])
    }, 1000)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement email submission
    alert('Your message has been sent! We will respond via email within 24 hours.')
    setContactForm({ subject: '', message: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-gray-600 mt-2">Get help from our support team</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Chat */}
        <Card className="lg:col-span-2 border-t-4 border-t-purple-600">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <CardTitle>Live Chat</CardTitle>
            </div>
            <CardDescription>Chat with our support team in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info & Email Form */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <p className="text-sm text-gray-600">support@flowxchange.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Phone</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Business Hours</p>
                  <p className="text-sm text-gray-600">Mon-Fri: 9AM - 6PM EST</p>
                  <p className="text-sm text-gray-600">Sat-Sun: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Form */}
          <Card className="border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="text-lg">Send Email</CardTitle>
              <CardDescription>We'll respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your issue..."
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="border-t-4 border-t-orange-600">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How do I create a deal request?</h3>
              <p className="text-sm text-gray-600">
                Navigate to "My Deals" and click "Create New Deal". Fill in the required information including deal type, financial terms, and trading instruments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How long does verification take?</h3>
              <p className="text-sm text-gray-600">
                Account verification typically takes 24-48 hours. You'll receive an email notification once your account is verified.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I edit my deal after posting?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can edit OPEN deals by clicking the "Edit" button on your deal card. Once a deal is accepted or closed, it cannot be edited.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How do I accept a bid?</h3>
              <p className="text-sm text-gray-600">
                Go to "My Deals", click on a deal with bids, review the bids, and click "Accept" on your preferred bid. This will create a connection with the broker.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
