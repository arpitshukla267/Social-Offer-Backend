import mongoose from "mongoose";

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but enforce uniqueness for non-null
    },
    category: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '', // Optional logo for QR code
    },
    pages: {
      type: [String], // array of page image URLs
      required: true,
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

// Generate slug before saving (one DB query instead of a loop of findOne calls)
projectSchema.pre('save', async function(next) {
  try {
    if (this.isModified('title') || !this.slug) {
      const baseSlug = generateSlug(this.title) || 'book';
      const Project = this.constructor;
      const escaped = escapeRegex(baseSlug);
      const regex = new RegExp(`^${escaped}(-\\d+)?$`);
      const existing = await Project.find({
        slug: regex,
        _id: { $ne: this._id },
      })
        .select('slug')
        .lean();
      const used = new Set(existing.map((d) => d.slug));
      let slug = baseSlug;
      let counter = 1;
      while (used.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Project = mongoose.model("Project", projectSchema);
export default Project;