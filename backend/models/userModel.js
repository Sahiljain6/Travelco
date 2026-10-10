const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    img: { type: String, default: "" },
    mobile: { type: String, required: true, trim: true, maxlength: 25 },
    password: { type: String, required: true, minlength: 8 },
    isAdmin: { type: Boolean, default: false },
    type: {
      type: String,
      required: true,
      default: "traveler",
    },
    pic: {
      type: String,
      required: true,
      default: "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg",
    },

    // Default true preserves access for accounts created before email verification was introduced.
    // New registrations explicitly set this to false in authController.
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    preferredCurrency: { type: String, default: "INR", uppercase: true, minlength: 3, maxlength: 3 },
    preferredLanguage: { type: String, default: "en", maxlength: 12 },
    travelInterests: { type: [String], default: [] },
    budgetRange: { type: String, enum: ["budget", "mid-range", "luxury", "flexible"], default: "flexible" },
    travelStyle: { type: String, enum: ["solo", "couple", "family", "friends", "group", "flexible"], default: "flexible" },
    savedDestinations: { type: [String], default: [] },
    notificationPreferences: {
      bookingUpdates: { type: Boolean, default: true },
      tripReminders: { type: Boolean, default: true },
      productNews: { type: Boolean, default: false },
    },
    termsAcceptedAt: { type: Date },
    termsVersion: { type: String, maxlength: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
