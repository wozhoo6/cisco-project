import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react'

const CartPage = () => {
  const { storeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [cart, setCart] = useState(location.state?.cart || [])

  const handleIncrease = id => {
    setCart(prev =>
      prev.map(item =>
        item.product_id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const handleDecrease = id => {
    setCart(prev =>
      prev
        .map(item =>
          item.product_id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const clearCart = () => setCart([])

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const fee = 15
  const total = subtotal + fee

  return (
    <div className='min-h-screen bg-[#f8f5f2] p-4'>
      {/* HEADER */}
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-[#7B4A2E]'
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className='font-bold text-[#7B4A2E]'>Edit Cart</h1>

        <button
          onClick={clearCart}
          className='text-red-500 text-sm flex items-center gap-1'
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      {/* CART ITEMS */}
      <div className='space-y-3'>
        {cart.length === 0 ? (
          <p className='text-center text-gray-400 mt-10'>Your cart is empty</p>
        ) : (
          cart.map(item => (
            <div
              key={item.product_id}
              className='bg-white p-3 rounded-xl flex gap-3 items-center'
            >
              <img
                src={item.image_url}
                className='w-16 h-16 rounded-lg object-cover'
              />

              <div className='flex-1'>
                <h2 className='font-semibold text-[#7B4A2E]'>{item.name}</h2>

                <p className='text-sm text-gray-500'>₱{item.price}</p>

                <p className='font-bold text-sm mt-1'>
                  ₱{item.price * item.quantity}
                </p>
              </div>

              {/* CONTROLS */}
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleDecrease(item.product_id)}
                  className='w-7 h-7 rounded-full border flex items-center justify-center'
                >
                  <Minus size={14} />
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => handleIncrease(item.product_id)}
                  className='w-7 h-7 rounded-full border flex items-center justify-center'
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTAL */}
      {cart.length > 0 && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3'>
          {/* CUSTOMER INFO */}
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Customer Name'
              className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
            />

            <div className='flex gap-2'>
              <button
                type='button'
                className='flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50'
              >
                Dine In
              </button>

              <button
                type='button'
                className='flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50'
              >
                Take Out
              </button>
            </div>
          </div>

          {/* TOTALS */}
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Subtotal</span>
            <span>₱{subtotal}</span>
          </div>

          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Fee</span>
            <span>₱{fee}</span>
          </div>

          <div className='flex justify-between font-bold text-lg mt-2 text-[#7B4A2E]'>
            <span>Total</span>
            <span>₱{total}</span>
          </div>

          <button className='w-full mt-3 bg-[#7B4A2E] text-white py-3 rounded-xl'>
            Checkout
          </button>
        </div>
      )}
    </div>
  )
}

export default CartPage
