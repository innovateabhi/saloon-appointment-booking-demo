import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Sparkles, Scissors, Eye } from 'lucide-react';

export const GalleryPage = () => {
  const [filter, setFilter] = useState('all');

  const galleryItems = [
    { id: 1, title: 'French Balayage & Gloss', category: 'colour', desc: 'Seamless dimensional honey ribbons on dark brunette canvas.' },
    { id: 2, title: 'Architectural Bob & Bangs', category: 'haircuts', desc: 'Sharp geometric baseline cut with subtle micro-layering.' },
    { id: 3, title: '24K Gold Cellular Facial', category: 'skincare', desc: 'Revitalized dewy skin transformation after ultrasound peptide infusion.' },
    { id: 4, title: 'Gentleman Razor Taper Fade', category: 'grooming', desc: 'Seamless skin transition with precision beard contouring.' },
    { id: 5, title: 'Haute Bridal Draping & Glam', category: 'bridal', desc: 'Radiant champagne makeup and intricate structural updo.' },
    { id: 6, title: 'Platinum Melt Transformation', category: 'colour', desc: 'Full root lift with zero yellow undertone and bond repair.' },
  ];

  const filtered = filter === 'all' ? galleryItems : galleryItems.filter(i => i.category === filter);

  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Visual Atelier Lookbook</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          The Art of Transformation
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-2xl mx-auto leading-relaxed">
          Explore our signature portfolio created across couture coloring, sculptural barbering, and clinical dermal therapies.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pt-6 overflow-x-auto pb-2">
          {['all', 'colour', 'haircuts', 'skincare', 'grooming', 'bridal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors ${
                filter === cat
                  ? 'bg-espresso text-ivory font-semibold shadow-sm'
                  : 'bg-cream/60 text-espresso hover:bg-gold/20'
              }`}
            >
              {cat === 'all' ? 'Complete Portfolio' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <Card key={item.id} hover className="overflow-hidden border border-[#E5D2B8] group">
              <div className="h-64 bg-gradient-to-tr from-espresso via-charcoal to-espresso/90 p-6 flex flex-col justify-end text-ivory relative transition-transform duration-500 group-hover:scale-102">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-ivory">
                  {item.title}
                </h3>
                <p className="text-xs text-taupe/90 mt-1">
                  {item.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

