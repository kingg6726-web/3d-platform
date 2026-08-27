import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Video ID is required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc(
    "increment_video_views",
    {
      video_id: id,
    }
  );

  if (error) {
    console.error("Increment video views error:", error);

    return NextResponse.json(
      { error: "Failed to increment video views." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    views: data,
  });
}