import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
};

export default function CustomDropdown({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="custom-dropdown">
      <div className="dropdown-selected" onClick={() => setOpen(!open)}>
        {selected}
      </div>

      {open && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="dropdown-item"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
