import { Loader } from "lucide-react";
import { motion } from "motion/react";

export function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Loader className="w-16 h-16 text-violet-500 animate-spin mb-4" />
      <p className="text-gray-400">Analisando playlist...</p>
    </motion.div>
  )
}
