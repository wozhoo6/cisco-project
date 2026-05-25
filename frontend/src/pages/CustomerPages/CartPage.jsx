import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react'
import { useOrderStore } from '../../stores/useOrderStore'
import toast from 'react-hot-toast'

const CartPage = () => {
  const { storeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { placeOrder, loading } = useOrderStore()

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(`cart`)

    return savedCart ? JSON.parse(savedCart) : []
  })

  const [orderType, setOrderType] = useState('DI')
  const [customerName, setCustomerName] = useState('')

  const [orderTag, setOrderTag] = useState(null)

  useEffect(() => {
    localStorage.setItem(`cart`, JSON.stringify(cart))
  }, [cart, storeId])

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

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  const handlePlaceOrder = async () => {
    if (customerName == '') {
      toast.error('Please enter customer name')
      return
    }

    const items = cart.map(item => ({
      item_id: item.product_id,
      quantity: item.quantity
    }))

    const res = await placeOrder({
      items: items,
      store_id: storeId,
      order_type: orderType,
      customer_name: customerName
    })

    if (res.error) {
      toast.error('Failed to place order. Please try again.')
      return
    }


    navigate(`/confirmation/${storeId}/${res.displayId}`)

    clearCart()
  }
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
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder='Customer Name'
              className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B4A2E]'
            />

            <div className='flex gap-2'>
              <button
                onClick={() => setOrderType('DI')}
                type='button'
                className={`flex-1 border rounded-lg py-2 text-sm transition 
      ${
        orderType === 'DI'
          ? 'bg-[#7B4A2E] text-white border-[#7B4A2E]'
          : 'bg-white hover:bg-gray-50'
      }`}
              >
                Dine In
              </button>

              <button
                onClick={() => setOrderType('TO')}
                type='button'
                className={`flex-1 border rounded-lg py-2 text-sm transition 
      ${
        orderType === 'TO'
          ? 'bg-[#7B4A2E] text-white border-[#7B4A2E]'
          : 'bg-white hover:bg-gray-50'
      }`}
              >
                Take Out
              </button>
            </div>
          </div>

          {/* TOTALS */}
          <div className='flex justify-between font-bold text-lg mt-2 text-[#7B4A2E]'>
            <span>Total</span>
            <span>₱{total}</span>
          </div>

          <button
            onClick={() => handlePlaceOrder()}
            className='w-full mt-3 bg-[#7B4A2E] text-white py-3 rounded-xl'
          >
            Place Order
          </button>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {loading && (
        <div className='fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl px-8 py-7 shadow-2xl flex flex-col items-center max-w-xs w-full'>
            {/* SPINNER */}
            <div className='relative w-16 h-16 mb-5'>
              <div className='absolute inset-0 rounded-full border-4 border-[#E7D8CF]' />

              <div className='absolute inset-0 rounded-full border-4 border-[#7B4A2E] border-t-transparent animate-spin' />
            </div>

            <h2 className='text-xl font-bold text-[#7B4A2E] mb-2'>
              Placing Order...
            </h2>

            <p className='text-sm text-gray-500 text-center'>
              Please wait while we submit your order.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
