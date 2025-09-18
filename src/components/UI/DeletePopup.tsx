import React from "react";
import { X } from "lucide-react";

interface DeletePopupProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeletePopup: React.FC<DeletePopupProps> = ({
  open,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-gray-600">{description}</p>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
