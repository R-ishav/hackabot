
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import qrcode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'campus-events-secret-key-12345';
// MongoDB connection: prefer environment variable (Atlas), fallback to local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-events';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- UTILITY FUNCTIONS ---
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// --- DATABASE CONNECTION ---
// Provide explicit options and a short timeout to surface errors quickly.
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message || err);
    // Helpful hints for common Atlas TLS / network issues
    if (err.message && /tls|SSL|TLS/i.test(err.message)) {
      console.error('Hint: TLS/SSL error when connecting to Atlas. Common fixes:');
      console.error('- Ensure your Atlas cluster is accessible from this machine (Network Access -> IP whitelist).');
      console.error('- Verify no corporate proxy is intercepting TLS (try from a different network).');
      console.error('- Confirm your connection string (username/password) has special characters URL-encoded.');
      console.error('- Try connecting with MongoDB Compass using the same connection string to get clearer diagnostics.');
    }
    // keep process alive for developer to read the message
  });

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  role: String,     // 'student' or 'admin'
  xp: { type: Number, default: 0 },
  societyName: String,
  rollNumber: String,
  phone: String,
  year: String,
  branch: String,
  course: String,
  gender: String,
  registeredEvents: [String]
});

const eventSchema = new mongoose.Schema({
  title: String,
  society: String,
  date: String,
  time: String,
  venue: String,
  category: String,
  description: String,
  imageColor: String,
  createdBy: String,
  coordinates: [Number], // [latitude, longitude] for map location
  registrants: [{ 
    id: String, 
    name: String, 
    time: String 
  }],
  comments: [{ 
    user: String, 
    text: String, 
    time: String 
  }],
  announcements: [{
    author: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  rollNumber: String,
  email: String,
  phone: String,
  year: String,
  branch: String,
  course: String,
  registrationDate: { type: Date, default: Date.now },
  uniqueCode: String, // 6-digit alphanumeric code
  qrToken: String,
  qrCode: String, // Base64 encoded QR code
  checkedIn: { type: Boolean, default: false },
  checkInTime: Date
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

// --- ROUTES ---

// 1. Register User
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Get All Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch events" });
  }
});

// 4. Create Event
app.post('/api/events', async (req, res) => {
  try {
    console.log('POST /api/events - Received body:', req.body);
    console.log('POST /api/events - Coordinates:', req.body.coordinates);
    const newEvent = new Event({
      ...req.body,
      imageColor: "from-indigo-600 to-blue-600",
      registrants: [],
      comments: []
    });
    await newEvent.save();
    console.log('POST /api/events - Saved event:', newEvent);
    res.json(newEvent);
  } catch (err) {
    console.error('POST /api/events - Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Event
app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete" });
  }
});

// 6. Register for Event (with QR code generation)
app.post('/api/events/:id/register', async (req, res) => {
  const { userId, userName, email, phone, rollNumber, year, branch, course } = req.body;
  
  try {
    // Prevent duplicate registration: return existing registration if present
    const already = await EventRegistration.findOne({ eventId: req.params.id, studentId: userId });
    if (already) {
      const updatedEvent = await Event.findById(req.params.id);
      const user = await User.findById(userId);
      return res.json({
        event: updatedEvent,
        user,
        registration: already,
        message: 'Already registered'
      });
    }
    // Generate unique 6-digit alphanumeric code
    const uniqueCode = generateUniqueCode();
    
    // Generate QR code from the 6-digit code (not from JWT)
    const qrCode = await qrcode.toDataURL(uniqueCode);
    
    // Generate JWT token for additional security if needed
    const nonce = Math.random().toString(36).substring(7);
    const qrToken = jwt.sign(
      { userId, eventId: req.params.id, timestamp: Date.now(), nonce, code: uniqueCode },
      JWT_SECRET,
      { expiresIn: '365d' }
    );
    
    // Create registration record
    const registration = new EventRegistration({
      eventId: req.params.id,
      studentId: userId,
      studentName: userName,
      rollNumber,
      email,
      phone,
      year,
      branch,
      course,
      uniqueCode,
      qrToken,
      qrCode
    });
    
    await registration.save();

    // Add to event registrants
    await Event.findByIdAndUpdate(req.params.id, {
      $push: { registrants: { id: userId, name: userName, time: new Date().toISOString() } }
    });

    // Add XP to user
    const user = await User.findById(userId);
    if (user && user.role === 'student') {
      user.xp = (user.xp || 0) + 50;
      // avoid duplicate event ids
      if (!user.registeredEvents.includes(req.params.id)) {
        user.registeredEvents.push(req.params.id);
      }
      await user.save();
    }
    
    // Return updated data with QR code and unique code
    const updatedEvent = await Event.findById(req.params.id);
    res.json({ 
      event: updatedEvent, 
      user,
      registration: {
        qrCode,
        uniqueCode,
        qrToken,
        studentName: userName,
        rollNumber,
        email,
        phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Add Comment
app.post('/api/events/:id/comment', async (req, res) => {
  const { user, text } = req.body;
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $push: { comments: { user, text, time } }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not post comment" });
  }
});

// 7b. Add Announcement (Admin only)
app.post('/api/events/:id/announcement', async (req, res) => {
  const { author, text } = req.body;
  
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { $push: { announcements: { author, text, timestamp: new Date() } } },
      { new: true }
    );
    res.json({ success: true, event: updated });
  } catch (err) {
    res.status(500).json({ error: "Could not post announcement" });
  }
});

// 8. Verify QR Code (Admin scans - now using 6-digit code)
app.post('/api/events/:eventId/verify-qr', async (req, res) => {
  const { qrToken } = req.body;
  
  try {
    // Find registration by unique code (QR now contains the 6-digit code)
    const registration = await EventRegistration.findOne({ 
      uniqueCode: qrToken.trim().toUpperCase(),
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ error: "Invalid QR code or event" });
    }
    
    // Update check-in status
    const updatedReg = await EventRegistration.findByIdAndUpdate(
      registration._id,
      { checkedIn: true, checkInTime: new Date() },
      { new: true }
    );
    
    res.json({ 
      success: true, 
      registration: updatedReg,
      message: `${updatedReg.studentName} checked in successfully!`
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired QR code" });
  }
});

// 9. Get Event Registrations (for admin)
app.get('/api/events/:id/registrations', async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch registrations" });
  }
});

// 10. Get Registrations For User
app.get('/api/users/:id/registrations', async (req, res) => {
  try {
    const regs = await EventRegistration.find({ studentId: req.params.id });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user registrations' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));