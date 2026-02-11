import { useEffect } from "react";
import SocketManager from "../game/managers/Socket";

export function Menu({ ready }: { ready: () => void }) {
  useEffect(() => {
    SocketManager.init();

    SocketManager.on("connect", () => {
      ready();
    });

    return () => {
      SocketManager.off("connect");
    };
  }, []);

  return (
    <div className="max-w-150 mx-auto flex flex-col justify-center items-center gap-7 h-screen">
      <div className="flex justify-between items-center w-full p-3">
        <p className="text-white">Connecting to server...</p>
      </div>
    </div>
  );
}
