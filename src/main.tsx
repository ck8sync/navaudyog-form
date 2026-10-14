import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { THEME } from './content';
import './index.css';

// Inject theme colours from content.ts as CSS variables
const vars = (t: Record<string, string>) =>
  Object.entries(t)
    .map(([k, v]) => `--${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v};`)
    .join('');
const light = `:root{color-scheme:light;${vars(THEME.light)}}`;
const dark = `:root{color-scheme:dark;${vars(THEME.dark)}}`;
const css = { light, dark, system: `${light}@media(prefers-color-scheme:dark){${dark}}` };
const style = document.createElement('style');
style.textContent = css[THEME.mode];
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
