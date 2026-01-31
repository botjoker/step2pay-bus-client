'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/local_config'

interface PaymentOrderData {
  order_id: string
  amount: string
  description: string
  payer_email?: string
  status: string
  payment_form?: {
    name: string
    fields: Array<{
      name: string
      type: string
      label: string
      required?: boolean
      options?: string[]
    }>
  }
}

export default function PaymentPage() {
  const params = useParams()
  const code = params.code as string
  const [orderData, setOrderData] = useState<PaymentOrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${config.api}/public/payment-order/${code}`)
        if (!response.ok) throw new Error('Order not found')
        const data = await response.json()
        setOrderData(data)
        if (data.payer_email) {
          setEmail(data.payer_email)
        }
      } catch (err) {
        setError('Заказ не найден')
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchOrder()
    }
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      alert('Укажите email')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${config.api}/public/payment-order/${code}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, form_data: formData }),
      })

      if (!response.ok) throw new Error('Payment creation failed')

      const result = await response.json()
      // Редирект на страницу оплаты ЮКассы
      window.location.href = result.data.confirmation_url
    } catch (err) {
      setError('Ошибка создания платежа. Попробуйте еще раз.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600 mt-4">Загрузка данных...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка</CardTitle>
            <CardDescription>{error || 'Заказ на оплату не найден'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (orderData.status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Заказ уже обработан</CardTitle>
            <CardDescription>
              {orderData.status === 'paid' && 'Этот счет уже оплачен'}
              {orderData.status === 'expired' && 'Срок действия счета истек'}
              {orderData.status === 'cancelled' && 'Счет отменен'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Оплата</CardTitle>
          <CardDescription>{orderData.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Сумма */}
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Сумма к оплате</p>
              <p className="text-4xl font-bold text-blue-600">{orderData.amount} ₽</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email для чека *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                На этот email придет чек об оплате
              </p>
            </div>

            {/* Кастомные поля формы */}
            {orderData.payment_form && orderData.payment_form.fields.length > 0 && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">{orderData.payment_form.name}</h3>
                {orderData.payment_form.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </Label>
                    
                    {field.type === 'select' && field.options ? (
                      <select
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="">Выберите...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        rows={3}
                        className="w-full border rounded-md p-2"
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка оплаты */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Создание платежа...
                </span>
              ) : (
                `Оплатить ${orderData.amount} ₽`
              )}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <p className="text-xs text-center text-gray-500">
              Защищенная оплата через ЮКасса
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
