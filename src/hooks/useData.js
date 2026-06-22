import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logAudit } from '../utils/auditLog';

const ITEMS_PER_PAGE = 50;

export function useEquipment(hubId, page = 1, filters = {}, searchQuery = '', useServerFiltering = true) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build the base query with count
      let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });
      let dataQuery = supabase.from('equipment').select('*');
      
      // Apply hub filter
      if (hubId && hubId !== 'all') {
        countQuery = countQuery.eq('hub', hubId);
        dataQuery = dataQuery.eq('hub', hubId);
      }

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
      setTotalCount(total);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      
      // Apply pagination range
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;
      dataQuery = dataQuery.range(start, end).order('updated_at', { ascending: false });
      
      const { data, error: dataError } = await dataQuery;
      if (dataError) throw dataError;
      
      console.log(`Fetched ${data?.length || 0} items (page ${page} of ${Math.ceil(total / ITEMS_PER_PAGE)}, total: ${total})`);
      setEquipment(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hubId, page, useServerFiltering ? JSON.stringify(filters) : '', useServerFiltering ? searchQuery : '']);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const addEquipment = async (item, user = 'system') => {
    console.log('Adding equipment with accessories:', item.accessories);
    const itemWithTimestamp = { ...item, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('equipment').insert([itemWithTimestamp]).select();
    if (error) {
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
    
    fetchEquipment();
    return data[0];
  };

  const updateEquipment = async (id, updates, user = 'system') => {
    console.log('Updating equipment', id, 'with accessories:', updates.accessories);
    
    // Get old values for audit
    const { data: oldData } = await supabase.from('equipment').select('*').eq('id', id).single();
    
    const updatesWithTimestamp = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('equipment').update(updatesWithTimestamp).eq('id', id).select();
    if (error) {
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
    
    fetchEquipment();
    return data[0];
  };

  const deleteEquipment = async (id, user = 'system') => {
    // Get old values for audit
    const { data: oldData } = await supabase.from('equipment').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) throw error;
    
    // Log audit
    await logAudit({
      equipmentId: id,
      action: 'DELETE',
      oldValues: oldData,
      changedBy: user
    });
    
    fetchEquipment();
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

export function useEquipmentStats(hubId) {
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
    hubCounts: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Build base query with count
      let countQuery = supabase.from('equipment').select('*', { count: 'exact', head: true });
      if (hubId && hubId !== 'all') {
        countQuery = countQuery.eq('hub', hubId);
      }

      // Get total count first
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;

      console.log('Stats fetch - Total count:', count);

      // Get data for detailed stats (only fetch needed columns)
      let dataQuery = supabase.from('equipment').select('equipment_type, status, condition, assigned_to, hub, accessories');
      if (hubId && hubId !== 'all') {
        dataQuery = dataQuery.eq('hub', hubId);
      }

      const { data, error } = await dataQuery;
      if (error) throw error;

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
        hubCounts: {}
      };

      data?.forEach(item => {
        const type = (item.equipment_type || '').toLowerCase();
        if (type.includes('computer') || type.includes('laptop')) counts.computers++;
        else if (type.includes('tablet')) counts.tablets++;
        else if (type.includes('monitor')) counts.monitors++;
        else if (type.includes('printer')) counts.printers++;
        else if (type.includes('scanner')) counts.scanners++;

        // Count accessories
        let accessories = item.accessories;
        if (typeof accessories === 'string') {
          try { accessories = JSON.parse(accessories); } catch (e) { accessories = null; }
        }
        if (accessories && Array.isArray(accessories)) {
          counts.accessories += accessories.length;
        }

        // Count by status
        const status = (item.status || '').toLowerCase();
        if (status === 'available') counts.available++;
        else if (status === 'active') counts.active++;
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

        // Count by hub
        if (item.hub) {
          counts.hubCounts[item.hub] = (counts.hubCounts[item.hub] || 0) + 1;
        }
      });

      setStats(counts);
      console.log('Stats calculated:', counts);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [hubId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

export function useHubs() {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const { data, error } = await supabase.from('hubs').select('*');
        if (error) throw error;
        setHubs(data || []);
      } catch (err) {
        console.error('Error fetching hubs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHubs();
  }, []);

  return { hubs, loading };
}
