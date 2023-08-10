import React, { useEffect, useRef, useState } from 'react';
import Jazzicon from '@metamask/jazzicon';

function ReactJazzicon({ seed }: { seed: string }) {
  const avatarRef = useRef<HTMLDivElement>();
  useEffect(() => {
    const loadIcon = () => {
      const element = avatarRef.current;
      if (element && seed) {
        const icon = Jazzicon(20, seed); // generates a size 20 icon
        if (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        element.appendChild(icon);
      }
    };
    loadIcon();
  }, [avatarRef]);
  return <div ref={avatarRef as any} />;
}

export default function Identicon({ text }: { text: string }) {
  const [jazziconData, setJazzicon] = useState(<></>);
  useEffect(() => {
    function cyrb128(seed: string) {
      let h1 = 1779033703;
      let h2 = 3144134277;
      let h3 = 1013904242;
      let h4 = 2773480762;
      // eslint-disable-next-line no-plusplus
      for (let i = 0, k; i < seed.length; i++) {
        k = seed.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
      }
      h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
      h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
      h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
      h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
      return [
        (h1 ^ h2 ^ h3 ^ h4) >>> 0,
        (h2 ^ h1) >>> 0,
        (h3 ^ h1) >>> 0,
        (h4 ^ h1) >>> 0,
      ];
    }
    const genJazzi = async () => {
      setJazzicon(<ReactJazzicon seed={cyrb128(text)} />);
    };
    genJazzi();
  }, []);
  return jazziconData;
}
