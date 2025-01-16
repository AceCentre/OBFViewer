export interface OBFButton {
  id: string
  label: string
  image_id?: string
  load_board?: {
    id?: string
    path?: string
    data_url?: string
    url?: string
    name?: string
  }
  border_color?: string
  background_color?: string
  vocalization?: string
  action?: string
}

export interface OBFImage {
  id: string
  url?: string
  data?: string
  path?: string
  width: number
  height: number
  content_type: string
}

export interface OBFGrid {
  rows: number
  columns: number
  order: (string | null)[][]
}

export interface OBFBoard {
  format: string
  id: string
  locale?: string
  url?: string
  name: string
  buttons: OBFButton[]
  grid: OBFGrid
  images: OBFImage[]
}

export interface OBZManifest {
  format: string
  root: string
  paths: {
    boards: Record<string, string>
    images: Record<string, string>
    sounds: Record<string, string>
  }
}

