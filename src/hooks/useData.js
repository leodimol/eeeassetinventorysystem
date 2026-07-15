import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 50;
const POLL_INTERVAL_MS = 30000; // Refresh data every 30 seconds

export function useEquipment(page = 1, filters = {}, searchQuery = '', useServerFiltering = true) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEquipment = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);

        // Build the base query with count
        let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });
        let dataQuery = supabase.from('equipment').select('*');

        // Only apply server-side filtering if useServerFiltering is true
        if (useServerFiltering) {
          const applyFilter = (q) => {
            // Apply category filter
            if (filters.category) {
              switch (filters.category) {
                case 'office':
                  q = q.or(
                    'equipment_type.in.(laptop,computer,desktop,monitor,printer,scanner,office),office_type.not.is.null'
                  );
                  break;
                case 'logistics':
                  q = q.or(
                    'equipment_type.in.(logistics,wooden_crates,pallets,storage_bins,wire_cages),logistics_type.not.is.null'
                  );
                  break;
                case 'transport':
                  q = q.or('equipment_type.eq.transport,plate_number.not.is.null');
                  break;
                case 'other':
                  q = q.or('equipment_type.eq.other,type.not.is.null');
                  break;
                default:
                  q = q.eq('equipment_type', filters.category);
              }
            }

            // Apply sub-category filter
            if (filters.subCategory) {
              if (filters.category === 'logistics') {
                q = q.eq('logistics_type', filters.subCategory);
              } else if (filters.category === 'office') {
                q = q.eq('office_type', filters.subCategory);
              } else if (filters.category === 'other') {
                q = q.eq('type', filters.subCategory);
              }
            }

            // Apply status filter
            if (filters.status) {
              q = q.eq('status', filters.status);
            }

            // Apply condition filter
            if (filters.condition) {
              q = q.eq('condition', filters.condition);
            }

            // Apply location filter
            if (filters.location) {
              q = q.ilike('location', `%${filters.location}%`);
            }

            // Apply date range filter on created_at
            if (filters.dateRange) {
              const now = new Date();
              let days = 0;
              switch (filters.dateRange) {
                case '7days':
                  days = 7;
                  break;
                case '30days':
                  days = 30;
                  break;
                case '90days':
                  days = 90;
                  break;
                case '1year':
                  days = 365;
                  break;
              }
              if (days > 0) {
                const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
                q = q.gte('created_at', cutoff);
              }
            }

            // Apply search query (server-side search on multiple fields)
            if (searchQuery && searchQuery.trim()) {
              const lowerQuery = searchQuery.toLowerCase();
              const searchFilter = `model.ilike.%${lowerQuery}%,brand.ilike.%${lowerQuery}%,asset_tag.ilike.%${lowerQuery}%,serial.ilike.%${lowerQuery}%,assigned_to.ilike.%${lowerQuery}%,plate_number.ilike.%${lowerQuery}%`;
              q = q.or(searchFilter);
            }

            return q;
          };

          countQuery = applyFilter(countQuery);
          dataQuery = applyFilter(dataQuery);
        }

        // Get total count first
        const { count, error: countError } = await countQuery;
        if (countError) throw countError;

        const total = count || 0;
        setTotalCount(total);

        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

        // Apply pagination range
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;
        dataQuery = dataQuery.range(start, end).order('updated_at', { ascending: false });

        const { data, error: dataError } = await dataQuery;
        if (dataError) throw dataError;

        setEquipment(data || []);
      } catch (err) {
        // Handle authentication errors
        if (err.code === '401' || err.message?.includes('JWT') || err.message?.includes('auth')) {
          setError('Authentication required. Please log in.');
        } else {
          setError(err.message);
        }
      } finally {
        if (!isBackground) {
          setLoading(false);
        }
      }
    },
    [
      page,
      useServerFiltering,
      filters.category,
      filters.subCategory,
      filters.status,
      filters.condition,
      filters.location,
      filters.dateRange,
      searchQuery,
    ]
  );

  useEffect(() => {
    fetchEquipment(false);
    const interval = setInterval(() => {
      fetchEquipment(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchEquipment]);

  const addEquipment = async (item, _user = 'system') => {
    // Remove id field if present (should not be present for new records)
    const itemToInsert = { ...item };
    if (itemToInsert.id) {
      delete itemToInsert.id;
    }

    const itemWithTimestamp = { ...itemToInsert, updated_at: new Date().toISOString() };

    const { data, error } = await supabase.from('equipment').insert([itemWithTimestamp]).select();
    if (error) {
      if (
        error.code === '401' ||
        error.message?.includes('JWT') ||
        error.message?.includes('auth')
      ) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }

    fetchEquipment(true);
    return data[0];
  };

  const updateEquipment = async (id, updates, _user = 'system') => {
    const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('equipment')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select();
    if (error) {
      if (
        error.code === '401' ||
        error.message?.includes('JWT') ||
        error.message?.includes('auth')
      ) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }

    fetchEquipment(true);
    return data[0];
  };

  const deleteEquipment = async (id) => {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      if (
        error.code === '401' ||
        error.message?.includes('JWT') ||
        error.message?.includes('auth')
      ) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }

    fetchEquipment(true);
  };

  return {
    equipment,
    loading,
    error,
    refresh: fetchEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    totalCount,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}

export function useEquipmentStats() {
  const [stats, setStats] = useState({
    total: 0,
    computers: 0,
    tablets: 0,
    monitors: 0,
    printers: 0,
    scanners: 0,
    accessories: 0,
    available: 0,
    active: 0,
    idle: 0,
    in_use: 0,
    reserved: 0,
    loaned: 0,
    in_transit: 0,
    maintenance: 0,
    damaged: 0,
    retired: 0,
    pending_disposal: 0,
    new: 0,
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    assigned: 0,
    unassigned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [allEquipment, setAllEquipment] = useState([]);

  const fetchStats = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Build base query with count
      let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });

      // Get total count first
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Get full dataset needed by dashboard, notifications, and exports
      let dataQuery = supabase
        .from('equipment')
        .select('*')
        .order('updated_at', { ascending: false });

      const { data, error } = await dataQuery;
      if (error) {
        if (
          error.code === '401' ||
          error.message?.includes('JWT') ||
          error.message?.includes('auth')
        ) {
          throw new Error('Authentication required. Please log in.');
        }
        throw error;
      }

      // Calculate stats from data
      const counts = {
        total: count || 0,
        computers: 0,
        tablets: 0,
        monitors: 0,
        printers: 0,
        scanners: 0,
        accessories: 0,
        available: 0,
        active: 0,
        idle: 0,
        in_use: 0,
        reserved: 0,
        loaned: 0,
        in_transit: 0,
        maintenance: 0,
        damaged: 0,
        retired: 0,
        pending_disposal: 0,
        new: 0,
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        assigned: 0,
        unassigned: 0,
      };

      data?.forEach((item) => {
        const type = (item.equipment_type || '').toLowerCase();
        if (type.includes('computer') || type.includes('laptop')) counts.computers++;
        else if (type.includes('tablet')) counts.tablets++;
        else if (type.includes('monitor')) counts.monitors++;
        else if (type.includes('printer')) counts.printers++;
        else if (type.includes('scanner')) counts.scanners++;

        // Count by status
        const status = (item.status || '').toLowerCase();
        if (status === 'available') counts.available++;
        else if (status === 'active' || status === 'assigned') counts.active++;
        else if (status === 'idle') counts.idle++;
        else if (status === 'in_use') counts.in_use++;
        else if (status === 'reserved') counts.reserved++;
        else if (status === 'loaned') counts.loaned++;
        else if (status === 'in_transit' || status === 'in transit') counts.in_transit++;
        else if (status === 'maintenance') counts.maintenance++;
        else if (status === 'damaged') counts.damaged++;
        else if (status === 'retired') counts.retired++;
        else if (status === 'pending_disposal' || status === 'pending disposal')
          counts.pending_disposal++;

        // Count by condition
        const condition = (item.condition || '').toLowerCase();
        if (condition === 'new') counts.new++;
        else if (condition === 'excellent') counts.excellent++;
        else if (condition === 'good') counts.good++;
        else if (condition === 'fair') counts.fair++;
        else if (condition === 'poor') counts.poor++;

        // Count assignment
        if (item.assigned_to && item.assigned_to.trim()) {
          counts.assigned++;
        } else {
          counts.unassigned++;
        }
      });

      setStats(counts);
      setAllEquipment(data || []);
    } catch (err) {
      if (err.code === '401' || err.message?.includes('JWT') || err.message?.includes('auth')) {
        // Authentication error; UI will redirect to login
      } else {
        // Other stats fetch error; keep stale data visible
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
    const interval = setInterval(() => {
      fetchStats(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, allEquipment, refresh: fetchStats };
}

export function useDeletedAssets() {
  const [deletedAssets, setDeletedAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeletedAssets = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const { data, error } = await supabase
        .from('deleted_assets')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedAssets(data || []);
    } catch (err) {
      // Ignore deleted assets fetch errors; UI shows empty state
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedAssets(false);
    const interval = setInterval(() => {
      fetchDeletedAssets(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDeletedAssets]);

  return { deletedAssets, loading, refresh: fetchDeletedAssets };
}
