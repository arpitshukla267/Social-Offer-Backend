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

// Generate slug before saving
projectSchema.pre('save', async function(next) {
  try {
    if (this.isModified('title') || !this.slug) {
      let baseSlug = generateSlug(this.title);
      
      // If slug already exists, append a number
      const Project = this.constructor;
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existing = await Project.findOne({ slug: slug, _id: { $ne: this._id } });
        if (!existing) {
          break;
        }
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