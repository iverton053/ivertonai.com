import React from 'react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
  availableWidgets: any[];
}

declare const AddWidgetModal: React.FC<AddWidgetModalProps>;
export default AddWidgetModal;