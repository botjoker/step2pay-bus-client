'use client'

import { useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { config } from '@/local_config'

export default function ShortLinkPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = params.code as string
  const domain = searchParams.get('domain')

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        // Запрашиваем оригинальный URL с backend
        const response = await fetch(`${config.api}/public/s/${code}`, {
          redirect: 'manual',
        })

        // Backend вернет 302 редирект, получаем Location
        if (response.type === 'opaqueredirect' || response.status === 0) {
          // Если браузер не дает доступ к заголовкам, пробуем альтернативный метод
          // Делаем запрос через прокси или напрямую парсим из ответа
          window.location.href = `${config.api}/public/s/${code}`
          return
        }

        const location = response.headers.get('Location')
        if (location) {
          // Если получили Location, переходим туда
          window.location.href = location
        } else {
          // Fallback: просто делаем полный редирект через backend
          window.location.href = `${config.api}/public/s/${code}`
        }
      } catch (error) {
        console.error('Error fetching short link:', error)
        // В случае ошибки делаем прямой редирект через backend
        window.location.href = `${config.api}/public/s/${code}`
      }
    }

    if (code) {
      fetchOriginalUrl()
    }
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Перенаправление...</p>
      </div>
    </div>
  )
}
