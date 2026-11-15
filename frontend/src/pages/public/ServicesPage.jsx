import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Clock, Search, Scissors, ArrowRight, Sparkles } from 'lucide-react';

export const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get('/public/categories').then((res) => res.data),
  });

  const { data: services = [], isLoading: srvLoading } = useQuery({
    queryKey: ['public-services', selectedCategory, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      return api.get(`/public/services?${params.toString()}`).then((res) => res.data);
    },
  });

  const handleBookService = (serviceId) => {
    navigate(`/book?service=${serviceId}`);
  };

  return (
    <div className="py-12 md:py-20 space-y-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Atelier Treatment Menu</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          Haute Coiffure & Bespoke Rituals
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-2xl mx-auto">
          Every treatment is customized following a personal diagnostic consultation, using pure organic botanicals and clinical-grade formulations.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-taupe absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search treatments by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5D2B8] rounded-sm pl-10 pr-4 py-2.5 text-xs text-espresso placeholder:text-taupe/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-espresso text-ivory font-semibold shadow-sm'
                : 'bg-cream/60 text-espresso hover:bg-gold/20'
            }`}
          >
            All Treatments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-espresso text-ivory font-semibold shadow-sm'
                  : 'bg-cream/60 text-espresso hover:bg-gold/20'
              }`}
            >
              {cat.name} ({cat.services_count})
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {srvLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="text-xs uppercase tracking-widest text-taupe mt-3">Loading Atelier Menu...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-sm border border-[#E5D2B8] p-8 max-w-lg mx-auto">
            <Scissors className="w-8 h-8 text-taupe mx-auto mb-3" />
            <h3 className="font-serif text-xl text-espresso">No treatments match your search</h3>
            <p className="text-xs text-taupe mt-1">Try resetting the category filter or searching for another keyword.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <Card key={srv.id} hover className="p-6 flex flex-col justify-between border border-[#E5D2B8]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                      {srv.category_name}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-taupe">
                      <Clock className="w-3.5 h-3.5 text-gold" /> {srv.duration_minutes} mins
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-espresso">
                    {srv.name}
                  </h3>

                  <p className="text-xs text-taupe leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>

                  {/* Qualified Stylists Preview */}
                  {srv.stylists && srv.stylists.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-wider text-taupe/80">Available Artists:</p>
                      <p className="text-xs text-espresso font-medium truncate mt-0.5">
                        {srv.stylists.map(s => s.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1EAE1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-taupe uppercase tracking-wider block">Investment</span>
                    <span className="font-serif text-2xl font-bold text-espresso">
                      ₹{parseFloat(srv.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleBookService(srv.id)}
                  >
                    Reserve Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

