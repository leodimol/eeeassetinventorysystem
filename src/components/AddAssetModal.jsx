import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkDuplicates } from '../utils/duplicateCheck';
import { logAudit } from '../utils/auditLog';
import Toast from './ui/Toast';

const AddAssetModal = ({ isOpen, onClose, asset = null, onSaved, authUser }) => {
  const isEditMode = Boolean(asset?.id);
  const isRetired = asset?.status === 'retired';
  const [loading, setLoading] = useState(false);
  const [updateReason, setUpdateReason] = useState('');
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLogisticsType, setSelectedLogisticsType] = useState('');
  const [selectedOfficeType, setSelectedOfficeType] = useState('');
  const [toast, setToast] = useState(null);

  const categories = [
    { id: 'transport', name: 'Transport Equipment', icon: '🚛' },
    { id: 'logistics', name: 'Logistics Equipment', icon: '📦' },
    { id: 'office', name: 'Office Equipment', icon: '🖨️' },
    { id: 'other', name: 'Other Equipment', icon: '🔧' }
  ];

  const logisticsTypes = [
    { id: 'wooden_crates', name: 'Crates', icon: '📦' },
    { id: 'pallets', name: 'Pallets (Wooden, Plastic, Metal)', icon: '🔲' },
    { id: 'storage_bins', name: 'Storage Bins / Tote Boxes', icon: '🗃️' },
    { id: 'wire_cages', name: 'Wire Cages / Pallet Cages', icon: '🔒' }
  ];

  const officeTypes = [
    { id: 'desktop_computer', name: 'Desktop Computer', icon: '🖥️' },
    { id: 'laptop', name: 'Laptop', icon: '💻' },
    { id: 'monitor', name: 'Monitor', icon: '📺' },
    { id: 'keyboard_mouse', name: 'Keyboard & Mouse', icon: '⌨️' },
    { id: 'printer', name: 'Printer', icon: '🖨️' },
    { id: 'photocopier', name: 'Photocopier / MFD', icon: '📠' },
    { id: 'scanner', name: 'Scanner', icon: '📷' },
    { id: 'shredder', name: 'Shredder', icon: '🗑️' },
    { id: 'telephone', name: 'Telephone / IP Phone', icon: '📞' },
    { id: 'router', name: 'Router / Modem / Switch', icon: '📡' },
    { id: 'office_desk', name: 'Office Desk', icon: '🪑' },
    { id: 'office_chair', name: 'Office Chair', icon: '🛋️' },
    { id: 'filing_cabinet', name: 'Filing Cabinet', icon: '🗄️' },
    { id: 'bookshelf', name: 'Bookshelf / Rack', icon: '📚' },
    { id: 'paper_cutter', name: 'Paper Cutter / Trimmer', icon: '✂️' },
    { id: 'stapler', name: 'Stapler & Staples', icon: '📎' },
    { id: 'hole_puncher', name: 'Hole Puncher', icon: '🔳' },
    { id: 'document_tray', name: 'Document Tray / Sorter', icon: '📥' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'whiteboard', name: 'Whiteboard & Markers', icon: '📝' }
  ];

  const emptyForm = {
    category: '',
    brand: '',
    model: '',
    asset_tag: '',
    serial: '',
    location: '',
    assigned_to: '',
    added_by: '',
    idle_release: '',
    released_by: '',
    release_datetime: '',
    status: 'available',
    condition: 'new',
    last_service: new Date().toISOString().split('T')[0],
    purchase_date: '',
    warranty_date: '',
    // Laptop specific fields
    processor: '',
    ram: '',
    storage: '',
    accessories: '',
    // Transport specific fields
    plate_number: '',
    engine_number: '',
    chassis_number: '',
    fuel_type: '',
    capacity: '',
    year_manufactured: '',
    // Logistics specific fields
    logistics_type: '',
    quantity: '',
    brand_make: '',
    material: '',
    dimensions: '',
    load_capacity: '',
    features: '',
    type: '',
    color: '',
    design: '',
    volume_capacity: '',
    finish: '',
    serial_id: '',
    notes: '',
    // Office specific fields
    office_type: '',
    specs: '',
    use: '',
    office_quantity: '',
    office_serial_id: '',
    office_condition: '',
    office_status: '',
    office_features: '',
    office_type_field: '',
    office_size: '',
    office_capacity: '',
    office_ports: '',
    office_lock: '',
    office_tier: '',
    office_material: '',
    office_cut_type: '',
    office_notes: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  const statusOptions = [
    { value: 'available', label: '✅ Available - Working, ready for assignment' },
    { value: 'idle', label: '✅ Idle - Working, currently not in use' },
    { value: 'maintenance', label: '⚠️ Under Maintenance - Temporarily out of service' },
    { value: 'retired', label: '❌ Retired/Disposed - Permanently removed' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && asset) {
        setFormData({
          category: asset.category || '',
          brand: asset.brand || '',
          model: asset.model || '',
          asset_tag: asset.asset_tag || '',
          serial: asset.serial || '',
          location: asset.location || '',
          assigned_to: asset.assigned_to || '',
          added_by: asset.added_by || '',
          idle_release: asset.idle_release || '',
          status: asset.status || 'available',
          condition: asset.condition || 'new',
          last_service: asset.last_service ? asset.last_service.split('T')[0] : new Date().toISOString().split('T')[0],
          purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
          warranty_date: asset.warranty_date ? asset.warranty_date.split('T')[0] : '',
          processor: asset.processor || '',
          ram: asset.ram || '',
          storage: asset.storage || '',
          accessories: asset.accessories || '',
          plate_number: asset.plate_number || '',
          engine_number: asset.engine_number || '',
          chassis_number: asset.chassis_number || '',
          fuel_type: asset.fuel_type || '',
          capacity: asset.capacity || '',
          year_manufactured: asset.year_manufactured || '',
          logistics_type: asset.logistics_type || '',
          quantity: asset.quantity || '',
          brand_make: asset.brand_make || '',
          material: asset.material || '',
          dimensions: asset.dimensions || '',
          load_capacity: asset.load_capacity || '',
          features: asset.features || '',
          type: asset.type || '',
          color: asset.color || '',
          design: asset.design || '',
          volume_capacity: asset.volume_capacity || '',
          finish: asset.finish || '',
          serial_id: asset.serial_id || '',
          notes: asset.notes || '',
          // Office specific fields
          office_type: asset.office_type || '',
          specs: asset.specs || '',
          use: asset.use || '',
          office_quantity: asset.office_quantity || '',
          office_serial_id: asset.office_serial_id || '',
          office_condition: asset.office_condition || '',
          office_status: asset.office_status || '',
          office_features: asset.office_features || '',
          office_type_field: asset.office_type_field || '',
          office_size: asset.office_size || '',
          office_capacity: asset.office_capacity || '',
          office_ports: asset.office_ports || '',
          office_lock: asset.office_lock || '',
          office_tier: asset.office_tier || '',
          office_material: asset.office_material || '',
          office_cut_type: asset.office_cut_type || '',
          office_notes: asset.office_notes || ''
        });
        setSelectedCategory(asset.category || '');
        setSelectedLogisticsType(asset.logistics_type || '');
        setSelectedOfficeType(asset.office_type || '');
        setCurrentStep(asset.category === 'logistics' && asset.logistics_type ? 3 : asset.category === 'office' && asset.office_type ? 3 : 2);
      } else {
        setFormData(emptyForm);
        setSelectedCategory('');
        setSelectedLogisticsType('');
        setSelectedOfficeType('');
        setCurrentStep(1);
      }
    }
  }, [isOpen, asset, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category }));
    if (category === 'logistics') {
      setCurrentStep(2); // Go to logistics type selection
    } else if (category === 'office') {
      setCurrentStep(2); // Go to office type selection
    } else {
      setCurrentStep(3); // Skip type selection for other categories
    }
  };

  const handleLogisticsTypeSelect = (type) => {
    setSelectedLogisticsType(type);
    setFormData(prev => ({ ...prev, logistics_type: type }));
    setCurrentStep(3);
  };

  const handleOfficeTypeSelect = (type) => {
    setSelectedOfficeType(type);
    setFormData(prev => ({ ...prev, office_type: type }));
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 3 && selectedCategory === 'logistics') {
      setCurrentStep(2);
      setSelectedLogisticsType('');
    } else if (currentStep === 3 && selectedCategory === 'office') {
      setCurrentStep(2);
      setSelectedOfficeType('');
    } else {
      setCurrentStep(1);
      setSelectedCategory('');
      setSelectedLogisticsType('');
      setSelectedOfficeType('');
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.category) validationErrors.category = 'Category is required';
    // Brand and Model are not required for logistics and office
    if (selectedCategory !== 'logistics' && selectedCategory !== 'office') {
      if (!formData.brand) validationErrors.brand = 'Brand is required';
      if (!formData.model) validationErrors.model = 'Model is required';
    }
    if (!formData.asset_tag) validationErrors.asset_tag = 'Asset tag is required';
    if (!formData.added_by) validationErrors.added_by = 'Added By is required';

    // Require reason for update when editing
    if (isEditMode && !updateReason.trim()) {
      validationErrors.updateReason = 'Reason for update is required';
    }

    // Date format validation
    if (formData.purchase_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.purchase_date)) {
        validationErrors.purchase_date = 'Invalid date format. Use YYYY-MM-DD';
      }
    }
    if (formData.warranty_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.warranty_date)) {
        validationErrors.warranty_date = 'Invalid date format. Use YYYY-MM-DD';
      }
    }
    if (formData.last_service) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.last_service)) {
        validationErrors.last_service = 'Invalid date format. Use YYYY-MM-DD';
      }
    }
    if (formData.release_datetime) {
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!dateTimeRegex.test(formData.release_datetime)) {
        validationErrors.release_datetime = 'Invalid datetime format. Use YYYY-MM-DDTHH:MM';
      }
    }

    // Release mode validation
    if (formData.idle_release === 'release') {
      if (!formData.location) validationErrors.location = 'Location is required when releasing';
      if (!formData.assigned_to) validationErrors.assigned_to = 'Assigned To is required when releasing';
      if (!formData.released_by) validationErrors.released_by = 'Released By is required when releasing';
      if (!formData.release_datetime) validationErrors.release_datetime = 'Release Date & Time is required when releasing';
    }

    // Category-specific validation
    if (selectedCategory === 'transport') {
      if (!formData.plate_number) validationErrors.plate_number = 'Plate number is required for transport equipment';
    }

    if (selectedCategory === 'logistics') {
      if (!formData.logistics_type) validationErrors.logistics_type = 'Logistics type is required';
      if (!formData.quantity) validationErrors.quantity = 'Quantity is required for logistics equipment';
    }

    // Clear any lingering serial errors for categories where serial is not required
    if (selectedCategory === 'transport' || selectedCategory === 'logistics' || selectedCategory === 'office') {
      validationErrors.serial = null;
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Real-time validation for key fields
  useEffect(() => {
    if (formData.asset_tag && errors.asset_tag) {
      setErrors(prev => ({ ...prev, asset_tag: '' }));
    }
  }, [formData.asset_tag]);

  useEffect(() => {
    if (formData.serial && errors.serial) {
      setErrors(prev => ({ ...prev, serial: '' }));
    }
  }, [formData.serial]);

  useEffect(() => {
    if (formData.added_by && errors.added_by) {
      setErrors(prev => ({ ...prev, added_by: '' }));
    }
  }, [formData.added_by]);

  // Real-time duplicate check
  useEffect(() => {
    const checkRealTimeDuplicates = async () => {
      if (formData.asset_tag || formData.serial) {
        try {
          const duplicateCheck = await checkDuplicates({
            serial: formData.serial,
            assetTag: formData.asset_tag,
            excludeId: asset?.id
          });

          if (duplicateCheck.hasDuplicates) {
            if (formData.asset_tag && duplicateCheck.duplicates.some(d => d.asset_tag === formData.asset_tag)) {
              setErrors(prev => ({ ...prev, asset_tag: 'Asset ID already exists' }));
            }
            if (formData.serial && duplicateCheck.duplicates.some(d => d.serial === formData.serial)) {
              setErrors(prev => ({ ...prev, serial: 'Serial Number already exists' }));
            }
          }
        } catch (error) {
          console.error('Real-time duplicate check failed:', error);
        }
      }
    };

    const debounceTimer = setTimeout(checkRealTimeDuplicates, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.asset_tag, formData.serial, asset?.id]);

  useEffect(() => {
    if (formData.idle_release === 'release') {
      if (formData.location && errors.location) {
        setErrors(prev => ({ ...prev, location: '' }));
      }
      if (formData.assigned_to && errors.assigned_to) {
        setErrors(prev => ({ ...prev, assigned_to: '' }));
      }
      if (formData.released_by && errors.released_by) {
        setErrors(prev => ({ ...prev, released_by: '' }));
      }
      if (formData.release_datetime && errors.release_datetime) {
        setErrors(prev => ({ ...prev, release_datetime: '' }));
      }
    }
  }, [formData.location, formData.assigned_to, formData.released_by, formData.release_datetime, formData.idle_release]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submission started', formData);

    const isValid = validateForm();
    console.log('Form validation result:', isValid, errors);

    if (!isValid) {
      setToast({
        message: 'Please fix the validation errors before submitting.',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Check for duplicates
      const duplicateCheck = await checkDuplicates({
        serial: formData.serial,
        assetTag: formData.asset_tag,
        excludeId: asset?.id
      });

      console.log('Duplicate check result:', duplicateCheck);

      if (duplicateCheck.hasDuplicates) {
        setToast({
          message: `Duplicate detected: ${duplicateCheck.messages.join(', ')}. Please review before continuing.`,
          type: 'warning'
        });
        const confirmed = window.confirm(
          `Warning: ${duplicateCheck.messages.join('\n')}\n\n` +
          `Existing assets:\n${duplicateCheck.duplicates.map(d =>
            `- ${d.model || 'Unknown'} (${d.asset_tag || 'No Tag'}) - ${d.status || 'Unknown'}`
          ).join('\n')}\n\nDo you want to continue saving?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      // Create payload with all form fields
      const payload = {
        brand: formData.brand,
        model: formData.model,
        asset_tag: formData.asset_tag,
        serial: formData.serial || null,
        location: formData.location || null,
        assigned_to: formData.assigned_to || null,
        added_by: formData.added_by || null,
        idle_release: formData.idle_release || null,
        released_by: formData.released_by || null,
        release_datetime: formData.release_datetime || null,
        status: formData.status,
        condition: formData.condition,
        last_service: formData.last_service || null,
        purchase_date: formData.purchase_date || null,
        warranty_date: formData.warranty_date || null,
        equipment_type: formData.category,
        // Laptop specific fields
        processor: formData.processor || null,
        ram: formData.ram || null,
        storage: formData.storage || null,
        accessories: formData.accessories || null,
        // Transport specific fields
        plate_number: formData.plate_number || null,
        engine_number: formData.engine_number || null,
        chassis_number: formData.chassis_number || null,
        fuel_type: formData.fuel_type || null,
        capacity: formData.capacity || null,
        year_manufactured: formData.year_manufactured || null,
        // Logistics specific fields
        logistics_type: formData.logistics_type || null,
        quantity: formData.quantity || null,
        brand_make: formData.brand_make || null,
        material: formData.material || null,
        dimensions: formData.dimensions || null,
        load_capacity: formData.load_capacity || null,
        features: formData.features || null,
        type: formData.type || null,
        color: formData.color || null,
        design: formData.design || null,
        volume_capacity: formData.volume_capacity || null,
        finish: formData.finish || null,
        serial_id: formData.serial_id || null,
        notes: formData.notes || null,
        // Office specific fields
        office_type: formData.office_type || null,
        specs: formData.specs || null,
        use: formData.use || null,
        office_quantity: formData.office_quantity || null,
        office_serial_id: formData.office_serial_id || null,
        office_condition: formData.office_condition || null,
        office_status: formData.office_status || null,
        office_features: formData.office_features || null,
        office_type_field: formData.office_type_field || null,
        office_size: formData.office_size || null,
        office_capacity: formData.office_capacity || null,
        office_ports: formData.office_ports || null,
        office_lock: formData.office_lock || null,
        office_tier: formData.office_tier || null,
        office_material: formData.office_material || null,
        office_cut_type: formData.office_cut_type || null,
        office_notes: formData.office_notes || null,
        ...(isEditMode ? { updated_at: new Date().toISOString() } : { created_at: new Date().toISOString() })
      };

      // Prevent saving retired assets
      if (isRetired) {
        setToast({
          message: 'Cannot edit retired assets. This asset is permanently removed from service.',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      let savedAsset;
      
      if (isEditMode) {
        const { data, error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', asset.id)
          .select()
          .single();
        
        if (error) throw error;
        savedAsset = data;
      } else {
        const { data, error } = await supabase
          .from('equipment')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        savedAsset = data;
      }

      // Log audit entry
      await logAudit({
        equipmentId: savedAsset.id,
        action: isEditMode ? 'UPDATE' : 'CREATE',
        oldValues: isEditMode ? asset : null,
        newValues: savedAsset,
        changedBy: formData.added_by || authUser?.email || 'system',
        reason: isEditMode ? updateReason : null
      });

      if (onSaved) onSaved(savedAsset);
      onClose();
      setCurrentStep(1);
      setSelectedCategory('');
      setSelectedLogisticsType('');
      setSelectedOfficeType('');
      setFormData(emptyForm);
      setToast({ 
        message: isEditMode ? 'Equipment updated successfully! Changes have been saved.' : 'Equipment added successfully! You can now view it in the inventory.', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Error saving asset:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setToast({ 
        message: `Failed to save asset: ${err.message || 'Please check your data and try again.'}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelection = () => (
    <div className="asset-category-intro">
      <div className="asset-category-rule"></div>
      <h3 className="modal-title" style={{ marginBottom: '8px' }}>Select Equipment Category</h3>
      <p className="asset-category-instruction">Choose the type of equipment you want to add to the inventory</p>
      
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '32px' }}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="glass-card"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <span style={{ fontSize: '48px' }}>{category.icon}</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLogisticsTypeSelection = () => (
    <div className="asset-category-intro">
      <div className="asset-category-rule"></div>
      <h3 className="modal-title" style={{ marginBottom: '8px' }}>Select Logistics Equipment Type</h3>
      <p className="asset-category-instruction">Choose the specific type of storage & container equipment</p>
      
      <button
        onClick={handleBack}
        className="back-button"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Categories</span>
      </button>
      
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '32px' }}>
        {logisticsTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleLogisticsTypeSelect(type.id)}
            className="glass-card"
            style={{
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <span style={{ fontSize: '48px' }}>{type.icon}</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '14px',
              color: 'var(--text-primary)',
              textAlign: 'center'
            }}>{type.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderOfficeTypeSelection = () => (
    <div className="asset-category-intro">
      <div className="asset-category-rule"></div>
      <h3 className="modal-title" style={{ marginBottom: '8px' }}>Select Office Equipment Type</h3>
      <p className="asset-category-instruction">Choose the specific type of office equipment</p>
      
      <button
        onClick={handleBack}
        className="back-button"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Categories</span>
      </button>
      
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '32px' }}>
        {officeTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleOfficeTypeSelect(type.id)}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = '';
            }}
          >
            <span style={{ fontSize: '36px' }}>{type.icon}</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '13px',
              color: 'var(--text-primary)',
              textAlign: 'center'
            }}>{type.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCategorySpecificFields = () => {
    switch (selectedCategory) {
      case 'transport':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Plate Number *</label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleChange}
                className={`form-input ${errors.plate_number ? 'border-red-500' : ''}`}
                placeholder="e.g. ABC-1234"
              />
              <p className="form-hint">Vehicle license plate number (required)</p>
              {errors.plate_number && <p className="error-text">{errors.plate_number}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Engine Number</label>
              <input
                type="text"
                name="engine_number"
                value={formData.engine_number}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. ENG123456789"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chassis Number</label>
              <input
                type="text"
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. CHS987654321"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="form-input asset-category-select"
              >
                <option value="">Select fuel type</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 5 tons"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year Manufactured</label>
              <input
                type="number"
                name="year_manufactured"
                value={formData.year_manufactured}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 2024"
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </>
        );

      case 'office':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="office_quantity"
                value={formData.office_quantity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 5"
                min="1"
              />
            </div>

            {/* Type-specific fields based on office_type */}
            {selectedOfficeType === 'desktop_computer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Daily admin, data entry, documents"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specs</label>
                  <textarea
                    name="specs"
                    value={formData.specs}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Processor, RAM, Storage, OS"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. HP, Dell, Lenovo, Acer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Serial / Asset ID</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Unique number/tag"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="defective">Defective</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="idle">Idle</option>
                    <option value="for_repair">For Repair</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'laptop' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Mobile work, meetings, field tasks"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specs</label>
                  <textarea
                    name="specs"
                    value={formData.specs}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Screen size, RAM, Storage"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Lenovo ThinkPad, ASUS, MacBook"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Serial / Asset ID</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Labeled or engraved"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="needs_service">Needs Service</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="in_storage">In Storage</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'monitor' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Extended display, better viewing"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Size</label>
                  <input
                    type="text"
                    name="office_size"
                    value={formData.office_size}
                    onChange={handleChange}
                    className="form-input"
                    placeholder='e.g. 19", 22", 24"'
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="led">LED</option>
                    <option value="lcd">LCD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="dim">Dim</option>
                    <option value="flickering">Flickering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'keyboard_mouse' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Input control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="wired">Wired</option>
                    <option value="wireless">Wireless</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Generic, Logitech, A4Tech"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="unresponsive">Unresponsive</option>
                    <option value="broken">Broken</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="attached">Attached</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'printer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Print reports, forms, invoices"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="inkjet">Inkjet</option>
                    <option value="laser">Laser</option>
                    <option value="dot_matrix">Dot-matrix</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Features</label>
                  <textarea
                    name="office_features"
                    value={formData.office_features}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. B&W, Color, Scanner, Copier"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Canon, HP, Epson, Brother"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="needs_ink_toner">Needs ink/toner</option>
                    <option value="jammed">Jammed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'photocopier' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Copy, scan, print, sometimes fax"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Kyocera, Xerox, Ricoh"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="text"
                    name="office_capacity"
                    value={formData.office_capacity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Monthly duty cycle"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="paper_feed_issue">Paper feed issue</option>
                    <option value="low_toner">Low toner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="operational">Operational</option>
                    <option value="for_maintenance">For maintenance</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'scanner' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Digitize physical documents"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="sheet_fed">Sheet-fed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Canon, Epson, Fujitsu"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="not_detected">Not detected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'shredder' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Securely destroy confidential papers"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    type="text"
                    name="office_capacity"
                    value={formData.office_capacity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Sheets per pass"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cut Type</label>
                  <select
                    name="office_cut_type"
                    value={formData.office_cut_type}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select cut type</option>
                    <option value="strip_cut">Strip-cut</option>
                    <option value="cross_cut">Cross-cut</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="overheat">Overheat</option>
                    <option value="jammed">Jammed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="idle">Idle</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'telephone' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Internal & external calls"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="corded">Corded</option>
                    <option value="cordless">Cordless</option>
                    <option value="voip">VoIP</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Panasonic, Avaya, Grandstream"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="working">Working</option>
                    <option value="no_dial_tone">No dial tone</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="assigned">Assigned</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'router' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Internet & office network"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. TP-Link, Cisco, D-Link"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ports</label>
                  <select
                    name="office_ports"
                    value={formData.office_ports}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select ports</option>
                    <option value="4_port">4-port</option>
                    <option value="8_port">8-port</option>
                    <option value="24_port">24-port</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="stable">Stable</option>
                    <option value="intermittent">Intermittent</option>
                    <option value="faulty">Faulty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'office_desk' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Workstation surface"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select
                    name="office_material"
                    value={formData.office_material}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select material</option>
                    <option value="wood">Wood</option>
                    <option value="metal_frame">Metal frame</option>
                    <option value="laminated">Laminated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 120×60×75 cm"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="standard">Standard</option>
                    <option value="executive">Executive</option>
                    <option value="cubicle">Cubicle</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="wobbly">Wobbly</option>
                    <option value="scratched">Scratched</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="available">Available</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'office_chair' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Seating for staff"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="swivel">Swivel</option>
                    <option value="fixed">Fixed</option>
                    <option value="with_armrest">With armrest</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select
                    name="office_material"
                    value={formData.office_material}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select material</option>
                    <option value="fabric">Fabric</option>
                    <option value="mesh">Mesh</option>
                    <option value="leatherette">Leatherette</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="broken_wheel">Broken wheel</option>
                    <option value="tilt_issue">Tilt issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="assigned">Assigned</option>
                    <option value="spare">Spare</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'filing_cabinet' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Store records, folders, files"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="office_type_field"
                    value={formData.office_type_field}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select type</option>
                    <option value="2_drawer">2-drawer</option>
                    <option value="3_drawer">3-drawer</option>
                    <option value="4_drawer">4-drawer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select
                    name="office_material"
                    value={formData.office_material}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select material</option>
                    <option value="steel">Steel</option>
                    <option value="wood">Wood</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lock</label>
                  <select
                    name="office_lock"
                    value={formData.office_lock}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select lock</option>
                    <option value="with_lock">With lock</option>
                    <option value="no_lock">No lock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="stuck_drawer">Stuck drawer</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="in_storage">In Storage</option>
                  </select>
                </div>
              </>
            )}

            {selectedOfficeType === 'bookshelf' && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Store manuals, supplies, binders"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select
                    name="office_material"
                    value={formData.office_material}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select material</option>
                    <option value="steel">Steel</option>
                    <option value="wood">Wood</option>
                    <option value="particleboard">Particleboard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tier</label>
                  <select
                    name="office_tier"
                    value={formData.office_tier}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select tier</option>
                    <option value="3_tier">3-tier</option>
                    <option value="4_tier">4-tier</option>
                    <option value="5_tier">5-tier</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="sturdy">Sturdy</option>
                    <option value="loose">Loose</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="available">Available</option>
                  </select>
                </div>
              </>
            )}

            {/* Basic Office Supplies */}
            {['paper_cutter', 'stapler', 'hole_puncher', 'document_tray', 'calculator', 'whiteboard'].includes(selectedOfficeType) && (
              <>
                <div className="form-group">
                  <label className="form-label">Use</label>
                  <input
                    type="text"
                    name="use"
                    value={formData.use}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. General office use"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Generic, Brand name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    name="office_condition"
                    value={formData.office_condition}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select condition</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="office_status"
                    value={formData.office_status}
                    onChange={handleChange}
                    className="form-input asset-category-select"
                  >
                    <option value="">Select status</option>
                    <option value="in_use">In Use</option>
                    <option value="in_storage">In Storage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="office_notes"
                    value={formData.office_notes}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Additional details"
                  />
                </div>
              </>
            )}
          </>
        );

      case 'logistics':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="e.g. 50"
                min="1"
              />
              <p className="form-hint">Number of items (required)</p>
              {errors.quantity && <p className="error-text">{errors.quantity}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Brand / Make</label>
              <input
                type="text"
                name="brand_make"
                value={formData.brand_make}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Generic, Union, Standard"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 100cm × 80cm × 60cm"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Load Capacity</label>
              <input
                type="text"
                name="load_capacity"
                value={formData.load_capacity}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 500 kg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial / ID</label>
              <input
                type="text"
                name="serial_id"
                value={formData.serial_id}
                onChange={handleChange}
                className="form-input"
                placeholder="Individual tag or batch number"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Additional details about the equipment"
            />
          </div>
        );
    }
  };

  const renderEquipmentDetails = () => (
    <div className="modal-body">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="back-button"
      >
        <ArrowLeft size={16} />
        <span>Change Category</span>
      </button>

      {/* Category Indicator */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <span className="selected-category-display">
          Category: {categories.find(c => c.id === selectedCategory)?.name}
          {selectedCategory === 'logistics' && selectedLogisticsType && (
            <span> → {logisticsTypes.find(t => t.id === selectedLogisticsType)?.name}</span>
          )}
          {selectedCategory === 'office' && selectedOfficeType && (
            <span> → {officeTypes.find(t => t.id === selectedOfficeType)?.name}</span>
          )}
        </span>
      </div>

      {/* Brand - Only for transport */}
      {selectedCategory === 'transport' && (
        <div className="form-group">
          <label className="form-label">Brand *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={`form-input ${errors.brand ? 'border-red-500' : ''}`}
            placeholder="e.g. Toyota, Ford, Honda"
          />
          <p className="form-hint">Manufacturer or brand name (required)</p>
          {errors.brand && <p className="error-text">{errors.brand}</p>}
        </div>
      )}

      {/* Model - Only for transport */}
      {selectedCategory === 'transport' && (
        <div className="form-group">
          <label className="form-label">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className={`form-input ${errors.model ? 'border-red-500' : ''}`}
            placeholder="e.g. Camry, F-150, Civic"
          />
          <p className="form-hint">Specific model or version (required)</p>
          {errors.model && <p className="error-text">{errors.model}</p>}
        </div>
      )}

      {/* Asset Tag */}
      <div className="form-group">
        <label className="form-label">Asset Tag *</label>
        <input
          type="text"
          name="asset_tag"
          value={formData.asset_tag}
          onChange={handleChange}
          className={`form-input ${errors.asset_tag ? 'border-red-500' : ''}`}
          placeholder="e.g. IT-2024-001"
        />
        <p className="form-hint">Unique identifier for the asset (required)</p>
        {errors.asset_tag && <p className="error-text">{errors.asset_tag}</p>}
      </div>

      {/* Category-specific fields */}
      <div className="form-section">
        <div className="form-section-header">
          <h4 className="form-section-title">
            {selectedCategory === 'logistics' && selectedLogisticsType
              ? logisticsTypes.find(t => t.id === selectedLogisticsType)?.name
              : selectedCategory === 'office' && selectedOfficeType
              ? officeTypes.find(t => t.id === selectedOfficeType)?.name
              : categories.find(c => c.id === selectedCategory)?.name} Details
          </h4>
        </div>
        <div className="form-section-content">
          {renderCategorySpecificFields()}
        </div>
      </div>

      {/* Status - Only for transport and logistics */}
      {selectedCategory !== 'office' && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-input asset-category-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Condition - Only for transport and logistics */}
      {selectedCategory !== 'office' && (
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="form-input asset-category-select"
          >
            {conditionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Last Service Date - Only for transport */}
      {selectedCategory === 'transport' && (
        <div className="form-group">
          <label className="form-label">Last Service Date</label>
          <input
            type="date"
            name="last_service"
            value={formData.last_service}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      )}

      {/* Purchase Date */}
      <div className="form-group">
        <label className="form-label">Purchase Date</label>
        <input
          type="date"
          name="purchase_date"
          value={formData.purchase_date}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      {/* Warranty Date - Optional for all categories */}
      <div className="form-group">
        <label className="form-label">Warranty Date (Optional)</label>
        <input
          type="date"
          name="warranty_date"
          value={formData.warranty_date}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      {/* Description - Optional for all categories */}
      <div className="form-group">
        <label className="form-label">Description (Optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="form-textarea"
          rows="3"
          placeholder="Additional details about the equipment"
        />
      </div>

      {/* Added By */}
      <div className="form-group">
        <label className="form-label">Added By *</label>
        <input
          type="text"
          name="added_by"
          value={formData.added_by}
          onChange={handleChange}
          className={`form-input ${errors.added_by ? 'border-red-500' : ''}`}
          placeholder="e.g. John Smith"
        />
        <p className="form-hint">Name of the person adding this asset (required)</p>
        {errors.added_by && <p className="error-text">{errors.added_by}</p>}
      </div>

      {/* Idle/Release */}
      <div className="form-group">
        <label className="form-label">Idle/Release</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, idle_release: 'idle', status: 'available' }));
            }}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              formData.idle_release === 'idle'
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                : 'bg-white/80 text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            Idle
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, idle_release: 'release', status: 'in_use' }));
            }}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              formData.idle_release === 'release'
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                : 'bg-white/80 text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            Release
          </button>
        </div>
        <div
          className={`mt-3 p-3 rounded-lg border-l-4 ${
            formData.idle_release === 'idle'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-blue-50 border-blue-500'
          }`}
        >
          <p className="text-sm font-semibold mb-1">
            {formData.idle_release === 'idle' ? '⚠️ Idle Mode' : '📋 Release Mode'}
          </p>
          <p className="text-xs text-gray-700">
            {formData.idle_release === 'idle'
              ? 'Asset is idle in storage. Location and assignment fields are HIDDEN.'
              : 'Asset is released/assigned. Location and assignment fields are REQUIRED.'}
          </p>
        </div>
      </div>

      {/* Location - Only show when release mode */}
      {formData.idle_release === 'release' && (
        <div className="form-group">
          <label className="form-label">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Headquarters, Warehouse"
          />
        </div>
      )}

      {/* Assigned To - Only show when release mode */}
      {formData.idle_release === 'release' && (
        <div className="form-group">
          <label className="form-label">Assigned To *</label>
          <input
            type="text"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. John Smith"
          />
        </div>
      )}

      {/* Release By - Only show when release mode */}
      {formData.idle_release === 'release' && (
        <div className="form-group">
          <label className="form-label">Released By *</label>
          <input
            type="text"
            name="released_by"
            value={formData.released_by}
            onChange={handleChange}
            className={`form-input ${errors.released_by ? 'border-red-500' : ''}`}
            placeholder="e.g. John Smith"
          />
          {errors.released_by && <p className="error-text">{errors.released_by}</p>}
        </div>
      )}

      {/* Release Date & Time - Only show when release mode */}
      {formData.idle_release === 'release' && (
        <div className="form-group">
          <label className="form-label">Release Date & Time *</label>
          <input
            type="datetime-local"
            name="release_datetime"
            value={formData.release_datetime}
            onChange={handleChange}
            className={`form-input text-lg p-3 ${errors.release_datetime ? 'border-red-500 border-2' : 'border-2'}`}
            style={{
              fontSize: '16px',
              padding: '12px',
              colorScheme: 'light',
              outline: 'none'
            }}
            onClick={(e) => e.target.showPicker?.()}
          />
          <style>{`
            input[type="datetime-local"]::-webkit-calendar-picker-indicator {
              filter: invert(1);
              cursor: pointer;
            }
            input[type="datetime-local"]:focus {
              outline: none;
              box-shadow: none;
            }
            .form-hint {
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
              font-style: italic;
            }
          `}</style>
          {errors.release_datetime && <p className="error-text">{errors.release_datetime}</p>}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Equipment' : 'Add Asset'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Retired Asset Warning Banner */}
        {isRetired && (
          <div style={{
            padding: '12px 16px',
            margin: '0 24px',
            backgroundColor: 'var(--bg-red)',
            border: '1px solid var(--border-red)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} style={{ color: 'var(--text-red)' }} />
            <div>
              <p style={{ 
                color: 'var(--text-red)', 
                fontWeight: '600', 
                fontSize: '14px',
                margin: 0
              }}>
                Retired Asset - View Only
              </p>
              <p style={{ 
                color: 'var(--text-red)', 
                fontSize: '12px',
                margin: '4px 0 0 0',
                opacity: 0.8
              }}>
                This asset has been permanently removed from service and cannot be edited.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderCategorySelection()}
          {currentStep === 2 && selectedCategory === 'logistics' && renderLogisticsTypeSelection()}
          {currentStep === 2 && selectedCategory === 'office' && renderOfficeTypeSelection()}
          {currentStep === 3 && renderEquipmentDetails()}

          {/* Update Reason Field (only shown in edit mode) */}
          {isEditMode && currentStep === 3 && (
            <div style={{ padding: '0 24px 16px' }}>
              <div className="form-group">
                <label className="form-label">
                  Reason for Update <span style={{ color: 'var(--accent-red)' }}>*</span>
                </label>
                <textarea
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="form-textarea"
                  rows="2"
                  placeholder="Please explain why you are updating this asset..."
                  style={errors.updateReason ? { borderColor: 'var(--accent-red)' } : {}}
                />
                {errors.updateReason && (
                  <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>
                    {errors.updateReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          {currentStep === 3 && (
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isRetired}
                className="btn btn-primary"
                style={isRetired ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {isRetired ? 'View Only' : (loading ? <Loader2 className="animate-spin" size={20} /> : (isEditMode ? 'Update' : 'Add Equipment'))}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            borderRadius: '24px'
          }}
        >
          <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>
            {isEditMode ? 'Updating Equipment...' : 'Adding Equipment...'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Please wait
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AddAssetModal;
