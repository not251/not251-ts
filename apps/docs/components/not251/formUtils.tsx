import { Dispatch, SetStateAction } from "react";

interface RenderProps<T> {
  id: keyof T;
  label: string;
  params: T;
  setParams: Dispatch<SetStateAction<T>>;
}

interface SliderProps<T> extends RenderProps<T> {
  max: number;
  min?: number;
  step?: number;
}

export function renderSlider<T>({
  id,
  label,
  params,
  setParams,
  max,
  min = 0,
  step = 1,
}: SliderProps<T>) {
  const value = typeof params[id] === "number" ? (params[id] as number) : 0;

  return (
    <div className="flex items-center space-x-2">
      <label>{label}:</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          setParams((prev) => ({ ...prev, [id]: Number(e.target.value) }))
        }
        className="w-32"
      />
      <span>{value}</span>
    </div>
  );
}

export function renderCheckbox<T>({
  id,
  label,
  params,
  setParams,
}: RenderProps<T>) {
  const checked =
    typeof params[id] === "boolean" ? (params[id] as boolean) : false;

  return (
    <div className="flex items-center space-x-2">
      <label>{label}:</label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          setParams((prev) => ({ ...prev, [id]: e.target.checked }))
        }
      />
    </div>
  );
}
