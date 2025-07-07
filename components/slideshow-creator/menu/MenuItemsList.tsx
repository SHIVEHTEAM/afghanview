import React, { useState } from "react";
import { Trash2, Edit, Plus, Upload } from "lucide-react";
import { MenuItem } from "./types";
import MenuItemForm from "./MenuItemForm";

interface MenuItemsListProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  onRemoveItem: (id: string) => void;
}

export default function MenuItemsList({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: MenuItemsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSave = (item: MenuItem) => {
    if (editingItem) {
      onUpdateItem(item);
      setEditingItem(null);
    } else {
      onAddItem(item);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">
          Menu Items ({items.length})
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <h5 className="font-semibold mb-4 text-green-800 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </h5>
          <MenuItemForm
            item={
              editingItem || {
                id: "",
                name: "",
                price: 0,
                category: "Main Course",
                description: "",
                isPopular: false,
                dietaryInfo: [],
                image: "",
              }
            }
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={!!editingItem}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            No Menu Items Yet
          </h4>
          <p className="text-gray-500 mb-4">
            Start building your menu by adding your first item
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Use AI suggestions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Add manually</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-gray-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-lg">{item.name}</div>
                  {item.isPopular && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      ⭐ Popular
                    </span>
                  )}
                  {/* {item.spicy && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      🌶️ Spicy
                    </span>
                  )}
                  {item.vegetarian && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      🥬 Vegetarian
                    </span>
                  )} */}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.category}</span>
                  <span className="text-lg font-bold text-green-600">
                    ${item.price}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit item"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
