import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash2,
  Type,
  GripVertical,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { SlideMedia } from "./types";

interface MediaListProps {
  media: SlideMedia[];
  selectedMedia: string | null;
  defaultDuration: number;
  onDragEnd: (result: any) => void;
  onSelectMedia: (id: string) => void;
  onRemoveMedia: (id: string) => void;
  onShowTextEditor: () => void;
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement }>;
}

// Sortable Media Item Component
function SortableMediaItem({
  item,
  index,
  selectedMedia,
  defaultDuration,
  onSelectMedia,
  onRemoveMedia,
  onShowTextEditor,
  videoRefs,
}: {
  item: SlideMedia;
  index: number;
  selectedMedia: string | null;
  defaultDuration: number;
  onSelectMedia: (id: string) => void;
  onRemoveMedia: (id: string) => void;
  onShowTextEditor: () => void;
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement }>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white rounded-lg border-2 transition-all cursor-pointer ${
        isDragging
          ? "border-purple-500 shadow-lg scale-105 opacity-75"
          : selectedMedia === item.id
          ? "border-green-400 bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelectMedia(item.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Media Preview */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        {item.type === "video" ? (
          <video
            ref={(el) => {
              if (el) videoRefs.current[item.id] = el;
            }}
            src={item.url}
            className="w-full h-full object-cover"
            muted
            onLoadedMetadata={() => {
              if (videoRefs.current[item.id]) {
                videoRefs.current[item.id].currentTime = 1;
              }
            }}
          />
        ) : (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {item.type === "video" ? (
            <Video className="w-3 h-3" />
          ) : (
            <ImageIcon className="w-3 h-3" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
          <span>•</span>
          <span>
            {item.type === "video"
              ? `${(item.duration || 0) / 1000}s`
              : `${(item.duration || defaultDuration) / 1000}s`}
          </span>
          {item.textOverlay && (
            <>
              <span>•</span>
              <span className="text-blue-600">Text</span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowTextEditor();
          }}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Add text overlay"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveMedia(item.id);
          }}
          className="p-2 text-pink-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MediaList({
  media,
  selectedMedia,
  defaultDuration,
  onDragEnd,
  onSelectMedia,
  onRemoveMedia,
  onShowTextEditor,
  videoRefs,
}: MediaListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalDuration = media.reduce((total, item) => {
    // For videos, use their natural duration; for images, use their set duration or default
    const itemDuration =
      item.type === "video"
        ? item.duration || 0
        : item.duration || defaultDuration;
    return total + itemDuration;
  }, 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = media.findIndex((item) => item.id === active.id);
      const newIndex = media.findIndex((item) => item.id === over?.id);

      onDragEnd({
        source: { index: oldIndex },
        destination: { index: newIndex },
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Your Media ({media.length})
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={media.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {media.map((item, index) => (
              <SortableMediaItem
                key={item.id}
                item={item}
                index={index}
                selectedMedia={selectedMedia}
                defaultDuration={defaultDuration}
                onSelectMedia={onSelectMedia}
                onRemoveMedia={onRemoveMedia}
                onShowTextEditor={onShowTextEditor}
                videoRefs={videoRefs}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span>Total duration: {(totalDuration / 1000).toFixed(1)}s</span>
          <span>{media.length} items</span>
        </div>
      </div>
    </div>
  );
}
