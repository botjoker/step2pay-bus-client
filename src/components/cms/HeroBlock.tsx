interface HeroBlockProps {
  content: {
    text?: string
    image_url?: string
    text_color?: string
    [key: string]: any
  }
}

export function HeroBlock({ content }: HeroBlockProps) {
  return (
    <section 
      className="relative w-full min-h-[60vh] flex items-end"
      style={{
        backgroundImage: content.image_url ? `url(${content.image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: content.image_url ? 'transparent' : '#f3f4f6',
      }}
    >
      {/* Темный градиент снизу вверх */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
        }}
      />
      
      {/* Контент */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {content.text && (
          <div 
            className="prose prose-invert max-w-3xl [&_h1]:text-6xl [&_h1]:font-bold [&_h1]:font-playfair [&_h2]:text-5xl [&_h2]:font-bold [&_h2]:font-playfair [&_h3]:text-4xl [&_h3]:font-bold [&_h4]:text-3xl [&_h4]:font-semibold [&_h5]:text-2xl [&_h5]:font-semibold [&_p]:text-lg [&_p]:leading-relaxed"
            style={{ color: content.text_color || '#ffffff' }}
            dangerouslySetInnerHTML={{ __html: content.text }}
          />
        )}
      </div>
    </section>
  )
}
