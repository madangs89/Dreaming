import React, { useEffect } from "react";
import type { TopicData } from "./topic.types";
import { useQuery } from "@tanstack/react-query";
import { fetchTopics } from "./topic.api";
import { useAppSelector } from "../../app/hook";
import toast from "react-hot-toast";
import { TopicSkeleton } from "./Components/TopicSkeleton";

const Topic = () => {
  const authSliceDetails = useAppSelector((state) => state.auth);
  const topicQuery = useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled:
      authSliceDetails.isAuthenticated && authSliceDetails.user?.id
        ? true
        : false,
  });

  const topicData: TopicData[] = topicQuery.data || [];

  useEffect(() => {
    if (topicQuery.isError) {
      toast.error("Failed to fetch topics! Please try again later.");
    }
  }, [topicQuery.isError]);

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
        <h1 className="text-2xl font-bold">Start Learning</h1>

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
      {topicQuery.isLoading ? (
        <TopicSkeleton />
      ) : topicData && topicData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {topicData.map((topic) => (
            <div
              key={topic.id}
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
                src={
                  topic.source_url || "https://picsum.photos/600/400?random=1"
                }
                alt={topic.title}
                className="w-full aspect-video object-cover rounded-xl"
              />

              <div className="mt-4">
                <h3 className="text-xl font-semibold">{topic.title}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {topic._count?.notes || 0} Notes
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
      ) : (
        <div className="flex items-center justify-center min-h-[300px]">
          <h2 className="text-center text-gray-500 text-lg">
            No topics found! Please create a new topic to start learning.
          </h2>
        </div>
      )}
    </div>
  );
};

export default Topic;
