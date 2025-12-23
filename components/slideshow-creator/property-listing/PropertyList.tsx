import React from "react";
import { Edit2, Trash2, Plus, Home } from "lucide-react";
import { Property } from "./types";

interface PropertyListProps {
    properties: Property[];
    onAdd: () => void;
    onEdit: (property: Property) => void;
    onRemove: (id: string) => void;
}

export default function PropertyList({ properties, onAdd, onEdit, onRemove }: PropertyListProps) {
    if (properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Home className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties added yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                    Add properties to create your real estate slideshow. Include details like price, address, and photos.
                </p>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5" />
                    Add Your First Property
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                    Your Properties ({properties.length})
                </h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="relative aspect-video bg-gray-100">
                            {property.images.length > 0 ? (
                                <img
                                    src={
                                        property.images[0] instanceof File
                                            ? URL.createObjectURL(property.images[0] as File)
                                            : (property.images[0] as string)
                                    }
                                    alt={property.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                    <Home className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(property)}
                                    className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRemove(property.id)}
                                    className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                                <div className="font-bold text-lg">{property.price}</div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h4 className="font-semibold text-gray-900 truncate mb-1">{property.name}</h4>
                            <p className="text-sm text-gray-500 truncate mb-3">{property.address}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-600 border-t pt-3">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">{property.bedrooms}</span> Bed
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">{property.bathrooms}</span> Bath
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">{property.squareFeet}</span> SqFt
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
