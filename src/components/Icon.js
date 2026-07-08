import Svg, { Path, Circle, Rect, G } from "react-native-svg";

// Stroke-style icons (outline). Reuses the web app's icon paths.
const STROKE = {
  chevronLeft: <Path d="M15 18l-6-6 6-6" />,
  chevronRight: <Path d="M9 18l6-6-6-6" />,
  search: <><Circle cx="11" cy="11" r="7" /><Path d="M21 21l-4.3-4.3" /></>,
  users: <><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx="9" cy="7" r="4" /><Path d="M23 21v-2a4 4 0 0 0-3-3.87" /><Path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></>,
  box: <><Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><Path d="M3.27 6.96L12 12.01l8.73-5.05" /><Path d="M12 22.08V12" /></>,
  receipt: <><Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" /><Path d="M8 7h8M8 11h8M8 15h5" /></>,
  calendar: <><Rect x="3" y="4" width="18" height="18" rx="2" /><Path d="M16 2v4M8 2v4M3 10h18" /></>,
  plus: <Path d="M12 5v14M5 12h14" />,
  close: <Path d="M18 6L6 18M6 6l12 12" />,
  logout: <><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Path d="M16 17l5-5-5-5M21 12H9" /></>,
  clock: <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></>,
  check: <Path d="M20 6L9 17l-5-5" />,
  trash: <><Path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
  mail: <><Rect x="2" y="4" width="20" height="16" rx="2" /><Path d="M22 7l-10 6L2 7" /></>,
  phone: <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  dollar: <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  arrow: <Path d="M5 12h14M13 6l6 6-6 6" />,
  alert: <><Circle cx="12" cy="12" r="10" /><Path d="M12 8v4M12 16h.01" /></>,
  lock: <><Rect x="3" y="11" width="18" height="11" rx="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  chevronDown: <Path d="M6 9l6 6 6-6" />,
  edit: <><Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><Path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
};

// Fill-style lotus brand mark.
function Lotus({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
      <G transform="translate(24,33)">
        <Path opacity={0.5} transform="rotate(-60)" d="M0 0 C -5 -7 -5 -15 0 -21 C 5 -15 5 -7 0 0 Z" />
        <Path opacity={0.5} transform="rotate(60)" d="M0 0 C -5 -7 -5 -15 0 -21 C 5 -15 5 -7 0 0 Z" />
        <Path opacity={0.75} transform="rotate(-31)" d="M0 0 C -5 -8 -5 -17 0 -23 C 5 -17 5 -8 0 0 Z" />
        <Path opacity={0.75} transform="rotate(31)" d="M0 0 C -5 -8 -5 -17 0 -23 C 5 -17 5 -8 0 0 Z" />
        <Path d="M0 2 C -5 -8 -4 -20 0 -27 C 4 -20 5 -8 0 2 Z" />
      </G>
    </Svg>
  );
}

export default function Icon({ name, size = 20, color = "#0f172a", strokeWidth = 1.9 }) {
  if (name === "lotus") return <Lotus size={size} color={color} />;
  const child = STROKE[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {child}
    </Svg>
  );
}
