"use client"

import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Image from "next/image"
import { unstable_noStore as noStore } from 'next/cache';
import axios from "axios";

const VideoCard = ({ title, channel, views, uploadTime, thumbnail, link }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a 
      href={link} 
      className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Image src={thumbnail} alt={title} className="w-full h-40 object-cover" width={150} height={100} />
        <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Play className="text-white" size={48} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate text-white">{title}</h3>
        <p className="text-sm text-gray-400">{channel}</p>
        <p className="text-xs text-gray-500">{views} views • {uploadTime}</p>
      </div>
    </a>
  );
};

const VideoGrid = ({ videos }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {videos.map((video, index) => (
      <VideoCard key={index} {...video} />
    ))}
  </div>
);

function timeAgo(dateStr) {
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diff = now - dateObj; // Difference in milliseconds

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

function format_views(views) {
  if (views >= 1e6) {
    return (views / 1e6).toFixed(1) + 'M'; // Format in millions
  } else if (views >= 1e3) {
    return (views / 1e3).toFixed(1) + 'K'; // Format in thousands
  } else {
    return views.toString(); // Return as is for lower values
  }
}

async function GetVideoData() {
  noStore();

  const { data } = await axios.get("/api/video/all");

  if (!data) { return []; }
  
  const newData = data.map(item => {
    return {
      title: item.title,
      views: format_views(item.views),
      link: `/video?id=${item.video_id}`,
      uploadTime: timeAgo(item.upload_at),
      channel: item.Account.username,
      thumbnail: item.thumbnail,
    }
  })

  return newData;
}

// Example usage
const ExampleVideoGrid = () => {
  const [video_data, setVideoData] = useState([]);

  useEffect(() => {
    async function get_data() {
      const data = await GetVideoData();
      setVideoData(data);
    }

    get_data()
  }, [setVideoData]);

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <VideoGrid videos={video_data} />
    </div>
  );
};

export default ExampleVideoGrid;