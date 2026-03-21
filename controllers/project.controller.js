import Project from '../models/project.model.js';

const generateSlugFromTitle = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
    const { fields, summary } = req.query;

    // Card list: no heavy `pages` array — only page count (smaller payload, faster)
    if (summary === '1' || summary === 'true') {
      const projects = await Project.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            cover: 1,
            slug: 1,
            createdAt: 1,
            updatedAt: 1,
            pageCount: {
              $cond: {
                if: { $isArray: '$pages' },
                then: { $size: '$pages' },
                else: 0,
              },
            },
          },
        },
      ]);
      return res.status(200).json(projects);
    }

    let projection = {};
    if (fields) {
      const fieldArray = fields.split(',').map(f => f.trim());
      fieldArray.forEach(field => {
        projection[field] = 1;
      });
      projection._id = 1;
    }

    const query = Project.find().sort({ createdAt: -1 });
    if (Object.keys(projection).length > 0) {
      query.select(projection);
    }

    const projects = await query.exec();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;
    const fieldArray = fields
      ? fields.split(',').map((f) => f.trim()).filter(Boolean)
      : null;

    const selectStr =
      fieldArray && fieldArray.length > 0
        ? [...new Set([...fieldArray, '_id'])].join(' ')
        : undefined;

    let project = await Project.findOne({ slug: id })
      .select(selectStr)
      .exec();
    if (!project) {
      try {
        project = await Project.findById(id).select(selectStr).exec();
      } catch {
        project = null;
      }
    }
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.slug && project.title) {
      let baseSlug = generateSlugFromTitle(project.title);
      let slug = baseSlug;
      let counter = 1;
      while (
        await Project.findOne({ slug, _id: { $ne: project._id } }).select('_id').lean()
      ) {
        slug = `${baseSlug}-${counter++}`;
      }
      await Project.findByIdAndUpdate(project._id, { $set: { slug } });
      project.slug = slug;
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