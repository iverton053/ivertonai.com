import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Star, 
  X, 
  Check,
  Lightbulb,
  TrendingUp,
  Calendar,
  Globe,
  Mail,
  Phone,
  Building,
  User
} from 'lucide-react';

interface FieldHistoryItem {
  value: string;
  label?: string;
  timestamp: number;
  frequency: number;
  context?: string;
}

interface SmartSuggestion {
  value: string;
  label?: string;
  confidence: number;
  reason: string;
  icon?: string;
  category?: string;
}

interface SmartFormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'select' | 'textarea' | 'date' | 'phone' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  enableHistory?: boolean;
  enableSuggestions?: boolean;
  enableSmartDefaults?: boolean;
  context?: string; // For contextual suggestions
  maxHistoryItems?: number;
  showFrequency?: boolean;
}

const SmartFormField: React.FC<SmartFormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  disabled = false,
  className = '',
  enableHistory = true,
  enableSuggestions = true,
  enableSmartDefaults = true,
  context,
  maxHistoryItems = 5,
  showFrequency = false
}) => {
  const [fieldHistory, setFieldHistory] = useState<FieldHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [smartDefault, setSmartDefault] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const fieldKey = `field_history_${name}`;
  const defaultKey = `smart_default_${name}`;

  // Load field history from localStorage
  useEffect(() => {
    if (enableHistory) {
      const saved = localStorage.getItem(fieldKey);
      if (saved) {
        try {
          setFieldHistory(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading field history:', error);
        }
      }
    }
  }, [fieldKey, enableHistory]);

  // Load smart default
  useEffect(() => {
    if (enableSmartDefaults && !value) {
      const saved = localStorage.getItem(defaultKey);
      if (saved) {
        setSmartDefault(saved);
      }
    }
  }, [defaultKey, enableSmartDefaults, value]);

  // Generate smart suggestions
  useEffect(() => {
    if (!enableSuggestions || !isFocused) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = (): SmartSuggestion[] => {
      const suggestions: SmartSuggestion[] = [];
      
      // History-based suggestions
      const historyMatches = fieldHistory
        .filter(item => 
          value ? item.value.toLowerCase().includes(value.toLowerCase()) : true
        )
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 3)
        .map(item => ({
          value: item.value,
          label: item.label || item.value,
          confidence: Math.min(item.frequency * 20, 95),
          reason: `Used ${item.frequency} times`,
          icon: 'Clock',
          category: 'history'
        }));

      suggestions.push(...historyMatches);

      // Context-based suggestions
      if (context) {
        const contextSuggestions = getContextualSuggestions(context, type, value);
        suggestions.push(...contextSuggestions);
      }

      // Type-based smart suggestions
      const typeSuggestions = getTypeSuggestions(type, value);
      suggestions.push(...typeSuggestions);

      return suggestions
        .filter((suggestion, index, self) => 
          self.findIndex(s => s.value === suggestion.value) === index
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxHistoryItems);
    };

    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
  }, [value, isFocused, fieldHistory, context, type, enableSuggestions, maxHistoryItems]);

  const getContextualSuggestions = (ctx: string, fieldType: string, currentValue: string): SmartSuggestion[] => {
    const contextMap: Record<string, SmartSuggestion[]> = {
      'crm-contact': [
        { value: 'john.doe@company.com', confidence: 85, reason: 'Common business email format', icon: 'Mail', category: 'pattern' },
        { value: '+1 (555) 123-4567', confidence: 80, reason: 'Standard US phone format', icon: 'Phone', category: 'pattern' },
        { value: 'TechCorp Solutions', confidence: 75, reason: 'Common business name pattern', icon: 'Building', category: 'pattern' }
      ],
      'campaign': [
        { value: 'Q4 2024 Campaign', confidence: 90, reason: 'Quarterly campaign naming', icon: 'Calendar', category: 'pattern' },
        { value: 'Holiday Promotion', confidence: 85, reason: 'Seasonal campaign', icon: 'Star', category: 'seasonal' },
        { value: 'Product Launch', confidence: 80, reason: 'Common campaign type', icon: 'TrendingUp', category: 'type' }
      ],
      'email-marketing': [
        { value: 'Welcome Series', confidence: 95, reason: 'Most effective email type', icon: 'Mail', category: 'best-practice' },
        { value: 'Newsletter', confidence: 85, reason: 'High engagement rate', icon: 'Mail', category: 'best-practice' },
        { value: 'Product Update', confidence: 75, reason: 'Good conversion rate', icon: 'TrendingUp', category: 'performance' }
      ]
    };

    return contextMap[ctx] || [];
  };

  const getTypeSuggestions = (fieldType: string, currentValue: string): SmartSuggestion[] => {
    if (!currentValue) return [];

    const typeSuggestions: Record<string, SmartSuggestion[]> = {
      email: [
        { value: currentValue.includes('@') ? currentValue : `${currentValue}@gmail.com`, confidence: 70, reason: 'Complete email format', icon: 'Mail', category: 'format' }
      ],
      phone: [
        { value: formatPhoneNumber(currentValue), confidence: 75, reason: 'Formatted phone number', icon: 'Phone', category: 'format' }
      ],
      url: [
        { value: currentValue.startsWith('http') ? currentValue : `https://${currentValue}`, confidence: 80, reason: 'Complete URL format', icon: 'Globe', category: 'format' }
      ]
    };

    return typeSuggestions[fieldType] || [];
  };

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const saveToHistory = (selectedValue: string) => {
    if (!enableHistory || !selectedValue.trim()) return;

    const newHistory = [...fieldHistory];
    const existingIndex = newHistory.findIndex(item => item.value === selectedValue);
    
    if (existingIndex >= 0) {
      newHistory[existingIndex].frequency += 1;
      newHistory[existingIndex].timestamp = Date.now();
    } else {
      newHistory.push({
        value: selectedValue,
        timestamp: Date.now(),
        frequency: 1,
        context
      });
    }

    // Keep only the most recent and frequent items
    const sortedHistory = newHistory
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50); // Store more in localStorage, show less in UI

    setFieldHistory(sortedHistory);
    localStorage.setItem(fieldKey, JSON.stringify(sortedHistory));

    // Update smart default
    if (enableSmartDefaults) {
      localStorage.setItem(defaultKey, selectedValue);
    }
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleSuggestionSelect = (suggestion: SmartSuggestion) => {
    onChange(suggestion.value);
    saveToHistory(suggestion.value);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && smartDefault && !value) {
      e.preventDefault();
      onChange(smartDefault);
      saveToHistory(smartDefault);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderInput = () => {
    const baseClasses = `w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          name={name}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (smartDefault ? `Press Tab for: ${smartDefault}` : `Enter ${label.toLowerCase()}...`)}
          required={required}
          disabled={disabled}
          className={baseClasses}
          rows={4}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          name={name}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          required={required}
          disabled={disabled}
          className={baseClasses}
        >
          <option value="">{placeholder || `Select ${label.toLowerCase()}...`}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        name={name}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (smartDefault ? `Press Tab for: ${smartDefault}` : `Enter ${label.toLowerCase()}...`)}
        required={required}
        disabled={disabled}
        className={baseClasses}
      />
    );
  };

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {smartDefault && !value && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1 text-xs text-purple-400"
          >
            <Lightbulb className="w-3 h-3" />
            <span>Press Tab for smart default</span>
          </motion.div>
        )}
      </div>

      <div className="relative">
        {renderInput()}
        
        {(enableHistory || enableSuggestions) && isFocused && suggestions.length > 0 && (
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-gray-800/95 backdrop-blur-lg border border-gray-600/50 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.value}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 ${
                      suggestion.category === 'history' ? 'text-blue-400' :
                      suggestion.category === 'pattern' ? 'text-green-400' :
                      suggestion.category === 'best-practice' ? 'text-purple-400' :
                      'text-gray-400'
                    }`}>
                      {suggestion.icon === 'Clock' && <Clock className="w-4 h-4" />}
                      {suggestion.icon === 'Mail' && <Mail className="w-4 h-4" />}
                      {suggestion.icon === 'Phone' && <Phone className="w-4 h-4" />}
                      {suggestion.icon === 'Globe' && <Globe className="w-4 h-4" />}
                      {suggestion.icon === 'Building' && <Building className="w-4 h-4" />}
                      {suggestion.icon === 'Star' && <Star className="w-4 h-4" />}
                      {suggestion.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4" />}
                      {suggestion.icon === 'Calendar' && <Calendar className="w-4 h-4" />}
                      {!suggestion.icon && <Lightbulb className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {suggestion.label || suggestion.value}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {suggestion.reason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      {suggestion.confidence}%
                    </div>
                    <Check className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SmartFormField;