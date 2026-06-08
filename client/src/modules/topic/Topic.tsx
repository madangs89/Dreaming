import React from "react";

const Topic = () => {
  const topics = [
    {
      title: "React Fundamentals",
      source_url: "https://picsum.photos/600/400?random=1",
    },
    {
      title: "Node.js Backend",
      source_url: "https://picsum.photos/600/400?random=2",
    },
    {
      title: "System Design",
      source_url: "https://picsum.photos/600/400?random=3",
    },
    {
      title: "Docker",
      source_url: "https://picsum.photos/600/400?random=4",
    },
    {
      title: "Kubernetes",
      source_url: "https://picsum.photos/600/400?random=5",
    },
    {
      title: "Machine Learning",
      source_url: "https://picsum.photos/600/400?random=6",
    },
    {
      title: "Data Structures",
      source_url: "https://picsum.photos/600/400?random=7",
    },
    {
      title: "Operating Systems",
      source_url: "https://picsum.photos/600/400?random=8",
    },
    {
      title: "Computer Networks",
      source_url: "https://picsum.photos/600/400?random=9",
    },
    {
      title: "PostgreSQL",
      source_url: "https://picsum.photos/600/400?random=10",
    },
  ];

  return (
    <div className="lg:px-12 p-4  h-screen overflow-x-hidden w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 content-start gap-2">
      {topics.map((topic) => {
        return (
          <div className="w-full bg-white p-3 h-72 rounded-xl border border-[#DFE2E9] overflow-hidden flex flex-col gap-3">
            <img
              src={topic.source_url}
              alt={topic.title}
              className="w-full h-[85%] object-cover rounded-xl"
            />
            <div className="flex justify-between items-center lg:flex-row flex-col">
              <p className="font-semibold  text-xl">{topic.title}</p>

              <button
                className="px-4 py-1.5 bg-[#313131] hidden lg:block
                      tracking-[0.1rem]
          font-semibold
          text-white rounded-md text-[12px]  hover:bg-[#424242] transition-colors duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Topic;
