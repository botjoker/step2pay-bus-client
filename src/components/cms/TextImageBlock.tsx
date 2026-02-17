interface TextImageBlockProps {
  content: {
    text?: string
    image_url?: string
    text_color?: string
    background_color?: string
    text_align?: string
    padding?: string
    [key: string]: any
  }
  imagePosition: 'left' | 'right'
}

const PADDING_MAP = {
  none: 'py-0',
  small: 'py-4',
  medium: 'py-8',
  large: 'py-16',
}

export function TextImageBlock({ content, imagePosition }: TextImageBlockProps) {
  const paddingClass = PADDING_MAP[content.padding as keyof typeof PADDING_MAP] || 'py-8'
  
  return (
    <section 
      className={`w-full ${paddingClass}`}
      style={{
        backgroundColor: content.background_color || 'transparent',
      }}
    >
      <div className="container mx-auto px-4">
        <div className={`grid md:grid-cols-2 gap-8 items-center ${imagePosition === 'right' ? '' : 'md:flex-row-reverse'}`}>
          {/* Текст */}
          <div>
            {content.text && (
              <div 
                className="prose max-w-none [&_h1]:text-5xl [&_h1]:font-bold [&_h2]:text-4xl [&_h2]:font-bold [&_h3]:text-3xl [&_h3]:font-bold [&_h4]:text-2xl [&_h4]:font-bold [&_h5]:text-xl [&_h5]:font-bold"
                style={{ 
                  color: content.text_color || '#000000',
                  textAlign: content.text_align || 'left',
                }}
                dangerouslySetInnerHTML={{ __html: content.text }}
              />
            )}
          </div>
          
          {/* Изображение */}
          {content.image_url && (
            <div className={imagePosition === 'left' ? 'md:order-first' : 'md:order-last'}>
              <img 
                src={content.image_url} 
                alt=""
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
