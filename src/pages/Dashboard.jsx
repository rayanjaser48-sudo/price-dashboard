import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import logo from "../assets/logo.jpg";
import ReactCountryFlag from "react-country-flag";
import "../App.css";

function Dashboard() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("⚠️ لا يوجد مستخدم مسجل دخول.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Profile query error:", profileError);
        setErrorMessage("⚠️ حدث خطأ أثناء جلب بيانات المستخدم.");
        return;
      }

      if (!profile || !profile.shop_id) {
        setErrorMessage("⚠️ لم يتم العثور على بيانات المحل.");
        return;
      }

      setShopId(profile.shop_id);

      const { data: ratesData, error: ratesError } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("shop_id", profile.shop_id)
        .order("currency");

      if (ratesError) throw ratesError;

      setRates(ratesData);
    } catch (err) {
      console.log(err);
      setErrorMessage("⚠️ حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setLoading(false);
    }
  }

  async function updateRate(currency, buy, sell) {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from("exchange_rates")
        .update({
          buy_price: buy,
          sell_price: sell,
          updated_at: new Date(),
        })
        .eq("shop_id", shopId)
        .eq("currency", currency);

      if (error) throw error;

      toast.success("تم التحديث بنجاح ✨");

    } catch (err) {
      console.log(err);
      toast.error("فشل التحديث ❌");
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel(`exchange_rates_shop_${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exchange_rates",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          setRates((prev) =>
            prev.map((item) =>
              item.currency === payload.new.currency
                ? { ...item, ...payload.new }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [shopId]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-3xl animate-fadeIn">
        {errorMessage}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] text-3xl animate-pulse">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 relative overflow-hidden animate-fadeIn">

      {/* خلفيات متوهجة */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-[#D4AF37]/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-cyan-400/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-[#D4AF37]/30 rounded-3xl p-10 shadow-2xl">

        {/* الهيدر */}
        <div className="flex items-center justify-between mb-10">

          {/* اللوغو */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              onClick={() => window.location.href = "/display"}
              className="w-28 h-28 rounded-full shadow-2xl ring-2 ring-[#D4AF37]/40 object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* اسم الشركة */}
          <h1 className="text-5xl font-bold text-[#D4AF37] tracking-wider text-center flex-1">
            شركة الشهم
          </h1>

          {/* زر تسجيل الخروج */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* الجدول */}
        <table className="w-full text-left border-separate border-spacing-y-4 text-xl">
          <thead>
            <tr className="text-[#D4AF37] bg-white/10 backdrop-blur-xl rounded-xl text-2xl">
              <th className="py-5 px-8 rounded-l-xl">العملة</th>
              <th className="py-5 px-8">سعر الشراء</th>
              <th className="py-5 px-8">سعر المبيع</th>
              <th className="py-5 px-8 text-center rounded-r-xl">الإجراء</th>
            </tr>
          </thead>

          <tbody>
            {rates.map((item) => (
              <tr
                key={item.currency}
                className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-xl"
              >
                <td className="py-6 px-8 font-bold flex items-center gap-5 text-2xl">
                  <ReactCountryFlag
                    countryCode={item.currency.slice(0, 2)}
                    svg
                    style={{
                      width: "2.6em",
                      height: "2.6em",
                      borderRadius: "6px",
                      boxShadow: "0 0 8px rgba(0,0,0,0.4)"
                    }}
                  />
                  <span>{item.currency}</span>
                </td>

                <td className="px-8">
                  <input
                    type="number"
                    defaultValue={item.buy_price}
                    onChange={(e) => (item.buy_price = e.target.value)}
                    className="bg-black/40 border border-[#D4AF37]/40 rounded-xl px-5 py-4 w-40 text-white focus:ring-2 focus:ring-[#D4AF37] text-center text-xl transition-all"
                  />
                </td>

                <td className="px-8">
                  <input
                    type="number"
                    defaultValue={item.sell_price}
                    onChange={(e) => (item.sell_price = e.target.value)}
                    className="bg-black/40 border border-[#D4AF37]/40 rounded-xl px-5 py-4 w-40 text-white focus:ring-2 focus:ring-[#D4AF37] text-center text-xl transition-all"
                  />
                </td>

                <td className="text-center px-8">
                  <button
                    onClick={() => updateRate(item.currency, item.buy_price, item.sell_price)}
                    disabled={updating}
                    className="px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#E8B923] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md text-xl disabled:opacity-50"
                  >
                    {updating ? "جاري الحفظ..." : "تحديث"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default Dashboard;
