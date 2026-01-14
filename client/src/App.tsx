import { useEffect, useRef } from "react";
import { config } from "./game/config";
import Phaser from "phaser";
import { Inventory } from "./ui/Inventory";
import { Entities } from "./ui/Entities";
import { Hotbar } from "./ui/Hotbar";

function App() {
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (game.current) return;

    game.current = new Phaser.Game(config);

    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, []);

  return (
    <>
      <div id="game"></div>
      <Entities />
      <div className="fixed top-0 left-256 w-24">
        <Inventory />
        <Hotbar />
      </div>
    </>
  );
}

export default App;
