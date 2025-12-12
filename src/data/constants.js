import { Grid, Code, Music, Trophy, BookOpen } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Registered', icon: Trophy },
  { name: 'All', icon: Grid },
  { name: 'Technical', icon: Code },
  { name: 'Cultural', icon: Music },
  { name: 'Sports', icon: Trophy },
  { name: 'Academic', icon: BookOpen },
];

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000];

export const INITIAL_USERS = [
  { id: 'admin1', name: 'Tech Society Admin', email: 'tech@uni.edu', password: '123', role: 'admin', societyName: 'Tech Society' },
  { id: 'student1', name: 'John Doe', email: 'john@uni.edu', password: '123', role: 'student', xp: 150, registeredEvents: [1] }
];

export const INITIAL_EVENTS = [
  {
    id: 1,
    title: "AI & Robotics Summit",
    society: "Tech Society",
    createdBy: 'admin1',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    time: "10:00 AM",
    venue: "Main Auditorium",
    category: "Technical",
    description: "Join us for a day of innovation featuring guest speakers from leading tech companies.",
    registrants: [ { id: 'student1', name: 'John Doe', time: '2023-10-10' } ],
    imageColor: "from-blue-500 to-cyan-400",
    comments: []
  },
  {
    id: 2,
    title: "Cultural Fest Auditions",
    society: "Arts Club",
    createdBy: 'admin2',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString().split('T')[0],
    time: "04:00 PM",
    venue: "Student Center Hall",
    category: "Cultural",
    description: "Auditions for the annual winter fest. Singers, dancers, and actors welcome.",
    registrants: [],
    imageColor: "from-purple-500 to-pink-400",
    comments: []
  },
  {
    id: 3,
    title: "Inter-Department Football",
    society: "Sports Board",
    createdBy: 'admin3',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22).toISOString().split('T')[0],
    time: "03:00 PM",
    venue: "University Stadium",
    category: "Sports",
    description: "Cheer for your department! The semi-finals begin this weekend.",
    registrants: [],
    imageColor: "from-green-400 to-emerald-500",
    comments: []
  }
];