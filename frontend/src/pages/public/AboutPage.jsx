import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Sparkles, Shield, Heart, Award, Clock } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 md:py-20 space-y-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">The Aurelia Heritage</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          Where Haute Coiffure Meets Bespoke Aesthetics
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-3xl mx-auto leading-relaxed">
          Founded in 2014, AURELIA was conceived as an antidote to commercial, rushed salon spaces. We envisioned a tranquil European-inspired atelier where master hairdressing is practiced with sculptural devotion, and aesthetic treatments are formulated as restorative rituals.
        </p>
      </section>

      {/* 3 Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 border border-[#E5D2B8]">
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-gold mb-6 border border-gold/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso mb-2">
              Individual Diagnostic Care
            </h3>
            <p className="text-xs text-taupe leading-relaxed">
              Every appointment initiates with an in-depth facial architecture and scalp diagnostic consultation to ensure formulas and cuts flatter individual bone structure.
            </p>
          </Card>

          <Card className="p-8 border border-[#E5D2B8]">
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-gold mb-6 border border-gold/30">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso mb-2">
              Clean Botanical Formulations
            </h3>
            <p className="text-xs text-taupe leading-relaxed">
              We exclusively utilize ammonia-free European pigments, formaldehyde-free organic keratin, and clinical cold-pressed dermal serums free of parabens and synthetic fragrances.
            </p>
          </Card>

          <Card className="p-8 border border-[#E5D2B8]">
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-gold mb-6 border border-gold/30">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso mb-2">
              Master Artist Pedigree
            </h3>
            <p className="text-xs text-taupe leading-relaxed">
              Our styling directors and lead aestheticians maintain international certifications from Paris, London, and Milan, regularly curating high-fashion editorial presentations.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

