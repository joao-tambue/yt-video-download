import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Download, Youtube } from 'lucide-react'

import When from '../components/When'
import { List } from '../components/List'
import { BASE_URL } from '../constants/api'
import { Loading } from '../components/Loading'
import { usePlaylist } from '../hooks/use-playlist'
import { VideoSearchInput } from '../components/VideoSearchInput'

interface Video {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  selected: boolean
  url: string
}

type Stage = 'idle' | 'downloading' | 'zipping' | 'done' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const { analyzePlaylist, data, loading, error } = usePlaylist()

  const [videos, setVideos] = useState<Video[]>([])

  // 🔥 PROGRESS STATE
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<Stage>('idle')

  useEffect(() => {
    if (data?.videos) {
      const processedVideos = data.videos.map((video) => ({
        id: video.id,
        title: video.title,
        description: '',
        duration: formatDuration(video.duration),
        thumbnail: video.thumbnail,
        selected: true,
        url: video.url,
      }))

      setVideos(processedVideos)
    }
  }, [data])

  const handleProcessPlaylist = async () => {
    if (!url.trim()) return

    await analyzePlaylist(url)
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const toggleVideoSelection = (id: string) => {
    setVideos(
      videos.map((video) => (video.id === id ? { ...video, selected: !video.selected } : video))
    )
  }

  const selectAll = () => {
    setVideos(videos.map((video) => ({ ...video, selected: true })))
  }

  const deselectAll = () => {
    setVideos(videos.map((video) => ({ ...video, selected: false })))
  }

  const handleDownload = async () => {
    try {
      const selectedVideos = videos
        .filter((v) => v.selected)
        .map((v) => ({ url: v.url }))

      if (selectedVideos.length === 0) return

      setProgress(0)
      setStage('downloading')

      const response = await fetch(`${BASE_URL}/downloads/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: selectedVideos }),
      })

      if (!response.ok) {
        throw new Error('Erro ao iniciar download')
      }

      const data = await response.json()
      setJobId(data.job_id)
    } catch (err: any) {
      console.error(err)
      setStage('error')
      alert(err.message || 'Erro inesperado')
    }
  }

  // ===============================
  // WEBSOCKET PROGRESS
  // ===============================
  useEffect(() => {
    if (!jobId) return

    const ws = new WebSocket(
      `${BASE_URL.replace('http', 'ws')}/ws/progress/${jobId}`
    )

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setProgress(data.percent)
      setStage(data.stage)

      if (data.stage === 'done' || data.stage === 'error') {
        ws.close()
      }
    }

    ws.onerror = () => {
      setStage('error')
      ws.close()
    }

    return () => ws.close()
  }, [jobId])

  // ===============================
  // DOWNLOAD ZIP WHEN DONE
  // ===============================
  useEffect(() => {
    if (stage !== 'done' || !jobId) return

    const downloadZip = async () => {
      const response = await fetch(`${BASE_URL}/downloads/download/${jobId}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      a.download = 'videos.zip'
      document.body.appendChild(a)
      a.click()

      a.remove()
      window.URL.revokeObjectURL(url)

      setJobId(null)
      setProgress(0)
      setStage('idle')
    }

    downloadZip()
  }, [stage, jobId])

  const improveDurationFormat = (duration: string) => {
    const parts = duration.split(':')

    if (parts[0].length > 2) {
      const hours = parts[0].slice(0, parts[0].length - 2)
      const minutes = parts[0].slice(-2)

      return `${hours}:${minutes}:${parts[1]}`
    }

    return duration
  }

  const selectedCount = videos.filter((v) => v.selected).length

  console.log('VIDEOS: ', videos)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-violet-500" />
            <h1 className="text-3xl tmd:ext-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              YouTube Playlist Downloader
            </h1>
          </div>
          <p className="text-gray-400">Baixe todas as vídeo aulas de uma playlist de uma só vez</p>
        </motion.div>

        <VideoSearchInput
          url={url}
          error={error}
          loading={loading}
          setUrl={setUrl}
          handleProcessPlaylist={handleProcessPlaylist}
        />

        <AnimatePresence>
          <When expr={loading}>
            <Loading />
          </When>
        </AnimatePresence>

        <When expr={data?.videos && !loading}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-semibold text-violet-400">
                  {data?.title} ({data?.count_videos})
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-gray-400">
                    {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-500 rounded text-sm font-medium transition-colors"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm font-medium transition-colors"
                  >
                    Desselecionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <List<Video> items={videos}>
                  {({ item, index }) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => toggleVideoSelection(item.id)}
                      className={`bg-zinc-900 rounded-lg p-4 border transition-all cursor-pointer hover:scale-[1.02] ${
                        item.selected
                          ? 'bg-violet-600 shadow-lg shadow-violet-500/10 border-violet-400'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="relative flex items-center gap-4">
                        <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg` || '/yt-icon.png'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs">
                            {improveDurationFormat(item.duration)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{item.title}</h3>

                          <p className="text-sm text-gray-500 mt-1">Duração: {item.duration}</p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            item.selected ? 'bg-transparent border-violet-400' : 'border-gray-600'
                          }`}
                        >
                          <When expr={item.selected}>
                            <Check className="w-4 h-4 text-violet-400" />
                          </When>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </List>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="sticky bottom-6 bg-zinc-900 rounded-xl p-6 border border-violet-500/20 shadow-2xl shadow-violet-500/20"
              >
                {/* 🔥 PROGRESS BAR */}
                {stage !== 'idle' && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>
                        {stage === 'downloading' && 'Baixando vídeos'}
                        {stage === 'zipping' && 'Compactando arquivos'}
                        {stage === 'done' && 'Concluído'}
                        {stage === 'error' && 'Erro'}
                      </span>
                      <span>{progress}%</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleDownload}
                  disabled={selectedCount === 0 || stage !== 'idle'}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 rounded-lg font-semibold flex items-center justify-center gap-3"
                >
                  <Download />
                  Baixar {selectedCount} vídeo(s)
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </When>
      </div>
    </div>
  )
}