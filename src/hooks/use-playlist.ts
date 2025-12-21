import { useState } from "react";
import { api } from "../services/api";

export type PlaylistVideo = {
  id: string;
  thumbnail: string;
  title: string;
  duration: number;
  url: string
  selected: boolean
};

export type PlaylistResponse = {
  title: string;
  count_videos: number;
  videos: PlaylistVideo[];
};

export function usePlaylist() {
  const [data, setData] = useState<PlaylistResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // async function analyzePlaylist(url: string) {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const response = await api.post<PlaylistResponse>(
  //       "/api/v1/playlists/",
  //       null,
  //       {
  //         params: {
  //           playlist_url: url,
  //         },
  //       }
  //     );

  //     setData(response.data);
  //   } catch (err: any) {
  //     setError(
  //       err.response?.data?.detail?.[0]?.msg ||
  //       "Erro ao analisar playlist"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }


  async function analyzePlaylist(url: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<PlaylistResponse>(
        "/playlists/",
        {
          url: url,
        }
      );

      setData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail?.[0]?.msg ||
        "Erro ao analisar playlist"
      );
    } finally {
      setLoading(false);
    }
  }



  return {
    data,
    loading,
    error,
    analyzePlaylist,
  };
}