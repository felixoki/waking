import { useEffect, useState } from "react";
import {
  ComponentName,
  EntityName,
  Event,
  Item as ItemInterface,
  SpellName,
} from "@server/types";
import EventBus from "../game/EventBus";
import { configs } from "@server/configs";
import { ContextMenu, ContextMenuAction } from "./ContextMenu";

export function Inventory() {
  const [items, setItems] = useState<(ItemInterface | null)[]>(
    Array(24).fill(null),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const add = (items: (ItemInterface | null)[]) => setItems(items);

    const toggle = () => {
      setIsOpen((prev) => !prev);
      setMenu(null);
    };

    EventBus.on(Event.INVENTORY_UPDATE, add);
    EventBus.on(Event.UI_TOGGLE, toggle);

    return () => {
      EventBus.off(Event.INVENTORY_UPDATE, add);
      EventBus.off(Event.UI_TOGGLE, toggle);
    };
  }, []);

  if (!isOpen) return null;

  const item = menu !== null ? items[menu.index] : null;

  const actions: ContextMenuAction[] = item
    ? getActions(item.name).map((action) => ({
        label: action,
        onClick: () => {
          if (action === "learn") {
            const spell = getSpell(item.name);
            if (spell)
              EventBus.emit(Event.SPELL_LEARN, {
                entityName: item.name,
                spell,
              });
          }

          setMenu(null);
        },
      }))
    : [];

  return (
    <>
      <ul className="flex flex-wrap gap-1 mt-2 max-w-135">
        {items.map((item, i) => (
          <Item
            key={i}
            item={item}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!item) return;
              const actions = getActions(item.name);
              if (actions.length === 0) return;
              setMenu({ index: i, x: e.clientX, y: e.clientY });
            }}
          />
        ))}
      </ul>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          actions={actions}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

function getActions(name: EntityName): string[] {
  const def = configs.entities[name];
  if (!def) return [];

  const actions: string[] = [];
  if (def.components.some((c) => c.name === ComponentName.LEARNABLE))
    actions.push("learn");

  return actions;
}

function getSpell(name: EntityName): SpellName | null {
  const def = configs.entities[name];
  const learnable = def?.components.find(
    (c) => c.name === ComponentName.LEARNABLE,
  );
  if (learnable && learnable.name === ComponentName.LEARNABLE)
    return learnable.config.spell;
  return null;
}

function Item({
  item,
  onContextMenu,
}: {
  item: ItemInterface | null;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const config = item ? configs.entities[item.name] : null;

  return (
    <li>
      <button
        title={config?.metadata?.description || item?.name || ""}
        className="relative flex items-center justify-center rounded-lg text-xs w-16 aspect-square bg-gray-200"
        onContextMenu={onContextMenu}
      >
        {config?.metadata?.displayName || item?.name || ""}
        <span className="absolute bottom-1 right-1">{item?.quantity}</span>
      </button>
    </li>
  );
}
