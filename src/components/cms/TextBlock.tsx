interface TextBlockProps {
  content: {
    text?: string
    text_color?: string
    background_color?: string
    text_align?: string
    padding?: string
    [key: string]: any
  }
}

const PADDING_MAP = {
  none: 'py-0',
  small: 'py-4',
  medium: 'py-8',
  large: 'py-16',
}

export function TextBlock({ content }: TextBlockProps) {
  const paddingClass = PADDING_MAP[content.padding as keyof typeof PADDING_MAP] || 'py-8'
  
  return (
    <section 
      className={`w-full ${paddingClass}`}
      style={{
        backgroundColor: content.background_color || 'transparent',
      }}
    >
      <div className="container mx-auto px-4">
        {content.text && (
          <div 
            className="prose max-w-none [&_h1]:text-5xl [&_h1]:font-bold [&_h1]:font-playfair [&_h2]:text-4xl [&_h2]:font-bold [&_h2]:font-playfair [&_h3]:text-3xl [&_h3]:font-bold [&_h4]:text-2xl [&_h4]:font-semibold [&_h5]:text-xl [&_h5]:font-semibold [&_p]:text-lg [&_p]:leading-relaxed"
            style={{ 
              color: content.text_color || '#000000',
              textAlign: (content.text_align || 'left') as React.CSSProperties['textAlign'],
            }}
            dangerouslySetInnerHTML={{ __html: content.text }}
          />
        )}
      </div>
    </section>
  )
}
