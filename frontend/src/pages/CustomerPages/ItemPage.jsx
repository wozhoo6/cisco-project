import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductStore } from '../../stores/useProductStore.js'

const ItemPage = () => {
  const navigate = useNavigate()
  const { fetchProducts, products, loading } = useProductStore()
  const { storeId } = useParams()

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart')

    return savedCart ? JSON.parse(savedCart) : []
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const handleAddToCart = product => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id)

      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  return (
    <div
      className={
        cartCount > 0
          ? 'min-h-screen bg-[#f8f5f2] pb-16'
          : 'min-h-screen bg-[#f8f5f2]'
      }
    >
      {/* HEADER */}
      <header className='sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-[#7B4A2E]'>Coffee Menu</h1>

          <p className='text-xs text-gray-500'>Fresh drinks everyday</p>
        </div>

        {/* NAVIGATE TO CART */}
        <button
          onClick={() => navigate(`/cart/${storeId}`)}
          className='relative bg-[#7B4A2E] text-white p-3 rounded-full shadow-md'
        >
          <ShoppingCart size={20} />

          {cartCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold'>
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* PRODUCTS */}
      <main className='max-w-6xl mx-auto p-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          <div className='flex flex-col gap-8'>
            {products?.map(category => (
              <section key={category.category_id}>
                {/* CATEGORY TITLE */}
                <h2 className='text-xl font-bold text-[#7B4A2E] mb-4'>
                  {category.category_name}
                </h2>

                {/* PRODUCTS GRID */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {category.products.map(product => (
                    <div
                      key={product.product_id}
                      className='bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition flex flex-col'
                    >
                      {/* IMAGE */}
                      <div className='h-44 bg-gray-100'>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='flex items-center justify-center h-full text-gray-400 text-sm'>
                            No image
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className='p-4 flex flex-col flex-1'>
                        <div className='flex justify-between items-start'>
                          <h3 className='font-semibold text-[#7B4A2E]'>
                            {product.name}
                          </h3>
                          <span className='font-bold text-[#7B4A2E]'>
                            ₱{product.price}
                          </span>
                        </div>

                        <p className='text-sm text-gray-500 mt-1 flex-1'>
                          {product.description || 'No description'}
                        </p>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className='mt-4 bg-[#7B4A2E] hover:bg-[#623923] text-white py-2 rounded-xl text-sm font-medium transition'
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* MOBILE FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <div className='lg:hidden fixed bottom-3 left-4 right-4 z-30'>
          <button
            onClick={() =>
              navigate(`/cart/${storeId}`, {
                state: { cart }
              })
            }
            className='w-full bg-[#7B4A2E] text-white rounded-2xl px-4 py-4 shadow-xl flex items-center justify-between'
          >
            <div className='flex items-center gap-3'>
              <ShoppingCart size={20} />

              <span className='font-medium'>{cartCount} item(s)</span>
            </div>

            <span className='font-bold'>View Cart</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ItemPage
