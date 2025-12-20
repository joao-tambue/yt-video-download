import { Link } from 'lucide-react'
import { motion } from 'motion/react'

import When from './When'

export interface VideoSearchInputProps {
  url: string
  error: string | null
  loading: boolean
  setUrl: (url: string) => void
  handleProcessPlaylist: () => void
}

export function VideoSearchInput({
  url,
  error,
  setUrl,
  loading,
  handleProcessPlaylist,
}: VideoSearchInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-12"
    >
      <div className="bg-zinc-900 rounded-xl p-6 border border-violet-500/20 shadow-lg shadow-violet-500/10">
        <label htmlFor="playlist-url" className="block mb-3 text-sm text-gray-300">
          Cole o link da playlist do YouTube
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="playlist-url"
              type="text"
              value={url}
              disabled={loading}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcessPlaylist()}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="w-full bg-black border border-violet-500/30 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <button
            onClick={handleProcessPlaylist}
            disabled={loading || !url.trim()}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            <When expr={loading}>
                <When.Else><>Analizar</></When.Else>
                <>Analizando...</>
            </When>
          </button>
        </div>

        <When expr={error}>
          <p className="text-red-500 mt-4">{error}</p>
        </When>
      </div>
    </motion.div>
  )
}
