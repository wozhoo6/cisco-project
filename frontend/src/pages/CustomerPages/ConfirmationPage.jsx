import { CheckCircle2, Coffee } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const ConfirmationPage = () => {
  const navigate = useNavigate()
  const { orderId, storeId } = useParams()

  return (
    <div className='min-h-screen bg-[#f8f5f2] flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center'>
        {/* ICON */}
        <div className='flex justify-center mb-5'>
          <div className='w-24 h-24 rounded-full bg-green-100 flex items-center justify-center'>
            <CheckCircle2
              size={56}
              className='text-green-600'
            />
          </div>
        </div>

        {/* TITLE */}
        <h1 className='text-3xl font-extrabold text-[#7B4A2E] mb-2'>
          Order Confirmed
        </h1>

        <p className='text-gray-500 mb-6'>
          Your coffee order has been placed successfully.
        </p>

        {/* ORDER NUMBER */}
        <div className='bg-[#f8f5f2] rounded-2xl py-5 mb-6 border border-[#eadfd8]'>
          <p className='text-xs tracking-wide text-gray-500 mb-2'>
            ORDER NUMBER
          </p>

          <p className='text-5xl font-black tracking-[0.2em] text-[#7B4A2E]'>
            #{orderId}
          </p>
        </div>

        {/* INFO */}
        <div className='bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3 text-left'>
          <Coffee className='text-[#7B4A2E] shrink-0 mt-1' size={20} />

          <div>
            <p className='font-semibold text-[#7B4A2E]'>
              Preparing your order
            </p>

            <p className='text-sm text-gray-600'>
              Please wait for your number to be called.
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className='space-y-3'>
          <button
            onClick={() => navigate(`/menu/${storeId}`)}
            className='w-full bg-[#7B4A2E] hover:bg-[#623923] transition text-white py-3 rounded-xl font-medium'
          >
            Back to Menu
          </button>

          <button
            onClick={() => window.location.reload()}
            className='w-full border border-gray-300 hover:bg-gray-50 transition py-3 rounded-xl text-gray-700'
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPage