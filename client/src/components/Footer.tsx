export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">NammaMysuru.ai</h3>
            <p className="text-primary-foreground/80 leading-relaxed max-w-xs">
              From majestic palaces to cultural treasures, NammaMysuru.ai helps you explore Mysuru with smart, conversational assistance.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-lg mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="/spots" className="hover:text-white transition-colors">Tourist Spots</a></li>
              <li><a href="/restaurants" className="hover:text-white transition-colors">Dining</a></li>
              <li><a href="/chat" className="hover:text-white transition-colors">NammaMysuru.ai</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-lg mb-4 text-secondary">Emergency</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="flex justify-between max-w-[200px]"><span>Police Control</span> <span>100</span></li>
              <li className="flex justify-between max-w-[200px]"><span>Ambulance</span> <span>108</span></li>
              <li className="flex justify-between max-w-[200px]"><span>Tourism Helpline</span> <span>1363</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} NammaMysuru.ai Built for Namma Mysuru by Skanda M Rao</p>
        </div>
      </div>
    </footer>
  );
}
