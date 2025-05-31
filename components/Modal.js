// components/Modal.js
export default function Modal({ show, onClose, children, title }) {
  if (!show) return null;
  return (
    
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative animate-pop"
        onClick={e => e.stopPropagation()} // Supaya klik di dalam modal tidak menutup modal
      >
        {/* Title (opsional) */}
        {title && (
          <div className="text-lg font-bold text-blue-600 mb-4">{title}</div>
        )}

        {/* Tombol close */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl"
          onClick={onClose}
          aria-label="Tutup"
          type="button"
        >
          ×
        </button>

        {/* Konten modal */}
        {children}
      </div>
      <style jsx>{`
        @keyframes pop {
          0% { opacity: 0; transform: scale(.85);}
          70% { opacity: .9; transform: scale(1.05);}
          100% { opacity: 1; transform: scale(1);}
        }
        .animate-pop { animation: pop .28s cubic-bezier(.65,0,.35,1);}
      `}</style>
    </div>
  );
}
