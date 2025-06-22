import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-dark-surface text-dark-text-secondary border-t border-dark-border pt-10 pb-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left: Logo + Brand + Tagline */}
        <div className="flex flex-col space-y-3">
          <Link to="/" className="flex items-center space-x-2 mb-2">
            <img src="/satark_logo.png" alt="Satark Logo" className="h-8 w-auto object-contain" style={{ maxWidth: 40 }} />
            <span className="font-bold text-lg text-dark-text-primary">Satark</span>
          </Link>
          <p className="text-sm text-dark-text-muted">Stay alert with real-time emergency notifications and trusted news updates.</p>
          <p className="text-xs text-dark-text-muted mt-2">&copy; {new Date().getFullYear()} Satark. All rights reserved.</p>
        </div>
        {/* Middle: Quick Links */}
        <div>
          <h4 className="font-semibold text-dark-text-primary mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-dark-accent transition-colors">Home</Link></li>
            <li><Link to="/alerts" className="hover:text-dark-accent transition-colors">Alerts</Link></li>
            <li><Link to="/privacy" className="hover:text-dark-accent transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-dark-accent transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        {/* About/Contact */}
        <div>
          <h4 className="font-semibold text-dark-text-primary mb-3">About</h4>
          <p className="text-sm text-dark-text-muted mb-2">Satark is your trusted platform for emergency alerts and verified news, helping you stay safe and informed.</p>
          <h4 className="font-semibold text-dark-text-primary mt-4 mb-2">Contact</h4>
          <p className="text-sm text-dark-text-muted">Email: <a href="mailto:support@satark.com" className="hover:text-dark-accent">support@satark.com</a></p>
        </div>
        {/* Social/Newsletter/Emergency */}
        <div>
          <h4 className="font-semibold text-dark-text-primary mb-3">Connect</h4>
          <div className="flex space-x-3 mb-4">
            <a href="#" className="hover:text-dark-accent transition-colors" aria-label="Twitter"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 8.99 4.07 7.13 1.64 4.16c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.39-.22-1.98-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.11 2.94 3.97 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 24 4.59a8.48 8.48 0 0 1-2.54.7z"/></svg></a>
            <a href="#" className="hover:text-dark-accent transition-colors" aria-label="Facebook"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.592 1.325-1.326V1.326C24 .592 23.405 0 22.675 0"/></svg></a>
            <a href="#" className="hover:text-dark-accent transition-colors" aria-label="LinkedIn"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.18-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
          </div>
          <h4 className="font-semibold text-dark-text-primary mb-2">Emergency Contact</h4>
          <p className="text-sm text-dark-text-muted">24/7 Helpline: <a href="tel:1234567890" className="hover:text-dark-accent">123-456-7890</a></p>
        </div>
      </div>
    </footer>
  );
}
