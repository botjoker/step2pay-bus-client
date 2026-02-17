'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { config } from '@/local_config'
import { Loader2 } from 'lucide-react'
import { HeroBlock } from '@/components/cms/HeroBlock'
import { TextBlock } from '@/components/cms/TextBlock'
import { TextImageBlock } from '@/components/cms/TextImageBlock'

interface PublicBlock {
  id: string
  block_type: string
  order_index: number
  content: {
    text?: string
    image_url?: string
    image_id?: string
    [key: string]: any
  }
}

interface PublicPageData {
  id: string
  title: string
  slug: string
  settings: Record<string, any>
  is_published: boolean
  published_at?: string
  blocks: PublicBlock[]
}

export default function PublicCmsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  
  // Получаем домен из hostname или query параметра (для локальной разработки)
  const getDomain = () => {
    if (typeof window === 'undefined') return null
    
    const hostname = window.location.hostname
    
    // Локальная разработка - используем query параметр
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return searchParams.get('domain')
    }
    
    // Продакшн - извлекаем поддомен из hostname (aaa.sambacrm.online -> aaa)
    const parts = hostname.split('.')
    return parts.length > 1 ? parts[0] : null
  }
  
  const domain = getDomain()

  const { data: page, isLoading, error } = useQuery<PublicPageData>({
    queryKey: ['public-cms-page', slug, domain],
    queryFn: async () => {
      const response = await axios.get(`${config.api}/public/pages/${slug}`, {
        params: { domain }
      })
      return response.data.data
    },
    enabled: !!domain,
  })

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Домен не определен
          </h1>
          <p className="text-gray-600">
            Для локальной разработки добавьте ?domain=YOUR_DOMAIN в URL
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Страница не найдена
          </h1>
          <p className="text-gray-600">
            Страница "{slug}" не существует или не опубликована
          </p>
        </div>
      </div>
    )
  }

  if (!page) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {page.blocks.map((block) => {
        switch (block.block_type) {
          case 'hero':
            return <HeroBlock key={block.id} content={block.content} />
          
          case 'text':
            return <TextBlock key={block.id} content={block.content} />
          
          case 'text-image-left':
            return <TextImageBlock key={block.id} content={block.content} imagePosition="left" />
          
          case 'text-image-right':
            return <TextImageBlock key={block.id} content={block.content} imagePosition="right" />
          
          default:
            return (
              <section key={block.id} className="container mx-auto px-4 py-8">
                <div className="bg-gray-100 p-6 rounded">
                  <p className="text-sm text-gray-600 mb-2">Неизвестный тип блока: {block.block_type}</p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(block, null, 2)}
                  </pre>
                </div>
              </section>
            )
        }
      })}
    </div>
  )
}
