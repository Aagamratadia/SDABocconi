export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-14 w-14 animate-spin rounded-full border-4 border-[#003E68]/20 border-t-[#FBCE0C]"
          aria-hidden
        />
        <p className="text-sm tracking-wide text-[#003E68] font-medium">
          Loading Dashboard…
        </p>
      </div>
    </div>
  );
}