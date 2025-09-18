import type React from "react"

const EventsPage: React.FC = () => {
  const events = [
    {
      id: "1",
      title: "Comic Con 2024",
      image: "/placeholder.svg?height=200&width=400",
      date: "July 20-23, 2024",
      location: "San Diego Convention Center",
      price: "$75",
    },
    {
      id: "2",
      title: "Music Festival Live",
      image: "/placeholder.svg?height=200&width=400",
      date: "August 15-17, 2024",
      location: "Central Park",
      price: "$120",
    },
    {
      id: "3",
      title: "Gaming Championship",
      image: "/placeholder.svg?height=200&width=400",
      date: "September 5-7, 2024",
      location: "Madison Square Garden",
      price: "$50",
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-gray-400 mb-2">{event.date}</p>
              <p className="text-gray-400 mb-4">{event.location}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold text-lg">{event.price}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventsPage
