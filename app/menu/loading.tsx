export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfaf8]">

      {/* Hero skeleton */}
      <div className="relative h-[40vh] bg-stone-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-3 w-24 bg-stone-700 rounded-full mx-auto animate-pulse" />
          <div className="h-10 w-72 bg-stone-700 rounded-full mx-auto animate-pulse" />
          <div className="h-1 w-20 bg-stone-700 rounded-full mx-auto animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2rem] bg-stone-200 animate-pulse aspect-square"
            />
          ))}
        </div>
      </div>

    </div>
  );
}