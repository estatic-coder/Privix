import re

with open('c:/Users/Samerath Kumar/OneDrive/Desktop/Code/Privix/frontend/src/components/ExposureCard.jsx', 'r') as f:
    text = f.read()

# Strip framer-motion imports
text = re.sub(r"import \{ motion, AnimatePresence \} from 'framer-motion';\n", '', text)

# Replace <motion.div> with <div>
text = re.sub(r'<motion\.div([^>]*)>', r'<div\1>', text)
text = re.sub(r'</motion\.div>', '</div>', text)

# Replace <motion.button> with <button>
text = re.sub(r'<motion\.button([^>]*)>', r'<button\1>', text)
text = re.sub(r'</motion\.button>', '</button>', text)

# Remove framer-motion props
text = re.sub(r'\s*initial=\{[^}]+\}', '', text)
text = re.sub(r'\s*animate=\{[^}]+\}', '', text)
text = re.sub(r'\s*exit=\{[^}]+\}', '', text)
text = re.sub(r'\s*whileHover=\{[^}]+\}', '', text)
text = re.sub(r'\s*whileTap=\{[^}]+\}', '', text)
text = re.sub(r'\s*layout\s*', '', text)

# Remove AnimatePresence wrappers
text = re.sub(r'<AnimatePresence>', '', text)
text = re.sub(r'</AnimatePresence>', '', text)

# Change .exposure-card to .brutalist-card in the outer div
text = text.replace('className={`exposure-card risk-${finding.risk} tilt-card`}', 'className={`brutalist-card risk-${finding.risk} mb-4`}')

# Remove inline styles that add perspective and rotate
text = re.sub(r'style=\{\{[^}]+\}\}', '', text)
text = text.replace('onMouseMove={handleMouseMove}', '')
text = text.replace('onMouseLeave={handleMouseLeave}', '')

# Remove rounded-lg from buttons and headers
text = text.replace('rounded-lg', 'rounded-none')
text = text.replace('rounded-xl', 'rounded-none')
text = text.replace('rounded-full', 'rounded-none')

with open('c:/Users/Samerath Kumar/OneDrive/Desktop/Code/Privix/frontend/src/components/ExposureCard.jsx', 'w') as f:
    f.write(text)
