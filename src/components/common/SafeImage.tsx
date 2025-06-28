'use client'

import { useState,useEffect } from 'react'
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
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (!src) return fallbackSrc
    if (Array.isArray(src)) {
      return src.length > 0 ? src[0] : fallbackSrc
    }
    if (typeof src === 'string') {
      if (src.trim() === '' || src === 'null' || src === 'undefined') {
        return fallbackSrc
      }
      return src
    }
    return fallbackSrc
  })

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setCurrentSrc(() => {
      if (!src) return fallbackSrc
      if (Array.isArray(src)) {
        return src.length > 0 ? src[0] : fallbackSrc
      }
      if (typeof src === 'string') {
        if (src.trim() === '' || src === 'null' || src === 'undefined') {
          return fallbackSrc
        }
        return src
      }
      return fallbackSrc
    })
  }, [src, fallbackSrc]);


  const handleError = () => {
    setHasError(true);
  }

  return (
    <Image
      src={hasError ? fallbackSrc : currentSrc}
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
