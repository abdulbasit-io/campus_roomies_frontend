const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4000';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-campus">Campus Roomies</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Find a room. Find your people.</h1>
        <p className="mt-6 max-w-xl text-lg text-stone-600">Housing around your campus, made easier.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a className="rounded-xl bg-campus px-5 py-3 font-semibold text-white" href="/browse">Browse rooms</a>
          <a className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold" href="/listings/new">List a room</a>
        </div>
        <p className="mt-12 text-sm text-stone-500">API configured at {apiOrigin}</p>
      </div>
    </main>
  );
}
