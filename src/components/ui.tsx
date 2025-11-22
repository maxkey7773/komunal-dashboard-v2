import { clsx } from "clsx";

export function Card({ children, className="" }: any) {
  return <div className={clsx("card p-4", className)}>{children}</div>;
}
export function CardTitle({ children }: any) {
  return <div className="text-sm text-slate-300">{children}</div>;
}
export function CardValue({ children }: any) {
  return <div className="text-2xl font-semibold mt-1">{children}</div>;
}
export function Button({ children, className="", ...props }: any) {
  return <button className={clsx("btn", className)} {...props}>{children}</button>;
}
export function GhostButton({ children, className="", ...props }: any) {
  return <button className={clsx("btn btn-ghost", className)} {...props}>{children}</button>;
}
export function Input(props: any) {
  return <input className="input" {...props} />;
}
export function Select({ className="", ...props }: any) {
  return <select className={clsx("input", className)} {...props} />;
}
export function Label({ children }: any) {
  return <label className="text-sm text-slate-300">{children}</label>;
}
export function Hr() { return <div className="h-px bg-slate-800 my-3" />; }
