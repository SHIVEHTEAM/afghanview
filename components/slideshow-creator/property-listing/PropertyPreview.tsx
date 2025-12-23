import React from "react";
import { Property, PropertyTheme, PropertyLayout } from "./types";
import { Bath, Bed, Move, MapPin } from "lucide-react";

interface PropertyPreviewProps {
    properties: Property[];
    theme: PropertyTheme;
    layout: PropertyLayout;
}

export default function PropertyPreview({ properties, theme, layout }: PropertyPreviewProps) {
    if (properties.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-black text-white/50">
                No properties to preview
            </div>
        );
    }

    // Preview the first property
    const property = properties[0];
    const image = property.images[0];
    const imageUrl = image instanceof File ? URL.createObjectURL(image) : image as string;

    return (
        <div
            className="w-full h-full relative overflow-hidden"
            style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: theme.fontFamily
            }}
        >
            {/* Background Image with Blur (optional based on theme) */}
            <div className="absolute inset-0 opacity-20 filter blur-xl">
                {imageUrl && <img src={imageUrl} alt="" className="w-full h-full object-cover" />}
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 flex flex-col md:flex-row p-8 gap-8 z-10">

                {/* Left: Main Image */}
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl">
                    {imageUrl ? (
                        <img src={imageUrl} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}

                    <div className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold text-xl shadow-lg"
                        style={{ backgroundColor: theme.accentColor, color: theme.backgroundColor === "#ffffff" ? "#ffffff" : theme.textColor }}>
                        {property.price}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 leading-tight">{property.name}</h1>
                        <div className="flex items-center gap-2 opacity-80 text-lg">
                            <MapPin className="w-5 h-5" />
                            <span>{property.address}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-b py-6"
                        style={{ borderColor: theme.textColor + '30' }}>
                        <div className="text-center">
                            <Bed className="w-8 h-8 mx-auto mb-2" style={{ color: theme.accentColor }} />
                            <div className="font-bold text-xl">{property.bedrooms}</div>
                            <div className="text-sm opacity-70">Bedrooms</div>
                        </div>
                        <div className="text-center border-l" style={{ borderColor: theme.textColor + '30' }}>
                            <Bath className="w-8 h-8 mx-auto mb-2" style={{ color: theme.accentColor }} />
                            <div className="font-bold text-xl">{property.bathrooms}</div>
                            <div className="text-sm opacity-70">Bathrooms</div>
                        </div>
                        <div className="text-center border-l" style={{ borderColor: theme.textColor + '30' }}>
                            <Move className="w-8 h-8 mx-auto mb-2" style={{ color: theme.accentColor }} />
                            <div className="font-bold text-xl">{property.squareFeet}</div>
                            <div className="text-sm opacity-70">Sq Ft</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2 uppercase tracking-wider text-sm opacity-70">Features</h3>
                        <div className="flex flex-wrap gap-2">
                            {property.features?.slice(0, 5).map((feature, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: theme.accentColor + '20', color: theme.accentColor }}
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-4 opacity-80">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                            {/* Placeholder for agent image */}
                        </div>
                        <div>
                            <div className="font-bold">{property.agentName || "Listing Agent"}</div>
                            <div className="text-sm">{property.agentPhone || "(555) 123-4567"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
