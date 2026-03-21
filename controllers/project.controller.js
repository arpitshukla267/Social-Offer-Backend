import Project from '../models/project.model.js';

export const createProject = async (req, res) => {
  try {
    const { title, category, cover, logo, pages } = req.body;
    const project = new Project({ title, category, cover, logo, pages });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    // Support query parameter to fetch only specific fields
    const { fields } = req.query;
    
    let projection = {};
    if (fields) {
      // Parse fields (comma-separated) and build projection object
      const fieldArray = fields.split(',').map(f => f.trim());
      fieldArray.forEach(field => {
        projection[field] = 1;
      });
      // Always include _id
      projection._id = 1;
    }
    
    const query = Project.find().sort({ createdAt: -1 });
    if (Object.keys(projection).length > 0) {
      query.select(projection);
    }
    
    let projects = await query.exec();
    
    // Generate slugs for projects that don't have them
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    // Update projects without slugs
    const slugPromises = projects.map(async (project) => {
      if (!project.slug && project.title) {
        let baseSlug = generateSlug(project.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure slug is unique
        while (await Project.findOne({ slug: slug, _id: { $ne: project._id } })) {
          slug = `${baseSlug}-${counter++}`;
        }
        
        project.slug = slug;
        await project.save();
      }
    });
    
    // Wait for all slug generations to complete
    await Promise.all(slugPromises);
    
    // Re-fetch to ensure slugs are included in response
    if (Object.keys(projection).length > 0 && projection.slug !== undefined) {
      projects = await Project.find().select(projection).sort({ createdAt: -1 }).exec();
    }
    
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    // Try to find by slug first, then by ID
    let project = await Project.findOne({ slug: id });
    if (!project) {
      project = await Project.findById(id);
    }
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // If project doesn't have a slug, generate one
    if (!project.slug && project.title) {
      const generateSlug = (title) => {
        return title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };
      
      let baseSlug = generateSlug(project.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure slug is unique
      while (await Project.findOne({ slug: slug, _id: { $ne: project._id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      
      project.slug = slug;
      await project.save();
    }
    
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, cover, logo, pages } = req.body;
    const project = await Project.findByIdAndUpdate(
      id,
      { title, category, cover, logo, pages },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};