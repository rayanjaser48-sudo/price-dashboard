import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";
import logo from "../assets/logo.jpg";
import ReactCountryFlag from "react-country-flag";
import "../App.css";

function Dashboard() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [shopId, setShopId] = useState(null);
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

      if (profileError || !profile?.shop_id) {
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
      console.error(err);
      setErrorMessage("⚠️ حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setLoading(false);
    }
  }

  // تحديث جميع الأسعار
  async function updateAllRates() {
    if (!shopId || rates.length === 0) {
      toast.error("لا توجد بيانات للتحديث");
      return;
    }

    try {
      setUpdating(true);

      const promises = rates.map((item) =>
        supabase
          .from("exchange_rates")
          .update({
            buy_price: Number(item.buy_price) || 0,
            sell_price: Number(item.sell_price) || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("shop_id", shopId)
          .eq("currency", item.currency)
      );

      const results = await Promise.all(promises);

      const hasError = results.some((result) => result.error);

      if (hasError) {
        console.error("Update errors:", results);
        throw new Error("فشل تحديث بعض العملات");
      }

      toast.success("✅ تم تحديث جميع الأسعار بنجاح");
    } catch (err) {
      console.error("Update All Error:", err);
      toast.error("❌ فشل التحديث - تحقق من Console");
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscription
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
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            تسجيل الخروج
          </button>

          <h1 className="text-4xl font-bold text-[#D4AF37] tracking-wider text-center flex-1">
            شركة الشهم للصرافة والحوالات المالية
          </h1>

          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              onClick={() => window.location.href = "/display"}
              className="w-28 h-28 rounded-full shadow-2xl ring-2 ring-[#D4AF37]/40 object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* الجدول */}
        <table className="w-full text-left border-separate border-spacing-y-4 text-xl">
          <thead>
            <tr className="text-[#D4AF37] bg-white/10 backdrop-blur-xl rounded-xl text-2xl">
              <th className="py-5 px-8 rounded-l-xl">العملة</th>
              <th className="py-5 px-8">سعر الشراء</th>
              <th className="py-5 px-8 rounded-r-xl">سعر المبيع</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((item, index) => (
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
                      boxShadow: "0 0 8px rgba(0,0,0,0.4)",
                    }}
                  />
                  <span>{item.currency}</span>
                </td>
                <td className="px-8">
                  <input
                    type="number"
                    value={item.buy_price ?? ""}
                    onChange={(e) => {
                      const newRates = [...rates];
                      newRates[index].buy_price = parseFloat(e.target.value) || 0;
                      setRates(newRates);
                    }}
                    className="bg-black/40 border border-[#D4AF37]/40 rounded-xl px-5 py-4 w-40 text-white focus:ring-2 focus:ring-[#D4AF37] text-center text-xl transition-all"
                  />
                </td>
                <td className="px-8">
                  <input
                    type="number"
                    value={item.sell_price ?? ""}
                    onChange={(e) => {
                      const newRates = [...rates];
                      newRates[index].sell_price = parseFloat(e.target.value) || 0;
                      setRates(newRates);
                    }}
                    className="bg-black/40 border border-[#D4AF37]/40 rounded-xl px-5 py-4 w-40 text-white focus:ring-2 focus:ring-[#D4AF37] text-center text-xl transition-all"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

                           {/* زر التحديث الجماعي - تصميم فاخر مصغر */}
        <div className="flex justify-center mt-12">
          <button
            onClick={updateAllRates}
            disabled={updating}
            className="group relative px-14 py-5 bg-gradient-to-r from-[#D4AF37] via-[#E8C24F] to-[#D4AF37] 
                       hover:from-[#E8C24F] hover:via-[#F4D97A] hover:to-[#E8C24F]
                       text-black font-bold text-2xl rounded-3xl
                       shadow-[0_4px_15px_rgba(212,175,55,0.25)] 
                       hover:shadow-[0_8px_25px_rgba(212,175,55,0.3)]
                       transition-all duration-300 active:scale-95
                       disabled:opacity-70 flex items-center gap-3
                       border border-[#F4D97A]/30 hover:border-[#F4D97A]/50"
          >
            {/* أيقونة صح أخضر */}
            <span className="text-4xl transition-transform group-hover:rotate-45 duration-300">
              ✅
            </span>
            
            {updating ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin inline-block">⟳</span>
                جاري التحديث...
              </span>
            ) : (
           "تحديث الأسعار"
            )}

            {/* تأثير لمعان داخلي خفيف جداً */}
            <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-15 transition-opacity pointer-events-none"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;