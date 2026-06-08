import React from "react";

const Topic = () => {
  const topics = [
    {
      title: "React Fundamentals",
      source_url: "https://picsum.photos/600/400?random=1",
      notes: 12,
      reviews: 3,
    },
    {
      title: "Node.js Backend",
      source_url: "https://picsum.photos/600/400?random=2",
      notes: 8,
      reviews: 2,
    },
    {
      title: "System Design",
      source_url: "https://picsum.photos/600/400?random=3",
      notes: 15,
      reviews: 5,
    },
    {
      title: "Docker",
      source_url: "https://picsum.photos/600/400?random=4",
      notes: 10,
      reviews: 1,
    },
    {
      title: "Kubernetes",
      source_url: "https://picsum.photos/600/400?random=5",
      notes: 7,
      reviews: 2,
    },
    {
      title: "Machine Learning",
      source_url: "https://picsum.photos/600/400?random=6",
      notes: 20,
      reviews: 6,
    },
  ];

  return (
    <div className="lg:px-12 p-4 w-full h-[calc(100vh-90px)] overflow-y-auto">
      {/* Welcome Banner */}
      {/* <div className="bg-[#F5F3FF] border border-[#E9E4FF] rounded-xl p-5 mb-6">
        <h2 className="text-xl font-semibold">
          👋 Welcome Back, Madan
        </h2>

        <p className="text-gray-600 mt-1">
          Continue your learning journey and stay consistent
          with your revision schedule.
        </p>
      </div> */}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Start Learning
        </h1>

        <button
          className="
            px-5 py-2
            bg-black
            text-white
            rounded-lg
            text-sm
            font-medium
            hover:bg-zinc-800
            transition
          "
        >
          + New Topic
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.title}
            className="
              bg-white
              rounded-2xl
              border
              border-[#DFE2E9]
              p-3
              hover:shadow-lg
              transition-all
              duration-300
            "
          >
            <img
              src={topic.source_url}
              alt={topic.title}
              className="
                w-full
                aspect-video
                object-cover
                rounded-xl
              "
            />

            <div className="mt-4">
              <h3 className="text-xl font-semibold">
                {topic.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {topic.notes} Notes • Review #{topic.reviews}
              </p>

              <button
                className="
                  mt-4
                  w-full
                  py-2.5
                  rounded-lg
                  bg-[#313131]
                  text-white
                  text-sm
                  font-medium
                  hover:bg-[#424242]
                  transition
                "
              >
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topic;