import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const THINKING_WORDS = [
  'Pondering',
  'Untangling',
  'Percolating',
  'Noodling',
  'Marinating',
  'Ruminating',
  'Contemplating',
  'Deliberating',
  'Cogitating',
  'Mulling',
  'Wrangling',
  'Unpacking',
  'Puzzling',
  'Synthesizing',
  'Simmering',
  'Brewing',
  'Assembling',
  'Weaving',
  'Threading',
  'Excavating',
  'Sifting',
  'Distilling',
  'Composing',
  'Sketching',
  'Doodling',
  'Tinkering',
  'Whittling',
  'Chewing',
  'Digesting',
  'Untying',
  'Decoding',
  'Deciphering',
  'Parsing',
  'Connecting',
  'Bridging',
  'Charting',
  'Mapping',
  'Plotting',
  'Formulating',
  'Conjuring',
  'Summoning',
  'Wrestling',
  'Grappling',
  'Sculpting',
  'Crafting',
  'Refining',
  'Polishing',
  'Calibrating',
  'Untwisting',
  'Unspooling',
  'Musing',
  'Reflecting',
  'Cross-checking',
  'Fact-finding',
  'Rummaging',
  'Foraging',
  'Untethering',
  'Reticulating',
  'Recalibrating',
  'Unravelling',
  'Extrapolating',
  'Interpolating',
  'Triangulating',
  'Corroborating',
  'Verifying',
  'Cataloguing',
  'Indexing',
  'Collating',
  'Consolidating',
  'Harmonizing',
  'Deducing',
  'Inferring',
  'Hypothesizing',
  'Theorizing',
  'Reasoning',
  'Untwining',
  'Disentangling',
  'Reconciling',
  'Squaring',
  'Iterating',
];

const MIN_MS = 1000;
const MAX_MS = 2600;

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickWord = (exclude) => {
  if (THINKING_WORDS.length === 1) return THINKING_WORDS[0];
  let word;
  do {
    word = THINKING_WORDS[Math.floor(Math.random() * THINKING_WORDS.length)];
  } while (word === exclude);
  return word;
};

const TypingIndicator = () => {
  const [word, setWord] = useState(() => pickWord(null));
  const timeoutRef = useRef(null);

  useEffect(() => {
    const scheduleNext = () => {
      timeoutRef.current = setTimeout(
        () => {
          setWord((prev) => pickWord(prev));
          scheduleNext();
        },
        randomBetween(MIN_MS, MAX_MS)
      );
    };

    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="w-full py-3">
      <div className="max-w-3xl mx-auto px-3 md:px-4 flex items-center gap-2 justify-start">
        <AnimatePresence mode="wait">
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[14px] text-slate-400"
          >
            {word}…
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypingIndicator;
