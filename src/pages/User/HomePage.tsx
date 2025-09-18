import React from "react";
import { Button } from "../../components/UI/button";
import { Eye, Heart } from "lucide-react";
import image1 from "../../assets/movieImage/greedy-people-movie-poster.png";
import image2 from "../../assets/movieImage/the-union-movie-poster.png";
import image3 from "../../assets/movieImage/placeholder-6tu51.png";
import image4 from "../../assets/movieImage/generic-tornado-movie-poster.png";
import image5 from "../../assets/movieImage/back-to-black-poster.png";
import image6 from "../../assets/movieImage/the-movie-poster.png";
import bgImage from "../../assets/movieImage/dark-trees-thrones.png";
import shogunImage from "../../assets/movieImage/shogun-samurai.png";

const HomePage: React.FC = () => {
  const trendingShows = [
    { title: "Greedy People", image: image1 },
    { title: "The Union", image: image2 },
    { title: "Oddity", image: image3 },
    { title: "Twisters", image: image4 },
    { title: "Back to Black", image: image5 },
    { title: "Tue", image: image6 },
  ];

  const renderCard = (show: any) => (
    <div className="sm:w-40 xl:w-1/6 flex-shrink-0">
      <div className="h-56 bg-gray-200 rounded-lg overflow-hidden relative">
        <img
          src={show.image || "/placeholder.svg"}
          alt={show.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <p className="text-white text-sm font-medium">{show.title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Hero Section */}
        <div className="relative h-80 bg-gradient-to-r from-gray-900 to-gray-700 overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center rounded-2xl opacity-60"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center p-3">
            <h1 className="text-4xl font-bold text-white mb-2">Game of</h1>
            <h1 className="text-4xl font-bold text-white mb-4">Thrones</h1>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                Action
              </span>
              <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                Adventure
              </span>
              <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                Drama
              </span>
            </div>
            <p className="text-white text-sm mb-6 max-w-md">
              It's the story of the intricate and bloody battles of several noble
              families in the fictional land of Westeros. The series follows the
              members of House Stark and the Targaryens, fight for control of the
              Iron Throne. The symbol of power in the Seven Kingdoms.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-[#fff200] text-[#113293] hover:bg-yellow-300 font-medium px-6">
                BOOK NOW
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#113293] bg-transparent"
              >
                MORE
              </Button>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-8 h-8 bg-[#fff200] rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#113293]" />
            </div>
            <div className="w-8 h-8 bg-[#fff200] rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#113293]" />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Trending */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
              <span className="text-[#113293] hover:underline cursor-pointer">
                View All
              </span>
            </div>
  <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {trendingShows.map(renderCard)}</div>
          </section>

          {/* Ticket Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Events</h2>
              <span className="text-[#113293] hover:underline cursor-pointer">
                View All
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="relative h-64 bg-gradient-to-r from-teal-600 to-red-600 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url(${shogunImage})` }}
                />
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-white text-sm mb-2">
                      Uncovering Secrets, Shifting Powers
                    </p>
                    <h3 className="text-3xl font-bold text-[#fff200] mb-4">Shogun</h3>
                    <p className="text-white text-sm">
                      When a mysterious European ship sinks near a nearby fishing
                      village, Lord Yoshi Toranaga uncovers secrets that could tip
                      the balance of power and threaten his realm.
                    </p>
                  </div>
                  <Button className="bg-[#fff200] text-[#113293] hover:bg-yellow-300 w-fit">
                    BOOK NOW
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Ticket Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Non-Ticket Events</h2>
              <span className="text-[#113293] hover:underline cursor-pointer">
                View All
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="relative h-64 bg-gradient-to-r from-teal-600 to-red-600 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{ backgroundImage: `url(${shogunImage})` }}
                />
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-white text-sm mb-2">
                      Uncovering Secrets, Shifting Powers
                    </p>
                    <h3 className="text-3xl font-bold text-[#fff200] mb-4">Shogun</h3>
                    <p className="text-white text-sm">
                      When a mysterious European ship sinks near a nearby fishing
                      village, Lord Yoshi Toranaga uncovers secrets that could tip
                      the balance of power and threaten his realm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Other Sections */}
          {["Trending Music", "Trending Spiritual", "Trending Drama", "My Watchlist"].map(
            (section) => (
              <section key={section}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{section}</h2>
                  <span className="text-[#113293] hover:underline cursor-pointer">
                    View All
                  </span>
                </div>
  <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {trendingShows.map(renderCard)}</div>
              </section>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
