
import type React from "react"
import { useParams } from "react-router-dom"

const DetailPage: React.FC = () => {
  const { id } = useParams()

  const castMembers = [
    { name: "Paddy Considine", character: "King Viserys", image: "/placeholder.svg?height=80&width=80" },
    { name: "Emma D'Arcy", character: "Princess Rhaenyra", image: "/placeholder.svg?height=80&width=80" },
    { name: "Matt Smith", character: "Prince Daemon", image: "/placeholder.svg?height=80&width=80" },
    { name: "Olivia Cooke", character: "Alicent Hightower", image: "/placeholder.svg?height=80&width=80" },
    { name: "Rhys Ifans", character: "Otto Hightower", image: "/placeholder.svg?height=80&width=80" },
    { name: "Steve Toussaint", character: "Lord Corlys", image: "/placeholder.svg?height=80&width=80" },
    { name: "Eve Best", character: "Princess Rhaenys", image: "/placeholder.svg?height=80&width=80" },
  ]

  const episodes = [
    { title: "The Heirs of the Dragon", duration: "66 min", rating: "8.9" },
    { title: "The Rogue Prince", duration: "54 min", rating: "8.7" },
    { title: "Second of His Name", duration: "63 min", rating: "8.2" },
    { title: "King of the Narrow Sea", duration: "62 min", rating: "8.6" },
    { title: "We Light the Way", duration: "64 min", rating: "8.8" },
  ]

  const comments = [
    {
      user: "John Anderson",
      time: "2 days ago",
      rating: 5,
      comment: "Absolutely incredible series! The production value is through the roof and the acting is phenomenal.",
    },
    {
      user: "Sarah Chen",
      time: "1 week ago",
      rating: 4,
      comment:
        "Great continuation of the Game of Thrones universe. Much better pacing than the original series finale.",
    },
    {
      user: "Michael Torres",
      time: "2 weeks ago",
      rating: 5,
      comment: "The dragons look amazing! Visual effects team outdid themselves.",
    },
    {
      user: "Emily Rodriguez",
      time: "3 weeks ago",
      rating: 4,
      comment: "Compelling characters and storyline. Can't wait for the next season!",
    },
  ]

  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="relative h-96 rounded-lg overflow-hidden mb-8">
        <img
          src="/placeholder.svg?height=400&width=1200"
          alt="House of the Dragon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">House of the Dragon</h1>
          <div className="flex items-center space-x-4 mb-4">
            <span className="bg-yellow-400 text-black px-2 py-1 rounded text-sm font-semibold">Drama</span>
            <span className="text-gray-300">Fantasy</span>
            <span className="text-gray-300">Action</span>
          </div>
          <p className="text-gray-300 mb-6 leading-relaxed">
            The Targaryen civil war begins. House of the Dragon tells the story of an internal succession war within
            House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.
          </p>
          <div className="flex space-x-4">
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
              Watch Now
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors">
              Add to List
            </button>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full">
          <span className="text-sm font-semibold">8.5 ★</span>
        </div>
      </div>

      {/* Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Released:</span>
                <span className="text-white ml-2">August 21, 2022</span>
              </div>
              <div>
                <span className="text-gray-400">Runtime:</span>
                <span className="text-white ml-2">60 min</span>
              </div>
              <div>
                <span className="text-gray-400">Genre:</span>
                <span className="text-white ml-2">Drama, Fantasy, Action</span>
              </div>
              <div>
                <span className="text-gray-400">Director:</span>
                <span className="text-white ml-2">Miguel Sapochnik</span>
              </div>
            </div>
          </div>

          {/* Cast */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {castMembers.map((member, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover mb-2"
                  />
                  <p className="text-white text-xs font-medium">{member.name}</p>
                  <p className="text-gray-400 text-xs">{member.character}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Episodes */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>
            <div className="space-y-3">
              {episodes.map((episode, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="text-white font-medium">{episode.title}</h3>
                    <p className="text-gray-400 text-sm">{episode.duration}</p>
                  </div>
                  <div className="text-yellow-400 font-semibold">{episode.rating} ★</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Reviews</h2>

          {/* Add Review */}
          <div className="mb-6">
            <textarea
              placeholder="Write a comment for this movie..."
              className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
              Post Comment
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-700 pb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">{comment.user[0]}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{comment.user}</p>
                    <p className="text-gray-400 text-xs">{comment.time}</p>
                  </div>
                  <div className="ml-auto text-yellow-400 text-sm">{"★".repeat(comment.rating)}</div>
                </div>
                <p className="text-gray-300 text-sm">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPage
