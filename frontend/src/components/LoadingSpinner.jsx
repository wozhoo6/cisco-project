import { Coffee } from 'lucide-react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <Coffee className="text-[#7B4A2E] animate-spin" size={40} />
        <p className="text-[#7B4A2E] text-sm font-medium">
          Brewing your experience...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner