import { useState } from "react";

interface Notification {
  title: string;
  message: string;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    { title: "امتحان جديد", message: "تم إضافة امتحان Math" },
    { title: "امتحان جديد", message: "تم إضافة امتحان Physics" },
  ]);

  return (
    <div className="relative">
      
      {/* 🔔 Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-xl"
      >
        🔔

        {/* عدد الإشعارات */}
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📥 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50">
          
          {/* Header */}
          <div className="p-3 border-b font-bold">
            الإشعارات
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-3 text-gray-500">لا يوجد إشعارات</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-3 border-b hover:bg-gray-100 cursor-pointer"
                >
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 text-center text-blue-500 cursor-pointer hover:bg-gray-100">
            عرض الكل
          </div>
        </div>
      )}
    </div>
  );
}