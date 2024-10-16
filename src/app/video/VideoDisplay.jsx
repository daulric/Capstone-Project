"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import VideoPlayer from "./VideoPlayer";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const YouTubeStylePlayer = () => {
  const [videoData, setVideoData] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();
  const video_id = searchParams.get("id");

  const getVideo = useCallback(async () => {
    if (!video_id) return;
    try {
      const {data} = await axios.get("/api/video", {
        timeout: 5000,
      });

      if (!data || data.success === false) return;
      const videos_data = data.data;
      const filtered_data = videos_data.filter(item => item.video_id === video_id);
      if (filtered_data.length === 0) return;
      setVideoData(filtered_data[0]);

      // Updating the View Count
      await axios.post("/api/video/views", {}, {
        params: {
          id: video_id,
        }
      });
    } catch (error) {
      console.log("Error fetching video data:", error);
    }
  }, [video_id]);

  useEffect(() => {
    getVideo();
  }, [getVideo]);

  const truncateDescription = (text, limit = 150) => {
    if (!text) return "No description available.";
    
    // Replace newline characters with spaces for truncation
    const flatText = text.replace(/(\r\n|\n|\r)/gm, " ");
    
    if (flatText.length <= limit) return text;
    
    // Truncate the flattened text
    const truncated = flatText.slice(0, limit).trim() + '...';
    
    return truncated;
  };

  const formatDescription = (text) => {
    if (!text) return "No description available.";
    
    // Replace newline characters with <br /> for proper HTML rendering
    return text.split(/\r\n|\n|\r/).map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-900 text-white">
      <Card className="shadow-xl border-gray-800 rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative pt-[56.25%] bg-gray-800">
            <div className="absolute inset-0">
              {videoData ? (
                <Suspense fallback={<p className="text-gray-400 flex items-center justify-center h-full">Loading video...</p>}>
                  <VideoPlayer videoSrc={videoData.video} />
                </Suspense>
              ) : (
                <p className="text-gray-400 flex items-center justify-center h-full">No video available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 p-4">
        <h2 className="text-xl font-bold mb-2">{videoData ? videoData.title : "Video Title"}</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={videoData?.uploaderAvatar} alt="Uploader" />
              <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
            </Avatar>
            <Link href={`/profile/${videoData?.Account?.username}`} >
              <p className="font-semibold">{videoData?.Account?.username || "Anonymous"}</p>
              <p className="text-sm text-gray-400">{videoData?.upload_at ? new Date(videoData.upload_at).toLocaleString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "unknown"}</p>
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {expanded 
              ? formatDescription(videoData?.description)
              : truncateDescription(videoData?.description)
            }
          </div>
          {videoData?.description && videoData.description.length > 150 && (
            <Button 
              variant="ghost" 
              className="mt-2 text-blue-400 hover:text-blue-300 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeStylePlayer;