import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Landing Page Builder</h1>
        <p className="text-lg mb-8">Create beautiful landing pages with drag and drop simplicity</p>
        <Link href="/builder">
          <Button size="lg" className="font-semibold">
            Start Building
          </Button>
        </Link>
      </div>
    </main>
  );
}
