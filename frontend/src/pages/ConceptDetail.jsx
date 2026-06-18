import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ArrowBack, BookmarkBorder, Bookmark, Share } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { toast } from 'react-toastify';

const ConceptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        const response = await api.get(`/concepts/${id}`);
        setConcept(response.data.data);
        setIsBookmarked(response.data.data.is_bookmarked);
        setLoading(false);
        api.post(`/history/${id}`).catch(() => {});
      } catch {
        toast.error('Failed to fetch concept');
        navigate('/dashboard');
      }
    };
    fetchConcept();
  }, [id, navigate]);

  const handleBookmark = async () => {
    try {
      const response = await api.post(`/bookmarks/${id}`);
      setIsBookmarked(response.data.data.bookmarked);
      toast.success(response.data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {concept.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={concept.category} color="primary" size="small" />
              <Chip label={concept.subcategory} color="secondary" size="small" variant="outlined" />
              <Chip label={concept.difficulty} size="small" />
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleBookmark}>
              {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Prompt:
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          {concept.prompt}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 4 }}>
          Detailed Response:
        </Typography>
        <Box className="markdown-content">
          <ReactMarkdown>
            {concept.content}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConceptDetail;
