import React from 'react';
import { Modal } from 'antd';
import { User, Clock, FileText } from 'lucide-react';

// Custom styles for enhanced modal animations
const customModalStyles = `
  .print-success-modal .ant-modal-content {
    animation: modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .print-success-modal .ant-modal-mask {
    animation: fadeInBlur 0.4s ease-out;
  }
  
  @keyframes fadeInBlur {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(8px);
    }
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.85) translateY(50px) rotateX(10deg);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0) rotateX(0deg);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-delay-100 {
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }
  
  .animate-delay-200 {
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }
  
  .animate-delay-300 {
    animation: fadeInUp 0.6s ease-out 0.3s both;
  }
  
  .animate-delay-400 {
    animation: fadeInUp 0.6s ease-out 0.4s both;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  
  .shimmer-effect {
    animation: shimmer 2s infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4); }
  }
  
  .glow-effect {
    animation: glow 2s ease-in-out infinite;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('print-modal-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'print-modal-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = customModalStyles;
    document.head.appendChild(styleSheet);
  }
}

const PrintSuccessModal = ({ 
  isVisible, 
  onClose, 
  orderData, 
  onPrint 
}) => {
  const handleClose = () => {
    onClose();
  };

  const handlePrint = () => {
    if (orderData && onPrint) {
      onPrint(orderData, handleClose);
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={580}
      centered
      className="print-success-modal"
      closable={false}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)'
      }}
      styles={{
        content: {
          borderRadius: '24px',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        }
      }}
    >
      <div className="relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #059669 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
        </div>

        {/* Success Header with Enhanced Gradient */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 px-8 py-8 text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                {/* Main success icon with enhanced animation */}
                <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 relative overflow-hidden glow-effect">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg float-animation">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Inner glow effect */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                
                {/* Multiple animated rings */}
                <div className="absolute inset-0 w-20 h-20 border-3 border-white/40 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Success particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1 tracking-tight">Test Order Successfully Created!</h3>
                <p className="text-emerald-100 text-base font-medium">Ready for processing and patient care</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-200">Order ID: #{orderData?._id?.slice(-6) || 'NEW'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/40 group"
            >
              <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Modal Content */}
        <div className="px-8 py-8">
          {/* Enhanced Patient Info Card */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200/50 shadow-lg relative overflow-hidden animate-delay-100">
            {/* Card decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Patient Information</h4>
                  <p className="text-sm text-blue-600 font-medium">Complete order summary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Name</span>
                    <p className="font-bold text-gray-900 text-lg">{orderData?.patientName}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Count</span>
                    <p className="font-bold text-blue-600 text-lg">{orderData?.tests?.length} test(s)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Amount</span>
                    <p className="font-bold text-emerald-600 text-2xl">৳{orderData?.totalAmount}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</span>
                    <p className="font-bold text-gray-900 text-lg">{orderData?.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Print Question Section */}
          <div className="text-center mb-8 animate-delay-200">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-amber-200 float-animation">
                <FileText className="w-10 h-10 text-amber-600" />
              </div>
              {/* Floating notification dot */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready to Print Report?</h4>
            <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
              Generate and print the professional test report now, or access it later from the Test Orders management dashboard.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-4 animate-delay-400">
            <button
              onClick={handleClose}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Clock className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">Print Later</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">Print Now</span>
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 shimmer-effect transform -skew-x-12"></div>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PrintSuccessModal;
