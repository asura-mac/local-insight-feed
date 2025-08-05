import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-dark-surface text-dark-text-secondary border-t border-dark-border pt-10 pb-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left: Logo + Brand + Tagline */}
        <div className="flex flex-col space-y-3">
          <Link to="/" className="flex items-center space-x-2 mb-2">
            <img src="/satark_logo.png" alt="Satark Logo" className="h-8 w-auto object-contain" style={{ maxWidth: 40 }} />
            <span className="font-bold text-lg text-gray-900">Satark</span>
          </Link>
          <p className="text-sm text-dark-text-muted">Stay alert with real-time emergency notifications and trusted news updates.</p>
          <p className="text-xs text-dark-text-muted mt-2">&copy; {new Date().getFullYear()} Satark. All rights reserved.</p>
        </div>
        {/* Middle: Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-dark-accent transition-colors">Home</Link></li>
            <li><Link to="/alerts" className="hover:text-dark-accent transition-colors">Alerts</Link></li>
            {/* <li><Link to="/privacy" className="hover:text-dark-accent transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-dark-accent transition-colors">Terms of Service</Link></li> */}
          </ul>
        </div>
        {/* About/Contact */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">About</h4>
          <p className="text-sm text-dark-text-muted mb-2">Satark is your trusted platform for emergency alerts and verified news, helping you stay safe and informed.</p>
          <h4 className="font-semibold text-gray-900 mt-4 mb-2">Contact</h4>
          <p className="text-sm text-dark-text-muted">Email: <a href="mailto:contactus@evoolfoundation.org" className="hover:text-dark-accent">contactus@evoolfoundation.org</a></p>
        </div>
        {/* Social/Newsletter/Emergency */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
          <div className="flex space-x-3 mb-4">
            <a href="https://x.com/evoolfoundation?s=21" className="hover:text-dark-accent transition-colors" aria-label="Twitter"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.16c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.39-.22-1.98-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.11 2.94 3.97 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 24 4.59a8.48 8.48 0 0 1-2.54.7z"/></svg></a>
            <a href="https://www.facebook.com/share/1J5Q1EniJW/?mibextid=wwXIfr" className="hover:text-dark-accent transition-colors" aria-label="Facebook"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.592 1.325-1.326V1.326C24 .592 23.405 0 22.675 0"/></svg></a>
            <a href="https://www.instagram.com/evoolfoundation?igsh=bG9kZmNmaWg5NmN4" className="hover:text-dark-accent transition-colors" aria-label="Instagram">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            </a>
          </div>
          {/* <h4 className="font-semibold text-gray-900 mb-2">Emergency Contact</h4>
          <p className="text-sm text-dark-text-muted">24/7 Helpline: <a href="tel:1234567890" className="hover:text-dark-accent">123-456-7890</a></p> */}
        </div>
      </div>
    </footer>
  );
}
