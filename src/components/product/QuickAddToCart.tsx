'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

interface QuickAddToCartProps {
  product: {
    id: string
    name: string
    stock: number
  }
  className?: string
}

export default function QuickAddToCart({ product, className = '' }: QuickAddToCartProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a Link
    e.stopPropagation()
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Đã thêm ${product.name} vào giỏ hàng`)
      } else {
        if (response.status === 401) {
          toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
          router.push('/dang-nhap')
        } else {
          toast.error(data.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng')
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleQuickAdd}
      disabled={product.stock === 0 || isLoading}
      className={`bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-700 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
    </button>
  )
}
