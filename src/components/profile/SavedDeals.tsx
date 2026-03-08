
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Share2,
  ExternalLink,
  Trash2,
  Star,
  Calendar,
  Clock,
  Bookmark,
  Heart,
  Loader2
} from "lucide-react";
import axiosInstance from '@/api/axios';
import { toast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ConfirmModal } from '../confirmModal';

interface SavedDealsProps {
  user: any;
}

interface SavedDeal {
  id: string;
  offerId: string;
  title: string;
  brand: string;
  brandLogo: string;
  discount: string;
  description: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  savings: number;
  expiryDate: string;
  isLimited: boolean;
  savedDate: string;
  rating: number;
  verified: boolean;
}

export const SavedDeals: React.FC<SavedDealsProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const [deletingSavedOffer, setDeletingSavedOffer] = useState(false);

  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();

  const handleDeleteSavedOffer = async (offerId: string) => {
    try {
      setDeletingSavedOffer(true);
      const response = await axiosInstance.delete(`/user/me/saved-offers/${offerId}`);
      if (response.status !== 200) {
        throw new Error('Failed to delete saved offer');
      }
      toast({
        title: 'Offer removed',
        description: 'The offer has been successfully removed from your saved deals.',
        variant: 'success',
      });
      // Refresh saved deals after deletion
      fetchSavedDeals();
    } catch (error) {
      
      toast({
        title: 'Error removing offer',
        description: error.response?.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setDeletingSavedOffer(false);

    }
  };

  async function shareContent(title, text, url) {
    

    try {
      await navigator.share({
        title: title,
        text: text,
        url: url,
      });
    } catch (err) {
      
      // Fallback to custom share dialog
      // showCustomShareDialog(title, url);
    }
  }

  const fetchSavedDeals = async () => {
    try {
      const response = await axiosInstance.get('/user/me/saved-offers');
      if (response.status !== 200) {
        throw new Error('Failed to fetch saved deals');
      }
      const deals: SavedDeal[] = response.data.data
      setSavedDeals(deals);
    } catch (error) {
      
      toast({
        title: error.response?.data?.message || 'Failed to fetch saved deals',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    setSavedDeals(user.savedDeals || []);
  }, []);

  const categories = ['all', ...Array.from(new Set(savedDeals.map(deal => deal.category)))];

  const filteredDeals = savedDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        {...modalProps}
      />
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-brand-primary mb-1">{savedDeals.length}</div>
            <div className="text-sm text-neutral-medium">Saved Deals</div>
          </CardContent>
        </Card>
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              ${savedDeals.reduce((total, deal) => total + deal.savings, 0)}
            </div>
            <div className="text-sm text-neutral-medium">Potential Savings</div>
          </CardContent>
        </Card>
        <Card className="border-neutral-lighter">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {savedDeals.filter(deal => getDaysUntilExpiry(deal.expiryDate) <= 7).length}
            </div>
            <div className="text-sm text-neutral-medium">Expiring Soon</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-neutral-lighter">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium h-4 w-4" />
              <Input
                placeholder="Search saved deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-neutral-lighter rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Deals Grid */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => {
            const daysUntilExpiry = getDaysUntilExpiry(deal.expiryDate);
            const isExpiringSoon = daysUntilExpiry <= 7;

            return (
              <Card key={deal.id} className="border-neutral-lighter hover:border-brand-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-background-subtle flex items-center justify-center border border-neutral-lighter">
                          <img
                            src={deal.brandLogo}
                            alt={deal.brand}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">{deal.title}</h3>
                          <p className="text-sm text-neutral-medium">{deal.brand}</p>
                        </div>
                      </div>
                    </div>

                    {/* Discount and Savings */}
                    <div className="flex items-center gap-3">
                      <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                        {deal.discount}
                      </Badge>
                      {deal.verified && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-medium">{deal.description}</p>

                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {deal.category}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-neutral-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {formatDate(deal.expiryDate)}</span>
                        </div>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires in {daysUntilExpiry} days
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        <span>Saved {formatDate(deal.savedDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-neutral-lighter">
                      <Button onClick={() => navigate(`/offer/${deal.offerId}`)} className="flex-1 bg-brand-primary hover:bg-brand-primary/90">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Deal
                      </Button>
                      <Button onClick={
                        () => shareContent(deal.title, deal.description, window.location.href + `/offer/${deal.offerId}`)
                      } variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={deletingSavedOffer}
                        onClick={
                          () => {
                            openModal({
                              title: 'Remove Saved Deal',
                              message: `Are you sure you want to remove "${deal.title}" from your saved deals?`,
                              confirmText: 'Remove',
                              cancelText: 'Cancel',
                              variant: 'destructive',
                              onConfirm: () => handleDeleteSavedOffer(deal.id),
                              onClose: closeModal,
                            });
                          }
                        } variant="outline" size="icon" className="text-destructive hover:text-destructive">
                      {deletingSavedOffer ? (
                        <span className="animate-spin">
                          <Loader2 className="h-4 w-4" />
                        </span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-neutral-lighter">
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Saved Deals</h3>
            <p className="text-neutral-medium mb-4">Start saving deals you love to access them anytime</p>
            <Button onClick={() => navigate('/deals')} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Search className="h-4 w-4 mr-2" />
              Browse Deals
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};