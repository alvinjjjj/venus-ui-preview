import 'assets/styles/index.css';
import { createRoot } from 'react-dom/client';
import { LiteIntroPreview } from './index';

// Deliberately separate from App, wallet initialization, routing and persisted preferences.
const container = document.getElementById('root');
if (container) createRoot(container).render(<LiteIntroPreview />);
