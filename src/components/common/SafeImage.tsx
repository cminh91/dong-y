'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string | string[] | null | undefined
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/images/placeholder.png'
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(() => {
    // Handle different src types
    if (!src) return fallbackSrc

    if (Array.isArray(src)) {
      return src.length > 0 ? src[0] : fallbackSrc
    }

    if (typeof src === 'string') {
      // Handle empty or invalid strings
      if (src.trim() === '' || src === 'null' || src === 'undefined') {
        return fallbackSrc
      }

      return src
    }

    return fallbackSrc
  })

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}
