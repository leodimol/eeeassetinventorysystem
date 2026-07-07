import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logAudit } from '../utils/auditLog';

const ITEMS_PER_PAGE = 50;
const MAX_ITEMS_PER_PAGE = 10000; // For fetching all data without pagination

export function useEquipment(page = 1, filters = {}, searchQuery = '', useServerFiltering = true) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchEquipment = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Build the base query with count
      let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });
      let dataQuery = supabase.from('equipment').select('*');

      // Only apply server-side filtering if useServerFiltering is true
      if (useServerFiltering) {
        // Apply category filter - check both category and equipment_type fields
        if (filters.category) {
          countQuery = countQuery.or(`category.eq.${filters.category},equipment_type.eq.${filters.category}`);
          dataQuery = dataQuery.or(`category.eq.${filters.category},equipment_type.eq.${filters.category}`);
        }

        // Apply sub-category filter
        if (filters.subCategory) {
          if (filters.category === 'logistics') {
            countQuery = countQuery.eq('logistics_type', filters.subCategory);
            dataQuery = dataQuery.eq('logistics_type', filters.subCategory);
          } else if (filters.category === 'office') {
            countQuery = countQuery.eq('office_type', filters.subCategory);
            dataQuery = dataQuery.eq('office_type', filters.subCategory);
          }
        }

        // Apply status filter
        if (filters.status) {
          countQuery = countQuery.eq('status', filters.status);
          dataQuery = dataQuery.eq('status', filters.status);
        }

        // Apply condition filter
        if (filters.condition) {
          countQuery = countQuery.eq('condition', filters.condition);
          dataQuery = dataQuery.eq('condition', filters.condition);
        }
        
        // Apply search query (server-side search on multiple fields)
        if (searchQuery && searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase();
          // Use or filter for searching across multiple fields
          const searchFilter = `model.ilike.%${lowerQuery}%,brand.ilike.%${lowerQuery}%,asset_tag.ilike.%${lowerQuery}%,serial.ilike.%${lowerQuery}%,assigned_to.ilike.%${lowerQuery}%`;
          dataQuery = dataQuery.or(searchFilter);
          countQuery = countQuery.or(searchFilter);
        }
      }
      
      // Get total count first
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      const total = count || 0;
      console.log('useEquipment - Total count from DB:', total, 'filters:', filters);
      setTotalCount(total);

      // If fetching all data for dashboard/sidebar (no filters, no search), fetch all without pagination
      const shouldFetchAll = !filters.category && !filters.status && !filters.condition && !searchQuery;
      const itemsPerPage = shouldFetchAll ? MAX_ITEMS_PER_PAGE : ITEMS_PER_PAGE;
      setTotalPages(Math.ceil(total / itemsPerPage));

      // Apply pagination range
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      dataQuery = dataQuery.range(start, end).order('updated_at', { ascending: false });

      const { data, error: dataError } = await dataQuery;
      if (dataError) throw dataError;

      console.log(`Fetched ${data?.length || 0} items (page ${page} of ${Math.ceil(total / itemsPerPage)}, total: ${total}, shouldFetchAll: ${shouldFetchAll})`);
      setEquipment(data || []);
    } catch (err) {
      // Handle authentication errors
      if (err.code === '401' || err.message?.includes('JWT') || err.message?.includes('auth')) {
        setError('Authentication required. Please log in.');
      } else {
        setError(err.message);
      }
      console.error('Fetch error:', err);
    } finally {
      if (!isBackground) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [page, useServerFiltering ? JSON.stringify(filters) : '', useServerFiltering ? searchQuery : '']);

  useEffect(() => {
    fetchEquipment(false);
    const interval = setInterval(() => {
      fetchEquipment(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchEquipment]);

  const addEquipment = async (item, user = 'system') => {
    console.log('Adding equipment with accessories:', item.accessories);
    console.log('Item being added:', item);

    // Remove id field if present (should not be present for new records)
    const itemToInsert = { ...item };
    if (itemToInsert.id) {
      console.warn('Removing id field from item for new record');
      delete itemToInsert.id;
    }

    const itemWithTimestamp = { ...itemToInsert, updated_at: new Date().toISOString() };
    console.log('Final item to insert:', itemWithTimestamp);

    const { data, error } = await supabase.from('equipment').insert([itemWithTimestamp]).select();
    if (error) {
      if (error.code === '401' || error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw new Error('Authentication required. Please log in.');
      }
      console.error('Add equipment error:', error);
      throw error;
    }
    console.log('Added equipment response:', data);
    
    // Log audit
    await logAudit({
      equipmentId: data[0].id,
      action: 'CREATE',
      newValues: data[0],
      changedBy: user
    });
    
    fetchEquipment(true);
    return data[0];
  };

  const updateEquipment = async (id, updates, user = 'system') => {
    console.log('Updating equipment', id, 'with accessories:', updates.accessories);
    
    // Get old values for audit
    const { data: oldData } = await supabase.from('equipment').select('*').eq('id', id).single();
    
    const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('equipment').update(updatesWithTimestamp).eq('id', id).select();
    if (error) {
      if (error.code === '401' || error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw new Error('Authentication required. Please log in.');
      }
      console.error('Update equipment error:', error);
      throw error;
    }
    console.log('Updated equipment response:', data);
    
    // Log audit
    await logAudit({
      equipmentId: id,
      action: 'UPDATE',
      oldValues: oldData,
      newValues: data[0],
      changedBy: user
    });
    
    fetchEquipment(true);
    return data[0];
  };

  const deleteEquipment = async (id, user = 'system') => {
    // Get old values for audit
    const { data: oldData } = await supabase.from('equipment').select('*').eq('id', id).single();

    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) {
      if (error.code === '401' || error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw new Error('Authentication required. Please log in.');
      }
      throw error;
    }
    
    // Log audit
    await logAudit({
      equipmentId: id,
      action: 'DELETE',
      oldValues: oldData,
      changedBy: user
    });
    
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
    itemsPerPage: ITEMS_PER_PAGE
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
    unassigned: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Build base query with count
      let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });

      // Get total count first
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      // Get data for detailed stats (only fetch needed columns)
      let dataQuery = supabase.from('equipment').select('equipment_type, status, condition, assigned_to');

      const { data, error } = await dataQuery;
      if (error) {
        if (error.code === '401' || error.message?.includes('JWT') || error.message?.includes('auth')) {
          throw new Error('Authentication required. Please log in.');
        }
        console.error('Stats data fetch error:', error);
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
        unassigned: 0
      };

      data?.forEach(item => {
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
        else if (status === 'pending_disposal' || status === 'pending disposal') counts.pending_disposal++;

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
    } catch (err) {
      if (err.code === '401' || err.message?.includes('JWT') || err.message?.includes('auth')) {
        console.error('Authentication required for stats');
      } else {
        console.error('Stats fetch error:', err);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
    const interval = setInterval(() => {
      fetchStats(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

export function useHubs() {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubs = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const { data, error } = await supabase.from('hubs').select('*');
        if (error) throw error;
        setHubs(data || []);
      } catch (err) {
        console.error('Error fetching hubs:', err.message);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };
    fetchHubs(false);
    const interval = setInterval(() => {
      fetchHubs(true);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { hubs, loading };
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
      console.error('Error fetching deleted assets:', err.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedAssets(false);
    const interval = setInterval(() => {
      fetchDeletedAssets(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchDeletedAssets]);

  return { deletedAssets, loading, refresh: fetchDeletedAssets };
}
