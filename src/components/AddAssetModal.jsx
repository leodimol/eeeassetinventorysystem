import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkDuplicates } from '../utils/duplicateCheck';
import { logAudit } from '../utils/auditLog';
import Toast from './ui/Toast';

const AddAssetModal = ({ isOpen, onClose, asset = null, onSaved, authUser, onToast }) => {
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
    batch_number: '',
    quantity: 1,
    remaining_quantity: 1,
    serial: '',
    location: '',
    assigned_to: '',
    added_by: '',
    idle_release: 'idle',
    released_by: '',
    release_datetime: '',
    release_location: '',
    status: 'available',
    condition: 'new',
    last_service: new Date().toISOString().split('T')[0],
    purchase_date: '',
    warranty_date: '',
    date_added: new Date().toISOString(),
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
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const statusOptions = [
    { value: 'available', label: '✅ Available - Working, ready for assignment' },
    { value: 'in_use', label: '👤 In Use - Currently assigned and being used' },
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
        const category = asset.category || asset.equipment_type || '';
        
        // Validate that the category exists in the categories array
        const validCategory = categories.find(c => c.id === category) ? category : '';
        
        setFormData({
          category: validCategory,
          brand: asset.brand || '',
          model: asset.model || '',
          asset_tag: asset.asset_tag || '',
          batch_number: asset.batch_number || '',
          quantity: asset.quantity || 1,
          remaining_quantity: asset.remaining_quantity || 1,
          serial: asset.serial || '',
          location: asset.location || '',
          assigned_to: asset.assigned_to || '',
          added_by: asset.added_by || '',
          idle_release: asset.idle_release || 'idle',
          released_by: asset.released_by || '',
          release_datetime: asset.release_datetime || '',
          release_location: asset.release_location || '',
          status: asset.status || 'available',
          condition: asset.condition || 'new',
          last_service: asset.last_service ? asset.last_service.split('T')[0] : new Date().toISOString().split('T')[0],
          purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '',
          warranty_date: asset.warranty_date ? asset.warranty_date.split('T')[0] : '',
          date_added: asset.date_added || new Date().toISOString(),
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
        
        setSelectedCategory(validCategory);
        setSelectedLogisticsType(asset.logistics_type || '');
        setSelectedOfficeType(asset.office_type || '');
        
        // For transport and other categories, go directly to step 3
        // For logistics and office, go to step 3 only if sub-type is already selected
        if (validCategory === 'transport' || validCategory === 'other') {
          setCurrentStep(3);
        } else if (validCategory === 'logistics' && asset.logistics_type) {
          setCurrentStep(3);
        } else if (validCategory === 'office' && asset.office_type) {
          setCurrentStep(3);
        } else {
          setCurrentStep(1); // Start at step 1 if category is invalid
        }
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

    // Auto-close date picker if today is selected
    if (e.target.type === 'date' && value) {
      const today = new Date().toISOString().split('T')[0];
      if (value === today) {
        e.target.blur();
      }
    }

    // Auto-close datetime picker if today is selected
    if (e.target.type === 'datetime-local' && value) {
      const today = new Date().toISOString().split('T')[0];
      const selectedDate = value.split('T')[0];
      if (selectedDate === today) {
        e.target.blur();
      }
    }
  };

  // Real-time duplicate checking
  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!isEditMode && (formData.asset_tag || formData.serial)) {
        const duplicateCheck = await checkDuplicates({
          serial: formData.serial,
          assetTag: formData.asset_tag,
          excludeId: asset?.id
        });

        if (duplicateCheck.hasDuplicates) {
          setDuplicateWarning({
            messages: duplicateCheck.messages,
            duplicates: duplicateCheck.duplicates
          });
        } else {
          setDuplicateWarning(null);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const debounceTimer = setTimeout(checkForDuplicates, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.asset_tag, formData.serial, isEditMode, asset?.id]);

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

    console.log('Validating form with category:', selectedCategory);

    if (!formData.category) validationErrors.category = 'Category is required';

    // New mandatory fields for batch-based entry
    if (!formData.brand) validationErrors.brand = 'Brand is required';
    if (!formData.batch_number) validationErrors.batch_number = 'Batch number is required';
    if (!formData.quantity || formData.quantity < 1) validationErrors.quantity = 'Quantity must be at least 1';
    if (!formData.location) validationErrors.location = 'Storage/Location is required';
    if (!formData.warranty_date) validationErrors.warranty_date = 'Warranty date is required';
    if (!formData.condition) validationErrors.condition = 'Condition is required';

    // Type is required for other category
    if (selectedCategory === 'other' && !formData.type) {
      validationErrors.type = 'Equipment type is required';
    }

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
      // New mandatory release fields
      if (!formData.model) validationErrors.model = 'Model is required when releasing equipment';
      if (!formData.serial) validationErrors.serial = 'Serial number is required when releasing equipment';
      if (!formData.assigned_to) validationErrors.assigned_to = 'Assigned To is required when releasing';
      if (!formData.release_location) validationErrors.release_location = 'Assign To Location is required when releasing';
      if (!formData.released_by) validationErrors.released_by = 'Released By is required when releasing';
      if (!formData.release_datetime) validationErrors.release_datetime = 'Release Date & Time is required when releasing';

      // Stock validation - prevent releasing more than available
      if (formData.remaining_quantity !== undefined && formData.remaining_quantity <= 0) {
        validationErrors.stock = 'No items remaining in this batch. Cannot release more items.';
      }

      // Require serial number/identifier during release for equipment that has it
      if (selectedCategory === 'office' && selectedOfficeType) {
        // Electronic equipment with serial numbers
        const electronicTypes = ['desktop_computer', 'laptop', 'monitor', 'printer', 'photocopier', 'scanner', 'router', 'telephone'];
        if (electronicTypes.includes(selectedOfficeType) && !formData.office_serial_id) {
          validationErrors.office_serial_id = 'Serial number is required when releasing equipment';
        }

        // Equipment with specs requires specs during release
        const specTypes = ['desktop_computer', 'laptop'];
        if (specTypes.includes(selectedOfficeType) && !formData.specs) {
          validationErrors.specs = 'Specs are required when releasing equipment for identification';
        }

        // Monitor requires size during release for identification
        if (selectedOfficeType === 'monitor' && !formData.office_size) {
          validationErrors.office_size = 'Size is required when releasing monitor for identification';
        }

        // Furniture requires dimensions as identifier during release
        const furnitureTypes = ['office_desk', 'office_chair', 'filing_cabinet', 'bookshelf'];
        if (furnitureTypes.includes(selectedOfficeType) && !formData.dimensions) {
          validationErrors.dimensions = 'Dimensions are required when releasing furniture for identification';
        }

        // All office equipment requires brand/model during release for identification
        if (!formData.brand) {
          validationErrors.brand = 'Brand/Model is required when releasing equipment for identification';
        }
      }

      // Logistics equipment requires serial_id during release
      if (selectedCategory === 'logistics' && !formData.serial_id) {
        validationErrors.serial_id = 'Serial/ID is required when releasing logistics equipment';
      }

      // Other category requires brand during release for identification
      if (selectedCategory === 'other' && !formData.brand) {
        validationErrors.brand = 'Brand is required when releasing equipment for identification';
      }

      // Transport equipment already requires plate_number (validated below)
    }

    // Category-specific validation
    if (selectedCategory === 'transport') {
      if (!formData.plate_number) validationErrors.plate_number = 'Plate number is required for transport equipment';
    }

    if (selectedCategory === 'logistics') {
      if (!formData.logistics_type) validationErrors.logistics_type = 'Logistics type is required';
    }

    // Clear any lingering serial errors for categories where serial is not required
    if (selectedCategory === 'transport' || selectedCategory === 'logistics' || selectedCategory === 'office' || selectedCategory === 'other') {
      delete validationErrors.serial;
    }

    console.log('Validation errors:', validationErrors);
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

  const saveAsset = async () => {
    setLoading(true);

    try {
      // Create payload with all form fields
      const payload = {
        brand: formData.brand,
        model: formData.model,
        asset_tag: formData.asset_tag,
        batch_number: formData.batch_number || null,
        quantity: formData.quantity || 1,
        remaining_quantity: formData.remaining_quantity || 1,
        serial: formData.serial || null,
        location: formData.location || null,
        assigned_to: formData.assigned_to || null,
        added_by: formData.added_by || null,
        idle_release: formData.idle_release || null,
        released_by: formData.released_by || null,
        release_datetime: formData.release_datetime || null,
        release_location: formData.release_location || null,
        status: formData.status,
        condition: formData.condition,
        last_service: formData.last_service || null,
        purchase_date: formData.purchase_date || null,
        warranty_date: formData.warranty_date || null,
        date_added: formData.date_added || new Date().toISOString(),
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

      // Explicitly remove id field if present (should not be present for new records)
      if (!isEditMode && payload.id) {
        console.warn('Removing id field from payload for new record');
        delete payload.id;
      }

      console.log('Payload being sent:', payload);
      console.log('Is edit mode:', isEditMode);
      console.log('Has id field:', !!payload.id);

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
        // If releasing an item, deduct 1 from remaining_quantity
        if (formData.idle_release === 'release' && formData.remaining_quantity > 0) {
          payload.remaining_quantity = Math.max(0, formData.remaining_quantity - 1);
        }

        const { data, error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', asset.id)
          .select()
          .single();

        if (error) throw error;
        savedAsset = data;
      } else {
        // For new records, set remaining_quantity equal to quantity for idle mode
        // For release mode, set remaining_quantity to quantity - 1
        if (formData.idle_release === 'release') {
          payload.remaining_quantity = Math.max(0, (formData.quantity || 1) - 1);
        } else {
          payload.remaining_quantity = formData.quantity || 1;
        }

        const { data, error } = await supabase
          .from('equipment')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        savedAsset = data;
      }

      // Log audit entry (don't fail if this errors)
      try {
        await logAudit({
          equipmentId: savedAsset.id,
          action: isEditMode ? 'UPDATE' : 'CREATE',
          oldValues: isEditMode ? asset : null,
          newValues: savedAsset,
          changedBy: formData.added_by || authUser?.email || 'system',
          reason: isEditMode ? updateReason : null
        });
      } catch (auditErr) {
        console.error('Audit log failed:', auditErr);
      }

      console.log('Asset saved successfully, showing success toast');
      // Show success message immediately after successful save
      if (onToast) {
        onToast({
          message: isEditMode ? 'Equipment updated successfully! Changes have been saved.' : 'Equipment added successfully! You can now view it in the inventory.',
          type: 'success'
        });
      } else {
        setToast({
          message: isEditMode ? 'Equipment updated successfully! Changes have been saved.' : 'Equipment added successfully! You can now view it in the inventory.',
          type: 'success'
        });
      }

      // Close modal and reset form (don't fail if these error)
      try {
        console.log('Starting cleanup operations');
        if (onSaved) onSaved(savedAsset);
        onClose();
        setCurrentStep(1);
        setSelectedCategory('');
        setSelectedLogisticsType('');
        setSelectedOfficeType('');
        setFormData(emptyForm);
        console.log('Cleanup completed');
      } catch (cleanupErr) {
        console.error('Cleanup failed:', cleanupErr);
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setToast({
        message: `Failed to save asset: ${err.message || 'Please check your data and try again.'}`,
        type: 'error'
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

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

    // Prevent save if duplicate warning is showing
    if (duplicateWarning) {
      setToast({
        message: 'Please use a different asset tag or serial number. This one already exists.',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      // Proceed with save - duplicate checking is done in real-time
      await saveAsset();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
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
                placeholder="Vehicle license plate number (e.g. ABC-1234)"
              />
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
                    className={`form-textarea ${errors.specs ? 'border-red-500' : ''}`}
                    rows="3"
                    placeholder="Processor, RAM, Storage, OS"
                  />
                  {errors.specs && <p className="error-text">{errors.specs}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Serial / Asset ID</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Unique number/tag"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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

                {formData.idle_release === 'release' && (
                  <div className="form-group">
                    <label className="form-label">Specs</label>
                    <textarea
                      name="specs"
                      value={formData.specs}
                      onChange={handleChange}
                      className={`form-textarea ${errors.specs ? 'border-red-500' : ''}`}
                      rows="3"
                      placeholder="Screen size, RAM, Storage"
                    />
                    {errors.specs && <p className="error-text">{errors.specs}</p>}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Serial / Asset ID</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Labeled or engraved"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                    className={`form-input ${errors.office_size ? 'border-red-500' : ''}`}
                    placeholder='e.g. 19", 22", 24"'
                  />
                  {errors.office_size && <p className="error-text">{errors.office_size}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    name="office_serial_id"
                    value={formData.office_serial_id}
                    onChange={handleChange}
                    className={`form-input ${errors.office_serial_id ? 'border-red-500' : ''}`}
                    placeholder="Serial number from manufacturer"
                  />
                  {errors.office_serial_id && <p className="error-text">{errors.office_serial_id}</p>}
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
                    className={`form-input ${errors.dimensions ? 'border-red-500' : ''}`}
                    placeholder="e.g. 120×60×75 cm"
                  />
                  {errors.dimensions && <p className="error-text">{errors.dimensions}</p>}
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
                className={`form-input ${errors.serial_id ? 'border-red-500' : ''}`}
                placeholder="Individual tag or batch number"
              />
              {errors.serial_id && <p className="error-text">{errors.serial_id}</p>}
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="form-group">
              <label className="form-label">Equipment Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Generator, Pump, etc."
              />
            </div>
          </>
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

      {/* Brand - Required for all categories in new batch system */}
      <div className="form-group">
        <label className="form-label">Brand *</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className={`form-input ${errors.brand ? 'border-red-500' : ''}`}
          placeholder="Manufacturer or brand name (e.g., Dell, HP, Toyota)"
        />
        {errors.brand && <p className="error-text">{errors.brand}</p>}
      </div>

      {/* Batch Number - Required for all categories */}
      <div className="form-group">
        <label className="form-label">Batch Number *</label>
        <input
          type="text"
          name="batch_number"
          value={formData.batch_number}
          onChange={handleChange}
          className={`form-input ${errors.batch_number ? 'border-red-500' : ''}`}
          placeholder="Unique shipment/purchase reference (e.g., BATCH-2024-001)"
        />
        {errors.batch_number && <p className="error-text">{errors.batch_number}</p>}
      </div>

      {/* Quantity - Required for all categories */}
      <div className="form-group">
        <label className="form-label">Quantity *</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
          placeholder="Total number of identical items in this batch"
          min="1"
        />
        {errors.quantity && <p className="error-text">{errors.quantity}</p>}
      </div>

      {/* Storage / Location - Required for all categories */}
      <div className="form-group">
        <label className="form-label">Storage / Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`form-input ${errors.location ? 'border-red-500' : ''}`}
          placeholder="Physical storage location (e.g., Warehouse A, Shelf 3)"
        />
        {errors.location && <p className="error-text">{errors.location}</p>}
      </div>

      {/* Warranty Date - Required for all categories */}
      <div className="form-group">
        <label className="form-label">Warranty Date *</label>
        <input
          type="date"
          name="warranty_date"
          value={formData.warranty_date}
          onChange={handleChange}
          className={`form-input ${errors.warranty_date ? 'border-red-500' : ''}`}
          placeholder="Warranty expiry date"
        />
        {errors.warranty_date && <p className="error-text">{errors.warranty_date}</p>}
      </div>

      {/* Condition - Required for all categories */}
      <div className="form-group">
        <label className="form-label">Condition *</label>
        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className={`form-input ${errors.condition ? 'border-red-500' : ''}`}
        >
          <option value="">Select condition</option>
          <option value="new">New</option>
          <option value="functional">Functional</option>
          <option value="needs_repair">Needs Repair</option>
          <option value="damaged">Damaged</option>
        </select>
        {errors.condition && <p className="error-text">{errors.condition}</p>}
      </div>

      {/* Description - Optional */}
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

      {/* Added By */}
      <div className="form-group">
        <label className="form-label">Added By *</label>
        <input
          type="text"
          name="added_by"
          value={formData.added_by}
          onChange={handleChange}
          className={`form-input ${errors.added_by ? 'border-red-500' : ''}`}
          placeholder="User or staff member adding this batch (e.g. John Smith)"
        />
        {errors.added_by && <p className="error-text">{errors.added_by}</p>}
      </div>

      {/* Action Buttons - Set to Idle / Release Item */}
      <div className="form-group">
        <label className="form-label">Action</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, idle_release: 'idle', status: 'available' }));
            }}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-semibold ${
              formData.idle_release === 'idle'
                ? 'bg-green-500 text-white border-green-500 shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
                : 'bg-white/80 text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            ✅ Set to Idle
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, idle_release: 'release', status: 'in_use' }));
            }}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-semibold ${
              formData.idle_release === 'release'
                ? 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                : 'bg-white/80 text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            📦 Release Item
          </button>
        </div>
        <div
          className={`mt-3 p-3 rounded-lg border-l-4 ${
            formData.idle_release === 'idle'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
          }`}
        >
          <p className="text-sm font-semibold mb-1">
            {formData.idle_release === 'idle' ? '✅ Idle Mode' : '📋 Release Mode'}
          </p>
          <p className="text-xs text-gray-700">
            {formData.idle_release === 'idle'
              ? 'Save batch to storage as available stock. Items remain in inventory.'
              : 'Release individual items from this batch. Serial number and assignment details required.'}
          </p>
        </div>
      </div>

      {/* Release Fields - Only show when release mode */}
      {formData.idle_release === 'release' && (
        <>
          <div className="form-section">
            <div className="form-section-header">
              <h4 className="form-section-title">Release Details</h4>
            </div>
            <div className="form-section-content">
              {/* Model - Required during release */}
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`form-input ${errors.model ? 'border-red-500' : ''}`}
                  placeholder="Specific model of the item being released (e.g. ThinkPad X1, MacBook Pro)"
                />
                {errors.model && <p className="error-text">{errors.model}</p>}
              </div>

              {/* Serial Number / Asset Tag - Required during release */}
              <div className="form-group">
                <label className="form-label">Serial Number / Asset Tag *</label>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  className={`form-input ${errors.serial ? 'border-red-500' : ''}`}
                  placeholder="Unique identifier for this specific unit (e.g. SN-12345678)"
                />
                {errors.serial && <p className="error-text">{errors.serial}</p>}
              </div>

              {/* Assign To - Person */}
              <div className="form-group">
                <label className="form-label">Assign To - Person *</label>
                <input
                  type="text"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className={`form-input ${errors.assigned_to ? 'border-red-500' : ''}`}
                  placeholder="Name or ID of the person receiving this released item (e.g. John Smith)"
                />
                {errors.assigned_to && <p className="error-text">{errors.assigned_to}</p>}
              </div>

              {/* Assign To - Location */}
              <div className="form-group">
                <label className="form-label">Assign To - Location *</label>
                <input
                  type="text"
                  name="release_location"
                  value={formData.release_location || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.release_location ? 'border-red-500' : ''}`}
                  placeholder="Destination department, site, or location for this released item (e.g. Marketing Department, HQ Floor 3)"
                />
                {errors.release_location && <p className="error-text">{errors.release_location}</p>}
              </div>

              {/* Released By - Auto-filled or manual */}
              <div className="form-group">
                <label className="form-label">Released By *</label>
                <input
                  type="text"
                  name="released_by"
                  value={formData.released_by}
                  onChange={handleChange}
                  className={`form-input ${errors.released_by ? 'border-red-500' : ''}`}
                  placeholder="Name or user ID of the person releasing this item (e.g. John Smith)"
                />
                {errors.released_by && <p className="error-text">{errors.released_by}</p>}
              </div>

              {/* Release Date & Time - Auto-filled */}
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
                `}</style>
                {errors.release_datetime && <p className="error-text">{errors.release_datetime}</p>}
              </div>

              {/* Stock Warning */}
              {formData.remaining_quantity !== undefined && formData.remaining_quantity <= 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ No items remaining in this batch
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    This batch has 0 remaining items. Cannot release more items.
                  </p>
                </div>
              )}

              {formData.remaining_quantity !== undefined && formData.remaining_quantity > 0 && formData.remaining_quantity <= 3 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Low Stock Warning
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Only {formData.remaining_quantity} item(s) remaining in this batch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
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





