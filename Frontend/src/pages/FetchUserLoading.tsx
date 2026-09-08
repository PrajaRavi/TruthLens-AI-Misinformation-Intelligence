import { motion } from "framer-motion";

export default function FullScreenLoader({ text = "Loading..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-14 h-14 rounded-full border-4 border-[#6177EF] border-t-transparent"
        />

        {/* Text */}
        <p className="text-white text-sm tracking-wide">{text}</p>
      </div>
    </motion.div>
  );
}
