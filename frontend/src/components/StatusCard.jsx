import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  Package,
  Coffee,
  XCircle,
  CreditCard
} from 'lucide-react'

// Icon mapping
const icons = {
  pending: Clock,
  paid: CreditCard,
  preparing: Coffee,
  ready: Package,
  completed: CheckCircle,
  cancelled: XCircle
}

// Gradient mapping
const gradients = {
  pending: 'from-yellow-100 to-yellow-50',
  paid: 'from-green-100 to-green-50',
  preparing: 'from-orange-100 to-orange-50',
  ready: 'from-blue-100 to-blue-50',
  completed: 'from-indigo-100 to-indigo-50',
  cancelled: 'from-red-100 to-red-50'
}

const Card = ({ title, value }) => {
  const key = title.toLowerCase()
  const Icon = icons[key] || Clock

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`rounded-2xl p-4 text-center bg-gradient-to-br ${
        gradients[key] || 'from-gray-100 to-gray-50'
      } shadow-sm hover:shadow-lg border border-white/50 backdrop-blur`}
    >
      <div className="flex justify-center mb-2">
        <Icon className="w-6 h-6 text-[#7B4A2E]" />
      </div>

      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-extrabold text-[#7B4A2E] mt-1">
        {value ?? 0}
      </h2>
    </motion.div>
  )
}

export default Card
