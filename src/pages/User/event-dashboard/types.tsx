export type SeatStatus = "AVAILABLE" | "BOOKED" | string

export interface Seat {
  status: SeatStatus
}

export interface Event {
  id: number
  title: string
  description: string
  categoryName: string
  ratings: number
  status: "ACTIVE" | "INACTIVE" | string
  imageUrls?: string[]
  startDate: string
  endDate: string
  venueName: string
  venueId?: number | string
  rows: number
  columns: number
  seatingType: string
  capacity: number
  totalSeats: number
  seats?: Seat[]
  ticketPrice: number
  organizerFeeAmount: number
  organizerFeeStatus: "PAID" | "UNPAID" | string
  mode: string
  hasActiveAd?: boolean
}
