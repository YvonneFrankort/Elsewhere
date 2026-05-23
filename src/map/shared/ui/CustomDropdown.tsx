import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label: string;
};

export default function CustomDropdown({
  options,
  value,
  onChange,
  label
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const trigger = root.querySelector(".dropdown-selected");
    const items = root.querySelectorAll(".dropdown-item");

    if (!trigger) return;

    const onTrigger = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen((v) => !v);
    };

    trigger.addEventListener("pointerup", onTrigger);

    items.forEach((item) => {
      item.addEventListener("pointerup", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const value = (item as HTMLElement).dataset.value!;
        onChange(value);
        setOpen(false);
      });
    });

    return () => {
      trigger.removeEventListener("pointerup", onTrigger);
      items.forEach((item) => {
        item.replaceWith(item.cloneNode(true));
      });
    };
  }, [open, options, onChange]);

  return (
    <div
      ref={rootRef}
      className="custom-dropdown"
      style={{ position: "relative", zIndex: 999999 }}
    >
      <div className="dropdown-selected">
        {label}
      </div>

      {open && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="dropdown-item"
              data-value={opt.value}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}