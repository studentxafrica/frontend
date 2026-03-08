
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  Phone,
  Globe,
  Palette,
  Target,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  Heart,
  Zap,
  Shield,
  Eye,
  Save
} from "lucide-react";

interface PreferencesSettingsProps {
  user: any;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ user }) => {
  const [preferences, setPreferences] = useState({
    // Notification Preferences
    emailDeals: true,
    pushDeals: true,
    smsDeals: false,
    weeklyDigest: true,
    priceAlerts: true,
    expiring: true,

    // Deal Preferences
    categories: ['Technology', 'Food & Dining', 'Fashion'],
    location: '',
    radius: [25],

    // App Preferences
    language: 'en',
    currency: 'KES',
    theme: 'light',
    autoApplyCoupons: true,

    // Privacy Preferences
    profileVisibility: 'public',
    shareActivity: true,
    dataCollection: true,
    marketing: false
  });

  const categories = [
    'Technology', 'Fashion', 'Food & Dining', 'Entertainment',
    'Travel', 'Books & Education', 'Health & Beauty', 'Sports & Fitness',
    'Home & Garden', 'Automotive'
  ];

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSave = () => {
    // Save preferences logic here
    
  };

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive updates about deals and offers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="email-deals">Email Deals</Label>
                </div>
                <Switch
                  id="email-deals"
                  className={`${preferences.emailDeals ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.emailDeals}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, emailDeals: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="push-deals">Push Notifications</Label>
                </div>
                <Switch
                  id="push-deals"
                  className={`${preferences.pushDeals ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.pushDeals}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, pushDeals: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="sms-deals">SMS Notifications</Label>
                </div>
                <Switch
                  id="sms-deals"
                  className={`${preferences.smsDeals ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.smsDeals}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, smsDeals: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                </div>
                <Switch
                  id="weekly-digest"
                  className={`${preferences.weeklyDigest ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, weeklyDigest: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="price-alerts">Price Drop Alerts</Label>
                </div>
                <Switch
                  id="price-alerts"
                  className={`${preferences.priceAlerts ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.priceAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, priceAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-brand-primary" />
                  <Label htmlFor="expiring">Expiring Soon</Label>
                </div>
                <Switch
                  id="expiring"
                  className={`${preferences.expiring ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  checked={preferences.expiring}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, expiring: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Preferences */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-primary" />
            Deal Preferences
          </CardTitle>
          <CardDescription>
            Customize what types of deals you want to see
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Favorite Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={preferences.categories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer justify-center py-2 ${preferences.categories.includes(category)
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-medium" />
                <Select value={preferences.location} onValueChange={(value) =>
                  setPreferences(prev => ({ ...prev, location: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Nairobi">Nairobi</SelectItem>
                    <SelectItem value="Mombasa">Mombasa</SelectItem>
                    <SelectItem value="Kisumu">Kisumu</SelectItem>
                    <SelectItem value="Nakuru">Nakuru</SelectItem>
                    <SelectItem value="Eldoret">Eldoret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Search Radius</Label>
              <div className="space-y-2">
                <Slider
                  value={preferences.radius}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, radius: value }))
                  }
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-medium">
                  <span>5 miles</span>
                  <span className="font-medium">{preferences.radius[0]} miles</span>
                  <span>100+ miles</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-primary" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Language</Label>
              <Select value={preferences.language} onValueChange={(value) =>
                setPreferences(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) =>
                setPreferences(prev => ({ ...prev, currency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-brand-primary" />
              <div>
                <Label htmlFor="auto-apply">Auto-apply Coupons</Label>
                <p className="text-sm text-neutral-medium">Automatically apply best available coupons</p>
              </div>
            </div>
            <Switch
              id="auto-apply"
              className={`${preferences.autoApplyCoupons ? 'bg-brand-primary' : 'bg-gray-300'}`}
              checked={preferences.autoApplyCoupons}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, autoApplyCoupons: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Preferences */}
      <Card className="border-neutral-lighter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Profile Visibility</Label>
            <Select

              value={preferences.profileVisibility}
              onValueChange={(value) =>
                setPreferences(prev => ({ ...prev, profileVisibility: value }))
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white" >
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-brand-primary" />
                <div>
                  <Label htmlFor="share-activity">Share Activity</Label>
                  <p className="text-sm text-neutral-medium">Let friends see your deal activity</p>
                </div>
              </div>
              <Switch
                id="share-activity"
                checked={preferences.shareActivity}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, shareActivity: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-brand-primary" />
                <div>
                  <Label htmlFor="data-collection">Analytics & Improvement</Label>
                  <p className="text-sm text-neutral-medium">Help improve the app with usage data</p>
                </div>
              </div>
              <Switch
                id="data-collection"
                checked={preferences.dataCollection}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, dataCollection: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-primary" />
                <div>
                  <Label htmlFor="marketing">Marketing Communications</Label>
                  <p className="text-sm text-neutral-medium">Receive promotional emails and offers</p>
                </div>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-brand-primary hover:bg-brand-primary/90 px-8 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};