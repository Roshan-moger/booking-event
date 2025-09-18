
import  React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"

interface MovieCardProps {
  id: string
  title: string
  image: string
  hoverImage: string
  year?: string
  genre?: string
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, image, hoverImage, year, genre }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link to={`/detail/${id}`}>
      <div
        className="relative group cursor-pointer transform transition-transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <img
            src={isHovered ? hoverImage : image}
            alt={title}
            className="w-full h-64 object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            {year && <p className="text-xs text-gray-300">{year}</p>}
            {genre && <p className="text-xs text-gray-300">{genre}</p>}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard
