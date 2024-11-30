import React, { useState } from "react"; 
import { useTheme } from "@/app/contexts/ThemeContext";
import { 
  FaFileAlt, FaSave, FaPlay, FaKeyboard, 
  FaClone, FaSearch, FaArrowDown,
  FaCode,
  FaChevronDown,
  FaCloud,
  FaBrain,
  FaRocket,
  FaSync
} from "react-icons/fa";

const WelcomeGuide = () => {
  const { theme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const features = [
    {
      icon: <FaCode className="text-3xl" />,
      title: "Hỗ trợ nhiều ngôn ngữ",
      desc: "Python, JavaScript, C++, Java và nhiều ngôn ngữ khác"
    },
    {
      icon: <FaCloud className="text-3xl" />,
      title: "Lưu trữ đám mây",
      desc: "Đồng bộ và sao lưu code của bạn"
    },
    {
      icon: <FaBrain className="text-3xl" />,
      title: "Suggestions",
      desc: "Gợi ý code thông minh và tự động hoàn thành"
    },
    {
      icon: <FaRocket className="text-3xl" />,
      title: "Chạy code trực tiếp",
      desc: "Biên dịch và chạy code ngay trong trình duyệt"
    },
    {
      icon: <FaSync className="text-3xl" />,
      title: "Tự động lưu",
      desc: "Không bao giờ mất code với tính năng tự động lưu"
    },
    {
      icon: <FaKeyboard className="text-3xl" />,
      title: "Phím tắt hữu ích",
      desc: "Tăng tốc coding với các phím tắt"
    }
  ];

  const shortcuts = [
    {
      title: "Thao tác cơ bản",
      items: [
        { icon: <FaFileAlt />, key: "Ctrl + N", desc: "Tạo file mới" },
        { icon: <FaSave />, key: "Ctrl + S", desc: "Lưu file" },
        { icon: <FaPlay />, key: "Ctrl + B", desc: "Chạy code" },
        { icon: <FaCode />, key: "Ctrl + /", desc: "Comment/Uncomment" },
      ]
    },
    {
      title: "Di chuyển & Chọn",
      items: [
        { icon: <FaArrowDown />, key: "Ctrl + G", desc: "Đi đến dòng" },
        { icon: <FaKeyboard />, key: "Ctrl + D", desc: "Chọn từ tiếp theo" },
        { icon: <FaKeyboard />, key: "Ctrl + Shift + L", desc: "Chọn tất cả từ giống nhau" },
        { icon: <FaKeyboard />, key: "Alt + Click", desc: "Thêm con trỏ" }
      ]
    },
    {
      title: "Chỉnh sửa nâng cao",
      items: [
        { icon: <FaClone />, key: "Alt + ↑/↓", desc: "Di chuyển dòng" },
        { icon: <FaClone />, key: "Alt + Shift + ↑/↓", desc: "Nhân đôi dòng" },
        { icon: <FaKeyboard />, key: "Ctrl + [", desc: "Thụt lề trái" },
        { icon: <FaKeyboard />, key: "Ctrl + ]", desc: "Thụt lề phải" }
      ]
    },
    {
      title: "Tìm kiếm & Thay thế",
      items: [
        { icon: <FaSearch />, key: "Ctrl + F", desc: "Tìm kiếm" },
        { icon: <FaSearch />, key: "Ctrl + H", desc: "Thay thế" },
        { icon: <FaSearch />, key: "Ctrl + Shift + F", desc: "Tìm trong tất cả file" },
        { icon: <FaKeyboard />, key: "F3", desc: "Tìm tiếp theo" }
      ]
    },
    {
      title: "Code Folding",
      items: [
        { icon: <FaKeyboard />, key: "Ctrl + Shift + [", desc: "Thu gọn vùng code" },
        { icon: <FaKeyboard />, key: "Ctrl + Shift + ]", desc: "Mở rộng vùng code" },
        { icon: <FaKeyboard />, key: "Ctrl + K Ctrl + 0", desc: "Thu gọn tất cả" },
        { icon: <FaKeyboard />, key: "Ctrl + K Ctrl + J", desc: "Mở rộng tất cả" }
      ]
    }
  ];

  return (
    <div className={`h-full overflow-y-auto ${
      theme === "light" ? "bg-white text-gray-800" : "bg-[#1e1e1e] text-gray-300"
    }`}>
      <div className="flex flex-col items-center p-6 space-y-8">
        {/* Header section */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Chào mừng đến với Code Editor
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg transition-transform hover:scale-105 ${
                theme === "light"
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-gray-800/50 hover:bg-gray-800"
              }`}
            >
              <div className={`mb-4 ${
                index % 3 === 0 ? "text-blue-500" :
                index % 3 === 1 ? "text-purple-500" :
                "text-pink-500"
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-80">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Shortcuts Toggle Button */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transform transition hover:-translate-y-0.5"
        >
          <span>{showShortcuts ? "Ẩn phím tắt" : "Xem phím tắt"}</span>
          <FaChevronDown className={`transform transition-transform ${showShortcuts ? "rotate-180" : ""}`} />
        </button>

        {/* Shortcuts Section */}
        {showShortcuts && (
          <div className="grid grid-cols-1 gap-8 max-w-6xl animate-fadeIn">
            {shortcuts.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <h3 className={`text-xl font-semibold ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}>
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.items.map((shortcut, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-transform hover:scale-105 ${
                        theme === "light" 
                          ? "bg-gray-50 hover:bg-gray-100" 
                          : "bg-gray-800/50 hover:bg-gray-800"
                      }`}
                    >
                      <div className={`text-2xl ${
                        groupIndex === 0 ? "text-blue-500" : 
                        groupIndex === 1 ? "text-purple-500" : 
                        "text-pink-500"
                      }`}>
                        {shortcut.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <kbd className={`px-2 py-1 rounded text-sm font-mono ${
                          theme === "light" 
                            ? "bg-gray-200 text-gray-700" 
                            : "bg-gray-700 text-gray-300"
                        }`}>
                          {shortcut.key}
                        </kbd>
                        <p className="mt-1 text-sm opacity-80">{shortcut.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeGuide;