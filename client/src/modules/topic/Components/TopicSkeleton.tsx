export const TopicSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="
            bg-white
            rounded-2xl
            border
            border-[#DFE2E9]
            p-3
            animate-pulse
          "
        >
          <div className="w-full aspect-video rounded-xl bg-gray-200" />

          <div className="mt-4 space-y-3">
            <div className="h-6 w-3/4 rounded bg-gray-200" />

            <div className="h-4 w-1/3 rounded bg-gray-200" />

            <div className="h-10 w-full rounded-lg bg-gray-200 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
};
