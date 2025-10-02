import { supabase } from '@/lib/supabase';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourismInventory {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  category_id: string;
  subcategory_id?: string;
  
  // Location data
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  
  // Contact information
  phone?: string;
  email?: string;
  website?: string;
  
  // Business information
  opening_hours?: Record<string, { open: string; close: string }>;
  price_range?: 'free' | 'low' | 'medium' | 'high';
  capacity?: number;
  amenities?: string[];
  
  // Media
  images?: string[];
  videos?: string[];
  
  // SEO and content
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  
  // Status and validation
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  is_active: boolean;
  validation_notes?: string;
  
  // Audit fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: InventoryCategory;
  subcategory?: InventoryCategory;
  reviews?: InventoryReview[];
  average_rating?: number;
  review_count?: number;
}

export interface InventoryReview {
  id: string;
  inventory_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryAnalytics {
  id: string;
  inventory_id: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface InventoryFilters {
  category_id?: string;
  subcategory_id?: string;
  city?: string;
  state?: string;
  status?: string;
  is_featured?: boolean;
  is_active?: boolean;
  price_range?: string;
  search?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

export interface InventoryStats {
  total_items: number;
  approved_items: number;
  pending_items: number;
  draft_items: number;
  featured_items: number;
  categories_count: number;
  average_rating: number;
  total_reviews: number;
}

class InventoryService {
  // Categories
  async getCategories(parentId?: string): Promise<InventoryCategory[]> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .eq('is_active', true)
      .eq(parentId ? 'parent_id' : 'parent_id', parentId || null)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCategoryById(id: string): Promise<InventoryCategory | null> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCategory(category: Partial<InventoryCategory>): Promise<InventoryCategory> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, category: Partial<InventoryCategory>): Promise<InventoryCategory> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Inventory Items
  async getInventoryItems(filters: InventoryFilters = {}, limit = 50, offset = 0): Promise<TourismInventory[]> {
    let query = supabase
      .from('tourism_inventory')
      .select(`
        *,
        category:inventory_categories!category_id(*),
        subcategory:inventory_categories!subcategory_id(*),
        reviews:inventory_reviews(*)
      `);

    // Apply filters
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.subcategory_id) {
      query = query.eq('subcategory_id', filters.subcategory_id);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.price_range) {
      query = query.eq('price_range', filters.price_range);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Location-based search
    if (filters.latitude && filters.longitude && filters.radius) {
      const earthRadius = 6371; // Earth's radius in kilometers
      const lat = filters.latitude;
      const lng = filters.longitude;
      const radius = filters.radius;

      query = query
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .filter('latitude', 'gte', lat - (radius / earthRadius) * (180 / Math.PI))
        .filter('latitude', 'lte', lat + (radius / earthRadius) * (180 / Math.PI))
        .filter('longitude', 'gte', lng - (radius / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180))
        .filter('longitude', 'lte', lng + (radius / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180));
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Calculate average ratings
    const itemsWithRatings = (data || []).map(item => {
      const reviews = item.reviews || [];
      const approvedReviews = reviews.filter((review: InventoryReview) => review.is_approved);
      const averageRating = approvedReviews.length > 0 
        ? approvedReviews.reduce((sum: number, review: InventoryReview) => sum + review.rating, 0) / approvedReviews.length
        : 0;

      return {
        ...item,
        average_rating: Math.round(averageRating * 10) / 10,
        review_count: approvedReviews.length
      };
    });

    return itemsWithRatings;
  }

  async getInventoryItemById(id: string): Promise<TourismInventory | null> {
    const { data, error } = await supabase
      .from('tourism_inventory')
      .select(`
        *,
        category:inventory_categories!category_id(*),
        subcategory:inventory_categories!subcategory_id(*),
        reviews:inventory_reviews(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      const reviews = data.reviews || [];
      const approvedReviews = reviews.filter((review: InventoryReview) => review.is_approved);
      const averageRating = approvedReviews.length > 0 
        ? approvedReviews.reduce((sum: number, review: InventoryReview) => sum + review.rating, 0) / approvedReviews.length
        : 0;

      return {
        ...data,
        average_rating: Math.round(averageRating * 10) / 10,
        review_count: approvedReviews.length
      };
    }

    return null;
  }

  async createInventoryItem(item: Partial<TourismInventory>): Promise<TourismInventory> {
    const { data, error } = await supabase
      .from('tourism_inventory')
      .insert(item)
      .select(`
        *,
        category:inventory_categories!category_id(*),
        subcategory:inventory_categories!subcategory_id(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateInventoryItem(id: string, item: Partial<TourismInventory>): Promise<TourismInventory> {
    const { data, error } = await supabase
      .from('tourism_inventory')
      .update(item)
      .eq('id', id)
      .select(`
        *,
        category:inventory_categories!category_id(*),
        subcategory:inventory_categories!subcategory_id(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('tourism_inventory')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Reviews
  async getReviews(inventoryId: string): Promise<InventoryReview[]> {
    const { data, error } = await supabase
      .from('inventory_reviews')
      .select('*')
      .eq('inventory_id', inventoryId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createReview(review: Partial<InventoryReview>): Promise<InventoryReview> {
    const { data, error } = await supabase
      .from('inventory_reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  async trackEvent(inventoryId: string, eventType: string, metadata?: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('inventory_analytics')
      .insert({
        inventory_id: inventoryId,
        event_type: eventType,
        metadata: metadata || {}
      });

    if (error) throw error;
  }

  async getAnalytics(inventoryId: string, startDate?: string, endDate?: string): Promise<InventoryAnalytics[]> {
    let query = supabase
      .from('inventory_analytics')
      .select('*')
      .eq('inventory_id', inventoryId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Statistics
  async getStats(): Promise<InventoryStats> {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('tourism_inventory')
      .select('status, is_featured, is_active');

    if (inventoryError) throw inventoryError;

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('inventory_categories')
      .select('id')
      .eq('is_active', true);

    if (categoriesError) throw categoriesError;

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('inventory_reviews')
      .select('rating, is_approved')
      .eq('is_approved', true);

    if (reviewsError) throw reviewsError;

    const totalItems = inventoryData?.length || 0;
    const approvedItems = inventoryData?.filter(item => item.status === 'approved').length || 0;
    const pendingItems = inventoryData?.filter(item => item.status === 'pending').length || 0;
    const draftItems = inventoryData?.filter(item => item.status === 'draft').length || 0;
    const featuredItems = inventoryData?.filter(item => item.is_featured).length || 0;
    const categoriesCount = categoriesData?.length || 0;

    const approvedReviews = reviewsData?.filter(review => review.is_approved) || [];
    const totalReviews = approvedReviews.length;
    const averageRating = totalReviews > 0 
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    return {
      total_items: totalItems,
      approved_items: approvedItems,
      pending_items: pendingItems,
      draft_items: draftItems,
      featured_items: featuredItems,
      categories_count: categoriesCount,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: totalReviews
    };
  }

  // Search
  async searchInventory(query: string, filters: InventoryFilters = {}): Promise<TourismInventory[]> {
    const searchFilters = { ...filters, search: query };
    return this.getInventoryItems(searchFilters, 100, 0);
  }

  // Featured items
  async getFeaturedItems(limit = 10): Promise<TourismInventory[]> {
    return this.getInventoryItems({ is_featured: true, is_active: true }, limit, 0);
  }

  // Nearby items
  async getNearbyItems(latitude: number, longitude: number, radius = 10): Promise<TourismInventory[]> {
    return this.getInventoryItems({ latitude, longitude, radius }, 50, 0);
  }
}

export const inventoryService = new InventoryService();
