import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface CustomCode {
  id: string;
  name: string;
  type: 'css' | 'javascript';
  code: string;
  enabled: boolean;
  position: 'head' | 'body-start' | 'body-end';
  created_at: string;
  updated_at: string;
}

interface UseCustomCodeOptions {
  portalId: string;
  enabled?: boolean;
}

export const useCustomCode = ({ portalId, enabled = true }: UseCustomCodeOptions) => {
  const [customCodes, setCustomCodes] = useState<CustomCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load custom codes from database
  const loadCustomCodes = useCallback(async () => {
    if (!enabled || !portalId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('portal_custom_code')
        .select('*')
        .eq('client_portal_id', portalId)
        .eq('enabled', true)
        .order('position');

      if (error) throw error;

      setCustomCodes(data || []);
    } catch (err) {
      console.error('Error loading custom codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load custom codes');
    } finally {
      setLoading(false);
    }
  }, [portalId, enabled]);

  // Apply CSS codes to the document
  const applyCSSCodes = useCallback(() => {
    if (!enabled) return;

    // Remove existing custom CSS
    const existingStyles = document.querySelectorAll('style[data-custom-portal-css]');
    existingStyles.forEach(style => style.remove());

    // Apply new CSS codes
    const cssCode = customCodes
      .filter(code => code.type === 'css' && code.enabled)
      .map(code => code.code)
      .join('\n\n');

    if (cssCode.trim()) {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-custom-portal-css', 'true');
      styleElement.textContent = cssCode;

      // Insert based on position
      const headCodes = customCodes.filter(code =>
        code.type === 'css' && code.enabled && code.position === 'head'
      );

      if (headCodes.length > 0) {
        document.head.appendChild(styleElement);
      }
    }
  }, [customCodes, enabled]);

  // Apply JavaScript codes to the document
  const applyJavaScriptCodes = useCallback(() => {
    if (!enabled) return;

    // Remove existing custom scripts
    const existingScripts = document.querySelectorAll('script[data-custom-portal-js]');
    existingScripts.forEach(script => script.remove());

    // Apply JavaScript codes based on position
    const jsCodes = customCodes.filter(code => code.type === 'javascript' && code.enabled);

    jsCodes.forEach(code => {
      if (!code.code.trim()) return;

      try {
        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('data-custom-portal-js', 'true');
        scriptElement.textContent = code.code;

        switch (code.position) {
          case 'head':
            document.head.appendChild(scriptElement);
            break;
          case 'body-start':
            document.body.insertBefore(scriptElement, document.body.firstChild);
            break;
          case 'body-end':
            document.body.appendChild(scriptElement);
            break;
          default:
            document.head.appendChild(scriptElement);
        }
      } catch (err) {
        console.error(`Error executing custom JavaScript "${code.name}":`, err);
      }
    });
  }, [customCodes, enabled]);

  // Apply all custom codes
  const applyCustomCodes = useCallback(() => {
    if (!enabled || loading) return;

    applyCSSCodes();
    applyJavaScriptCodes();
  }, [enabled, loading, applyCSSCodes, applyJavaScriptCodes]);

  // Security validation for custom code
  const validateCode = useCallback((code: string, type: 'css' | 'javascript'): { valid: boolean; warnings: string[] } => {
    const warnings: string[] = [];

    if (type === 'javascript') {
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        { pattern: /document\.cookie/gi, warning: 'Accessing document.cookie detected' },
        { pattern: /localStorage\.setItem.*token|password|auth/gi, warning: 'Potential credential storage detected' },
        { pattern: /sessionStorage\.setItem.*token|password|auth/gi, warning: 'Potential credential storage detected' },
        { pattern: /fetch.*\/api\/.*password|token|auth/gi, warning: 'Potential API credential access detected' },
        { pattern: /window\.location\.href\s*=/gi, warning: 'Page redirect detected' },
        { pattern: /eval\s*\(/gi, warning: 'eval() usage detected (security risk)' },
        { pattern: /innerHTML\s*=/gi, warning: 'innerHTML assignment detected (XSS risk)' },
        { pattern: /outerHTML\s*=/gi, warning: 'outerHTML assignment detected (XSS risk)' }
      ];

      dangerousPatterns.forEach(({ pattern, warning }) => {
        if (pattern.test(code)) {
          warnings.push(warning);
        }
      });

      // Check for external resource loading
      if (/src\s*=\s*["']https?:\/\/[^"']+/gi.test(code)) {
        warnings.push('External resource loading detected');
      }
    }

    if (type === 'css') {
      // Check for CSS injection patterns
      const dangerousPatterns = [
        { pattern: /javascript:/gi, warning: 'JavaScript URL in CSS detected' },
        { pattern: /@import.*url\(/gi, warning: 'External CSS import detected' },
        { pattern: /expression\s*\(/gi, warning: 'CSS expression usage detected (IE only, but risky)' }
      ];

      dangerousPatterns.forEach(({ pattern, warning }) => {
        if (pattern.test(code)) {
          warnings.push(warning);
        }
      });
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }, []);

  // Save custom code
  const saveCustomCode = useCallback(async (codeData: Omit<CustomCode, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      // Validate code before saving
      const validation = validateCode(codeData.code, codeData.type);
      if (!validation.valid) {
        const proceed = window.confirm(
          `Security warnings detected:\n${validation.warnings.join('\n')}\n\nDo you want to proceed?`
        );
        if (!proceed) {
          throw new Error('Code validation failed');
        }
      }

      const { data, error } = await supabase
        .from('portal_custom_code')
        .insert({
          client_portal_id: portalId,
          ...codeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCustomCodes(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error saving custom code:', err);
      setError(err instanceof Error ? err.message : 'Failed to save custom code');
      throw err;
    }
  }, [portalId, validateCode]);

  // Update custom code
  const updateCustomCode = useCallback(async (id: string, updates: Partial<CustomCode>) => {
    try {
      setError(null);

      // Validate code if it's being updated
      if (updates.code && updates.type) {
        const validation = validateCode(updates.code, updates.type);
        if (!validation.valid) {
          const proceed = window.confirm(
            `Security warnings detected:\n${validation.warnings.join('\n')}\n\nDo you want to proceed?`
          );
          if (!proceed) {
            throw new Error('Code validation failed');
          }
        }
      }

      const { data, error } = await supabase
        .from('portal_custom_code')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('client_portal_id', portalId)
        .select()
        .single();

      if (error) throw error;

      setCustomCodes(prev => prev.map(code => code.id === id ? data : code));
      return data;
    } catch (err) {
      console.error('Error updating custom code:', err);
      setError(err instanceof Error ? err.message : 'Failed to update custom code');
      throw err;
    }
  }, [portalId, validateCode]);

  // Delete custom code
  const deleteCustomCode = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('portal_custom_code')
        .delete()
        .eq('id', id)
        .eq('client_portal_id', portalId);

      if (error) throw error;

      setCustomCodes(prev => prev.filter(code => code.id !== id));
    } catch (err) {
      console.error('Error deleting custom code:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete custom code');
      throw err;
    }
  }, [portalId]);

  // Toggle code enabled status
  const toggleCustomCode = useCallback(async (id: string) => {
    const code = customCodes.find(c => c.id === id);
    if (!code) return;

    return updateCustomCode(id, { enabled: !code.enabled });
  }, [customCodes, updateCustomCode]);

  // Load codes on mount and portal change
  useEffect(() => {
    loadCustomCodes();
  }, [loadCustomCodes]);

  // Apply codes when they change
  useEffect(() => {
    applyCustomCodes();
  }, [applyCustomCodes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        // Remove custom CSS
        const existingStyles = document.querySelectorAll('style[data-custom-portal-css]');
        existingStyles.forEach(style => style.remove());

        // Remove custom JS (scripts can't be "undone" but we can clean up the elements)
        const existingScripts = document.querySelectorAll('script[data-custom-portal-js]');
        existingScripts.forEach(script => script.remove());
      }
    };
  }, [enabled]);

  return {
    customCodes,
    loading,
    error,
    saveCustomCode,
    updateCustomCode,
    deleteCustomCode,
    toggleCustomCode,
    validateCode,
    refreshCodes: loadCustomCodes,
    applyCustomCodes
  };
};