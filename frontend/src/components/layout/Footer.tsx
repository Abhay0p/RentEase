import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2 text-white">
            <Image src="/logo.png" alt="RentEase Logo" width={32} height={32} className="invert brightness-0" />
            <span className="text-xl font-bold tracking-tight">RentEase</span>
          </Link>
          <p className="text-sm text-slate-400">
            Your gateway to hassle-free living. We connect premium properties with verified tenants.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Discover</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-primary transition-colors">Properties</Link></li>
            <li><Link href="/locations" className="hover:text-primary transition-colors">Locations</Link></li>
            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        © {new Date().getFullYear()} RentEase Inc. All rights reserved.
      </div>
    </footer>
  );
}
