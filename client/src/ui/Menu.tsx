import { useEffect, useState } from "react";
import SocketManager from "../game/managers/Socket";

export function Menu({ ready }: { ready: () => void }) {
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    SocketManager.init();

    SocketManager.on("game:create", ({ instanceId }) => {
      SocketManager.setGameId(instanceId);
      ready();
    });

    SocketManager.on("game:join", ({ instanceId }) => {
      SocketManager.setGameId(instanceId);
      ready();
    });

    SocketManager.on("game:list", setGames);
    SocketManager.emit("game:list");
  }, []);

  return (
    <div className="p-3">
      <button
        className="px-2 py-1 bg-blue-500 text-white rounded w-full mb-5"
        onClick={() => {
          SocketManager.emit("game:create");
        }}
      >
        Create New Game
      </button>
      {games.map((id) => (
        <div key={id} className="even:bg-slate-50 rounded p-3">
          <div className="flex justify-between items-center">
            <div>{id}</div>
            <button
              className="px-2 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                SocketManager.emit("game:join", { instanceId: id });
              }}
            >
              Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
