import React, { useEffect, useState } from "react";
import { Sun, Moon, Home, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserNavbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [scrolled, setScrolled] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🌙 Dark mode sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 📜 Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 Subscription fetch
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch(
//           "http://127.0.0.1:8001/api/me/subscription",
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//               Accept: "application/json",
//             },
//           }
//         );

//         const data = await res.json();
//         setHasActivePlan(data.hasActivePlan);
//       } catch (err) {
//         console.log(err);
//         setHasActivePlan(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      className={`
        fixed w-[92%] left-1/2 -translate-x-1/2 top-4 z-50 rounded-2xl
        transition-all duration-300

        /* 🌞 LIGHT MODE */
        

        /* 🌙 DARK MODE */
        

        ${scrolled ? "scale-[0.98] backdrop-blur-xl" : "scale-100"}
      `}
    >
      <div className="flex items-center justify-between px-6 py-3">

        {/* LEFT */}
        <h1 className="
          text-xl font-bold
          text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-400
        ">
          Student Panel
        </h1>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Home */}
          <button
            onClick={() => navigate("/home")}
            className="
              p-2 rounded-lg transition
              text-gray-700 hover:bg-gray-100
              dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white
            "
          >
            <Home size={18} />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="
              p-2 rounded-lg transition
              text-gray-700 hover:bg-gray-100
              dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white
            "
          >
            <User size={18} />
          </button>

          {/* 🔥 Subscribe Button */}
          {!loading && hasActivePlan === false && (
            <button
              onClick={() => navigate("/pricing")}
              className="
                px-4 py-2 rounded-xl transition-all duration-300

                bg-emerald-500 text-white hover:bg-emerald-600

                dark:bg-emerald-600 dark:hover:bg-emerald-500
                dark:shadow-lg dark:shadow-emerald-500/20
              "
            >
              اشترك الآن 🚀
            </button>
          )}

          {/* 🌙 Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="
              relative w-16 h-8 flex items-center rounded-full p-1
              bg-gray-200 dark:bg-white/10
              dark:border dark:border-white/10
              transition
            "
          >
            <Sun className="absolute left-2 w-4 h-4 text-yellow-400" />
            <Moon className="absolute right-2 w-4 h-4 text-gray-300" />

            <div
              className={`
                w-6 h-6 rounded-full transition-all duration-300
                ${darkMode ? "translate-x-8 bg-emerald-500" : "translate-x-0 bg-white"}
              `}
            />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl transition

              bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white

              dark:bg-red-500/10 dark:text-red-400
              dark:hover:bg-red-500 dark:hover:text-white
              dark:hover:shadow-lg dark:hover:shadow-red-500/20
            "
          >
            <LogOut size={16} />
            خروج
          </button>

        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;