import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import logo from '../assets/logo.jpg'

function Login() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔒 منع الدخول لصفحة تسجيل الدخول إذا كان المستخدم مسجلاً
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        window.location.href = "/dashboard"
      }
    }
    checkSession()
  }, [])

  async function handleLogin() {
    try {
      setLoading(true)

      const email = `${username}@gmail.com`

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      window.location.href = "/display";

    } catch (err) {
      console.log(err)
      alert('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
{/* خلفيات متوهجة */}
<div className="absolute inset-0">

  {/* دائرة صفراء */}
  <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] 
       bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>

  {/* دائرة سماوية */}
  <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] 
       bg-cyan-400/15 rounded-full blur-3xl animate-pulse"></div>

</div>


      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl shadow-2xl p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#B8972E]/20 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden ring-2 ring-[#D4AF37]/30">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">
            شركة الشهم
          </h1>
          <p className="text-gray-400 text-sm">
            نظام صرف العملات الفوري
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Username */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              اسم المستخدم
            </label>

            <input
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              كلمة المرور
            </label>

            <input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          {/* Login Button - ذهبي فخم */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-3xl 
                       bg-gradient-to-r from-[#D4AF37] to-[#E8B923]
                       text-black font-bold text-xl tracking-wider
                       shadow-2xl shadow-[#D4AF37]/50
                       hover:shadow-[#E8B923]/70 hover:-translate-y-0.5
                       active:scale-95
                       transition-all duration-300 
                       disabled:opacity-50
                       relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </span>
          </button>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          نظام إدارة أسعار الصرف - لحظي
        </div>

      </div>

    </div>
  )
}

export default Login