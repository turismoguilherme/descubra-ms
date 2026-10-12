import React from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Item { id: string; name: string }

interface Props {
  items: Item[];
  onChange: (ids: string[]) => void;
  onReset: () => void;
  isCustom: boolean;
}

const Row: React.FC<{ item: Item; index: number }> = ({ item, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: 'none' }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'shadow-lg ring-2 ring-primary z-10 relative' : ''}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
      <span className="text-sm font-medium">{item.name}</span>
    </li>
  );
};

/** Lista onde o turista arrasta os pontos para montar a própria ordem (modo livre). */
const MyRouteOrderPlanner: React.FC<Props> = ({ items, onChange, onReset, isCustom }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    onChange(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Segure e arraste os pontos para montar a ordem do seu passeio. Ela fica salva neste aparelho.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item, i) => <Row key={item.id} item={item} index={i} />)}
          </ul>
        </SortableContext>
      </DndContext>
      {isCustom && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" /> Restaurar ordem sugerida
        </Button>
      )}
    </div>
  );
};

export default MyRouteOrderPlanner;
