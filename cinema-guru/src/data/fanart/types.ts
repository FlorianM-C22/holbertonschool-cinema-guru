export type FanartImageItem = {
  id: string
  url: string
  lang: string
  likes: string
}

export type FanartMovieResponse = {
  name?: string
  tmdb_id?: string
  imdb_id?: string
  hdmovielogo?: FanartImageItem[]
  moviebackground?: FanartImageItem[]
}

export type FanartTvResponse = {
  name?: string
  tmdb_id?: string
  clearlogo?: FanartImageItem[]
  hdtvlogo?: FanartImageItem[]
  showbackground?: FanartImageItem[]
}

export type FanartMovieArt = {
  logoUrl: string | null
  backgroundUrl: string | null
}

export type FanartTvArt = {
  logoUrl: string | null
  backgroundUrl: string | null
}
