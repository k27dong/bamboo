export interface QRKeyResponse {
  code: number
  unikey: string
}

export interface QRCodeResponse {
  qrurl: string
  qrimg: string
}

export interface QRCheckResponse {
  code: number
  cookie: string
}

export interface StatGuildsRecord {
  name: string;
  id: string;
  joinedTimeClean: string;
}
