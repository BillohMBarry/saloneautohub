import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-xs font-mono text-amber-500 uppercase tracking-wider">
          404 · Page Not Found
        </p>
        <h1 className="text-3xl font-bold font-display text-white">
          Workshop Bay or Part Listing Not Found
        </h1>
        <p className="text-sm text-zinc-400">
          The page you requested could not be located. Return to the SaloneAutoHub catalog to
          browse verified spare parts and certified mechanics.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors"
          >
            Return to SaloneAutoHub Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
