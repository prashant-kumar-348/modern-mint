"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getUser } from "@/lib/auth";
import { fetchRoom } from "@/lib/lobby/api";
import GameBoard from "@/components/GameBoard";

export default function GameRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ready = useAuthGuard();
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerDetails, setPlayerDetails] = useState<{
    username: string;
    role: string;
    avatarId?: number;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;

    async function load() {
      try {
        const user = getUser();
        if (!user) {
          router.replace("/login");
          return;
        }

        const roomDetails = await fetchRoom(id);
        const rawRoom = roomDetails.raw;

        // Search for user in founders or investors
        const founderSlot = rawRoom.founders.find(
          (f) => f.userId === user.id
        );
        const investorSlot = rawRoom.investors.find(
          (i) => i.userId === user.id
        );

        if (founderSlot) {
          setPlayerDetails({
            username: founderSlot.name || user.username,
            role: "Founder",
            avatarId: founderSlot.avatarId,
          });
        } else if (investorSlot) {
          setPlayerDetails({
            username: investorSlot.name || user.username,
            role: "Investor",
            avatarId: investorSlot.avatarId,
          });
        } else {
          // Player has not joined the room officially
          router.replace(`/lobby/join/${id}`);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ready, id, router]);

  if (!ready || loading) {
    return (
      <div className="w-screen h-screen bg-[#030806] flex items-center justify-center text-[#55ffb0] font-mono tracking-widest uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#55ffb0] border-t-transparent rounded-full animate-spin"></div>
          <div>Loading Game Session...</div>
        </div>
      </div>
    );
  }

  if (error || !playerDetails) {
    return (
      <div className="w-screen h-screen bg-[#030806] flex flex-col items-center justify-center text-[#ef4444] font-mono tracking-widest uppercase p-6 gap-4">
        <div>Error loading session: {error || "Not authorized"}</div>
        <button
          onClick={() => router.push("/lobby")}
          className="px-6 py-2 border border-[#ef4444] hover:bg-[#ef4444]/20 text-white rounded transition-colors cursor-pointer"
        >
          Back to Lobby
        </button>
      </div>
    );
  }

  return (
    <GameBoard
      roomId={id}
      username={playerDetails.username}
      role={playerDetails.role}
      avatarId={playerDetails.avatarId}
    />
  );
}
