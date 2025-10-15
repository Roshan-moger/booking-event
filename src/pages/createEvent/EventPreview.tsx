
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, Users, MapPin, Star } from "lucide-react"
import { Button } from "../../components/UI/button"


interface EventCategory {
  name: string
  price: number
}

interface SeatLayout {
  row: string
  number: number
  categoryName: string
}

interface EventFormData {
  eventName: string
  description: string
  venueId: number
  selectedDate: Date | null
  selectedTime: Date | null
  selectedTags: string[]
  ticketType: "WITH_TICKETING" | "PROMOTION_ONLY"
  seatingType: "GENERAL_ADMISSION" | "SEAT_LAYOUT"
  capacity: string
  ticketPrice: string
  rows: string
  columns: string
  categories: EventCategory[]
  layout: SeatLayout[]
  posterImage?: File
}

const EventPreview = ({
  formData,
  image,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  formData: EventFormData
  image: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-card p-4 sm:p-6">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">Event Preview</h1>
        <p className="text-muted-foreground text-lg">Review your event details before publishing</p>
      </div>

      <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-accent via-accent/90 to-accent/80">
          {image ? (
            <img src={`https://spot.app.codevicesolution.in/api/${formData.posterImage}`} alt="Event Poster" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center">
              <div className="text-accent-foreground text-center px-4">
                <div className="text-5xl sm:text-7xl mb-4 opacity-90">🎭</div>
                <p className="text-lg sm:text-xl opacity-80 font-medium">Event Poster Placeholder</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
            <div className="p-6 sm:p-10 text-white w-full">
              <h2 className="text-3xl sm:text-5xl font-bold mb-2 text-balance leading-tight">
                {formData.eventName || "Event Name"}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-lg font-medium">Premium Event</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group flex items-center gap-4 p-6 bg-gradient-to-r from-card to-muted/50 rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">Event Date</p>
                <p className="font-bold text-lg text-card-foreground">
                  {formData.selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) || "Date not selected"}
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-4 p-6 bg-gradient-to-r from-card to-muted/50 rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300">
              <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">Event Time</p>
                <p className="font-bold text-lg text-card-foreground">
                  {formData.selectedTime?.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }) || "Time not selected"}
                </p>
              </div>
            </div>
          </div>

          {formData.ticketType === "WITH_TICKETING" && (
            <div className="bg-gradient-to-r from-secondary via-secondary/95 to-secondary/90 rounded-2xl p-8 text-secondary-foreground shadow-xl border border-border/20">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <Users className="h-6 w-6 text-accent-foreground" />
                    </div>
                    Event Ticketing
                  </h3>
                  <p className="text-secondary-foreground/80 text-lg">Secure your spot at this exclusive event</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 text-center sm:text-right">
                  {formData.seatingType === "GENERAL_ADMISSION" && (
                    <>
                      <div className="bg-secondary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-3xl font-bold text-accent-foreground">₹{formData.ticketPrice || "0"}</p>
                        <p className="text-sm text-secondary-foreground/70 font-medium">per ticket</p>
                      </div>
                      <div className="bg-secondary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-3xl font-bold text-accent-foreground">{formData.capacity || "0"}</p>
                        <p className="text-sm text-secondary-foreground/70 font-medium">total capacity</p>
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          )}

          {formData.selectedTags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-card-foreground flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Tag className="h-5 w-5 text-accent" />
                </div>
                Event Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {formData.selectedTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-5 py-3 bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-card-foreground">About This Event</h3>
            <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
              <p className="text-muted-foreground text-base leading-relaxed">
                {formData.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-6 border-2 border-border rounded-2xl hover:border-accent/50 transition-colors">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Ticketing Type
                </p>
                <p className="font-bold text-card-foreground capitalize">
                  {formData.ticketType === "WITH_TICKETING" ? "With Ticketing" : "Promotion Only"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 border-2 border-border rounded-2xl hover:border-accent/50 transition-colors">
              <div className="p-3 bg-accent/10 rounded-xl">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">Seating Type</p>
                <p className="font-bold text-card-foreground capitalize">
                  {formData.seatingType === "GENERAL_ADMISSION"
                    ? "General Admission"

                      : "Seat Layout"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-gradient-to-r from-muted/30 to-card/50 flex flex-col sm:flex-row justify-between gap-4 border-t border-border/50">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous Step
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            size="lg"
       
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground"></div>
                Creating Event...
              </>
            ) : (
              <>
                Create Event
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  </div>
)

export default EventPreview
