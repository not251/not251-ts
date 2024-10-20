import { Dispatch, SetStateAction } from "react";

interface RenderProps<T> {
  name: string;
  params: T;
  setParams: Dispatch<SetStateAction<T>>;
}

interface SliderProps<T> extends RenderProps<T> {
  max: number;
  step?: number;
}

export function renderSlider<T>({
  name,
  params,
  setParams,
  max,
  step,
}: SliderProps<T>) {
  const paramName = name.toLowerCase() as keyof T;
  const value =
    typeof params[paramName] === "number" ? (params[paramName] as number) : 0;

  return (
    <div className="flex items-center space-x-2">
      <label>{name}:</label>
      <input
        type="range"
        min={0}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) =>
          setParams((prev) => ({
            ...prev,
            [paramName]: Number(e.target.value),
          }))
        }
        className="w-32"
      />
      <span>
        {value +
          (name === "Modo" || name === "Grado"
            ? 1
            : name === "Octave"
              ? -1
              : 0)}
      </span>
    </div>
  );
}

export function renderCheckbox<T>({ name, params, setParams }: RenderProps<T>) {
  const paramName = name.toLowerCase() as keyof T;
  const checked =
    typeof params[paramName] === "boolean"
      ? (params[paramName] as boolean)
      : false;

  return (
    <div className="flex items-center space-x-2">
      <label>{name}:</label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          setParams((prev) => ({ ...prev, [paramName]: e.target.checked }))
        }
      />
    </div>
  );
}
