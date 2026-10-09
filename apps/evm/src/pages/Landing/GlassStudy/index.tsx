import { SecondaryButton } from '@venusprotocol/ui';
import { ButtonGroup, Page } from 'components';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useStackCopy } from '../VenusStack/useStackCopy';
import { createGlassStudy } from './scene';

/** Isolated material experiment: it never changes the New / E landing renderers. */
export const GlassStudy = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReturnType<typeof createGlassStudy> | null>(null);
  const [frost, setFrost] = useState(true);
  const [joined, setJoined] = useState(false);
  const [boxed, setBoxed] = useState(false);
  const [layered, setLayered] = useState(true);
  const [available, setAvailable] = useState(true);
  const reduced = useReducedMotion() ?? false;
  const copy = useStackCopy();
  const hubName = copy.liquidityHub.name;
  const spokeName = copy.spokes.name;
  const optionsRef = useRef({ frost, joined, boxed, layered });
  optionsRef.current = { frost, joined, boxed, layered };

  useEffect(() => {
    if (!mountRef.current) return;
    try {
      sceneRef.current = createGlassStudy(mountRef.current, [hubName, spokeName], reduced);
      sceneRef.current.configure(optionsRef.current);
      setAvailable(true);
    } catch {
      setAvailable(false);
    }
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [hubName, spokeName, reduced]);

  useEffect(() => {
    sceneRef.current?.configure({ frost, joined, boxed, layered });
  }, [frost, joined, boxed, layered]);

  return (
    <Page indexWithSearchEngines={false}>
      <section className="bg-background-active text-white">
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Glass material study</h1>
            <Link
              className="text-light-grey hover:text-white underline underline-offset-4"
              to="/?chainId=56"
            >
              Back to landing
            </Link>
          </div>
          <p className="mt-2 text-light-grey">
            Square glass layers. A continuous case. Clear surface lettering.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonGroup
              ariaLabel="Glass finish"
              buttonLabels={['Clear glass', 'Soft frost']}
              activeButtonIndex={frost ? 1 : 0}
              onButtonClick={i => setFrost(i === 1)}
              buttonSize="sm"
            />
            <ButtonGroup
              ariaLabel="Layer separation"
              buttonLabels={['Split', 'Join', 'Box']}
              activeButtonIndex={boxed ? 2 : joined ? 1 : 0}
              onButtonClick={i => {
                setJoined(i !== 0);
                setBoxed(i === 2);
              }}
              buttonSize="sm"
            />
            <ButtonGroup
              ariaLabel="Refraction comparison"
              buttonLabels={['Standard', 'Layered refraction']}
              activeButtonIndex={layered ? 1 : 0}
              onButtonClick={i => setLayered(i === 1)}
              buttonSize="sm"
            />
            <SecondaryButton size="sm" onClick={() => sceneRef.current?.reset()}>
              Reset view
            </SecondaryButton>
          </div>
        </div>
        <div
          ref={mountRef}
          className="relative h-[45svh] min-h-96 md:h-[70svh]"
          role="img"
          aria-label="Interactive square Venus glass layers and closing case. Drag to rotate; compare Split, Join and Box using the controls."
        />
        {!available && (
          <p className="px-6 py-4" role="status">
            WebGL is unavailable in this browser.
          </p>
        )}
        <p className="px-6 pb-6 text-center text-sm text-light-grey">
          Drag to inspect the edges. This is a material prototype, not a replacement for New.
        </p>
      </section>
    </Page>
  );
};
