import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../App.css";
import logo from "../assets/logo.jpg";
import ReactCountryFlag from "react-country-flag";

function Display() {
  const [rates, setRates] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  async function loadData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      setShopId(profile.shop_id);

      const { data: ratesData } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("shop_id", profile.shop_id)
        .order("currency");

      setRates(ratesData || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel(`display_rates_${shopId}`)
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

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] text-4xl animate-pulse">
        Loading Display...
      </div>
    );
  }

  const tableRates = rates.slice(0, 3);
  const cardRates = rates.slice(3, 7);

  return (
    <div className="min-h-screen bg-black text-white p-4 relative overflow-hidden">

      {/* خلفيات مع توهج متحرك */}
      <div className="absolute inset-0">

        {/* توهج ذهبي */}
        <div className="
          absolute top-[-150px] left-[-150px]
          w-[420px] h-[420px]
          bg-[#D4AF37]/40 rounded-full
          shadow-[0_0_120px_60px_rgba(212,175,55,0.5)]
          glow-animate
        "></div>

        {/* توهج أزرق */}
        <div className="
          absolute bottom-[-150px] right-[-150px]
          w-[420px] h-[420px]
          bg-cyan-400/40 rounded-full
          shadow-[0_0_120px_60px_rgba(34,211,238,0.5)]
          glow-animate
        "></div>

      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* الهيدر */}
        <div className="flex items-center justify-between mb-6">

          {/* الوقت */}
          <div className="text-left">
            <div className="text-3xl font-bold text-[#D4AF37]">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-md text-gray-400 mt-1">
              {time.toLocaleDateString("ar-SA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* اسم الشركة */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-4xl font-bold text-[#D4AF37] tracking-wider">
              شركة الشهم
            </h1>
          </div>

          {/* اللوغو */}
          <div
            className="cursor-pointer flex-shrink-0"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <img
              src={logo}
              alt="Logo"
              className="w-24 h-24 rounded-full shadow-xl ring-2 ring-[#D4AF37]/50"
            />
          </div>
        </div>

        {/* الجدول */}
        {tableRates.length > 0 && (
          <div className="mb-5">

            <div className="border border-[#D4AF37]/40 rounded-2xl p-3 bg-white/5 backdrop-blur-xl shadow-xl">

              <table className="w-full text-center text-2xl border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[#D4AF37] bg-white/10 rounded-xl">
                    <th className="py-3 rounded-l-xl">العملة</th>
                    <th className="py-3">شراء</th>
                    <th className="py-3">مبيع</th>
                    <th className="py-3 rounded-r-xl">وقت التعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRates.map((item) => (
                    <tr
                      key={item.currency}
                      className="bg-white/5 hover:bg-white/10 transition rounded-xl"
                    >
                      <td className="py-4 font-bold flex items-center justify-center gap-3 text-xl">
                        <ReactCountryFlag
                          countryCode={item.currency.slice(0, 2)}
                          svg
                          style={{ width: "1.8em", height: "1.8em" }}
                        />
                        <span>{item.currency}</span>
                      </td>

                      <td className="py-4 text-green-400 font-semibold text-2xl">
                        {item.buy_price}
                      </td>

                      <td className="py-4 text-red-400 font-semibold text-2xl">
                        {item.sell_price}
                      </td>

                      <td className="py-4 text-gray-300 text-lg">
                        {new Date(item.updated_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        )}

        {/* الكروت */}
        {cardRates.length > 0 && (
          <div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cardRates.map((item) => (
                <div
                  key={item.currency}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl p-5 shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">

                    <div className="flex items-center justify-center gap-3 mb-4">
                      <ReactCountryFlag
                        countryCode={item.currency.slice(0, 2)}
                        svg
                        style={{ width: "2.2em", height: "2.2em" }}
                      />
                      <h3 className="text-2xl font-bold">{item.currency}</h3>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex justify-between items-center bg-black/40 rounded-xl p-3">
                        <span className="text-gray-400 text-lg">شراء</span>
                        <span className="text-green-400 text-2xl font-bold">
                          {item.buy_price}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-black/40 rounded-xl p-3">
                        <span className="text-gray-400 text-lg">مبيع</span>
                        <span className="text-red-400 text-2xl font-bold">
                          {item.sell_price}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Display;
