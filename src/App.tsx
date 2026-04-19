/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game } from './Game';
import { UI } from './UI';

export default function App() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Game />
      <UI />
    </div>
  );
}
