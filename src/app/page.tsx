import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">DojoFlow</h1>
      <p className="mb-8 text-lg text-muted-foreground">Franchise CRM Solution</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Login
        </Link>
      </div>
    </main>
  );
}

