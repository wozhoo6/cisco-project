import { Coffee, Mail, Lock } from 'lucide-react'
import { useUserStore } from '../../stores/useUserStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login, loading } = useUserStore()

  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e) => {
    e.preventDefault()

    try {
      await login({
        username: userName,
        password: password,
      })

    } catch (error) {
      toast.error('Login failed:', error)
    }
  }

  return (
    <div className='min-h-screen flex'>
      {/* Left Brand Panel */}
      <div className='hidden md:flex w-1/2 bg-[#7B4A2E] items-center justify-center text-white'>
        <div className='text-center'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <Coffee size={36} />
            <h1 className='text-4xl font-bold tracking-wide'>kape cisco</h1>
          </div>
          <p className='text-sm opacity-80'>Brewed with passion ☕</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className='flex w-full md:w-1/2 items-center justify-center bg-[#F5E6D3] px-6'>
        <form
          onSubmit={handleSignIn}
          className='w-full max-w-md bg-white shadow-xl rounded-2xl p-8'
        >
          <h2 className='text-2xl font-bold text-[#7B4A2E] mb-2'>
            Welcome Back
          </h2>
          <p className='text-sm text-gray-500 mb-6'>
            Sign in to your coffee account
          </p>

          {/* Username */}
          <div className='mb-4'>
            <label className='text-sm text-gray-600'>Username</label>
            <div className='flex items-center border rounded-lg px-3 py-2 mt-1'>
              <Mail className='text-gray-400 mr-2' size={18} />
              <input
                type='text'
                placeholder='username'
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className='w-full outline-none text-sm'
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className='mb-4'>
            <label className='text-sm text-gray-600'>Password</label>
            <div className='flex items-center border rounded-lg px-3 py-2 mt-1'>
              <Lock className='text-gray-400 mr-2' size={18} />
              <input
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full outline-none text-sm'
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
          disable={loading}
            type='submit'
            className='w-full bg-[#7B4A2E] text-white py-2 rounded-lg hover:bg-[#5e3821] transition'
          >
            Sign In
          </button>

          {/* Footer */}
          <p className='text-sm text-center text-gray-500 mt-6'>
            Don’t have an account?{' '}
            <span className='text-[#7B4A2E] font-medium cursor-pointer'>
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage