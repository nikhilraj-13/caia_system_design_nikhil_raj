const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const conceptRoutes = require('./routes/concept.routes');
const taxonomyRoutes = require('./routes/taxonomy.routes');
const searchRoutes = require('./routes/search.routes');
const filterRoutes = require('./routes/filter.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { bookmarkRouter, noteRouter, voteRouter } = require('./routes/interaction.routes');
const bulkRoutes = require('./routes/bulk.routes');
const adminRoutes = require('./routes/admin.routes');
const systemRoutes = require('./routes/system.routes');

const app = express();

// Root route to show all available endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the System Design Knowledge Base API!',
    availableRoutes: {
      auth: [
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/logout',
        'POST /api/v1/auth/refresh-token',
        'GET /api/v1/auth/profile',
        'PATCH /api/v1/auth/profile',
        'DELETE /api/v1/auth/profile'
      ],
      concepts: [
        'GET /api/v1/concepts',
        'GET /api/v1/concepts/:id',
        'POST /api/v1/concepts',
        'PUT /api/v1/concepts/:id',
        'PATCH /api/v1/concepts/:id',
        'DELETE /api/v1/concepts/:id',
        'GET /api/v1/concepts/random',
        'GET /api/v1/concepts/latest',
        'GET /api/v1/concepts/trending',
        'GET /api/v1/concepts/popular',
        'GET /api/v1/concepts/:id/summary',
        'GET /api/v1/concepts/:id/related',
        'PATCH /api/v1/concepts/:id/archive',
        'PATCH /api/v1/concepts/:id/restore'
      ],
      taxonomy: [
        'GET /api/v1/categories',
        'GET /api/v1/categories/:category',
        'GET /api/v1/categories/:category/concepts',
        'GET /api/v1/subcategories',
        'GET /api/v1/tags',
        'GET /api/v1/tags/:tag',
        'GET /api/v1/patterns',
        'GET /api/v1/patterns/:patternName',
        'GET /api/v1/languages',
        'GET /api/v1/languages/:language',
        'GET /api/v1/difficulty',
        'GET /api/v1/difficulty/:level',
        'GET /api/v1/question-types',
        'GET /api/v1/question-types/:type',
        'GET /api/v1/architectures/microservices'
      ],
      search: [
        'GET /api/v1/search?q=keyword',
        'GET /api/v1/search/title?q=keyword',
        'GET /api/v1/search/content?q=keyword',
        'GET /api/v1/search/tags?q=keyword',
        'GET /api/v1/search/patterns?q=keyword',
        'GET /api/v1/search/language?q=keyword',
        'GET /api/v1/search/category?q=keyword',
        'GET /api/v1/search/difficulty?q=keyword',
        'GET /api/v1/search/fuzzy?q=keyword',
        'GET /api/v1/search/autocomplete?q=keyword',
        'GET /api/v1/search/exact?q=keyword',
        'GET /api/v1/search/regex?pattern=keyword'
      ],
      filter: [
        'GET /api/v1/filter/category?name=keyword',
        'GET /api/v1/filter/difficulty?level=keyword',
        'GET /api/v1/filter/pattern?name=keyword',
        'GET /api/v1/filter/language?name=keyword',
        'GET /api/v1/filter/date?after=2025-01-01',
        'GET /api/v1/filter/tags?list=tag1,tag2',
        'GET /api/v1/filter/trending',
        'GET /api/v1/filter/popular',
        'GET /api/v1/filter/expert-only',
        'GET /api/v1/filter/frontend',
        'GET /api/v1/filter/backend',
        'GET /api/v1/filter/devops',
        'GET /api/v1/filter/cloud'
      ],
      analytics: [
        'GET /api/v1/analytics/total-concepts',
        'GET /api/v1/analytics/category-distribution',
        'GET /api/v1/analytics/difficulty-stats',
        'GET /api/v1/analytics/patterns/top',
        'GET /api/v1/analytics/languages/top',
        'GET /api/v1/analytics/views/top',
        'GET /api/v1/analytics/bookmarks/top',
        'GET /api/v1/analytics/trending'
      ],
      interactions: [
        'GET /api/v1/bookmarks',
        'POST /api/v1/bookmarks/:conceptId',
        'DELETE /api/v1/bookmarks/:conceptId',
        'GET /api/v1/notes/:conceptId',
        'POST /api/v1/notes/:conceptId',
        'PATCH /api/v1/notes/:noteId',
        'DELETE /api/v1/notes/:noteId',
        'POST /api/v1/votes/:conceptId',
        'GET /api/v1/votes/top'
      ],
      bulk: [
        'POST /api/v1/concepts/bulk/create',
        'PATCH /api/v1/concepts/bulk/update',
        'DELETE /api/v1/concepts/bulk/delete'
      ],
      admin: [
        'GET /api/v1/admin/users',
        'GET /api/v1/admin/users/:id',
        'PATCH /api/v1/admin/users/:id/role',
        'PATCH /api/v1/admin/users/:id/ban',
        'PATCH /api/v1/admin/users/:id/unban'
      ],
      system: [
        'GET /api/v1/health',
        'GET /api/v1/system/status',
        'GET /api/v1/system/version',
        'GET /api/v1/system/uptime'
      ]
    }
  });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(helmet());
app.use(rateLimiter);

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/concepts/bulk', bulkRoutes); // Mount before /:id to prevent conflict
app.use('/api/v1/concepts', conceptRoutes);
app.use('/api/v1', taxonomyRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/filter', filterRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/bookmarks', bookmarkRouter);
app.use('/api/v1/notes', noteRouter);
app.use('/api/v1/votes', voteRouter);
app.use('/api/v1/history', historyRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', systemRoutes); // For health and system

// Global error handler
app.use(errorHandler);

module.exports = app;
