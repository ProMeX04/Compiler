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
  FaSync,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaShareSquare,
  FaHistory,
  FaFileExport,
  FaFileImport
} from "react-icons/fa";

const WelcomeGuide = () => {
  const { theme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCloudGuide, setShowCloudGuide] = useState(false);

  const features = [
    {
      icon: <FaCode className="text-3xl" />,
      title: "Hỗ trợ nhiều ngôn ngữ",
      desc: "Python, JavaScript, C++, Java và nhiều ngôn ngữ khác"
    },
    {
      icon: <FaCloud className="text-3xl" />,
      title: "Đồng bộ đám mây",
      desc: "Sao lưu, khôi phục và chia sẻ code của bạn"
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

  const cloudFeatures = [
    {
      icon: <FaCloudUploadAlt className="text-3xl" />,
      title: "Lưu lên đám mây",
      desc: "Nhấn nút sync hoặc Ctrl+S để lưu file hiện tại lên cloud",
      steps: [
        "Mở file cần lưu trữ",
        "Nhấn nút Sync (biểu tượng đám mây) trên thanh công cụ",
        "Hoặc sử dụng phím tắt Ctrl+S",
        "File sẽ được lưu trữ an toàn trên cloud"
      ]
    },
    {
      icon: <FaCloudDownloadAlt className="text-3xl" />, 
      title: "Khôi phục từ đám mây",
      desc: "Khôi phục phiên bản trước đó của file từ cloud",
      steps: [
        "Mở file cần khôi phục",
        "Nhấn nút History (biểu tượng đồng hồ)",
        "Chọn phiên bản muốn khôi phục",
        "File sẽ được khôi phục về trạng thái đã chọn"
      ]
    },
    {
      icon: <FaShareSquare className="text-3xl" />,
      title: "Chia sẻ code",
      desc: "Chia sẻ file code với người khác qua link",
      steps: [
        "Click chuột phải vào file muốn chia sẻ",
        "Chọn 'Share' từ menu",
        "Link chia sẻ sẽ được copy vào clipboard",
        "Gửi link cho người muốn chia sẻ"
      ]
    },
    {
      icon: <FaHistory className="text-3xl" />,
      title: "Lịch sử phiên bản",
      desc: "Xem và khôi phục các phiên bản trước",
      steps: [
        "Click vào biểu tượng History của file",
        "Xem danh sách các phiên bản trước",
        "So sánh các thay đổi giữa các phiên bản",
        "Chọn phiên bản để khôi phục nếu cần"
      ]
    },
    {
      icon: <FaFileExport className="text-3xl" />,
      title: "Xuất file",
      desc: "Tải file về máy tính cá nhân",
      steps: [
        "Click chuột phải vào file",
        "Chọn 'Download' từ menu",
        "Chọn vị trí lưu file",
        "File sẽ được tải về máy"
      ]
    },
    {
      icon: <FaFileImport className="text-3xl" />,
      title: "Nhập file",
      desc: "Tải file từ máy tính lên editor",
      steps: [
        "Click nút Upload trên thanh công cụ",
        "Chọn file từ máy tính",
        "File sẽ được tải lên và mở trong editor",
        "Tự động đồng bộ với cloud khi thay đổi"
      ]
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
        { icon: <FaKeyboard />, key: "Ctrl + Shift + ]", desc: "M�� rộng vùng code" },
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
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Chào mừng đến với Code Editor
          </h2>
        </div>
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

        <button
          onClick={() => setShowCloudGuide(!showCloudGuide)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transform transition hover:-translate-y-0.5"
        >
          <span>{showCloudGuide ? "Ẩn hướng dẫn cloud" : "Xem hướng dẫn cloud"}</span>
          <FaChevronDown className={`transform transition-transform ${showCloudGuide ? "rotate-180" : ""}`} />
        </button>

        {showCloudGuide && (
          <div className="w-full max-w-6xl space-y-8 animate-fadeIn">
            <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Hướng Dẫn Tính Năng Cloud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cloudFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg transition-all hover:scale-105 ${
                    theme === "light"
                      ? "bg-gray-50 hover:bg-gray-100 shadow-md"
                      : "bg-gray-800/50 hover:bg-gray-800 shadow-lg"
                  }`}
                >
                  <div className={`flex items-center gap-4 mb-4`}>
                    <div className="text-blue-500">{feature.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold">{feature.title}</h4>
                      <p className="text-sm opacity-80">{feature.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Các bước thực hiện:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {feature.steps.map((step, idx) => (
                        <li key={idx} className="text-sm opacity-80 pl-2">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transform transition hover:-translate-y-0.5"
        >
          <span>{showShortcuts ? "Ẩn phím tắt" : "Xem phím tắt"}</span>
          <FaChevronDown className={`transform transition-transform ${showShortcuts ? "rotate-180" : ""}`} />
        </button>

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