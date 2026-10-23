export function Footer() {
  return (
    <footer className="bg-stitch-primary text-white pt-12 pb-24 md:pb-12 mt-auto border-t border-stitch-secondary/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold mb-3 text-white flex items-center gap-2">
              <span>Namma Mysuru</span>
              <span className="text-stitch-secondary-fixed text-sm font-sans font-normal px-2 py-0.5 rounded bg-white/10">Heritage Guide</span>
            </h3>
            <p className="text-white/80 leading-relaxed max-w-md text-sm">
              Discover the City of Palaces, Sandalwood &amp; Silk with real-time cultural notices, verified monument ticketing, and multilingual AI concierge assistance.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4 text-stitch-secondary-fixed">Royal Canon</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="/spots" className="hover:text-white transition-colors">Palaces &amp; Heritage</a></li>
              <li><a href="/restaurants" className="hover:text-white transition-colors">Culinary &amp; Mysore Pak</a></li>
              <li><a href="/chat" className="hover:text-white transition-colors">AI Concierge &amp; Trails</a></li>
              <li><a href="/helpline" className="hover:text-white transition-colors">Safety &amp; Helplines</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4 text-stitch-secondary-fixed">Emergency Helplines</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex justify-between max-w-[200px]"><span>Police Control</span> <span className="font-bold text-stitch-secondary-fixed">100</span></li>
              <li className="flex justify-between max-w-[200px]"><span>Ambulance</span> <span className="font-bold text-stitch-secondary-fixed">108</span></li>
              <li className="flex justify-between max-w-[200px]"><span>Tourism Help</span> <span className="font-bold text-stitch-secondary-fixed">1363</span></li>
              <li className="flex justify-between max-w-[200px]"><span>KSTDC Kiosk</span> <span className="font-bold text-stitch-secondary-fixed">0821-2422096</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 pt-6 text-center text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} NammaMysuru.ai • Heritage Capital of Karnataka • Est. 1399 CE</p>
        </div>
      </div>
    </footer>
  );
}
