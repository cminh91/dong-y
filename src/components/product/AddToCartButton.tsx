'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    salePrice?: number
    stock: number
  }
  className?: string
}

export default function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Đã thêm ${product.name} vào giỏ hàng`)
        
        // Optionally redirect to cart or show cart sidebar
        // router.push('/gio-hang')
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

  const handleAddToWishlist = () => {
    toast.info('Tính năng yêu thích đang được phát triển')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Số lượng:</label>
        <div className="flex items-center border rounded-lg">
          <button 
            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0 || quantity <= 1}
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1" 
            max={product.stock}
            className="w-16 text-center border-0 focus:ring-0 focus:outline-none" 
            disabled={product.stock === 0}
          />
          <button 
            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0 || quantity >= product.stock}
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isLoading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </>
          )}
        </button>
        
        <button 
          onClick={handleAddToWishlist}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
